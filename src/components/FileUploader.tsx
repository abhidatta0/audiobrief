import { useRef, useState } from "react";
import { Audio, formatTime } from "@sina_byn/re-audio";
import {
  Volume,
  Volume2,
  Rewind,
  Play,
  Pause,
  FastForward,
  TriangleAlert,
} from "lucide-react";

interface Props {
  accept?: string;
  validateFile?: (file: File) => string | null;
  syncFile: (file: File) => void;
}

export const isAudioFile = (file: File) => {
  return file.type.toLowerCase().startsWith("audio");
};
const FileUploader = ({ accept, validateFile, syncFile }: Props) => {
  const uploadRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (uploadRef.current) {
      uploadRef.current.value = "";
    }
    processFile(file);
  };

  const processFile = (selectedFile: File | undefined) => {
    setError(null);
    setFile(null);

    if (!selectedFile) return;

    const validationError = validateFile?.(selectedFile);
    console.log({ validationError });
    if (validationError) {
      setError(validationError);
      return;
    }

    setFile(selectedFile);
    syncFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    console.log({ file });
    setIsDragOver(false);
    processFile(file);
  };

  return (
    <div
      className={`w-full flex justify-center items-center overflow-hidden bg-linear-to-br from-white to-red-600  cursor-pointer min-h-50 rounded-lg ${isDragOver ? "opacity-50" : "opacity-100"}`}
      onClick={() => (file ? null : uploadRef.current?.click())}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={() => setIsDragOver(false)}
    >
      <input
        ref={uploadRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleChange}
      />
      <div className=" justify-center items-center space-y-2">
        {file ? (
          <FileVisualizer file={file} />
        ) : (
          <h2 className="text-white font-bold text-center">Upload</h2>
        )}
        {error && (
          <p className="text-white flex items-center gap-3">
            <TriangleAlert className="text-red-800" />
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

const FileVisualizer = ({ file }: { file: File }) => {
  if (isAudioFile(file)) {
    // AudioPlayer.tsx
    return (
      <div className="min-w-lg">
        <Audio
          playlist={[
            { id: 1, src: URL.createObjectURL(file), name: file.name },
          ]}
        >
          {({
            loading,
            trackIndex,
            playlist,
            playing,
            togglePlay,
            duration,
            currentTime,
            volume,
            setVolume,
            rewindTrack,
            forwardTrack,
            setCurrentTime,
          }) => {
            const safeDuration = duration > 0 ? duration : 0;
            const safeCurrentTime = Math.min(currentTime, safeDuration);

            return (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="w-full space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col text-slate-700">
                        <span className="font-bold">
                          {/* @ts-expect-error error can happen if out of bounds value for trackIndex */}
                          {playlist[trackIndex].name}
                        </span>
                        <span>{formatTime(currentTime)}</span>
                      </div>
                    </div>

                    <div className="flex items-center max-md:justify-center gap-x-4 text-white">
                      <button
                        type="button"
                        title="Rewind"
                        onClick={rewindTrack.bind(null, 0.5)}
                      >
                        <Rewind size={24} />
                      </button>

                      <button type="button" onClick={togglePlay}>
                        {playing ? <Pause /> : <Play />}
                      </button>

                      <button
                        type="button"
                        onClick={forwardTrack.bind(null, 0.5)}
                      >
                        <FastForward />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <input
                    type="range"
                    min="0"
                    step={0.01}
                    max={safeDuration}
                    className="block w-full min-w-0 accent-white"
                    value={safeCurrentTime}
                    disabled={loading || duration === 0}
                    onChange={(e) => setCurrentTime(+e.currentTarget.value)}
                  />
                </div>

                <div className="flex items-center justify-between gap-x-4">
                  <div className="flex items-center gap-x-2 mt-4 text-white">
                    <Volume />

                    <input
                      type="range"
                      min="0"
                      max="100"
                      className="w-full md:w-[150px] accent-pink-300  bg-transparent cursor-pointer"
                      value={volume}
                      onChange={(e) => setVolume(+e.currentTarget.value)}
                    />

                    <Volume2 />
                  </div>

                  {loading && (
                    <span className="max-lg:text-sm mt-2">loading...</span>
                  )}
                </div>
              </div>
            );
          }}
        </Audio>
      </div>
    );
  }
  return file.name;
};

export default FileUploader;
