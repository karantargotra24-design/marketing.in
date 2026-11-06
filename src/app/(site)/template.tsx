"use client";

import { motion } from "framer-motion";

/** Soft fade between pages. Opacity only: a transform here would break position:fixed children (modal, curtain). */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
