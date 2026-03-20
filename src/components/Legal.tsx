import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

// Reusable Legal Document Component to dry up the code
const LegalDoc = ({ title, date, children }: { title: string, date: string, children: React.ReactNode }) => {
  return (
    <div className="bg-[#131B2F]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl space-y-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-600"></div>

      <div className="space-y-4 border-b border-white/10 pb-8">
        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">{title}</h1>
        <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Last Updated: {date}</p>
      </div>

      <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white prose-a:text-cyan-400 max-w-none prose-lg">
        {children}
      </div>
    </div>
  );
};

export function PrivacyPolicy() {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white py-12 px-4 md:px-8 font-sans selection:bg-cyan-500/30">
      <div className="max-w-4xl mx-auto space-y-8">
        <a href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors font-medium text-sm">
          <ArrowLeft size={16} /> Back to Home
        </a>

        <LegalDoc title="Privacy Policy" date="March 2026">
          <p>
            Welcome to the {settings.site_name} Privacy Policy. Your privacy is critically important to us.
            This document outlines how we collect, use, and protect your personal data when you interact with our network, including our website, community platforms, and affiliated services.
          </p>

          <h3>1. Information We Collect</h3>
          <p>
            When you join {settings.site_name}, we collect information that identifies you as an individual ("Personal Data").
            This includes your name, email address, physical location, professional role, skills, and any avatar or bio you provide.
          </p>

          <h3>2. How We Use Your Information</h3>
          <p>
            We use your data to:
            <ul>
              <li>Provide, operate, and maintain our platform.</li>
              <li>Improve, personalize, and expand the {settings.site_name} community experience.</li>
              <li>Understand and analyze how you use our platform.</li>
              <li>Develop new products, services, features, and functionality.</li>
              <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes.</li>
              <li>Send you emails.</li>
              <li>Find and prevent fraud.</li>
            </ul>
          </p>

          <h3>3. Sharing Your Information</h3>
          <p>
            We do not sell, trade, or rent your personal identification information to others.
            However, by creating a profile, certain information (such as your name, role, bio, and skills) will be publicly visible to other members of the {settings.site_name} community via the Explore page.
            We may share generic aggregated demographic information not linked to any personal identification information regarding visitors and users with our business partners, trusted affiliates, and advertisers for the purposes outlined above.
          </p>

          <h3>4. Data Security</h3>
          <p>
            We adopt appropriate data collection, storage, and processing practices and security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information, username, password, transaction information, and data stored on our platform.
            Our site is in compliance with PCI vulnerability standards in order to create as secure an environment as possible for users.
          </p>

          <h3>5. Your Data Protection Rights</h3>
          <p>
            You have the right to access, update, or delete the information we have on you.
            Whenever made possible, you can access, update, or request deletion of your Personal Data directly within your account settings section.
            If you are unable to perform these actions yourself, please contact us to assist you.
          </p>

          <h3>6. Changes to This Privacy Policy</h3>
          <p>
            {settings.site_name} has the discretion to update this privacy policy at any time. When we do, we will revise the updated date at the top of this page. We encourage users to frequently check this page for any changes to stay informed about how we are helping to protect the personal information we collect.
            You acknowledge and agree that it is your responsibility to review this privacy policy periodically and become aware of modifications.
          </p>

          <h3>7. Contact Us</h3>
          <p>
            If you have any questions about this Privacy Policy, the practices of this site, or your dealings with this site, please contact us.
          </p>
        </LegalDoc>
      </div>
    </div>
  );
}

