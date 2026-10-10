import { KeyRound, Info, EyeIcon, EyeClosed, ChevronDown } from "lucide-react";
import { useState } from "react";

interface Props {
  onChangeApiKey: (key: string) => void;
  apiKey: string;
}
const ApiInputKey = ({ onChangeApiKey, apiKey }: Props) => {
  const [showPassword, setShowPassword] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const PasswordIcon = showPassword ? EyeIcon : EyeClosed;
  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 p-3 mb-6 border border-slate-200 space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 font-semibold text-slate-700">
          <KeyRound className="text-brand-600" />
          OpenRouter AI API Key
        </label>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-slate-600 transition-colors"
          aria-label={collapsed ? "Expand" : "Collapse"}
        >
          <ChevronDown
            className={`transition-transform duration-200 ${collapsed ? "rotate-180" : "rotate-0"}`}
          />
        </button>
      </div>

      {!collapsed && (
        <>
          <p className="text-xs text-slate-500 mt-2 flex items-start gap-1.5">
            <Info className="w-4 h-4 shrink-0 mt-px" />
            Your OpenRouter API key stays in your browser and is only sent to
            OpenRouter.{" "}
            <a
              className="font-medium text-blue-600 underline underline-offset-2"
              rel="noreferrer"
              href="https://openrouter.ai/settings/keys"
              target="_blank"
            >
              Click here for Openrouter API key
            </a>
          </p>

          <div className="flex items-center border border-slate-200 focus:ring-2 focus:ring-blue-500 pl-2 rounded-lg">
            <PasswordIcon
              className="text-slate-400"
              onClick={() => setShowPassword(!showPassword)}
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your api key"
              value={apiKey}
              onChange={(e) => onChangeApiKey(e.target.value.trim())}
              className="w-full p-2 bg-white border-none  focus:outline-none focus:border-transparent transition-all"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ApiInputKey;
