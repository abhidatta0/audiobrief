import { Mail } from "lucide-react";

const FEEDBACK_EMAIL = "abhidatta146@gmail.com";
const FEEDBACK_SUBJECT = "AudioBrief feedback";

export default function Footer() {
  return (
    <footer className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 border-t border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
      <span>Feedback or bugs?</span>
      <a
        href={`mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(FEEDBACK_SUBJECT)}`}
        className="inline-flex items-center gap-1 font-semibold text-brand-600 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 rounded"
      >
        <Mail className="w-4 h-4 shrink-0" />
        Email me
      </a>
    </footer>
  );
}
