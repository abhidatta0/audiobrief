import ApiInputKey from "@/components/ApiInputKey";

export default function HeroSection() {
  return (
    <div className="min-h-full bg-linear-to-br from-slate-50 to-slate-100 py-16 px-6">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Upload Your Audio File
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          We&apos;ll generate thumbnail ideas, titles, and descriptions
          automatically
        </p>
      </div>

      <ApiInputKey />
    </div>
  );
}
