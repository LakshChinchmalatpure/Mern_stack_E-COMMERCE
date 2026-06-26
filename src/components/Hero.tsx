import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Hero({ onExploreClick }: { onExploreClick: () => void }) {
  return (
    <div className="relative overflow-hidden bg-gray-900 py-24 sm:py-32 rounded-2xl my-6 mx-4 sm:mx-6 lg:mx-8">
      {/* Background visual accents */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#312e81_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-500 blur-3xl opacity-30"></div>
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-700 blur-3xl opacity-25"></div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold leading-6 text-indigo-400 ring-1 ring-inset ring-indigo-500/20"
          >
            <Sparkles className="h-3 w-3" />
            <span>Discover the Future of Audio & Design</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-6xl font-sans"
          >
            Premium Accessories, Curated for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-200">Professionals</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 text-lg leading-8 text-gray-300"
          >
            Upgrade your daily workflows, workspaces, and lifestyle with our meticulously selected, artisanal technology, minimalist carry gadgets, and premium home goods.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <button
              onClick={onExploreClick}
              className="group flex items-center gap-1.5 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <span>Explore Collection</span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>
            <button
              onClick={onExploreClick}
              className="text-sm font-semibold leading-6 text-white hover:text-indigo-200 transition"
            >
              Learn our philosophy <span aria-hidden="true">→</span>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
