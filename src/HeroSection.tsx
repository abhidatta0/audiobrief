import ApiInputKey from "@/components/ApiInputKey";
import FileUploader, { isAudioFile } from "@/components/FileUploader";
import { useCallback, useState } from "react";
import { Play, Sparkles } from "lucide-react";
import Modal from "@/components/Modal";
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
  const [showDemoModal, setShowDemoModal] = useState(false);

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
      <div className="text-center mb-5 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2 md:mb-4 tracking-tight">
          Upload Your Audio File
        </h1>
        <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
          We&apos;ll generate thumbnail ideas, titles, and descriptions
          automatically
        </p>
        <button
          onClick={() => setShowDemoModal(true)}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 rounded"
        >
          <Play className="w-4 h-4 fill-current" />
          Watch demo
        </button>
      </div>

      <ApiInputKey onChangeApiKey={setApiKey} apiKey={apiKey} />

      <FileUploader
        accept=".mp3,audio/mpeg"
        validateFile={validateFile}
        syncFile={setFile}
      />
      <button
        disabled={!file || !apiKey || isGenerating}
        onClick={generateContent}
        className="group w-full mt-6 relative inline-flex justify-center items-center gap-2 px-8 py-4 text-lg font-semibold text-white  bg-brand-500 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/50 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
      >
        <Sparkles className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
        <span>{isGenerating ? "Generating" : "Generate"}</span>
      </button>
      {isGenerating && (
        <p className="mt-6 text-center text-sm text-slate-600 bg-white border border-slate-200 p-4 rounded-2xl animate-pulse">
          Generating 3 suggestions each for titles, thumbnails and
          descriptions.It will take approximately 1 min
        </p>
      )}
      {!isGenerating && <GeneratedOutput data={generatedContent} />}
      <Modal isVisible={showDemoModal} onClose={() => setShowDemoModal(false)}>
        <video
          controls
          className="w-full max-h-150"
          controlsList="nodownload nofullscreen"
        >
          <source src="/audiobrief-demo.mp4" type="video/mp4" />
        </video>
      </Modal>
    </div>
  );
}
