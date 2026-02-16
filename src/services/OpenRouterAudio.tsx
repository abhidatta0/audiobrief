import { OpenRouter } from "@openrouter/sdk";

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
  onChunk: (content: string) => void,
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
        onChunk(audioTranscribed); // Update UI with accumulated content
      }
    }
    console.log(audioTranscribed);

    //    const prompt = createAudioAnalysisPrompt();
  } catch (error) {
    console.error("OpenRouter API Error:", error);
  }
};

// const createAudioAnalysisPrompt = ()=>{
//    return `Please analyse this text and analyze its content. Based on what you hear:

//     1. Generate 3 engaging, SEO-optimized YouTube video titles
//     - Make them attention-grabbing and clickable
//     - Include relevant keywords based on the actual content
//     - Keep them under 70 characters when possible
//     - Reflect the tone and topic of the audio

//     2. Generate 5 thumbnail screenshots
//     - Provide the approximate timestamp for each moment (in seconds)
//     - Describe what's happening at each thumbnail
//     - Generate thumbnail
//     - Consider moments with: topic changes, exciting revelations, key takeaways, emotional peaks, or visual descriptions

//     3. Identify the content type and target audience
//     }`;
// }

const getOpenRouterInstance = (apiKey: string) => {
  const openRouter = new OpenRouter({
    apiKey,
  });

  return openRouter;
};
