import { useState } from "react";
import { motion, stagger } from "motion/react";
import { Copy, Check, Download } from "lucide-react";

export interface GeneratedResponse {
  images: string[];
  titles: string[];
  descriptions: string[];
}

interface GeneratedOutputProps {
  data: GeneratedResponse;
}

const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        delayChildren: stagger(0.07),
      },
    },
  },

  itemVariant: {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  },
} as const;

const COPY_FEEDBACK_DURATION = 2000;

const handleDownload = (imageUrl: string, index: number) => {
  const link = document.createElement("a");
  link.href = imageUrl;
  link.download = `thumbnail-${index + 1}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
type Tab = "titles" | "thumbnails" | "descriptions";
const TABS: { id: Tab; label: string }[] = [
  { id: "titles", label: "Titles" },
  { id: "thumbnails", label: "Thumbnails" },
  { id: "descriptions", label: "Descriptions" },
];

const GeneratedOutput = ({ data }: GeneratedOutputProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("titles");

  // On mobile only the active tab is shown; on md+ every section is visible
  const sectionClass = (tab: Tab) =>
    activeTab === tab ? "block" : "hidden md:block";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 p-4 md:p-8 mt-6">
      <span className="text-sm md:text-xl font-semibold text-brand-400 uppercase tracking-widest">
        Generated Results
      </span>

      <div
        role="tablist"
        className="md:hidden sticky top-2 z-10 mt-3 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 shadow-sm"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg py-2 text-xs font-semibold transition-colors ${
              activeTab === tab.id
                ? "bg-white text-brand-600 shadow"
                : "text-slate-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mx-auto md:space-y-12 mt-4 md:mt-3">
        <div className={sectionClass("titles")}>
          <Titles titles={data.titles} />
        </div>

        <div className={sectionClass("thumbnails")}>
          <Thumbnails images={data.images} />
        </div>

        <div className={sectionClass("descriptions")}>
          <Descriptions descriptions={data.descriptions} />
        </div>
      </div>
    </div>
  );
};

export default GeneratedOutput;

interface TitlesListProps {
  titles: string[];
}
const Titles = ({ titles }: TitlesListProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), COPY_FEEDBACK_DURATION);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };
  return (
    <motion.div
      variants={ANIMATION_VARIANTS.container}
      initial="hidden"
      animate="show"
      className="space-y-3 md:space-y-4"
    >
      <motion.h2
        variants={ANIMATION_VARIANTS.itemVariant}
        className="hidden md:block text-lg font-medium text-gray-700 tracking-wide mb-6 border-b-brand-600 border-b-2"
      >
        Titles
      </motion.h2>

      {titles.map((title, index) => (
        <motion.div
          key={index}
          variants={ANIMATION_VARIANTS.itemVariant}
          className="group relative bg-gray-50 rounded-lg p-3 md:p-4 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-start justify-between gap-2 md:gap-4">
            <p className="text-gray-800 flex-1 leading-relaxed">{title}</p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCopy(title, index)}
              className="shrink-0 p-2 rounded-md hover:bg-white transition-colors"
              aria-label="Copy title"
            >
              {copiedIndex === index ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              )}
            </motion.button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

interface ThumbnailListProps {
  images: string[];
}

const Thumbnails = ({ images }: ThumbnailListProps) => {
  return (
    <motion.div
      variants={ANIMATION_VARIANTS.container}
      initial="hidden"
      animate="show"
      className="space-y-3 md:space-y-4"
    >
      <motion.h2
        variants={ANIMATION_VARIANTS.itemVariant}
        className="hidden md:block text-lg font-medium text-gray-700 tracking-wide border-b-brand-600 border-b-2"
      >
        Thumbnails
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {images.map((image, index) => (
          <motion.div
            key={index}
            variants={ANIMATION_VARIANTS.itemVariant}
            className="group relative"
          >
            {/* Thumbnail Container */}
            <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />

              <div className="absolute bottom-2 right-2 md:inset-0 md:flex md:items-center md:justify-center transition-opacity md:bg-black/50 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDownload(image, index)}
                  className="bg-white/90 rounded-full p-2.5 md:p-3 shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                  aria-label="Download thumbnail"
                >
                  <Download className="w-4 h-4 md:w-5 md:h-5 text-gray-800" />
                </motion.button>
              </div>
            </div>

            {/* Dimensions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-2 text-xs text-gray-500 text-center"
            >
              1280 x 720
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

interface DescriptionListProps {
  descriptions: string[];
}
const Descriptions = ({ descriptions }: DescriptionListProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), COPY_FEEDBACK_DURATION);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };
  return (
    <motion.div
      variants={ANIMATION_VARIANTS.container}
      initial="hidden"
      animate="show"
      className="space-y-3 md:space-y-4"
    >
      <motion.h2
        variants={ANIMATION_VARIANTS.itemVariant}
        className="hidden md:block text-lg font-medium text-gray-700 tracking-wide mb-6 border-b-brand-600 border-b-2"
      >
        Descriptions
      </motion.h2>

      {descriptions.map((title, index) => (
        <motion.div
          key={index}
          variants={ANIMATION_VARIANTS.itemVariant}
          className="group relative bg-gray-50 rounded-lg p-3 md:p-4 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-start justify-between gap-2 md:gap-4">
            <p className="text-gray-800 flex-1 leading-relaxed">{title}</p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCopy(title, index)}
              className="shrink-0 p-2 rounded-md hover:bg-white transition-colors"
              aria-label="Copy title"
            >
              {copiedIndex === index ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              )}
            </motion.button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};
