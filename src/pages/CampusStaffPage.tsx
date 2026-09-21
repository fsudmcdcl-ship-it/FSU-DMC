import React, { useState } from "react";
import { Users, Mail, MapPin, Clock, Search, Phone, ExternalLink, ShieldCheck } from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  office: string;
  workingHours: string;
  imageUrl: string;
}

const STAFF_MEMBERS: StaffMember[] = [
  {
    id: "staff-1",
    name: "Janak Raj Pant",
    designation: "Campus Administrator",
    department: "Administration",
    email: "admin@fsudmc.com",
    phone: "+977-9848712345",
    office: "Main Administrative Block, Room 101",
    workingHours: "Sunday – Friday: 10:00 AM – 5:00 PM",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
  },
  {
    id: "staff-2",
    name: "Mohan Singh Dhami",
    designation: "Assistant Administrator",
    department: "Administration",
    email: "info@fsudmc.com",
    phone: "+977-9848712346",
    office: "Main Administrative Block, Room 102",
    workingHours: "Sunday – Friday: 10:00 AM – 5:00 PM",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300",
  },
  {
    id: "staff-3",
    name: "Birendra Bahadur Karki",
    designation: "Head of Examination Section",
    department: "Examination & Evaluation",
    email: "exam@fsudmc.com",
    phone: "+977-9848712347",
    office: "Academic Block 2, Examination Control Room",
    workingHours: "Sunday – Friday: 9:30 AM – 4:30 PM",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300",
  },
  {
    id: "staff-4",
    name: "Geeta Kumari Joshi",
    designation: "Examination Assistant",
    department: "Examination & Evaluation",
    email: "exam@fsudmc.com",
    phone: "+977-9848712348",
    office: "Academic Block 2, Room 204",
    workingHours: "Sunday – Friday: 10:00 AM – 4:30 PM",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
  },
  {
    id: "staff-5",
    name: "Khem Raj Bhatt",
    designation: "Senior Account Officer",
    department: "Finance & Accounts",
    email: "accounts@fsudmc.com",
    phone: "+977-9848712349",
    office: "Finance Wing, Ground Floor",
    workingHours: "Sunday – Friday: 10:00 AM – 4:00 PM",
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300",
  },
  {
    id: "staff-6",
    name: "Prakash Singh Tinkari",
    designation: "Senior Librarian",
    department: "Library & Information Center",
    email: "library@fsudmc.com",
    phone: "+977-9848712350",
    office: "Central Campus Library, 1st Floor",
    workingHours: "Sunday – Friday: 8:00 AM – 5:00 PM",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300",
  },
  {
    id: "staff-7",
    name: "Sunita Bohara",
    designation: "Assistant Librarian",
    department: "Library & Information Center",
    email: "library@fsudmc.com",
    phone: "+977-9848712351",
    office: "Central Campus Library, Circulation Counter",
    workingHours: "Sunday – Friday: 9:00 AM – 4:30 PM",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300",
  },
  {
    id: "staff-8",
    name: "Dipendra Thapa",
    designation: "ICT & Systems Administrator",
    department: "ICT & Technical Support",
    email: "it@fsudmc.com",
    phone: "+977-9848712352",
    office: "Computer Lab & ICT Center, Room 301",
    workingHours: "Sunday – Friday: 9:00 AM – 5:00 PM",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
  },
];

const DEPARTMENTS = [
  "All Departments",
  "Administration",
  "Examination & Evaluation",
  "Finance & Accounts",
  "Library & Information Center",
  "ICT & Technical Support",
];

export default function CampusStaffPage() {
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStaff = STAFF_MEMBERS.filter((member) => {
    const matchesDept = selectedDept === "All Departments" || member.department === selectedDept;
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12 w-full">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-8 md:p-12 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/60 border border-blue-700/60 text-xs font-bold uppercase tracking-wider text-blue-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Official Campus Directory
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight text-white">
            Campus Staff Directory
          </h1>
          <p className="text-blue-100/90 text-sm md:text-base leading-relaxed">
            Meet the administrative and operational team supporting students and academic operations at Darchula Multiple Campus, affiliated with{" "}
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        {/* Department tabs */}
        <div className="flex flex-wrap gap-2">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedDept === dept
                  ? "bg-blue-950 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff by name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-900 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((staff) => (
          <div
            key={staff.id}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/90 flex flex-col justify-between hover:shadow-md transition-shadow group"
          >
            <div>
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={staff.imageUrl}
                  alt={staff.name}
                  className="w-16 h-16 rounded-2xl object-cover shadow-sm border-2 border-slate-100 group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="font-serif font-black text-slate-900 text-base leading-snug">
                    {staff.name}
                  </h3>
                  <p className="text-xs font-bold text-red-700">{staff.designation}</p>
                  <span className="inline-block mt-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {staff.department}
                  </span>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={`mailto:${staff.email}`} className="hover:text-blue-900 hover:underline truncate">
                    {staff.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{staff.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{staff.office}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[11px]">{staff.workingHours}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-50">
              <a
                href={`mailto:${staff.email}?subject=Inquiry from Student/Staff Portal`}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-blue-950 hover:text-white text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors text-center flex items-center justify-center gap-1.5"
              >
                <span>Send Direct Inquiry</span>
                <Mail className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-500 font-mono text-sm">No staff members found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
}
