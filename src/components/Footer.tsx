import React from "react";
import { GeneralSettings } from "../types";
import { Shield, BookOpen, ExternalLink, HelpCircle, Users, GraduationCap, Building2, Mail, MapPin } from "lucide-react";

interface FooterProps {
  settings?: GeneralSettings;
  onNavigate?: (slug: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const handleNav = (slug: string, e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(slug);
    }
  };

  const usefulLinks = [
    { label: "Farwestern University Portal", url: "https://fwu.edu.np" },
    { label: "FWU Examination Controller", url: "https://fwu.edu.np" },
    { label: "UGC Nepal (University Grants Commission)", url: "https://ugcnepal.edu.np" },
    { label: "Ministry of Education (Nepal)", url: "https://moest.gov.np" },
  ];

  return (
    <footer className="relative bg-slate-950 text-gray-300 pt-12 pb-8 border-t-4 border-red-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        {/* Column 1: Info and Campus Address */}
        <div className="space-y-3">
          <h3 className="text-base font-bold font-serif text-white border-b border-gray-800 pb-2">
            Free Student Union - DMC
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            The official student representation council of Darchula Multiple Campus, proudly affiliated with{" "}
            <a
              href="https://fwu.edu.np"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline font-semibold"
            >
              Farwestern University
            </a>
            .
          </p>
          <div className="text-xs text-gray-400 space-y-1 pt-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>Khalanga, Darchula, Sudurpashchim, Nepal</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <a href="mailto:info@fsudmc.com" className="hover:text-amber-400 underline">
                info@fsudmc.com
              </a>
            </div>
            <div className="text-[11px] font-mono text-gray-500 pt-1">
              Base Domain: https://fsudmc.com
            </div>
          </div>
        </div>

        {/* Column 2: Campus Directories */}
        <div>
          <h3 className="text-base font-bold font-serif text-white mb-4 border-b border-gray-800 pb-2">
            Campus Directories
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <a
                href="/campus-staff"
                onClick={(e) => handleNav("campus-staff", e)}
                className="hover:text-amber-400 transition flex items-center gap-2"
              >
                <Users className="w-3.5 h-3.5 text-amber-500" />
                <span>Campus Staff Directory</span>
              </a>
            </li>
            <li>
              <a
                href="/professors"
                onClick={(e) => handleNav("professors", e)}
                className="hover:text-amber-400 transition flex items-center gap-2"
              >
                <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                <span>Professors & Academic Directory</span>
              </a>
            </li>
            <li>
              <a
                href="/fsu-helpdesk"
                onClick={(e) => handleNav("fsu-helpdesk", e)}
                className="hover:text-amber-400 transition flex items-center gap-2"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Unique FSU Helpdesk</span>
              </a>
            </li>
            <li>
              <a
                href="/contact-secretariat"
                onClick={(e) => handleNav("contact-secretariat", e)}
                className="hover:text-amber-400 transition flex items-center gap-2"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-500" />
                <span>Contact Secretariat</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Useful Links */}
        <div>
          <h3 className="text-base font-bold font-serif text-white mb-4 border-b border-gray-800 pb-2">
            Useful Links
          </h3>
          <ul className="space-y-2 text-xs">
            {usefulLinks.map((link, idx) => (
              <li key={idx}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
                  <span>{link.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Policy & Legal Pages */}
        <div>
          <h3 className="text-base font-bold font-serif text-white mb-4 border-b border-gray-800 pb-2">
            Terms & Governance
          </h3>
          <div className="flex flex-col gap-2.5 text-xs">
            <a
              href="/privacy-policy"
              onClick={(e) => handleNav("privacy-policy", e)}
              className="text-left text-gray-400 hover:text-white transition flex items-center gap-2 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <span>Privacy Policy</span>
            </a>
            <a
              href="/terms-and-conditions"
              onClick={(e) => handleNav("terms-and-conditions", e)}
              className="text-left text-gray-400 hover:text-white transition flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>Terms and Conditions</span>
            </a>
            <a
              href="/contact"
              onClick={(e) => handleNav("contact", e)}
              className="text-left text-gray-400 hover:text-white transition flex items-center gap-2 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-amber-500" />
              <span>Official Feedback & Complaints</span>
            </a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-900 my-6 max-w-7xl mx-auto px-4" />

      {/* Attribution Line */}
      <div className="text-center px-4 flex flex-col items-center justify-center gap-2">
        <p className="text-xs text-gray-500 font-mono tracking-wider">
          &copy; {new Date().getFullYear()} Free Student Union - DMC | Darchula Multiple Campus. All rights reserved.
        </p>
        <p className="text-xs text-gray-400 font-sans tracking-wide">
          Built with Love, Dedicated to FSUDMC —{" "}
          <a
            id="amit-signature"
            href="https://www.fsudmc.com/#contact"
            className="text-amber-400 hover:text-amber-300 underline decoration-amber-400/80 transition-colors"
            title="Profile of Amit - FSU President"
          >
            <b>BY AMIT</b>
          </a>
        </p>
      </div>
    </footer>
  );
}
