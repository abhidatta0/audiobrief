import { useRef, useState } from "react";

interface Props {
  accept?: string;
}

const isAudioFile = (file: File) => {
  return file.type.toLowerCase().startsWith("audio");
};
const FileUploader = ({ accept }: Props) => {
  const uploadRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (uploadRef.current) {
      uploadRef.current.value = "";
    }
    if (!file || !isAudioFile(file)) {
      return;
    }
    setFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    console.log({ file });
    if (!isAudioFile(file)) {
      return;
    }
    setFile(file);
    setIsDragOver(false);
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
