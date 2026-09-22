import React, { useState } from "react";
import { ref, push, set } from "firebase/database";
import { rtdb } from "../lib/firebase";
import {
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  AlertCircle,
  FileQuestion,
  BookOpen,
  Send,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQ[] = [
  {
    category: "Academics",
    question: "How do I register for Farwestern University semester/annual examinations?",
    answer:
      "Examination registration forms are published on the campus notice board and the Syllabus/Notes section of this portal. Fill out the prescribed form, attach 2 passport photographs, clear campus dues with the Account Section, and submit to the Examination Section before the deadline stated in official notices.",
  },
  {
    category: "Admissions",
    question: "What documents are required for admission into BBS, B.Ed, or BA first year?",
    answer:
      "You will require: (1) Certified SEE / Grade 10 mark sheet and certificate, (2) Grade 11 & 12 / +2 transcript and migration certificate, (3) Character certificate, (4) Citizenship photocopy or birth certificate, and (5) 3 passport-sized photos. FSU admission volunteers are available in Room 101 to assist you.",
  },
  {
    category: "Scholarships",
    question: "Are there scholarships available for remote, Dalit, or marginalized students?",
    answer:
      "Yes, Darchula Multiple Campus and the Free Student Union provide tuition waivers, merit scholarships, and underprivileged student stipends through UGC Nepal and Farwestern University guidelines. Submit your application along with local government recommendation to the FSU Secretariat.",
  },
  {
    category: "Campus Facilities",
    question: "How do I obtain a Campus Library Card and access the digital book bank?",
    answer:
      "Visit the Central Campus Library with your college admission receipt and 2 passport photos. The library team will issue your digital barcode library card within 24 hours, granting borrowing privileges for up to 3 textbooks at a time.",
  },
  {
    category: "Student Rights",
    question: "What should I do if I face academic harassment or an unfair grading issue?",
    answer:
      "The Free Student Union maintains a strictly confidential Student Welfare & Rights Cell. You can submit a confidential ticket using the form below or meet the FSU President or Vice President in person at the FSU Secretariat. Your identity will remain strictly protected.",
  },
];

interface HelpdeskPageProps {
  faqs?: Record<string, any>;
}

export default function HelpdeskPage({ faqs }: HelpdeskPageProps) {
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [faculty, setFaculty] = useState("Faculty of Management (BBS)");
  const [category, setCategory] = useState("Academic & Syllabus Inquiries");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || !phone.trim()) {
      setErrorMsg("Please fill in your name, contact phone, and query details.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const contactsRef = ref(rtdb, "contacts");
      const newTicketRef = push(contactsRef);
      const ticketId = `TICKET-${Math.floor(100000 + Math.random() * 900000)}`;

      await set(newTicketRef, {
        id: newTicketRef.key,
        name: name.trim(),
        rollNumber: rollNumber.trim() || "N/A",
        faculty,
        phone: phone.trim(),
        email: email.trim() || "N/A",
        subject: `[Helpdesk] ${category}`,
        category,
        message: message.trim(),
        tag: "FSU Helpdesk Ticket",
        ticketId,
        createdAt: Date.now(),
        status: "Open",
      });

      setSubmittedTicketId(ticketId);
      setName("");
      setRollNumber("");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error("Failed to submit helpdesk ticket:", err);
      setErrorMsg("Failed to submit your ticket. Please try again or call the emergency helpline.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12 w-full">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-8 md:p-12 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-700/80 border border-red-600 text-xs font-bold uppercase tracking-wider text-white">
            <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
            Official Student Support Cell
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight text-white">
            Unique FSU Helpdesk & Student Grievance Portal
          </h1>
          <p className="text-blue-100/90 text-sm md:text-base leading-relaxed">
            Directly connect with the Free Student Union - DMC for admissions guidance, examination queries, scholarship processing, hostel assistance, and grievance redressal under{" "}
            <a
              href="https://fwu.edu.np"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 hover:text-amber-200 font-semibold underline decoration-amber-400/60 transition-colors"
            >
              Farwestern University
            </a>
            .
          </p>
        </div>
      </div>

      {/* Quick Helpline Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
          <div className="p-3 bg-red-50 text-red-700 rounded-xl">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Emergency Helpline</span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">+977-9848712345</p>
            <p className="text-xs text-slate-500">24/7 Student Assistance</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-900 rounded-xl">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Official Email</span>
            <a href="mailto:info@fsudmc.com" className="text-sm font-bold text-blue-900 mt-0.5 hover:underline block truncate">
              info@fsudmc.com
            </a>
            <p className="text-xs text-slate-500">Response within 24 hours</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Helpdesk Location</span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">Room 101, FSU Wing</p>
            <p className="text-xs text-slate-500">Ground Floor, DMC Campus</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Confidential Cell</span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">Grievance Protection</p>
            <p className="text-xs text-slate-500">100% Identity Shielded</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Ticket Submission Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-red-700 block mb-1">
              Submit Support Request
            </span>
            <h2 className="text-2xl font-serif font-black text-slate-900">
              Open a Student Assistance Ticket
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Your inquiry will be directly routed to the FSU Secretariat and executive student representatives.
            </p>
          </div>

          {submittedTicketId && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-sm">Ticket Successfully Dispatched!</h4>
              </div>
              <p className="text-xs leading-relaxed">
                Your reference ID is <span className="font-mono font-bold text-emerald-800">{submittedTicketId}</span>. The FSU executive board will review your issue and reach out via phone or email shortly.
              </p>
              <button
                onClick={() => setSubmittedTicketId(null)}
                className="text-xs font-bold text-emerald-700 underline pt-1 cursor-pointer"
              >
                Submit another request
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Singh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Roll / Registration No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1024/080"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Faculty / Program *
                </label>
                <select
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none bg-white"
                >
                  <option>Faculty of Management (BBS)</option>
                  <option>Faculty of Education (B.Ed)</option>
                  <option>Faculty of Humanities & Social Sciences (BA)</option>
                  <option>Master of Business Studies (MBS)</option>
                  <option>Master of Education (M.Ed)</option>
                  <option>Prospective / New Applicant</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Query Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none bg-white"
                >
                  <option>Academic & Syllabus Inquiries</option>
                  <option>Examination & Admit Card Issues</option>
                  <option>Admission & Course Enrollment</option>
                  <option>Scholarship & Fee Concession</option>
                  <option>Campus Hostel & Infrastructure</option>
                  <option>Student Rights & Grievance Cell</option>
                  <option>Sports & Extracurriculars</option>
                  <option>Other General Assistance</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+977 98xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Detailed Query / Grievance Description *
              </label>
              <textarea
                rows={5}
                required
                placeholder="Describe your issue or inquiry thoroughly so the FSU can prepare the necessary solution..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Transmitting Ticket...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Ticket To FSU Helpdesk</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Frequently Asked Questions */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-900 block mb-1">
              Common Questions
            </span>
            <h2 className="text-2xl font-serif font-black text-slate-900">
              Student Helpdesk FAQs
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Answers to recurring questions regarding university examinations, admissions, and student services.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-100 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-start justify-between gap-3 bg-slate-50/60 hover:bg-slate-100/70 transition cursor-pointer"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 block mb-0.5">
                        {faq.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {faq.question}
                      </h4>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0 mt-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 mt-1" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
