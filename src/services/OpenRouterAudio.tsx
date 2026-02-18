import { GeneratedResponse } from "@/GeneratedOutput";
import { OpenRouter } from "@openrouter/sdk";
import { toast } from "react-fox-toast";

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
  onOutput: (content: GeneratedResponse) => void,
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

    const [textContent, image1, image2, image3] = await Promise.all([
      generateTextContent(audioTranscribed, openRouterInstance),
      generateSingleThumbnail(audioTranscribed, openRouterInstance),
      generateSingleThumbnail(audioTranscribed, openRouterInstance),
      generateSingleThumbnail(audioTranscribed, openRouterInstance),
    ]);

    const result = {
      ...textContent,
      images: [image1, image2, image3],
    };

    onOutput(result);
  } catch (error) {
    console.error("OpenRouter API Error:", error);
    if (error && typeof error === "object" && !Array.isArray(error)) {
      const err = error as Record<string, unknown>;
      if (err["error"]) {
        if (typeof err.error === "object" && !Array.isArray(err.error)) {
          const errObj = err.error as Record<string, unknown>;
          if ("code" in errObj) {
            if (typeof errObj.code === "number" && errObj.code === 401) {
              toast.error("Api key is invalid");
            }
          }
        }
      }
    }
  }
};

const generateSingleThumbnail = async (
  transcription: string,
  openRouterInstance: ReturnType<typeof getOpenRouterInstance>,
) => {
  const prompt = createSingleImagePrompt();

  const result = await openRouterInstance.chat.send({
    chatGenerationParams: {
      model: "openai/gpt-5-image-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "text", text: transcription },
          ],
        },
      ],
      stream: false,
      modalities: ["image", "text"],
      imageConfig: {
        aspectRatio: "16:9",
      },
    },
  });

  let image = "";
  if (result.choices[0].message.images?.[0]) {
    image = result.choices[0].message.images[0].imageUrl.url;
  }
  return image;
};

const generateTextContent = async (
  transcription: string,
  openRouterInstance: ReturnType<typeof getOpenRouterInstance>,
): Promise<{ titles: string[]; descriptions: string[] }> => {
  const prompt = createTextPrompt();

  let fullResponse = "";
  const stream = await openRouterInstance.chat.send({
    chatGenerationParams: {
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "text", text: transcription },
          ],
        },
      ],
      stream: true,
      responseFormat: {
        type: "json_schema",
        jsonSchema: {
          strict: true,
          name: "text_output",
          schema: {
            type: "object",
            properties: {
              titles: {
                type: "array",
                items: { type: "string", additionalProperties: false },
              },
              descriptions: {
                type: "array",
                items: { type: "string", additionalProperties: false },
              },
            },
            required: ["titles", "descriptions"],
          },
        },
      },
    },
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) fullResponse += content;
  }

  return JSON.parse(fullResponse);
};

const createTextPrompt = () => {
  return `Please analyze this text and its content. Based on that, generate a JSON response with:

1. Generate 3 engaging, SEO-optimized YouTube video titles
   - Make them attention-grabbing and clickable
   - Include relevant keywords based on the actual content
   - Keep them under 70 characters when possible
   - Reflect the tone and topic of the content

2. Generate 3 descriptions explaining about the video
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
}

CRITICAL: Generate original thumbnail images, do not search for existing images. Each thumbnail should be a custom-created image fully optimized for YouTube — safe zones respected, all text visible, no clipping.`;
};

const createSingleImagePrompt = () => {
  return `
  Please analyze this transcribed audio content and generate a single thumbnail.

CANVAS & COMPOSITION RULES (NON-NEGOTIABLE):
- Image size: exactly 1280x720 pixels (16:9 aspect ratio), under 2MB
- Safe zone: Keep ALL text, faces, logos within a 1180x620 inner frame (50px margin on all sides)
- Background must bleed to all 4 edges — no text or focal elements near the edges
- Design as if the thumbnail will be cropped by 5% on each side on some devices

TEXT RULES:
- MAX 2-3 words of large, bold text
- Font size readable on a 320px wide mobile screen
- Strong contrast: use drop shadows, outlines, or semi-transparent backing behind all text
- Never place text at the very top or bottom 60px of the image
- Avoid the bottom-left corner (YouTube timestamp covers it)
- At least 60px horizontal padding from edges

VISUAL DESIGN:
- High contrast between foreground and background (WCAG AA minimum)
- Max 3 colors for a clean, bold look
- Faces/subjects centered or in the right 60% of the frame
- Dramatic lighting, bold shapes, clear focal points

CRITICAL: Generate an original custom image. Do not search for existing images.`;
};
const getOpenRouterInstance = (apiKey: string) => {
  const openRouter = new OpenRouter({
    apiKey,
  });

  return openRouter;
};
