import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';

interface CustomDropdownProps {
  label: string;
  icon: React.ReactNode;
  name: string;
  value: string;
  options: string[];
  placeholder: string;
  onChange: (name: string, value: string) => void;
  required?: boolean;
}

export default function CustomDropdown({
  label,
  icon,
  name,
  value,
  options,
  placeholder,
  onChange,
  required = false
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(name, option);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev < options.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : options.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) {
          handleSelect(options[activeIndex]);
        }
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="space-y-2" ref={dropdownRef} onKeyDown={handleKeyDown}>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-300 ml-1">
        {icon} {label}
      </label>
      
      <div className="relative">
        {/* Hidden input for Formspree */}
        <input 
          type="hidden" 
          name={name} 
          value={value} 
          required={required} 
        />
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={`w-full bg-white/5 border ${isOpen ? 'border-cyan-500/50 ring-2 ring-cyan-500/20' : 'border-white/10'} rounded-xl px-4 py-3 text-left text-white flex items-center justify-between transition-all duration-300 focus:outline-none focus-glow`}
        >
          <span className={value ? 'text-white' : 'text-gray-500'}>
            {value || placeholder}
          </span>
          <ChevronDown 
            size={18} 
            className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute z-50 w-full mt-2 bg-[#0B0F19]/90 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl overflow-hidden"
            >
              <div 
                role="listbox"
                className="max-h-60 overflow-y-auto py-2 custom-scrollbar"
              >
                {options.map((option, index) => (
                  <button
                    key={option}
                    type="button"
                    role="option"
                    aria-selected={value === option}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between transition-colors group ${
                      activeIndex === index ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400'
                    }`}
                  >
                    {option}
                    {value === option && (
                      <Check size={16} className="text-cyan-400" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
