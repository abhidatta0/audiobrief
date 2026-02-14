import { useRef, useState } from "react";

interface Props {
  accept?: string;
  validateFile?: (file: File) => string | null;
}

export const isAudioFile = (file: File) => {
  return file.type.toLowerCase().startsWith("audio");
};
const FileUploader = ({ accept, validateFile }: Props) => {
  const uploadRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (uploadRef.current) {
      uploadRef.current.value = "";
    }
    processFile(file);
  };

  const processFile = (selectedFile: File | undefined) => {
    if (!selectedFile) return;

    const validationError = validateFile?.(selectedFile);
    console.log({ validationError });
    if (validationError) {
      // TODO: Show toast here
      return;
    }

    setFile(selectedFile);
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
      className={`w-full flex justify-center items-center overflow-hidden bg-slate-500 cursor-pointer min-h-75 rounded-lg ${isDragOver ? "opacity-50" : "opacity-100"}`}
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
      <h2 className="text-white">Upload</h2>

      {file && <p>{file.name}</p>}
    </div>
  );
};

export default FileUploader;
