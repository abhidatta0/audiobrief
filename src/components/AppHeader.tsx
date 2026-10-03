import Modal from "@/components/Modal";
import { useState } from "react";

export default function Header() {
  const [showDemoRibbon, setShowDemoRibbon] = useState(true);
  const [showDemoModal, setShowDemoModal] = useState(false);

  return (
    <>
      <header className="relative bg-linear-to-br from-slate-900 to-slate-800 md:px-8 md:py-6 px-4 py-3 overflow-hidden sm:px-6 sm:py-5">
        {showDemoRibbon && (
          <div className="static mb-2 lg:absolute  z-2 top-5 right-0 bg-white border-2 border-brand-600 rounded-l px-2  flex gap-2 justify-between">
            <button onClick={() => setShowDemoModal(true)}>Show demo</button>
            <button
              onClick={() => setShowDemoRibbon(false)}
              className="text-xs text-brand-400"
            >
              X
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
