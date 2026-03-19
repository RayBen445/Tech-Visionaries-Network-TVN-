/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Mail, Phone, Briefcase, Target, Award, Loader2, CheckCircle2, Globe } from 'lucide-react';
import ThreeBackground from './components/ThreeBackground';
import CustomDropdown from './components/CustomDropdown';
import CountdownTimer from './components/CountdownTimer';
import intlTelInput from 'intl-tel-input';
import 'intl-tel-input/build/css/intlTelInput.css';

export default function App() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    country: '',
    otherCountry: '',
    phone: '',
    role: '',
    skillLevel: '',
    goal: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const itiRef = useRef<any>(null);

  const formspreeId = import.meta.env.VITE_FORMSPREE_ID || 'maqpvynn';
  const whatsappNumber = "2348075614248";
  const whatsappMessage = encodeURIComponent("Hi, I just joined Tech Visionaries Network. Looking forward to building and collaborating.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const countryToIso: Record<string, string> = {
    "Algeria": "dz", "Angola": "ao", "Benin": "bj", "Botswana": "bw", "Burkina Faso": "bf",
    "Burundi": "bi", "Cabo Verde": "cv", "Cameroon": "cm", "Central African Republic": "cf",
    "Chad": "td", "Comoros": "km", "Congo (Congo-Brazzaville)": "cg",
    "Democratic Republic of the Congo": "cd", "Djibouti": "dj", "Egypt": "eg",
    "Equatorial Guinea": "gq", "Eritrea": "er", "Eswatini": "sz", "Ethiopia": "et",
    "Gabon": "ga", "Gambia": "gm", "Ghana": "gh", "Guinea": "gn", "Guinea-Bissau": "gw",
    "Ivory Coast": "ci", "Kenya": "ke", "Lesotho": "ls", "Liberia": "lr", "Libya": "ly",
    "Madagascar": "mg", "Malawi": "mw", "Mali": "ml", "Mauritania": "mr", "Mauritius": "mu",
    "Morocco": "ma", "Mozambique": "mz", "Namibia": "na", "Niger": "ne", "Nigeria": "ng",
    "Rwanda": "rw", "Sao Tome and Principe": "st", "Senegal": "sn", "Seychelles": "sc",
    "Sierra Leone": "sl", "Somalia": "so", "South Africa": "za", "South Sudan": "ss",
    "Sudan": "sd", "Tanzania": "tz", "Togo": "tg", "Tunisia": "tn", "Uganda": "ug",
    "Zambia": "zm", "Zimbabwe": "zw"
  };

  useEffect(() => {
    if (itiRef.current && formData.country && formData.country !== 'Others') {
      const iso = countryToIso[formData.country];
      if (iso) {
        itiRef.current.setCountry(iso);
      }
    }
  }, [formData.country]);

  useEffect(() => {
    if (itiRef.current && formData.country === 'Others' && formData.otherCountry) {
      // Try to match the typed country name to a country code
      const countries = (window as any).intlTelInputGlobals?.getCountryData() || [];
      const match = countries.find((c: any) => 
        c.name.toLowerCase().includes(formData.otherCountry.toLowerCase()) ||
        c.iso2.toLowerCase() === formData.otherCountry.toLowerCase()
      );
      if (match) {
        itiRef.current.setCountry(match.iso2);
      }
    }
  }, [formData.otherCountry]);

  useEffect(() => {
    let itiInstance: any;
    
    const initIti = () => {
      if (phoneInputRef.current && !isSuccess) {
        itiInstance = intlTelInput(phoneInputRef.current, {
          initialCountry: "auto",
          geoIpLookup: (callback) => {
            let called = false;
            const timeoutId = setTimeout(() => {
              if (!called) {
                called = true;
                callback("ng");
              }
            }, 2000);

            fetch("https://ipapi.co/json")
              .then((res) => res.json())
              .then((data) => {
                if (!called) {
                  called = true;
                  clearTimeout(timeoutId);
                  callback(data.country_code?.toLowerCase() || "ng");
                }
              })
              .catch(() => {
                if (!called) {
                  called = true;
                  clearTimeout(timeoutId);
                  callback("ng");
                }
              });
          },
          separateDialCode: true,
          utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js",
        } as any);
        itiRef.current = itiInstance;
      }
    };

    initIti();

    return () => {
      if (itiInstance) {
        try {
          itiInstance.destroy();
        } catch (e) {
          console.warn("Error destroying intlTelInput:", e);
        }
        itiRef.current = null;
      }
    };
  }, [isSuccess]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'phone') setPhoneError('');
  };

  const handleCustomChange = (name: string, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [name]: value,
      otherCountry: name === 'country' && value !== 'Others' ? '' : prev.otherCountry
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone
    let finalFormData = { ...formData };
    if (itiRef.current) {
      const phoneValue = phoneInputRef.current?.value.trim() || "";
      
      // Balanced validation: block if clearly too short
      if (phoneValue.length < 7) {
        setPhoneError('Please enter a valid phone number');
        return;
      }

      // Get full international number (E.164)
      const fullNumber = itiRef.current.getNumber();
      finalFormData.phone = fullNumber;
    }

    // Use otherCountry if country is "Others"
    if (finalFormData.country === 'Others' && finalFormData.otherCountry) {
      finalFormData.country = finalFormData.otherCountry;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...finalFormData,
          source: "TVN Early Access Landing Page",
          _redirect: whatsappUrl
        })
      });

      if (response.ok) {
        setIsSuccess(true);
        // Redirect after a short delay to show success message
        setTimeout(() => {
          window.location.href = whatsappUrl;
        }, 2000);
      } else {
        alert('Something went wrong. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Network error. Please check your connection.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-cyan-500/30">
      <ThreeBackground />

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl w-full text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-medium tracking-wider uppercase"
          >
            Africa’s Tech Builders Network
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-purple-200">
            Join Africa’s Tech <br className="hidden md:block" /> Builders Network
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Connect with developers, innovators, and builders shaping the future of tech in Africa.
          </p>
        </motion.div>

        {/* Countdown Timer */}
        <CountdownTimer />

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          <div className="relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative bg-[#0B0F19]/60 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-2xl shadow-2xl">
              <AnimatePresence mode="wait">
                {!isSuccess ? (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    <input type="hidden" name="source" value="TVN Early Access Landing Page" />
                    <input type="hidden" name="_redirect" value={whatsappUrl} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Full Name */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 ml-1">
                          <User size={16} className="text-cyan-400" /> Full Name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus-glow transition-all duration-300"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 ml-1">
                          <Mail size={16} className="text-cyan-400" /> Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus-glow transition-all duration-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Country */}
                      <CustomDropdown
                        label="Country"
                        icon={<Globe size={16} className="text-cyan-400" />}
                        name="country"
                        value={formData.country}
                        options={[
                          "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Cameroon", "Central African Republic", "Chad", "Comoros", "Congo (Congo-Brazzaville)", "Democratic Republic of the Congo", "Djibouti", "Egypt", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Ivory Coast", "Kenya", "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", "Sao Tome and Principe", "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan", "Tanzania", "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe", "Others"
                        ]}
                        placeholder="Select Country"
                        onChange={handleCustomChange}
                        required
                      />

                      {/* Other Country Input (Conditional) */}
                      <AnimatePresence>
                        {formData.country === 'Others' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2 overflow-hidden"
                          >
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 ml-1">
                              <Globe size={16} className="text-cyan-400" /> Specify Country
                            </label>
                            <input
                              type="text"
                              name="otherCountry"
                              required
                              value={formData.otherCountry}
                              onChange={handleChange}
                              placeholder="Enter your country"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus-glow transition-all duration-300"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Phone (intl-tel-input) */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 ml-1">
                          <Phone size={16} className="text-cyan-400" /> Phone Number
                        </label>
                        <input
                          ref={phoneInputRef}
                          type="tel"
                          required
                          onInput={() => setPhoneError('')}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus-glow transition-all duration-300"
                        />
                        <input type="hidden" name="phone" id="phone-hidden" value={formData.phone} />
                        {phoneError && (
                          <p className="text-red-400 text-xs mt-1 ml-1">{phoneError}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Role */}
                      <CustomDropdown
                        label="Role"
                        icon={<Briefcase size={16} className="text-cyan-400" />}
                        name="role"
                        value={formData.role}
                        options={["Developer", "Designer", "Data Analyst", "Beginner", "Founder"]}
                        placeholder="Select Role"
                        onChange={handleCustomChange}
                        required
                      />

                      {/* Skill Level */}
                      <CustomDropdown
                        label="Skill Level (Optional)"
                        icon={<Award size={16} className="text-cyan-400" />}
                        name="skillLevel"
                        value={formData.skillLevel}
                        options={["Beginner", "Intermediate", "Advanced"]}
                        placeholder="Select Level"
                        onChange={handleCustomChange}
                        required={false}
                      />
                    </div>

                    {/* Goal */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300 ml-1">
                        <Target size={16} className="text-cyan-400" /> Your Goal (Optional)
                      </label>
                      <textarea
                        name="goal"
                        value={formData.goal}
                        onChange={handleChange}
                        rows={4}
                        placeholder="What do you hope to achieve in the network?"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus-glow transition-all duration-300 resize-none"
                      ></textarea>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={!isSubmitting ? { scale: 1.02, boxShadow: "0 0 20px rgba(0, 209, 255, 0.3)" } : {}}
                      whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                      disabled={isSubmitting}
                      type="submit"
                      className={`w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-cyan-500/20'}`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Join Early Access
                          <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 text-center space-y-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 12, stiffness: 200 }}
                      className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cyan-500/20 text-cyan-400 mb-4"
                    >
                      <CheckCircle2 size={48} />
                    </motion.div>
                    <h2 className="text-3xl font-bold">Welcome to TVN!</h2>
                    <p className="text-gray-400 text-lg">
                      Your application has been received successfully.
                    </p>
                    <div className="flex flex-col items-center gap-3 pt-4">
                      <Loader2 size={24} className="animate-spin text-cyan-400" />
                      <p className="text-cyan-400 font-medium animate-pulse">
                        Redirecting you to WhatsApp...
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="mt-20 text-gray-500 text-sm font-mono tracking-widest uppercase">
          © 2026 Tech Visionaries Network • TVN
        </footer>
      </main>
    </div>
  );
}
