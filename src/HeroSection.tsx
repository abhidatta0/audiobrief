import ApiInputKey from "@/components/ApiInputKey";
import FileUploader, { isAudioFile } from "@/components/FileUploader";
import { useState } from "react";
import { Sparkles } from "lucide-react";

export default function HeroSection() {
  const [apiKey, setApiKey] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const validateFile = (file: File): string | null => {
    if (!isAudioFile(file)) {
      return "Please upload an audio file";
    }

    return null;
  };
  return (
    <div className="min-h-full bg-linear-to-br from-slate-50 to-slate-100 py-12 px-6">
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
        accept="audio/mp3,audio/*"
        validateFile={validateFile}
        syncFile={setFile}
      />

      <button
        disabled={!file || !apiKey}
        className="group mt-6 relative inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white  bg-red-600 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-red-500/50 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
      >
        <Sparkles className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
        <span>Generate Content</span>
      </button>
    </div>
  );
}
