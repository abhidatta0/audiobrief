import ApiInputKey from "@/components/ApiInputKey";
import FileUploader, { isAudioFile } from "@/components/FileUploader";
import { useCallback, useState } from "react";
import { Sparkles } from "lucide-react";
import { generateYouTubeContent } from "@/services/OpenRouterAudio";
import GeneratedOutput, { GeneratedResponse } from "@/GeneratedOutput";

const getInitialGeneratedResponse = () => ({
  images: [],
  titles: [],
  descriptions: [],
});
export default function HeroSection() {
  const [apiKey, setApiKey] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [generatedContent, setGeneratedContent] = useState<GeneratedResponse>(
    getInitialGeneratedResponse(),
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const validateFile = useCallback((file: File): string | null => {
    if (!isAudioFile(file)) {
      return "Please upload an audio file";
    }

    return null;
  }, []);

  const generateContent = async () => {
    if (!file || !apiKey) {
      return;
    }
    setIsGenerating(true);
    setGeneratedContent(getInitialGeneratedResponse());
    try {
      await generateYouTubeContent(file, apiKey, (output) => {
        setGeneratedContent(output);
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };
  return (
    <div className="min-h-full bg-linear-to-br from-slate-50 to-slate-100 md:py-12 md:px-6 py-6 px-3">
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Upload Your Audio File
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          We&apos;ll generate thumbnail ideas, titles, and descriptions
          automatically
        </p>
      </div>

      <ApiInputKey onChangeApiKey={setApiKey} apiKey={apiKey} />

      <FileUploader
        accept=".mp3,audio/mpeg"
        validateFile={validateFile}
        syncFile={setFile}
      />
      <br />
      <button
        disabled={!file || !apiKey || isGenerating}
        onClick={generateContent}
        className="group w-full mt-2 relative inline-flex justify-center items-center gap-2 px-8 py-4 text-lg font-semibold text-white  bg-brand-500 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/50 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
      >
        <Sparkles className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
        <span>{isGenerating ? "Generating" : "Generate"}</span>
      </button>
      {isGenerating && (
        <p className="text-center bg-white p-2 rounded-l-lg rounded-r-lg">
          Generating 3 suggestions each for titles, thumbnails and
          descriptions.It will take approximately 1 min
        </p>
      )}
      {!isGenerating && <GeneratedOutput data={generatedContent} />}
    </div>
  );
}
