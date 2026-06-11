/**
 * PageTransition — wraps <Outlet /> with a smooth fade+lift animation.
 *
 * Uses framer-motion AnimatePresence (already installed).
 * The motion.div is keyed by pathname so changing routes triggers exit + enter.
 * mode="wait" ensures the old page fully fades before the new one appears.
 * initial={false} skips the animation on the very first page load.
 */

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -6 },
};

type Props = { children: ReactNode };

export default function PageTransition({ children }: Props) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
