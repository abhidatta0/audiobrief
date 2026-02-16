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
                images: {
                  type: "array",
                  items: {
                    type: "string",
                    additionalProperties: false,
                  },
                },
              },
              required: ["titles", "images"],
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

2. Generate 3 custom thumbnail images
   - Analyze the content to determine 3 distinct visual concepts that would make compelling YouTube thumbnails
   - For each concept, create/generate an actual image using image generation capabilities
   - Design thumbnails with bold text overlays, high contrast, and eye-catching visuals
   - Make them click-worthy and accurately represent the content
   - Return the actual generated image URLs

Return the response in this exact JSON structure:
{
  "titles": [
    "Title 1",
    "Title 2", 
    "Title 3"
  ],
  "images": [
    "base64_image",
    "base64_image", 
    "base64_image"
  ],
}

CRITICAL: Generate original thumbnail images, do not search for existing images. Each thumbnail should be a custom-created image optimized for YouTube.`;
};

const getOpenRouterInstance = (apiKey: string) => {
  const openRouter = new OpenRouter({
    apiKey,
  });

  return openRouter;
};
