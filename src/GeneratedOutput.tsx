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
const GeneratedOutput = ({ data }: GeneratedOutputProps) => {
  return (
    <div className=" bg-white p-8 mt-2">
      <span className="text-xl font-semibold text-brand-400 uppercase tracking-widest">
        Generated Results
      </span>
      <div className="mx-auto space-y-12 mt-3">
        <Titles titles={data.titles} />

        <Thumbnails images={data.images} />

        <Descriptions descriptions={data.descriptions} />
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
      className="space-y-4"
    >
      <motion.h2
        variants={ANIMATION_VARIANTS.itemVariant}
        className="text-lg font-medium text-gray-700 tracking-wide mb-6 border-b-brand-600 border-b-2"
      >
        Titles
      </motion.h2>

      {titles.map((title, index) => (
        <motion.div
          key={index}
          variants={ANIMATION_VARIANTS.itemVariant}
          className="group relative bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
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
      className="space-y-4"
    >
      <motion.h2
        variants={ANIMATION_VARIANTS.itemVariant}
        className="text-lg font-medium text-gray-700 tracking-wide border-b-brand-600 border-b-2"
      >
        Thumbnails
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                className="w-full h-full object-fill"
              />

              {/* Hover Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-black/50 flex items-center justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDownload(image, index)}
                  className="bg-white rounded-full p-3 shadow-lg"
                  aria-label="Download thumbnail"
                >
                  <Download className="w-5 h-5 text-gray-800" />
                </motion.button>
              </motion.div>
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
      className="space-y-4"
    >
      <motion.h2
        variants={ANIMATION_VARIANTS.itemVariant}
        className="text-lg font-medium text-gray-700 tracking-wide mb-6 border-b-brand-600 border-b-2"
      >
        Descriptions
      </motion.h2>

      {descriptions.map((title, index) => (
        <motion.div
          key={index}
          variants={ANIMATION_VARIANTS.itemVariant}
          className="group relative bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
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
