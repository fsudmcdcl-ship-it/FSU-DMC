import React, { useState } from "react";
import { GraduationCap, Mail, BookOpen, Award, Search, Clock, ExternalLink } from "lucide-react";

interface Professor {
  id: string;
  name: string;
  title: string;
  faculty: string;
  department: string;
  qualification: string;
  subjects: string[];
  researchInterests: string;
  email: string;
  officeHours: string;
  imageUrl: string;
}

const PROFESSORS: Professor[] = [
  {
    id: "prof-1",
    name: "Assoc. Prof. Dr. Dinesh Kumar Bhatt",
    title: "Campus Chief & Associate Professor",
    faculty: "Faculty of Management",
    department: "Business Administration & Strategy",
    qualification: "Ph.D. in Management, M.Phil, MBS",
    subjects: ["Strategic Management", "Organizational Behavior", "Business Research Methods"],
    researchInterests: "Higher Education Leadership, Mountain Regional Economic Development",
    email: "chief@fsudmc.com",
    officeHours: "Sunday – Thursday: 11:00 AM – 1:00 PM",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300",
  },
  {
    id: "prof-2",
    name: "Assoc. Prof. Ram Prasad Joshi",
    title: "Head of Department (Humanities)",
    faculty: "Faculty of Humanities & Social Sciences",
    department: "English & Linguistics",
    qualification: "M.Phil in English Literature, MA (Gold Medalist)",
    subjects: ["Modern English Poetry", "Critical Theory", "Academic Writing"],
    researchInterests: "Folk Literature of Farwestern Nepal, Border Studies",
    email: "faculty@fsudmc.com",
    officeHours: "Monday – Friday: 10:00 AM – 12:00 PM",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
  },
  {
    id: "prof-3",
    name: "Asst. Prof. Sunita Pant",
    title: "Head of Department (Education)",
    faculty: "Faculty of Education",
    department: "Curriculum and Pedagogy",
    qualification: "M.Ed in Curriculum & Evaluation",
    subjects: ["Educational Psychology", "Classroom Pedagogy", "Measurement & Evaluation"],
    researchInterests: "Inclusive Education in Mountain Communities, Gender and Literacy",
    email: "education@fsudmc.com",
    officeHours: "Sunday – Thursday: 1:00 PM – 3:00 PM",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
  },
  {
    id: "prof-4",
    name: "Asst. Prof. Kamal Singh Dhami",
    title: "Assistant Professor",
    faculty: "Faculty of Management",
    department: "Accountancy & Taxation",
    qualification: "MBS, Chartered Financial Auditor (CFA-Nepal)",
    subjects: ["Corporate Accounting", "Cost & Management Accounting", "Taxation in Nepal"],
    researchInterests: "Public Financial Management, SME Financing in Sudurpashchim",
    email: "management@fsudmc.com",
    officeHours: "Sunday – Friday: 8:00 AM – 10:00 AM",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300",
  },
  {
    id: "prof-5",
    name: "Lecturer Bhupendra Bahadur Tinkari",
    title: "Lecturer in Economics",
    faculty: "Faculty of Humanities & Social Sciences",
    department: "Economics & Public Policy",
    qualification: "MA in Economics, Tribhuvan University",
    subjects: ["Microeconomics", "Macroeconomics", "Nepalese Economy & Planning"],
    researchInterests: "Cross-Border Trade with India & Tibet, Rural Livelihoods",
    email: "economics@fsudmc.com",
    officeHours: "Monday – Thursday: 11:30 AM – 1:30 PM",
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300",
  },
  {
    id: "prof-6",
    name: "Lecturer Pratima Bhatta",
    title: "Lecturer in Educational Administration",
    faculty: "Faculty of Education",
    department: "Educational Planning & Management",
    qualification: "M.Ed, B.Sc",
    subjects: ["Educational Administration & Supervision", "ICT in Education", "Action Research"],
    researchInterests: "Digital Pedagogy in Rural Schools, Teacher Professional Development",
    email: "faculty@fsudmc.com",
    officeHours: "Sunday – Wednesday: 10:00 AM – 12:00 PM",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300",
  },
];

const FACULTIES = [
  "All Faculties",
  "Faculty of Management",
  "Faculty of Education",
  "Faculty of Humanities & Social Sciences",
];

export default function ProfessorsPage() {
  const [selectedFaculty, setSelectedFaculty] = useState("All Faculties");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProfessors = PROFESSORS.filter((prof) => {
    const matchesFaculty = selectedFaculty === "All Faculties" || prof.faculty === selectedFaculty;
    const matchesSearch =
      prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.subjects.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFaculty && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12 w-full">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-8 md:p-12 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/60 border border-blue-700/60 text-xs font-bold uppercase tracking-wider text-blue-200">
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            Academic Faculty Directory
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight text-white">
            Professors & Academic Directory
          </h1>
          <p className="text-blue-100/90 text-sm md:text-base leading-relaxed">
            Distinguished professors, associate professors, and department heads guiding academic excellence across Management, Education, and Humanities at Darchula Multiple Campus, affiliated with{" "}
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

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-wrap gap-2">
          {FACULTIES.map((fac) => (
            <button
              key={fac}
              onClick={() => setSelectedFaculty(fac)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedFaculty === fac
                  ? "bg-blue-950 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {fac}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search professors, courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-900 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Professors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredProfessors.map((prof) => (
          <div
            key={prof.id}
            className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100/90 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center mb-6">
                <img
                  src={prof.imageUrl}
                  alt={prof.name}
                  className="w-20 h-20 rounded-2xl object-cover shadow-sm border-2 border-slate-100"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="font-serif font-black text-slate-900 text-lg leading-tight">
                    {prof.name}
                  </h3>
                  <p className="text-xs font-bold text-red-700 mt-0.5">{prof.title}</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">{prof.qualification}</p>
                  <span className="inline-block mt-2 text-[11px] font-semibold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                    {prof.faculty}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <div>
                  <span className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-900" />
                    Courses & Subjects Taught:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {prof.subjects.map((sub, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <span className="font-bold text-slate-800 block mb-0.5 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    Research & Specialization:
                  </span>
                  <p className="text-slate-500 italic text-[11px] leading-relaxed">
                    {prof.researchInterests}
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px]">{prof.officeHours}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a href={`mailto:${prof.email}`} className="hover:text-blue-900 underline text-[11px]">
                      {prof.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
              <a
                href={`mailto:${prof.email}?subject=Academic Consultation - ${prof.name}`}
                className="px-4 py-2 rounded-xl bg-blue-950 text-white hover:bg-blue-900 font-bold text-xs uppercase tracking-wider transition shadow-sm inline-flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Request Consultation</span>
              </a>

              <a
                href="https://fwu.edu.np"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-slate-500 hover:text-blue-900 flex items-center gap-1 transition"
              >
                <span>Curriculum on FWU</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
