import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, AlertTriangle, Zap } from 'lucide-react';
import { useCms } from '../contexts/CmsContext';

export default function AnnouncementBanner() {
  const { announcement } = useCms();
  const [isVisible, setIsVisible] = useState(true);

  if (!announcement || !isVisible) {
    return null;
  }

  const getStyles = () => {
    switch (announcement.type) {
      case 'warning':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'success':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'info':
      default:
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    }
  };

  const getIcon = () => {
    switch (announcement.type) {
      case 'warning':
        return <AlertTriangle size={18} />;
      case 'success':
        return <Zap size={18} />;
      case 'info':
      default:
        return <Info size={18} />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="w-full relative z-50 overflow-hidden"
      >
        <div className={`px-4 py-3 border-b flex items-center justify-between gap-4 ${getStyles()}`}>
          <div className="flex items-center gap-3 w-full justify-center text-sm font-medium text-center">
            {getIcon()}
            <span>{announcement.message}</span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white/50 hover:text-white transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
