import React, { useState } from "react";
import { ref, push, set } from "firebase/database";
import { rtdb } from "../lib/firebase";
import {
  Building2,
  Mail,
  Phone,
  Clock,
  MapPin,
  Calendar,
  Send,
  CheckCircle,
  AlertCircle,
  Award,
  Users,
  FileText,
  ExternalLink,
} from "lucide-react";

export default function SecretariatPage() {
  const [visitorName, setVisitorName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [meetingPurpose, setMeetingPurpose] = useState("Academic Welfare Discussion");
  const [preferredDate, setPreferredDate] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmitMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !phone.trim() || !details.trim()) {
      setErrorMsg("Please provide your name, contact phone, and purpose of meeting.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const contactsRef = ref(rtdb, "contacts");
      const newRef = push(contactsRef);

      await set(newRef, {
        id: newRef.key,
        name: visitorName.trim(),
        organization: organization.trim() || "Independent Student / Stakeholder",
        phone: phone.trim(),
        email: email.trim() || "N/A",
        meetingPurpose,
        preferredDate: preferredDate || "Earliest Available",
        message: `[Secretariat Meeting Request] ${meetingPurpose}: ${details.trim()}`,
        tag: "Secretariat Appointment",
        createdAt: Date.now(),
        status: "Pending Review",
      });

      setSuccessMsg(true);
      setVisitorName("");
      setOrganization("");
      setEmail("");
      setPhone("");
      setPreferredDate("");
      setDetails("");
    } catch (err) {
      console.error("Failed to submit appointment request:", err);
      setErrorMsg("Failed to book appointment. Please email info@fsudmc.com directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12 w-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-8 md:p-12 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/60 border border-blue-700/60 text-xs font-bold uppercase tracking-wider text-blue-200">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            Executive Secretariat Office
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight text-white">
            Contact FSU Secretariat
          </h1>
          <p className="text-blue-100/90 text-sm md:text-base leading-relaxed">
            The central administrative and executive organ of Free Student Union - DMC at Darchula Multiple Campus, coordinating with students, campus administration, and{" "}
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

      {/* Secretariat Quick Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-3 w-fit bg-red-50 text-red-700 rounded-xl mb-3">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-black text-slate-900 text-base">Office Location</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              FSU Secretariat Suite, Room 102<br />
              Ground Floor, Student Union Complex<br />
              Darchula Multiple Campus, Khalanga, Darchula<br />
              Sudurpashchim Province, Nepal
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500">
            Base Domain: https://fsudmc.com
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-3 w-fit bg-blue-50 text-blue-900 rounded-xl mb-3">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-black text-slate-900 text-base">Official Correspondence</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Email:{" "}
              <a href="mailto:info@fsudmc.com" className="font-bold text-blue-900 hover:underline">
                info@fsudmc.com
              </a>
              <br />
              Phone: +977-9848712345<br />
              Official Memorandums: secretariat@fsudmc.com
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Direct Line to FSU Executive Board
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-3 w-fit bg-emerald-50 text-emerald-700 rounded-xl mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-black text-slate-900 text-base">Secretariat Office Hours</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sunday – Thursday: 9:00 AM – 4:30 PM<br />
              Friday: 9:00 AM – 2:00 PM<br />
              Saturday: Closed (Emergency cell active)
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-emerald-700 font-bold">
            Open for Student Delegations & Inquiries
          </div>
        </div>
      </div>

      {/* Main Appointment & Delegation Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-red-700 block mb-1">
              Official Engagement
            </span>
            <h2 className="text-2xl font-serif font-black text-slate-900">
              Schedule an Appointment with the Secretariat
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Submit your formal meeting request with the FSU President, Secretary, or Executive Committee.
            </p>
          </div>

          {successMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-sm">Appointment Request Logged!</h4>
              </div>
              <p className="text-xs leading-relaxed">
                Thank you. The FSU Secretariat has received your meeting request. The Office Secretary will contact you via phone or email to confirm your appointment slot.
              </p>
              <button
                onClick={() => setSuccessMsg(false)}
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

          <form onSubmit={handleSubmitMeeting} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Binod Bhatt"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Class / Faculty / Organization
                </label>
                <input
                  type="text"
                  placeholder="e.g. BBS 3rd Year / Student Club"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Contact Phone Number *
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
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Subject / Purpose of Meeting *
                </label>
                <select
                  value={meetingPurpose}
                  onChange={(e) => setMeetingPurpose(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none bg-white"
                >
                  <option>Academic Welfare Discussion</option>
                  <option>Submission of Student Memorandum</option>
                  <option>Event or Sports Collaboration</option>
                  <option>Campus Infrastructure Improvement</option>
                  <option>Scholarship or Financial Aid Appeal</option>
                  <option>Official Media / Press Inquiry</option>
                  <option>Other Official Matter</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Preferred Date / Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tuesday at 11:30 AM"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Agenda Summary / Meeting Details *
              </label>
              <textarea
                rows={4}
                required
                placeholder="State the core issues, attendees count, and specific outcomes expected from this appointment..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Registering Appointment...</span>
              ) : (
                <>
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Send Appointment Request to Secretariat</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Executive Secretariat Protocol */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-900 block mb-1">
              Secretariat Mandate
            </span>
            <h3 className="text-xl font-serif font-black text-slate-900">
              Governance & Responsibilities
            </h3>
          </div>

          <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <Award className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 mb-0.5">Democratic Representation</h4>
                <p>Ensuring that student grievances, administrative resolutions, and campus development policies are executed in full alignment with student union elections.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <FileText className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 mb-0.5">University Liaison</h4>
                <p>Acting as the official bridge between students and <a href="https://fwu.edu.np" target="_blank" rel="noopener noreferrer" className="text-blue-900 font-bold underline">Farwestern University</a> for curriculum feedback, examination timetables, and accreditation.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <Users className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 mb-0.5">Transparent Student Fund</h4>
                <p>Managing sports, literary, cultural, and welfare funds with strict fiscal accountability and open reporting to campus student assemblies.</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900">
            <h4 className="font-bold mb-1">Submitting a Written Memorandum?</h4>
            <p className="leading-relaxed">
              Official student delegations may hand-deliver signed memorandums directly to the Office Secretary during morning working hours (9:30 AM – 1:00 PM) at Room 102.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
