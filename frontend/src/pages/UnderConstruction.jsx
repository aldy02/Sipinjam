import underConstructionGif from "../assets/underConstructionAnimation.gif";
import { motion } from "framer-motion";

export default function UnderConstruction() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-[#F4F7FE]">
      
      {/* GIF */}
      <motion.img
        src={underConstructionGif}
        alt="Under Construction"
        className="w-80 md:w-96 lg:w-105 object-contain mb-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      />

      {/* Title */}
      <motion.h2
        className="text-2xl md:text-3xl font-bold text-primary-1 mb-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Fitur sedang dalam pengembangan!
      </motion.h2>

      {/* Description */}
      <motion.p
        className="text-base md:text-lg text-neutral-2 max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Halaman ini akan segera tersedia. Terima kasih atas kesabaranmu.
      </motion.p>
    </div>
  );
}