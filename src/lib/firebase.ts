import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, get, child } from "firebase/database";
import { DatabaseState } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyCSbIo5RUS0OZ_-sGuSjFHOy5P7knYWPeY",
  authDomain: "fsu-bdbf6.firebaseapp.com",
  projectId: "fsu-bdbf6",
  storageBucket: "fsu-bdbf6.firebasestorage.app",
  messagingSenderId: "214528113668",
  appId: "1:214528113668:web:dfc4abf7d3736c8d454951",
  measurementId: "G-F49VKLZ071",
  databaseURL: "https://fsu-bdbf6-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const rtdb = getDatabase(app);

// Seed data function to populate initial state if database is blank
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
        logoUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200", // Default academic placeholder
        titleEn: "FREE STUDENT UNION",
        titleNp: "स्ववतन्त्र विद्यार्थी युनियन",
        subtitleEn: "Darchula Multiple Campus, Khalanga, Darchula",
        subtitleNp: "दार्चुला बहुमुखी क्याम्पस, खलङ्गा, दार्चुला",
        aboutFsuEn: "The Free Student Union (FSU) of Darchula Multiple Campus is a democratic student body dedicated to representing student voices, fostering academic excellence, and leading constructive campus welfare and social programs. Established with the vision of promoting student rights, the FSU plays a pivotal role in maintaining academic standards, organizing extracurricular activities, and acting as a bridge between campus administration and students. We actively engage in community services, sports, cultural programs, and academic forums.",
        aboutFsuNp: "दार्चुला बहुमुखी क्याम्पसको स्वतन्त्र विद्यार्थी युनियन (स्ववियु) विद्यार्थीहरूको हकहित संरक्षण, शैक्षिक उत्कृष्टता अभिवृद्धि र क्याम्पसको विकासका लागि समर्पित लोकतान्त्रिक विद्यार्थी संस्था हो। विद्यार्थी अधिकारको प्रवर्धन गर्ने उद्देश्यले स्थापना भएको स्ववियुले क्याम्पस प्रशासन र विद्यार्थीहरूबीच पुलको काम गर्दै शैक्षिक सुधार, खेलकुद तथा विभिन्न रचनात्मक कार्यक्रमहरू सञ्चालन गर्दै आएको छ।",
        aboutFsuImg: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800",
        aboutCampusEn: "Darchula Multiple Campus (DMC), established in 2062 BS, is a premier higher education institution in the far-western mountain district of Darchula, Nepal. Affiliated with Tribhuvan University, DMC provides accessible, quality education in Humanities, Management, and Education streams to students from remote communities. It is committed to fostering academic competence, moral values, and social responsibility under the leadership of dedicated faculties and campus management.",
        aboutCampusNp: "दार्चुला बहुमुखी क्याम्पस दार्चुला जिल्लाकै प्रतिष्ठित र अग्रणी शैक्षिक संस्था हो। त्रिभुवन विश्वविद्यालयबाट सम्बन्धन प्राप्त यस क्याम्पसले सुदूरपश्चिमको दुर्गम क्षेत्रका विद्यार्थीहरूलाई मानविकी, व्यवस्थापन र शिक्षा संकायमा गुणस्तरीय र व्यावहारिक उच्च शिक्षा प्रदान गर्दै आएको छ। क्याम्पसले निरन्तर रूपमा शैक्षिक स्तर सुधार तथा भौतिक पूर्वाधार विकासमा जोड दिँदै आएको छ।",
        aboutCampusImg: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800",
        presidentNameEn: "Mr. Amit Joshi",
        presidentNameNp: "श्री अमित जोशी",
        presidentPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
        presidentMessageEn: "Dear fellow students, it is an absolute honor to lead the Free Student Union at Darchula Multiple Campus. Our FSU is committed to creating an inclusive, vibrant, and progressive academic environment. We are focused on strengthening student facilities, organizing national seminars, modernizing our library, and expanding sports initiatives. Let us work hand in hand to make our campus a hub of excellence and standard education.",
        presidentMessageNp: "आदरणीय विद्यार्थी साथीहरू, दार्चुला बहुमुखी क्याम्पसको स्ववियुको नेतृत्व गर्न पाउनु मेरो लागि ठूलो सम्मानको विषय हो। हामी क्याम्पसमा विद्यार्थीमैत्री वातावरण सिर्जना गर्न, पुस्तकालयको सुदृढीकरण गर्न, खेलकुद गतिविधि बढाउन र विद्यार्थी अधिकारको रक्षाका लागि दृढ संकल्पित छौं। क्याम्पसको चौतर्फी विकासमा हामी सबै हातेमालो गर्दै अघि बढौं।",
        chiefNameEn: "Associate Prof. Dr. Dinesh Kumar Bhatt",
        chiefNameNp: "सह-प्रा. डा. दिनेश कुमार भट्ट",
        chiefPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
        chiefMessageEn: "Welcome to Darchula Multiple Campus. As the Campus Chief, I am proud of our academic legacy and the synergy we share with our vibrant student community and the FSU. We strive to provide standard higher education using modern teaching methodologies, and we continuously support our students in academic and extra-curricular paths to prepare them for global opportunities.",
        chiefMessageNp: "दार्चुला बहुमुखी क्याम्पसमा यहाँहरूलाई स्वागत छ। क्याम्पस प्रमुखको रूपमा, म हाम्रा दक्ष प्राध्यापकहरू र ऊर्जावान् विद्यार्थीहरूको सक्रियताप्रति गौरव गर्दछु। स्ववियुसँग सहकार्य गर्दै क्याम्पसलाई थप उत्कृष्ट र प्रविधिमैत्री शैक्षिक संस्था बनाउन हामी सधैं क्रियाशील छौं।",
        fbCampusPage: "https://facebook.com/DarchulaMultipleCampusOfficial",
        fbFsuPage: "https://facebook.com/amitjoc",
        privacyPolicyEn: "This Privacy Policy governs the manner in which the FSU Darchula Multiple Campus Portal collects, uses, maintains and discloses information collected from users. Your privacy is extremely important to us, and any data submitted via the anonymous or standard contact form is securely stored within our Firebase Realtime Database with restricted, authenticated administration access.",
        privacyPolicyNp: "यो गोपनीयता नीतिले स्ववियु दार्चुला बहुमुखी क्याम्पस पोर्टलले प्रयोगकर्ताहरूबाट संकलन गर्ने विवरणहरूको सुरक्षा र प्रयोगलाई नियमित गर्दछ। हामी तपाईंको गोपनीयताप्रति संवेदनशील छौं, र सम्पर्क फारम मार्फत पठाइएका विवरणहरू प्रमाणीकृत अधिकारीहरूले मात्र हेर्न मिल्ने गरी सुरक्षित रूपमा राखिन्छ।",
        termsEn: "By accessing this portal, you agree to use it strictly for academic, inquiry, and constructive feedback purposes. Any spamming of the contact system or unauthorized attempts to access administrative pages is strictly prohibited and subject to institutional discipline.",
        termsNp: "यस पोर्टलको प्रयोग गर्दा शैक्षिक हित, सकारात्मक पृष्ठपोषण र क्याम्पस विकासका सवालमा मात्र सञ्चार गर्न अनुरोध गरिन्छ। प्रणालीमा अनावश्यक सन्देश पठाउने वा अनधिकृत रूपमा प्रशासकीय खण्ड पहुँच गर्ने प्रयास गरेमा नियमानुसार कारबाही हुन सक्नेछ।"
      },
      slides: {
        "slide_1": {
          id: "slide_1",
          imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200",
          titleEn: "Welcome to Darchula Multiple Campus FSU",
          titleNp: "दार्चुला बहुमुखी क्याम्पस स्ववियुमा स्वागत छ"
        },
        "slide_2": {
          id: "slide_2",
          imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200",
          titleEn: "Empowering Students, Transforming Futures",
          titleNp: "विद्यार्थीको सशक्तिकरण, सुन्दर भविष्यको निर्माण"
        },
        "slide_3": {
          id: "slide_3",
          imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200",
          titleEn: "Fostering Academic and Leadership Excellence",
          titleNp: "शैक्षिक र नेतृत्व विकासमा निरन्तर अग्रसर"
        }
      },
      news: {
        "news_1": {
          id: "news_1",
          headingEn: "BBS and B.Ed Third Year Exam Centers Released by TU",
          headingNp: "त्रिविद्वारा बिबिएस र बिएड तेस्रो वर्षको परीक्षा केन्द्र सार्वजनिक",
          bodyEn: "Tribhuvan University Office of the Controller of Examinations has officially published the examination centers for BBS and B.Ed Third Year. All students are advised to check their respective rolls and download the admit cards. The examinations are starting from Shrawan 15, 2083. Best of luck!",
          bodyNp: "त्रिभुवन विश्वविद्यालय परीक्षा नियन्त्रण कार्यालयले बिबिएस र बिएड तेस्रो वर्षको परीक्षा केन्द्र प्रकाशित गरेको छ। परीक्षा साउन १५ गतेदेखि सुरु हुने भएकाले सम्पूर्ण विद्यार्थीहरूलाई आफ्नो प्रवेश-पत्र क्याम्पसबाट बुझिलिन अनुरोध गरिन्छ।",
          imageUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=600",
          createdAt: 1784534400000
        },
        "news_2": {
          id: "news_2",
          headingEn: "FSU to Organize District Level Inter-College Cricket Tournament",
          headingNp: "स्ववियुद्वारा जिल्लास्तरीय अन्तर-क्याम्पस क्रिकेट प्रतियोगिता आयोजना हुने",
          bodyEn: "To promote sportsmanship and physical health, the Free Student Union of Darchula Multiple Campus is organizing a district-level Inter-College Cricket Tournament starting next month. Teams from all high schools and campuses of Darchula are invited. Registrations are open at the FSU Office.",
          bodyNp: "विद्यार्थीहरूमा शारीरिक तन्दुरुस्ती र खेलकुद भावनाको विकास गर्न स्ववियु दार्चुला बहुमुखी क्याम्पसले जिल्लाव्यापी अन्तर-क्याम्पस क्रिकेट प्रतियोगिता आयोजना गर्ने भएको छ। इच्छुक टिमहरूले स्ववियु कार्यालयमा दर्ता गराउनुहोला।",
          imageUrl: "https://images.unsplash.com/photo-1531415080290-bc98545ab2ef?auto=format&fit=crop&q=80&w=600",
          createdAt: 1784448000000
        },
        "news_3": {
          id: "news_3",
          headingEn: "Free IT & Computer Literacy Workshop for B.Ed Students",
          headingNp: "बिएडका विद्यार्थीहरूका लागि नि:शुल्क कम्प्युटर साक्षरता कार्यशाला",
          bodyEn: "The FSU IT Club is hosting a comprehensive 10-day Computer Literacy Workshop targeting education students. Learn basic office suites, digital pedagogy, and internet-based research toolkits. Registrations close this Friday.",
          bodyNp: "डिजिटल शिक्षण विधिको प्रवर्धन गर्न स्ववियुको सूचना प्रविधि क्लबले बिएडका विद्यार्थीहरूका लागि १० दिने नि:शुल्क कम्प्युटर साक्षरता कार्यशाला सञ्चालन गर्ने भएको छ।",
          imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600",
          createdAt: 1784361600000
        }
      },
      downloads: {
        "dl_1": {
          id: "dl_1",
          titleEn: "B.Ed First Year Curriculum & Syllabus - TU",
          titleNp: "बिएड प्रथम वर्षको पाठ्यक्रम र पाठ्य विवरण - त्रिवि",
          fileUrl: "https://drive.google.com/drive/folders/1placeholder1",
          isDriveLink: true
        },
        "dl_2": {
          id: "dl_2",
          titleEn: "BBS Business English Complete Practice Notes",
          titleNp: "बिबिएस बिजनेस अंग्रेजी पूर्ण अभ्यास नोटहरू",
          fileUrl: "https://drive.google.com/drive/folders/2placeholder2",
          isDriveLink: true
        },
        "dl_3": {
          id: "dl_3",
          titleEn: "Academic Calendar and Vacation Schedule 2083",
          titleNp: "शैक्षिक क्यालेन्डर र बिदा तालिका २०८३",
          fileUrl: "https://drive.google.com/drive/folders/3placeholder3",
          isDriveLink: true
        }
      },
      blogs: {
        "blog_1": {
          id: "blog_1",
          headingEn: "The Role of Youth in Remote Mountain Education",
          headingNp: "दुर्गम हिमाली क्षेत्रको शिक्षा विकासमा युवाको भूमिका",
          bodyEn: "Education in mountainous districts like Darchula has always faced geographical and infrastructural bottlenecks. However, with the rise of student leadership and digitalization, the local youth are stepping up. By establishing computer labs, tutoring primary schools, and advocating for higher secondary facilities, we are carving out a brighter tomorrow. Education is not just about textbooks; it is about active citizenship.",
          bodyNp: "दार्चुला जस्ता हिमाली तथा दुर्गम जिल्लामा शिक्षाको पहुँच भौगोलिक विकटताका कारण चुनौतीपूर्ण छ। तर विद्यार्थी नेतृत्व र डिजिटल प्रविधिको विकासले आशा जगाएको छ। युवाहरूले गाउँ-गाउँमा शैक्षिक सचेतना जगाउँदै गुणस्तरीय शिक्षाको वकालत गर्न आवश्यक छ।",
          imageUrl: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=600",
          authorEn: "Amit Joshi, BBS 3rd Year",
          authorNp: "अमित जोशी, बिबिएस तेस्रो वर्ष",
          createdAt: 1784275200000
        },
        "blog_2": {
          id: "blog_2",
          headingEn: "Preserving Mahakali Border Culture and Heritage",
          headingNp: "महाकाली सीमा क्षेत्रको संस्कृति र सम्पदा संरक्षण",
          bodyEn: "Our border region Darchula possesses a rich tapestry of culture, ranging from Gaura parva, Hudkeeli dance, to traditional folk tunes that echo the spirit of the Himalayas. In an era of westernization, we students must document these cultural gems, preserve our language, and promote tourism along the Mahakali. This blog examines how youth can lead cultural preservation.",
          bodyNp: "दार्चुला जिल्ला सांस्कृतिक दृष्टिकोणले धनी छ। गौरा पर्व, हुड्केली नाच र लोक भाकाहरू हाम्रो पहिचान हुन्। पश्चिमा संस्कृतिको प्रभाव बढ्दै गएको आजको समयमा युवाहरूले हाम्रो मौलिक परम्पराको जगेर्ना गर्नुपर्छ।",
          imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600",
          authorEn: "Manisha Tinkari, B.Ed 2nd Year",
          authorNp: "मनिषा तिंकरी, बिएड दोस्रो वर्ष",
          createdAt: 1784188800000
        }
      },
      team: {
        "member_1": {
          id: "member_1",
          nameEn: "Amit Joshi",
          nameNp: "अमित जोशी",
          roleEn: "FSU President",
          roleNp: "स्ववियु सभापति",
          imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200",
          order: 1
        },
        "member_2": {
          id: "member_2",
          nameEn: "Janak Bahadur Dhami",
          nameNp: "जनक बहादुर धामी",
          roleEn: "FSU Vice President",
          roleNp: "स्ववियु उपसभापति",
          imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200",
          order: 2
        },
        "member_3": {
          id: "member_3",
          nameEn: "Deepa Tinkari",
          nameNp: "दीपा तिंकरी",
          roleEn: "FSU Secretary",
          roleNp: "स्ववियु सचिव",
          imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
          order: 3
        },
        "member_4": {
          id: "member_4",
          nameEn: "Suresh Sahu",
          nameNp: "सुरेश साहु",
          roleEn: "FSU Joint Secretary",
          roleNp: "स्ववियु सह-सचिव",
          imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
          order: 4
        },
        "member_5": {
          id: "member_5",
          nameEn: "Karan Singh Badal",
          nameNp: "करन सिंह बडाल",
          roleEn: "FSU Treasurer",
          roleNp: "स्ववियु कोषाध्यक्ष",
          imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200",
          order: 5
        }
      },
      importantNotice: {
        active: true,
        titleEn: "FSU Special Campus Admission Support Notice 2083",
        titleNp: "स्ववियु भर्ना तथा शैक्षिक परामर्श सेवा सम्बन्धी विशेष सूचना",
        bodyEn: "The Free Student Union has set up a specialized 'Admission Help Desk' inside the campus premises to assist new students enrolling in B.Ed, BBS, and BA first year. We provide guidance on choosing subjects, completing application forms, and understanding scholarship criteria. Contact Amit Joshi (+977-98487xxxxx) for immediate help.",
        bodyNp: "नवआगन्तुक विद्यार्थी साथीहरूलाई क्याम्पस भर्ना, संकाय छनोट र छात्रवृत्ति सम्बन्धी प्रक्रियामा सहजीकरण गर्न स्ववियुले 'भर्ना सहायता कक्ष' सञ्चालनमा ल्याएको छ। थप जानकारीका लागि स्ववियु सचिवालयमा सम्पर्क गर्नुहोला।",
        imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800",
        type: "both"
      }
    };

    await set(ref(rtdb), initialData);
    console.log("Database seeded successfully with Darchula Multiple Campus defaults!");
  } catch (err) {
    console.error("Failed to seed initial database state: ", err);
  }
}
