import { KeyRound, Info } from "lucide-react";

const ApiInputKey = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 p-6 mb-6 border border-slate-200">
      <label className="flex items-center gap-2 font-semibold text-slate-700 mb-3">
        <KeyRound className="text-red-600" />
        AI Provider API Key
      </label>

      <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
        <Info />
        Your API key stays in your browser and is never stored on our servers
      </p>
    </div>
  );
};

export default ApiInputKey;
