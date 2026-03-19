import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer: React.FC = () => {
  // Set target date to 7 days from now
  const [targetDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.getTime();
  });

  const calculateTimeLeft = (): TimeLeft | null => {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      return null;
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      const updatedTime = calculateTimeLeft();
      setTimeLeft(updatedTime);
      if (!updatedTime) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="w-full flex flex-col items-center justify-center mb-8 space-y-4">
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-cyan-400/80 text-xs md:text-sm font-mono tracking-[0.3em] uppercase"
      >
        {timeLeft ? "Founding Members Access Opens In" : "We Are Live"}
      </motion.p>

      <AnimatePresence mode="wait">
        {timeLeft ? (
          <motion.div 
            key="timer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex items-center gap-2 md:gap-4 font-mono"
          >
            <TimeUnit value={formatNumber(timeLeft.days)} label="d" />
            <span className="text-white/20 text-xl md:text-2xl">:</span>
            <TimeUnit value={formatNumber(timeLeft.hours)} label="h" />
            <span className="text-white/20 text-xl md:text-2xl">:</span>
            <TimeUnit value={formatNumber(timeLeft.minutes)} label="m" />
            <span className="text-white/20 text-xl md:text-2xl">:</span>
            <TimeUnit value={formatNumber(timeLeft.seconds)} label="s" />
          </motion.div>
        ) : (
          <motion.div
            key="live"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]"
          >
            NETWORK ACTIVE
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TimeUnit = ({ value, label }: { value: string; label: string }) => (
  <div className="flex items-baseline gap-1">
    <div className="relative group">
      <div className="absolute -inset-2 bg-cyan-500/10 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <span className="relative text-2xl md:text-4xl font-bold text-white tabular-nums tracking-tight">
        {value}
      </span>
    </div>
    <span className="text-xs md:text-sm text-gray-500 font-medium lowercase">
      {label}
    </span>
  </div>
);

export default CountdownTimer;
