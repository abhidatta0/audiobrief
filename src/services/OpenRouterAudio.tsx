import { OpenRouter } from "@openrouter/sdk";
import { ChatResponse } from "@openrouter/sdk/models";

const audioToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result && typeof reader.result === "string") {
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateYouTubeContent = async (
  audioFile: File,
  apiKey: string,
  onOutput: (content: ChatResponse) => void,
) => {
  const openRouterInstance = getOpenRouterInstance(apiKey);
  try {
    const audioBase64 = await audioToBase64(audioFile);
    const extension = audioFile.name.split(".").at(-1);
    const streamOfAudioOutput = await openRouterInstance.chat.send({
      chatGenerationParams: {
        model: "openai/gpt-audio",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "What is in this audio?",
              },
              {
                type: "input_audio",
                inputAudio: {
                  data: audioBase64,
                  format: extension ?? ".mp3",
                },
              },
            ],
          },
        ],
        stream: true,
      },
    });

    let audioTranscribed = "";
    for await (const chunk of streamOfAudioOutput) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        audioTranscribed += content;
      }
    }
    console.log(audioTranscribed);

    const prompt = createAudioAnalysisPrompt();
    const result = await openRouterInstance.chat.send({
      chatGenerationParams: {
        model: "openai/gpt-5-image",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "text",
                text: audioTranscribed,
              },
            ],
          },
        ],
        // stream: true,
        modalities: ["image", "text"],
        responseFormat: {
          type: "json_schema",
          jsonSchema: {
            strict: true,
            name: "output",

            schema: {
              type: "object",
              properties: {
                titles: {
                  type: "array",
                  items: {
                    type: "string",
                    additionalProperties: false,
                  },
                },
                descriptions: {
                  type: "array",
                  items: {
                    type: "string",
                    additionalProperties: false,
                  },
                },
                images: {
                  type: "array",
                  items: {
                    type: "string",
                    additionalProperties: false,
                  },
                },
              },
              required: ["titles", "images", "descriptions"],
            },
          },
        },
      },
    });

    console.log({ result });

    onOutput(result);
  } catch (error) {
    console.error("OpenRouter API Error:", error);
  }
};

const createAudioAnalysisPrompt = () => {
  return `Please analyze this text and its content. Based on that, generate a JSON response with:

1. Generate 3 engaging, SEO-optimized YouTube video titles
   - Make them attention-grabbing and clickable
   - Include relevant keywords based on the actual content
   - Keep them under 70 characters when possible
   - Reflect the tone and topic of the content

2. Generate 3 custom thumbnail images following STRICT YouTube guidelines:

   CANVAS & COMPOSITION RULES (NON-NEGOTIABLE):
   - Image size: exactly 1280x720 pixels (16:9 aspect ratio), under 2MB
   - Safe zone: Keep ALL text, faces, logos, and key visuals within a 1180x620 inner frame (50px margin on all sides). Nothing important should appear outside this boundary.
   - Background must bleed to all 4 edges — but NO text, NO faces, and NO focal elements near the edges
   - Design as if the thumbnail will be cropped by 5% on each side on some devices

   TEXT RULES:
   - Use MAX 5–7 words of large, bold text
   - Font size must be large enough to read on a 320px wide mobile screen
   - Text must have strong contrast: use drop shadows, outlines, or a semi-transparent backing behind all text
   - Never place text at the very top or bottom 60px of the image
   - Avoid the bottom-left corner (YouTube timestamp badge covers it)
   - No text near left/right edges — give at least 60px horizontal padding

   VISUAL DESIGN:
   - High contrast between foreground and background (WCAG AA minimum)
   - Use a maximum of 3 colors for a clean, bold look
   - Faces or subjects should be centered or placed in the right 60% of the frame
   - Avoid placing key subjects in corners
   - Use dramatic lighting, bold shapes, and clear focal points
   - Avoid small details that won't be visible at thumbnail size

   STYLE:
   - Analyze content to determine 3 visually distinct concepts
   - Each thumbnail must look different from the others
   - Return the generated images in base64 format

3. Generate 3 descriptions explaining about the video
   - Reflect the tone and topic of the content
   - Keep them atleast 150 characters when possible

Return the response in this exact JSON structure:
{
  "titles": [
    "Title 1",
    "Title 2",
    "Title 3"
  ],
  "descriptions": [
    "string",
    "string",
    "string"
  ],
  "images": [
    "base64_image",
    "base64_image",
    "base64_image"
  ]
}

CRITICAL: Generate original thumbnail images, do not search for existing images. Each thumbnail should be a custom-created image fully optimized for YouTube — safe zones respected, all text visible, no clipping.`;
};

const getOpenRouterInstance = (apiKey: string) => {
  const openRouter = new OpenRouter({
    apiKey,
  });

  return openRouter;
};
