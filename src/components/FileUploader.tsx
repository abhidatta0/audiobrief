import { useRef, useState } from "react";
import { TriangleAlert } from "lucide-react";

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
      // TODO: Show toast here
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
      className={`w-full flex justify-center items-center overflow-hidden bg-slate-500 cursor-pointer min-h-50 rounded-lg ${isDragOver ? "opacity-50" : "opacity-100"}`}
      onClick={() => uploadRef.current?.click()}
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
      <div className="flex-col justify-center items-center space-y-2">
        <h2 className="text-white font-bold text-center">
          {file ? file.name : "Upload"}
        </h2>
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

export default FileUploader;
