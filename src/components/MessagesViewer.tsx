import React, { useState, useEffect } from "react";
import { ref, onValue, remove, child } from "firebase/database";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { rtdb, auth } from "../lib/firebase";
import { ContactSubmission } from "../types";
import { Lock, MailOpen, Trash2, ShieldCheck, LogOut, Loader2, Calendar, User, EyeOff } from "lucide-react";

interface MessagesViewerProps {
  lang: "en" | "np";
  onGoHome: () => void;
}

// Authorized emails who can view student contact messages
const AUTHORIZED_EMAILS = [
  "fsudmcdcl@gmail.com", // User's email from metadata
  "amitjoc@gmail.com",
  "fsudmc.edu.np@gmail.com"
];

export default function MessagesViewer({ lang, onGoHome }: MessagesViewerProps) {
  const [user, setUser] = useState(auth.currentUser);
  const [messages, setMessages] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currUser) => {
      setUser(currUser);
      if (currUser) {
        setLoading(true);
        // Verify authorization
        if (currUser.email && AUTHORIZED_EMAILS.includes(currUser.email.toLowerCase())) {
          setAuthError("");
          fetchMessages();
        } else {
          setAuthError(
            lang === "en"
              ? `Access Denied: ${currUser.email} is not in the authorized FSU board list.`
              : `प्रवेश अस्वीकृत: ${currUser.email} स्ववियुको अधिकारप्राप्त सूचीमा छैन।`
          );
          setLoading(false);
        }
      } else {
        setMessages([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [lang]);

  const fetchMessages = () => {
    const contactsRef = ref(rtdb, "contacts");
    return onValue(contactsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        })) as ContactSubmission[];
        // Newest messages first
        setMessages(list.sort((a, b) => b.createdAt - a.createdAt));
      } else {
        setMessages([]);
      }
      setLoading(false);
    });
  };

  const handleLogin = async () => {
    setLoginLoading(true);
    setAuthError("");
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setAuthError(lang === "en" ? "Failed to authenticate." : "लगइन गर्न असफल भयो।");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("SignOut error:", err);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!window.confirm(lang === "en" ? "Delete this submission permanently?" : "के यो सन्देश सधैंको लागि मेटाउन चाहनुहुन्छ?")) {
      return;
    }
    try {
      await remove(ref(rtdb, `contacts/${msgId}`));
    } catch (err) {
      alert("Failed to delete message: Permission denied.");
    }
  };

  // Login Gate
  if (!user || authError) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl max-w-md w-full shadow-xl text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6 border border-red-100 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {lang === "en" ? "Restricted FSU Inbox" : "गोप्य सन्देश बक्स"}
          </h3>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-4">
            fsudmc.edu.np/databasemessage2083
          </p>
          <p className="text-sm text-gray-600 mb-8">
            {lang === "en"
              ? "Access to this page is strictly restricted to FSU Darchula Multiple Campus board officials. Please sign in with your authorized Gmail."
              : "यो पाना स्ववियु दार्चुला बहुमुखी क्याम्पसका आधिकारिक पदाधिकारीहरूको लागि मात्र आरक्षित छ। कृपया आधिकारिक इमेल प्रयोग गरी लगइन गर्नुहोस्।"}
          </p>

          {authError && (
            <div className="w-full p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-semibold mb-6">
              {authError}
            </div>
          )}

          <div className="w-full flex flex-col gap-3">
            {loginLoading ? (
              <button
                disabled
                className="w-full py-3 bg-emerald-600/50 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authorizing...</span>
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-emerald-50 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{lang === "en" ? "Sign In with Google" : "गुगल खाता मार्फत लगइन"}</span>
              </button>
            )}

            {user && (
              <button
                onClick={handleSignOut}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition"
              >
                {lang === "en" ? "Sign Out Current Account" : "लगआउट गर्नुहोस्"}
              </button>
            )}

            <button
              onClick={onGoHome}
              className="w-full py-2 text-slate-500 hover:text-slate-900 text-xs font-semibold transition mt-2"
            >
              {lang === "en" ? "← Back to Public Website" : "← सार्वजनिक वेबसाइटमा फर्कनुहोस्"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header bar */}
      <div className="bg-slate-950 p-6 rounded-3xl text-white mb-8 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 font-mono block mb-1">
            BOARD PRIVACY CONSOLE
          </span>
          <h2 className="text-2xl font-black">
            {lang === "en" ? "Database Inbox (Messages 2083)" : "प्राप्त सुरक्षित सन्देशहरू (२०८३)"}
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            Signed in as: <span className="text-emerald-300 font-bold">{user.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onGoHome}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-xl text-xs font-bold transition"
          >
            {lang === "en" ? "Public Website" : "वेबसाइट"}
          </button>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{lang === "en" ? "Sign Out" : "लगआउट"}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-mono text-sm">
            Fetching secure feedback logs from Realtime Database...
          </p>
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center">
          <MailOpen className="w-16 h-16 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {lang === "en" ? "Inbox is Clean" : "सन्देश बक्स खाली छ"}
          </h3>
          <p className="text-sm text-gray-500 max-w-sm">
            {lang === "en"
              ? "All student queries, anonymous notices, and complaints have been answered or empty."
              : "क्याम्पस विद्यार्थीहरूबाट हाल कुनै गुनासो वा सुझाव दर्ता भएको छैन।"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-xs text-gray-400 font-mono uppercase tracking-widest pl-1">
            TOTAL SUBMISSIONS: {messages.length} RECORD(S)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {messages.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-3xl p-6 shadow-sm border transition relative overflow-hidden flex flex-col justify-between ${
                  item.isAnonymous ? "border-yellow-200/80 bg-amber-50/10" : "border-slate-100"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-gray-50 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        item.isAnonymous ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {item.isAnonymous ? <EyeOff className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-gray-900">
                          {item.isAnonymous ? (lang === "en" ? "Anonymous Student" : "गोप्य विद्यार्थी") : item.name}
                        </h4>
                        {!item.isAnonymous && (
                          <span className="text-[10px] text-gray-400 font-mono block">
                            Contact: {item.contactInfo}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteMessage(item.id)}
                      className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-100 transition"
                      title="Delete permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {!item.isAnonymous && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="bg-gray-100 text-gray-700 text-[10px] px-2.5 py-0.5 rounded-full font-semibold font-mono">
                        Class: {item.className}
                      </span>
                      <span className="bg-gray-100 text-gray-700 text-[10px] px-2.5 py-0.5 rounded-full font-semibold font-mono">
                        Semester: {item.semester}
                      </span>
                    </div>
                  )}

                  <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed font-sans bg-slate-50/50 p-4 rounded-xl border border-slate-100/60">
                    {item.message}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Submitted on: {new Date(item.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