export function TermsOfService() {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white py-12 px-4 md:px-8 font-sans selection:bg-cyan-500/30">
      <div className="max-w-4xl mx-auto space-y-8">
        <a href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors font-medium text-sm">
          <ArrowLeft size={16} /> Back to Home
        </a>

        <LegalDoc title="Terms of Service" date="March 2026">
          <p>
            These Terms of Service govern your use of the website located at {settings.site_name} and any related services provided by {settings.site_name}.
          </p>
          <p>
            By accessing our platform, you agree to abide by these Terms of Service and to comply with all applicable laws and regulations.
            If you do not agree with these Terms of Service, you are prohibited from using or accessing this website or using any other services provided by {settings.site_name}.
          </p>

          <h3>1. Limitations of Use</h3>
          <p>
            By using this website, you warrant on behalf of yourself, your users, and other parties you represent that you will not:
            <ul>
              <li>Modify, copy, prepare derivative works of, decompile, or reverse engineer any materials and software contained on this website.</li>
              <li>Remove any copyright or other proprietary notations from any materials and software on this website.</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
              <li>Knowingly or negligently use this website or any of its associated services in a way that abuses or disrupts our networks or any other service {settings.site_name} provides.</li>
              <li>Use this website or its associated services to transmit or publish any harassing, indecent, obscene, fraudulent, or unlawful material.</li>
              <li>Use this website or its associated services in violation of any applicable laws or regulations.</li>
              <li>Use this website in conjunction with sending unauthorized advertising or spam.</li>
              <li>Harvest, collect, or gather user data without the user's consent.</li>
              <li>Use this website or its associated services in such a way that may infringe the privacy, intellectual property rights, or other rights of third parties.</li>
            </ul>
          </p>

          <h3>2. Intellectual Property</h3>
          <p>
            The intellectual property in the materials contained in this website are owned by or licensed to {settings.site_name} and are protected by applicable copyright and trademark law.
            We grant our users permission to download one copy of the materials for personal, non-commercial transitory viewing.
          </p>
          <p>
            This constitutes the grant of a license, not a transfer of title. This license shall automatically terminate if you violate any of these restrictions or the Terms of Service, and may be terminated by {settings.site_name} at any time.
          </p>

          <h3>3. User-Generated Content</h3>
          <p>
            You retain your intellectual property ownership rights over content you submit to us for publication on our website. We will never claim ownership of your content, but we do require a license from you in order to use it.
          </p>
          <p>
            When you use our website or its associated services to post, upload, share, or otherwise transmit content covered by intellectual property rights, you grant to us a non-exclusive, royalty-free, transferable, sub-licensable, worldwide license to use, distribute, modify, run, copy, publicly perform or display, translate, and create derivative works of your content in a manner that is consistent with your privacy preferences and our Privacy Policy.
          </p>

          <h3>4. Liability</h3>
          <p>
            Our website and the materials on our website are provided on an 'as is' basis. To the extent permitted by law, {settings.site_name} makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property, or other violation of rights.
          </p>

          <h3>5. Accuracy of Materials</h3>
          <p>
            The materials appearing on our website are not comprehensive and are for general information purposes only. {settings.site_name} does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on this website, or otherwise relating to such materials or on any resources linked to this website.
          </p>

          <h3>6. Links</h3>
          <p>
            {settings.site_name} has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement, approval, or control by {settings.site_name} of the site. Use of any such linked site is at your own risk and we strongly advise you make your own investigations with respect to the suitability of those sites.
          </p>

          <h3>7. Modifications</h3>
          <p>
            We may revise these Terms of Service for our website at any time without notice. By using this website you are agreeing to be bound by the then current version of these Terms of Service.
          </p>
        </LegalDoc>
      </div>
    </div>
  );
}

export function CodeOfConduct() {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white py-12 px-4 md:px-8 font-sans selection:bg-cyan-500/30">
      <div className="max-w-4xl mx-auto space-y-8">
        <a href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors font-medium text-sm">
          <ArrowLeft size={16} /> Back to Home
        </a>

        <LegalDoc title="Code of Conduct" date="March 2026">
          <p>
            At {settings.site_name}, we are committed to providing a friendly, safe, and welcoming environment for all, regardless of level of experience, gender identity and expression, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, nationality, or other similar characteristic.
          </p>

          <h3>Our Pledge</h3>
          <p>
            In the interest of fostering an open and welcoming environment, we as contributors and maintainers pledge to making participation in our project and our community a harassment-free experience for everyone.
          </p>

          <h3>Our Standards</h3>
          <p>
            Examples of behavior that contributes to creating a positive environment include:
            <ul>
              <li>Using welcoming and inclusive language.</li>
              <li>Being respectful of differing viewpoints and experiences.</li>
              <li>Gracefully accepting constructive criticism.</li>
              <li>Focusing on what is best for the community.</li>
              <li>Showing empathy towards other community members.</li>
            </ul>
          </p>

          <p>
            Examples of unacceptable behavior by participants include:
            <ul>
              <li>The use of sexualized language or imagery and unwelcome sexual attention or advances.</li>
              <li>Trolling, insulting/derogatory comments, and personal or political attacks.</li>
              <li>Public or private harassment.</li>
              <li>Publishing others' private information, such as a physical or electronic address, without explicit permission.</li>
              <li>Other conduct which could reasonably be considered inappropriate in a professional setting.</li>
            </ul>
          </p>

          <h3>Enforcement</h3>
          <p>
            Community leaders are responsible for clarifying the standards of acceptable behavior and are expected to take appropriate and fair corrective action in response to any instances of unacceptable behavior.
          </p>
          <p>
            Community leaders have the right and responsibility to remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions that are not aligned to this Code of Conduct, or to ban temporarily or permanently any contributor for other behaviors that they deem inappropriate, threatening, offensive, or harmful.
          </p>

          <h3>Reporting Issues</h3>
          <p>
            Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team. All complaints will be reviewed and investigated and will result in a response that is deemed necessary and appropriate to the circumstances. The project team is obligated to maintain confidentiality with regard to the reporter of an incident.
          </p>
        </LegalDoc>
      </div>
    </div>
  );
}
