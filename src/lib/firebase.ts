import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, child } from "firebase/database";
import { getAuth } from "firebase/auth";
import { DatabaseState } from "../types";

// Firebase configuration using environment variables or safe public configuration for DMC
const env = (import.meta as any).env || {};
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyDMC_FSU_DarchulaMultipleCampus2083",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "fsudmc-portal.firebaseapp.com",
  databaseURL: env.VITE_FIREBASE_DATABASE_URL || "https://fsudmc-portal-default-rtdb.firebaseio.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "fsudmc-portal",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "fsudmc-portal.appspot.com",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "102938475612",
  appId: env.VITE_FIREBASE_APP_ID || "1:102938475612:web:abcdef1234567890",
};

// Initialize Firebase App
export const firebaseApp = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const rtdb = getDatabase(firebaseApp);

// Initialize Firebase Authentication
export const auth = getAuth(firebaseApp);

/**
 * Seed initial database content on first startup if the database is unpopulated.
 * All content is provided strictly in English per institutional requirements.
 */
export async function seedInitialDataIfEmpty() {
  try {
    const dbRef = ref(rtdb);
    const snapshot = await get(child(dbRef, "generalSettings"));
    if (snapshot.exists()) {
      return; // Already has data!
    }

    // Default seed database structure
    const initialData: Partial<DatabaseState> = {
      generalSettings: {
        logoUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200",
        titleEn: "FREE STUDENT UNION",
        titleNp: "FREE STUDENT UNION",
        subtitleEn: "Darchula Multiple Campus, Khalanga, Darchula",
        subtitleNp: "Darchula Multiple Campus, Khalanga, Darchula",
        aboutFsuEn: "The Free Student Union (FSU) of Darchula Multiple Campus is a democratic student body dedicated to representing student voices, fostering academic excellence, and leading constructive campus welfare and social programs. Established with the vision of promoting student rights, the FSU plays a pivotal role in maintaining academic standards, organizing extracurricular activities, and acting as a bridge between campus administration and students. We actively engage in community services, sports, cultural programs, and academic forums.",
        aboutFsuNp: "The Free Student Union (FSU) of Darchula Multiple Campus is a democratic student body dedicated to representing student voices, fostering academic excellence, and leading constructive campus welfare and social programs.",
        aboutFsuImg: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800",
        aboutCampusEn: "Darchula Multiple Campus (DMC), established in 2062 BS, is a premier higher education institution in the far-western mountain district of Darchula, Nepal. Affiliated with Farwestern University, DMC provides accessible, quality education in Humanities, Management, and Education streams to students from remote communities. It is committed to fostering academic competence, moral values, and social responsibility under the leadership of dedicated faculties and campus management.",
        aboutCampusNp: "Darchula Multiple Campus (DMC) is a premier higher education institution in the far-western mountain district of Darchula, Nepal, affiliated with Farwestern University.",
        aboutCampusImg: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800",
        presidentNameEn: "Mr. Amit Joshi",
        presidentNameNp: "Mr. Amit Joshi",
        presidentPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
        presidentMessageEn: "Dear fellow students, it is an absolute honor to lead the Free Student Union at Darchula Multiple Campus. Our FSU is committed to creating an inclusive, vibrant, and progressive academic environment. We are focused on strengthening student facilities, organizing national seminars, modernizing our library, and expanding sports initiatives. Let us work hand in hand to make our campus a hub of excellence and standard education.",
        presidentMessageNp: "Dear fellow students, our FSU is committed to creating an inclusive, vibrant, and progressive academic environment for every student at Darchula Multiple Campus.",
        chiefNameEn: "Associate Prof. Dr. Dinesh Kumar Bhatt",
        chiefNameNp: "Associate Prof. Dr. Dinesh Kumar Bhatt",
        chiefPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
        chiefMessageEn: "Welcome to Darchula Multiple Campus. As the Campus Chief, I am proud of our academic legacy and the synergy we share with our vibrant student community and the FSU. We strive to provide standard higher education using modern teaching methodologies, and we continuously support our students in academic and extra-curricular paths to prepare them for global opportunities.",
        chiefMessageNp: "Welcome to Darchula Multiple Campus. We strive to provide standard higher education and prepare our students for competitive professional opportunities.",
        fbCampusPage: "https://facebook.com/DarchulaMultipleCampusOfficial",
        fbFsuPage: "https://facebook.com/amitjoc",
        privacyPolicyEn: "This Privacy Policy governs the manner in which the FSU Darchula Multiple Campus Portal collects, uses, maintains and discloses information collected from users. Your privacy is extremely important to us, and any data submitted via the anonymous or standard contact form is securely stored within our Firebase Realtime Database with restricted, authenticated administration access.",
        privacyPolicyNp: "This Privacy Policy governs the manner in which the FSU Darchula Multiple Campus Portal collects, uses, and maintains information submitted via secure inquiry channels.",
        termsEn: "By accessing this portal, you agree to use it strictly for academic, inquiry, and constructive feedback purposes. Any spamming of the contact system or unauthorized attempts to access administrative pages is strictly prohibited and subject to institutional discipline.",
        termsNp: "By accessing this portal, you agree to use it strictly for academic, inquiry, and constructive feedback purposes."
      },
      slides: {
        "slide_1": {
          id: "slide_1",
          imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200",
          titleEn: "Welcome to Darchula Multiple Campus FSU",
          titleNp: "Welcome to Darchula Multiple Campus FSU"
        },
        "slide_2": {
          id: "slide_2",
          imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200",
          titleEn: "Empowering Students, Transforming Futures",
          titleNp: "Empowering Students, Transforming Futures"
        },
        "slide_3": {
          id: "slide_3",
          imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200",
          titleEn: "Fostering Academic and Leadership Excellence",
          titleNp: "Fostering Academic and Leadership Excellence"
        }
      },
      news: {
        "news_1": {
          id: "news_1",
          headingEn: "BBS and B.Ed Third Year Exam Centers Released",
          headingNp: "BBS and B.Ed Third Year Exam Centers Released",
          bodyEn: "Farwestern University Office of the Controller of Examinations has officially published the examination centers for BBS and B.Ed Third Year. All students are advised to check their respective rolls and download the admit cards. The examinations are starting from Shrawan 15, 2083. Best of luck!",
          bodyNp: "Examination centers for BBS and B.Ed Third Year have been released. Best of luck to all candidates!",
          imageUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=600",
          createdAt: 1784534400000
        },
        "news_2": {
          id: "news_2",
          headingEn: "FSU to Organize District Level Inter-College Cricket Tournament",
          headingNp: "FSU to Organize District Level Inter-College Cricket Tournament",
          bodyEn: "To promote sportsmanship and physical health, the Free Student Union of Darchula Multiple Campus is organizing a district-level Inter-College Cricket Tournament starting next month. Teams from all high schools and campuses of Darchula are invited. Registrations are open at the FSU Office.",
          bodyNp: "District-level Inter-College Cricket Tournament announced by Free Student Union.",
          imageUrl: "https://images.unsplash.com/photo-1531415080290-bc98545ab2ef?auto=format&fit=crop&q=80&w=600",
          createdAt: 1784448000000
        },
        "news_3": {
          id: "news_3",
          headingEn: "Free IT & Computer Literacy Workshop for B.Ed Students",
          headingNp: "Free IT & Computer Literacy Workshop for B.Ed Students",
          bodyEn: "The FSU IT Club is hosting a comprehensive 10-day Computer Literacy Workshop targeting education students. Learn basic office suites, digital pedagogy, and internet-based research toolkits. Registrations close this Friday.",
          bodyNp: "Free IT and Computer Literacy workshop for campus students.",
          imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600",
          createdAt: 1784361600000
        }
      },
      downloads: {
        "dl_1": {
          id: "dl_1",
          titleEn: "B.Ed First Year Curriculum & Syllabus - FWU",
          titleNp: "B.Ed First Year Curriculum & Syllabus - FWU",
          fileUrl: "https://drive.google.com/drive/folders/1placeholder1",
          isDriveLink: true
        },
        "dl_2": {
          id: "dl_2",
          titleEn: "BBS Business English Complete Practice Notes",
          titleNp: "BBS Business English Complete Practice Notes",
          fileUrl: "https://drive.google.com/drive/folders/2placeholder2",
          isDriveLink: true
        },
        "dl_3": {
          id: "dl_3",
          titleEn: "Academic Calendar and Vacation Schedule 2083",
          titleNp: "Academic Calendar and Vacation Schedule 2083",
          fileUrl: "https://drive.google.com/drive/folders/3placeholder3",
          isDriveLink: true
        }
      },
      blogs: {
        "blog_1": {
          id: "blog_1",
          headingEn: "The Role of Youth in Remote Mountain Education",
          headingNp: "The Role of Youth in Remote Mountain Education",
          bodyEn: "Education in mountainous districts like Darchula has always faced geographical and infrastructural bottlenecks. However, with the rise of student leadership and digitalization, the local youth are stepping up. By establishing computer labs, tutoring primary schools, and advocating for higher secondary facilities, we are carving out a brighter tomorrow. Education is not just about textbooks; it is about active citizenship.",
          bodyNp: "Education in mountainous districts like Darchula has always faced geographical and infrastructural bottlenecks.",
          imageUrl: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=600",
          authorEn: "Amit Joshi, BBS 3rd Year",
          authorNp: "Amit Joshi, BBS 3rd Year",
          createdAt: 1784275200000
        },
        "blog_2": {
          id: "blog_2",
          headingEn: "Preserving Mahakali Border Culture and Heritage",
          headingNp: "Preserving Mahakali Border Culture and Heritage",
          bodyEn: "Our border region Darchula possesses a rich tapestry of culture, ranging from Gaura parva, Hudkeeli dance, to traditional folk tunes that echo the spirit of the Himalayas. In an era of westernization, we students must document these cultural gems, preserve our language, and promote tourism along the Mahakali. This blog examines how youth can lead cultural preservation.",
          bodyNp: "Preserving cultural gems, folklore, and historical heritage along the Mahakali border region.",
          imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600",
          authorEn: "Manisha Tinkari, B.Ed 2nd Year",
          authorNp: "Manisha Tinkari, B.Ed 2nd Year",
          createdAt: 1784188800000
        }
      },
      team: {
        "member_1": {
          id: "member_1",
          nameEn: "Amit Joshi",
          nameNp: "Amit Joshi",
          roleEn: "FSU President",
          roleNp: "FSU President",
          imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200",
          order: 1
        },
        "member_2": {
          id: "member_2",
          nameEn: "Janak Bahadur Dhami",
          nameNp: "Janak Bahadur Dhami",
          roleEn: "FSU Vice President",
          roleNp: "FSU Vice President",
          imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200",
          order: 2
        },
        "member_3": {
          id: "member_3",
          nameEn: "Deepa Tinkari",
          nameNp: "Deepa Tinkari",
          roleEn: "FSU Secretary",
          roleNp: "FSU Secretary",
          imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
          order: 3
        },
        "member_4": {
          id: "member_4",
          nameEn: "Suresh Sahu",
          nameNp: "Suresh Sahu",
          roleEn: "FSU Joint Secretary",
          roleNp: "FSU Joint Secretary",
          imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
          order: 4
        },
        "member_5": {
          id: "member_5",
          nameEn: "Karan Singh Badal",
          nameNp: "Karan Singh Badal",
          roleEn: "FSU Treasurer",
          roleNp: "FSU Treasurer",
          imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200",
          order: 5
        }
      },
      importantNotice: {
        active: true,
        titleEn: "FSU Special Campus Admission Support Notice 2083",
        titleNp: "FSU Special Campus Admission Support Notice 2083",
        bodyEn: "The Free Student Union has set up a specialized 'Admission Help Desk' inside the campus premises to assist new students enrolling in B.Ed, BBS, and BA first year. We provide guidance on choosing subjects, completing application forms, and understanding scholarship criteria. Contact the FSU Secretariat for immediate assistance.",
        bodyNp: "Special Admission Help Desk established by the Free Student Union for campus students.",
        imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800",
        type: "both"
      }
    };

    await set(ref(rtdb), initialData);
    console.log("Database seeded successfully with Darchula Multiple Campus English defaults!");
  } catch (err) {
    console.error("Failed to seed initial database state: ", err);
  }
}
