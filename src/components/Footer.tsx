import React, { useState } from "react";
import { GeneralSettings } from "../types";
import { Shield, BookOpen, ExternalLink, HelpCircle } from "lucide-react";

interface FooterProps {
  settings: GeneralSettings;
  lang: "en" | "np";
}

export default function Footer({ settings, lang }: FooterProps) {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Useful links default
  const usefulLinks = [
    { labelEn: "Tribhuvan University Portal", labelNp: "त्रिभुवन विश्वविद्यालय पोर्टल", url: "https://tu.edu.np" },
    { labelEn: "TU Exam Controller Office", labelNp: "त्रिवि परीक्षा नियन्त्रण कार्यालय", url: "https://tuexam.edu.np" },
    { labelEn: "UGC Nepal", labelNp: "विश्वविद्यालय अनुदान आयोग", url: "https://ugcnepal.edu.np" },
    { labelEn: "Ministry of Education Nepal", labelNp: "शिक्षा मन्त्रालय नेपाल", url: "https://moest.gov.np" },
  ];

  return (
    <footer className="relative bg-slate-950 text-gray-300 pt-12 pb-6 border-t-4 border-red-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        
        {/* Column 1: Info and Campus Address */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">
            {lang === "en" ? "FSU Darchula Multiple Campus" : "स्ववियु दार्चुला बहुमुखी क्याम्पस"}
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            {lang === "en"
              ? "Established to represent, empower, and inspire students. Empowering minds and leading remote mountain communities to academic and social excellence."
              : "विद्यार्थी हकहितको संरक्षण, शैक्षिक विकास र नेतृत्व विकासका लागि सदैव क्रियाशील स्वतन्त्र विद्यार्थी युनियन।"}
          </p>
          <div className="text-xs text-gray-500 font-mono">
            Khalanga, Darchula, Sudurpashchim, Nepal<br />
            Email: info@fsudmc.edu.np
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">
            {lang === "en" ? "Useful Links" : "महत्वपूर्ण लिङ्कहरू"}
          </h3>
          <ul className="space-y-2 text-sm">
            {usefulLinks.map((link, idx) => (
              <li key={idx}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
                  <span>{lang === "en" ? link.labelEn : link.labelNp}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Policy & Legal Toggles */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">
            {lang === "en" ? "Terms & Privacy" : "नीति तथा सर्तहरू"}
          </h3>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowPrivacy(true)}
              className="text-left text-sm text-gray-400 hover:text-white transition flex items-center gap-2 cursor-pointer"
            >
              <Shield className="w-4 h-4 text-amber-500" />
              <span>{lang === "en" ? "Privacy Policy" : "गोपनीयता नीति"}</span>
            </button>
            <button
              onClick={() => setShowTerms(true)}
              className="text-left text-sm text-gray-400 hover:text-white transition flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>{lang === "en" ? "Terms & Conditions" : "सर्त तथा बन्देजहरू"}</span>
            </button>
          </div>
          {/* Settings and links customizable info removed */}
        </div>
      </div>

      {/* Toggles for Privacy and Terms modal display */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-lg w-full text-gray-100 shadow-2xl relative">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-amber-400 font-serif">
              <Shield className="w-5 h-5" />
              {lang === "en" ? "Privacy Policy" : "गोपनीयता नीति"}
            </h3>
            <p className="text-sm leading-relaxed text-gray-300 whitespace-pre-line mb-6 font-sans">
              {lang === "en" ? (settings?.privacyPolicyEn) : (settings?.privacyPolicyNp)}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowPrivacy(false)}
                className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-sm font-semibold transition cursor-pointer"
              >
                {lang === "en" ? "Close" : "बन्द गर्नुहोस्"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-lg w-full text-gray-100 shadow-2xl relative">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-amber-400 font-serif">
              <BookOpen className="w-5 h-5" />
              {lang === "en" ? "Terms & Conditions" : "प्रयोगका सर्तहरू"}
            </h3>
            <p className="text-sm leading-relaxed text-gray-300 whitespace-pre-line mb-6 font-sans">
              {lang === "en" ? (settings?.termsEn) : (settings?.termsNp)}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowTerms(false)}
                className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-sm font-semibold transition cursor-pointer"
              >
                {lang === "en" ? "Close" : "बन्द गर्नुहोस्"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-slate-900 my-6 max-w-7xl mx-auto px-4" />

      {/* The Permanent Flickering Bold Attribution to Amit */}
      <div className="text-center px-4 flex flex-col items-center justify-center gap-1.5">
        <p className="text-xs text-gray-500 font-mono tracking-wider">
          &copy; {new Date().getFullYear()} Darchula Multiple Campus. All rights reserved.
        </p>
        <p className="text-xs text-gray-500 font-mono tracking-wider uppercase">
          <span className="mr-1">
            {lang === "en" ? "Designed With Love and For" : "माया र आदरको उपहार स्वरूप क्याम्पसलाई समर्पित"}
          </span>
          <span className="mr-1">
            {lang === "en" ? "Token of Love To Campus BY" : ""}
          </span>
          <a
            id="amit-signature"
            href="https://facebook.com/amitjoc"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-gray-400 hover:text-amber-400 transition-colors underline decoration-dotted"
            title="Visit Amit's Profile"
          >
            AMIT
          </a>
        </p>
      </div>
    </footer>
  );
}
