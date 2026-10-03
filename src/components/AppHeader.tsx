import Modal from "@/components/Modal";
import { useState } from "react";

export default function Header() {
  const [showDemoRibbon, setShowDemoRibbon] = useState(true);
  const [showDemoModal, setShowDemoModal] = useState(false);

  return (
    <>
      <header className="relative bg-linear-to-br from-slate-900 to-slate-800 md:px-8 md:py-6 px-4 py-3 overflow-hidden sm:px-6 sm:py-5">
        {showDemoRibbon && (
          <div className="mb-3 flex w-fit items-center gap-1 rounded-full border border-brand-600/40 bg-white/95 py-1 pl-1 pr-1.5 shadow-lg shadow-brand-600/20 backdrop-blur lg:absolute lg:top-5 lg:right-0 lg:mb-0 lg:rounded-r-none lg:border-r-0 lg:pr-3">
            <button
              onClick={() => setShowDemoModal(true)}
              className="group flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold text-slate-800 transition-colors hover:bg-brand-600 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition-colors group-hover:bg-white group-hover:text-brand-600">
                <svg
                  viewBox="0 0 10 12"
                  aria-hidden="true"
                  className="ml-0.5 h-2.5 w-2.5 fill-current"
                >
                  <path d="M0 0 L10 6 L0 12 Z" />
                </svg>
              </span>
              Show demo
            </button>
            <button
              onClick={() => setShowDemoRibbon(false)}
              aria-label="Dismiss demo banner"
              className="flex h-6 w-6 items-center justify-center rounded-full text-sm leading-none text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-brand-600"
            >
              ✕
            </button>
          </div>
        )}
        <div className="relative z-10 max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-10 sm:h-10 bg-linear-to-br from-white to-brand-600 rounded-xl flex items-center justify-center text-2xl sm:text-xl shadow-lg shadow-blue-500/30 animate-float">
              🎵
            </div>

            <div className="flex flex-col">
              <div className="text-3xl sm:text-xl font-extrabold bg-linear-to-br from-white to-slate-300 bg-clip-text text-transparent tracking-tight">
                AudioBrief
              </div>
              <div className="text-sm sm:text-xs text-slate-400 tracking-wide -mt-0.5">
                YouTube thumbnails, titles & descriptions from audio
              </div>
            </div>
          </div>
        </div>
      </header>
      <Modal isVisible={showDemoModal} onClose={() => setShowDemoModal(false)}>
        <video
          controls
          className="w-full max-h-150"
          controlsList="nodownload nofullscreen"
        >
          <source src="/audiobrief-demo.mp4" type="video/mp4" />
        </video>
      </Modal>
    </>
  );
}
