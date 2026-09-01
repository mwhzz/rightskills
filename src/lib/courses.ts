export const categories = [
  { id: "development", label: "Development", bangla: "ডেভেলপমেন্ট" },
  { id: "design", label: "Design", bangla: "ডিজাইন" },
  { id: "marketing", label: "Marketing", bangla: "মার্কেটিং" },
  { id: "language", label: "Language", bangla: "ভাষা" },
  { id: "career", label: "Career", bangla: "ক্যারিয়ার" },
  { id: "office", label: "Office", bangla: "অফিস স্কিল" },
] as const;

export type CategoryId = (typeof categories)[number]["id"];
export type Level = "Beginner" | "Intermediate" | "Advanced";
export type CourseLanguage = "Bangla" | "English" | "Bangla + English";

export type Lesson = {
  id: string;
  title: string;
  durationMin: number;
  preview?: boolean;
  body: string;
};

export type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export type Course = {
  slug: string;
  title: string;
  banglaTitle: string;
  subtitle: string;
  description: string;
  category: CategoryId;
  level: Level;
  language: CourseLanguage;
  priceBdt: number;
  originalPriceBdt?: number;
  rating: number;
  reviewCount: number;
  students: number;
  featured?: boolean;
  outcomes: string[];
  modules: Module[];
  instructor: {
    name: string;
    title: string;
    bio: string;
    initials: string;
  };
  cover: {
    from: string;
    to: string;
    pattern: "grid" | "dots" | "waves";
  };
};

function lesson(
  id: string,
  title: string,
  durationMin: number,
  body: string,
  preview = false
): Lesson {
  return { id, title, durationMin, body, preview };
}

export const courses: Course[] = [
  {
    slug: "fullstack-web-nextjs",
    title: "Full-Stack Web Development with Next.js",
    banglaTitle: "নেক্সট.জেএস দিয়ে ফুল-স্ট্যাক ওয়েব ডেভেলপমেন্ট",
    subtitle: "Ship real client websites — from Dhaka startups to freelance gigs.",
    description:
      "Build production websites with Next.js, TypeScript, and Tailwind. You will design pages, connect forms, and deploy a portfolio that Bangladeshi clients can actually hire you from. Lessons mix Bangla explanations with English industry terms so you can talk to both local clients and overseas buyers.",
    category: "development",
    level: "Beginner",
    language: "Bangla + English",
    priceBdt: 4990,
    originalPriceBdt: 7990,
    rating: 4.8,
    reviewCount: 612,
    students: 8420,
    featured: true,
    outcomes: [
      "Build and deploy a multi-page Next.js site",
      "Price and pitch a website to a local business",
      "Use TypeScript without freezing on errors",
      "Hand off a project with GitHub and Vercel",
    ],
    instructor: {
      name: "Rafiul Hasan",
      title: "Senior frontend engineer, ex-Pathao contractor",
      bio: "Rafi has shipped storefronts for 40+ Bangladeshi brands and mentors junior developers on Upwork.",
      initials: "RH",
    },
    cover: { from: "#0B6E4F", to: "#083D2C", pattern: "grid" },
    modules: [
      {
        id: "m1",
        title: "Foundations",
        lessons: [
          lesson("l1", "How web work actually pays in Bangladesh", 12, "A map of local agency work, freelance platforms, and what clients expect in a first meeting.", true),
          lesson("l2", "Tools: VS Code, Git, and Node", 18, "Install the toolchain and clone a starter. We keep the setup short so you can start building today."),
          lesson("l3", "HTML and Tailwind that look intentional", 24, "Spacing, type, and a simple landing layout you can reuse for every client."),
        ],
      },
      {
        id: "m2",
        title: "Build the product",
        lessons: [
          lesson("l4", "Pages, routing, and a real navbar", 22, "App Router pages, shared layout, and mobile navigation that does not break."),
          lesson("l5", "Forms, validation, and a lead inbox", 26, "Capture name, phone, and project notes — the lead flow local businesses actually use."),
          lesson("l6", "Deploy on Vercel and send the URL", 16, "Custom domain notes, environment variables, and how to demo on a phone."),
        ],
      },
    ],
  },
  {
    slug: "freelance-graphic-upwork",
    title: "Freelance Graphic Design for Upwork",
    banglaTitle: "আপওয়ার্কে গ্রাফিক ডিজাইন ফ্রিল্যান্সিং",
    subtitle: "Logos, social kits, and proposals that win first jobs.",
    description:
      "Learn a practical design stack with Figma and a proposal system built for Bangladeshi freelancers. You will build three portfolio pieces, write proposals that do not sound copy-pasted, and price work in USD without undercharging.",
    category: "design",
    level: "Beginner",
    language: "Bangla",
    priceBdt: 2490,
    originalPriceBdt: 3990,
    rating: 4.7,
    reviewCount: 890,
    students: 12140,
    featured: true,
    outcomes: [
      "Deliver a logo + brand kit in Figma",
      "Write a 150-word proposal that gets replies",
      "Price logo work without racing to the bottom",
      "Package files clients can actually use",
    ],
    instructor: {
      name: "Nusrat Jahan",
      title: "Brand designer, 200+ Upwork jobs",
      bio: "Nusrat runs a two-person studio in Chattogram and still takes selected logo projects herself.",
      initials: "NJ",
    },
    cover: { from: "#C45C26", to: "#7A2E12", pattern: "dots" },
    modules: [
      {
        id: "m1",
        title: "Portfolio that gets interviews",
        lessons: [
          lesson("l1", "What buyers scan in 8 seconds", 10, "How Upwork thumbnails and first case-study lines actually get clicked.", true),
          lesson("l2", "Logo system in Figma", 28, "Type pairing, colour, and a mockup set you can screenshot for your profile."),
          lesson("l3", "Social kit for a restaurant client", 22, "Feed posts, story covers, and a simple content calendar template."),
        ],
      },
      {
        id: "m2",
        title: "Getting paid",
        lessons: [
          lesson("l4", "Proposals that sound like a person", 16, "A three-paragraph structure in Bangla thinking, English sending."),
          lesson("l5", "Revisions, files, and closing the job", 14, "How to avoid endless edits and still keep a five-star review."),
        ],
      },
    ],
  },
  {
    slug: "facebook-ads-bd",
    title: "Facebook & Instagram Ads for Bangladesh",
    banglaTitle: "বাংলাদেশের জন্য ফেসবুক ও ইনস্টাগ্রাম অ্যাডস",
    subtitle: "Run ads that sell for shops in Dhaka, Sylhet, and beyond.",
    description:
      "Set up Business Manager the way agencies here actually use it. You will build audiences around districts, write Bangla ad copy, and read results without drowning in vanity metrics. Built for e-commerce sellers and page managers.",
    category: "marketing",
    level: "Intermediate",
    language: "Bangla",
    priceBdt: 3490,
    originalPriceBdt: 5490,
    rating: 4.6,
    reviewCount: 540,
    students: 6310,
    featured: true,
    outcomes: [
      "Launch a campaign with district-level targeting",
      "Write Bangla primary text that converts",
      "Read CPA, ROAS, and when to kill an ad",
      "Build a weekly reporting sheet for a client",
    ],
    instructor: {
      name: "Tanvir Ahmed",
      title: "Performance marketer, fashion & food brands",
      bio: "Tanvir has spent ad budgets from ৳20k test campaigns to multi-crore retainers for Dhaka retailers.",
      initials: "TA",
    },
    cover: { from: "#1D4ED8", to: "#1E3A8A", pattern: "waves" },
    modules: [
      {
        id: "m1",
        title: "Setup that does not break later",
        lessons: [
          lesson("l1", "Pixels, catalogues, and Business Manager", 20, "The checklist agencies use before a single taka is spent.", true),
          lesson("l2", "Audiences: city, interest, and lookalike", 18, "How to think about Dhaka vs rest-of-country without wasting budget."),
        ],
      },
      {
        id: "m2",
        title: "Creative and spend",
        lessons: [
          lesson("l3", "Ad copy in Bangla that does not cringe", 16, "Hooks, offers, and what gets people to comment instead of scroll."),
          lesson("l4", "Daily optimisation for a ৳2,000 budget", 22, "What to touch, what to leave, and how to report to a shop owner."),
        ],
      },
    ],
  },
  {
    slug: "spoken-english-job",
    title: "Spoken English for Job Interviews",
    banglaTitle: "চাকরির ইন্টারভিউয়ের জন্য স্পোকেন ইংলিশ",
    subtitle: "Clear answers for MNCs, NGOs, and remote standups.",
    description:
      "Practice the English you actually need in Bangladeshi workplaces: introducing yourself, handling HR rounds, and joining a standup without freezing. Short drills, model answers, and feedback checklists — not grammar lectures.",
    category: "language",
    level: "Beginner",
    language: "Bangla + English",
    priceBdt: 1990,
    originalPriceBdt: 2990,
    rating: 4.9,
    reviewCount: 1420,
    students: 18650,
    featured: true,
    outcomes: [
      "Deliver a 60-second self-introduction",
      "Answer behavioural questions with a simple structure",
      "Join a standup and give a status update",
      "Write a follow-up email after an interview",
    ],
    instructor: {
      name: "Farhana Rahman",
      title: "Corporate trainer, former BRAC HR",
      bio: "Farhana has coached graduates into roles at Grameenphone, bKash, and remote US teams.",
      initials: "FR",
    },
    cover: { from: "#0F766E", to: "#134E4A", pattern: "dots" },
    modules: [
      {
        id: "m1",
        title: "Sound ready on day one",
        lessons: [
          lesson("l1", "Your introduction, three versions", 14, "Campus, career-switch, and experienced — pick the one that fits.", true),
          lesson("l2", "STAR answers without sounding robotic", 18, "A Bangla-to-English drill for ‘tell me about a challenge’."),
          lesson("l3", "Standup English in 8 sentences", 12, "Yesterday, today, blockers — the only script most teams need."),
        ],
      },
    ],
  },
  {
    slug: "excel-office",
    title: "Excel & Google Sheets for Office Work",
    banglaTitle: "অফিসের কাজের জন্য এক্সেল ও গুগল শিটস",
    subtitle: "MIS, payroll lists, and reports your manager will actually open.",
    description:
      "Stop fighting with messy sheets. Learn the formulas, pivots, and clean layouts used in Bangladeshi offices — from NGOs to garment buying houses. Includes a sample sales tracker and a monthly report you can reuse.",
    category: "office",
    level: "Beginner",
    language: "Bangla",
    priceBdt: 1490,
    rating: 4.7,
    reviewCount: 980,
    students: 15420,
    featured: true,
    outcomes: [
      "Build a sales tracker with SUMIFS and data validation",
      "Make a pivot table your manager can filter",
      "Clean a messy CSV from another department",
      "Share a Google Sheet without breaking permissions",
    ],
    instructor: {
      name: "Mahmudul Islam",
      title: "MIS lead, RMG buying office",
      bio: "Mahmudul has trained merchandising teams across three factories on reporting that survives audits.",
      initials: "MI",
    },
    cover: { from: "#166534", to: "#14532D", pattern: "grid" },
    modules: [
      {
        id: "m1",
        title: "Sheets that survive real work",
        lessons: [
          lesson("l1", "Tables, not pretty colours", 12, "How to structure a sheet so formulas keep working after 2,000 rows.", true),
          lesson("l2", "Lookups and SUMIFS for sales", 20, "The two formula families that replace most manual counting."),
          lesson("l3", "Pivot + a one-page monthly report", 18, "A printable layout with last month vs this month."),
        ],
      },
    ],
  },
  {
    slug: "ielts-band-7",
    title: "IELTS Academic Band 7 Path",
    banglaTitle: "আইইএলটিএস একাডেমিক ব্যান্ড ৭",
    subtitle: "Writing Task 2 and speaking that match examiner habits.",
    description:
      "A focused Academic IELTS path for students aiming at Band 7 for Canada, UK, and Australian visas. Heavy on Task 2 structure, speaking part 2 cards, and the mistakes Bangladeshi candidates repeat.",
    category: "language",
    level: "Intermediate",
    language: "English",
    priceBdt: 3990,
    originalPriceBdt: 5990,
    rating: 4.5,
    reviewCount: 410,
    students: 3280,
    outcomes: [
      "Plan a Task 2 essay in 8 minutes",
      "Speak for two minutes without collapsing",
      "Spot grammar slips that cap you at 6.0",
      "Build a 21-day mock test calendar",
    ],
    instructor: {
      name: "Sabrina Chowdhury",
      title: "IELTS mentor, Band 8.5",
      bio: "Sabrina has coached 600+ candidates from Banani and Sylhet centres, with a Band 7 first-sit focus.",
      initials: "SC",
    },
    cover: { from: "#7C3AED", to: "#4C1D95", pattern: "waves" },
    modules: [
      {
        id: "m1",
        title: "Writing and speaking",
        lessons: [
          lesson("l1", "Task 2: the four-paragraph machine", 22, "Introduction, two body ideas, conclusion — with sample Band 7 language.", true),
          lesson("l2", "Speaking Part 2 without memorised essays", 16, "A cue-card method that still sounds like you."),
          lesson("l3", "Listening maps and academic reading", 20, "Timing drills for the sections that steal Band 7."),
        ],
      },
    ],
  },
  {
    slug: "python-data",
    title: "Python for Data & Office Automation",
    banglaTitle: "ডেটা ও অফিস অটোমেশনের জন্য পাইথন",
    subtitle: "Clean CSVs, send reports, stop repeating the same Excel steps.",
    description:
      "Use Python the way operations teams need it: read Excel, clean columns, and email a summary. No academic detours. You will automate a weekly sales dump that currently takes a junior two hours every Sunday.",
    category: "development",
    level: "Beginner",
    language: "Bangla + English",
    priceBdt: 2990,
    originalPriceBdt: 4490,
    rating: 4.6,
    reviewCount: 305,
    students: 4120,
    featured: true,
    outcomes: [
      "Read and clean an Excel export with pandas",
      "Write a script that emails a weekly summary",
      "Schedule a job on your own laptop",
      "Explain your script to a non-technical manager",
    ],
    instructor: {
      name: "Arif Khan",
      title: "Data engineer, fintech",
      bio: "Arif automates reporting at a Dhaka payments company and teaches Python to career-switchers on weekends.",
      initials: "AK",
    },
    cover: { from: "#334155", to: "#0F172A", pattern: "grid" },
    modules: [
      {
        id: "m1",
        title: "From spreadsheet to script",
        lessons: [
          lesson("l1", "Python only as far as you need it", 16, "Variables, lists, and files — nothing that will not show up in the project.", true),
          lesson("l2", "pandas on a messy sales CSV", 24, "Rename columns, fix dates, group by district."),
          lesson("l3", "Email the PDF and sleep in on Sunday", 18, "A small script plus a Windows Task Scheduler walkthrough."),
        ],
      },
    ],
  },
  {
    slug: "content-writing",
    title: "Content Writing Clients Will Pay For",
    banglaTitle: "ক্লায়েন্টরা যে কনটেন্ট রাইটিংয়ের জন্য টাকা দেয়",
    subtitle: "Landing pages, Facebook captions, and case-study posts.",
    description:
      "Write commercial Bangla and English that sells services — not school essays. You will produce a landing page, a week of captions, and a case study a digital agency can put in front of a client.",
    category: "marketing",
    level: "Beginner",
    language: "Bangla + English",
    priceBdt: 1790,
    rating: 4.8,
    reviewCount: 470,
    students: 7210,
    outcomes: [
      "Write a landing page that states an offer clearly",
      "Draft seven days of captions for a local brand",
      "Turn a client result into a case-study post",
      "Quote a writing retainer without guessing",
    ],
    instructor: {
      name: "Lamia Haque",
      title: "Copywriter, D2C and NGO briefs",
      bio: "Lamia writes for Dhaka D2C brands and still takes caption retainers for clinics and tuition centres.",
      initials: "LH",
    },
    cover: { from: "#B45309", to: "#7C2D12", pattern: "dots" },
    modules: [
      {
        id: "m1",
        title: "Pages, posts, proof",
        lessons: [
          lesson("l1", "Offers before adjectives", 12, "How to find the sentence a page is actually trying to say.", true),
          lesson("l2", "Captions that get saves, not just likes", 16, "A week of posts for a real shop example."),
          lesson("l3", "Case studies in 250 words", 14, "Problem, work, number — then a quote."),
        ],
      },
    ],
  },
  {
    slug: "wordpress-business",
    title: "WordPress Website Business",
    banglaTitle: "ওয়ার্ডপ্রেস ওয়েবসাইট বিজনেস",
    subtitle: "Sell ৳15k–৳40k sites to local businesses without custom code.",
    description:
      "Productise WordPress: discovery call, theme setup, forms, speed, and handover. Aimed at people who want a service business in their city — coaching centres, clinics, and shops that still need a website.",
    category: "career",
    level: "Beginner",
    language: "Bangla",
    priceBdt: 2290,
    originalPriceBdt: 3490,
    rating: 4.4,
    reviewCount: 260,
    students: 3890,
    outcomes: [
      "Run a 20-minute discovery call",
      "Launch a five-page site with forms and WhatsApp",
      "Hand over logins without creating future headaches",
      "Package hosting + updates as a monthly retainer",
    ],
    instructor: {
      name: "Imran Hossain",
      title: "Agency owner, Rajshahi",
      bio: "Imran’s studio ships 6–8 WordPress sites a month for clinics, schools, and retailers outside Dhaka.",
      initials: "IH",
    },
    cover: { from: "#0369A1", to: "#0C4A6E", pattern: "waves" },
    modules: [
      {
        id: "m1",
        title: "Sell, build, retain",
        lessons: [
          lesson("l1", "The ৳25k website offer", 14, "What is in, what is out, and how to say no to custom shops.", true),
          lesson("l2", "Theme, pages, and WhatsApp CTA", 22, "A clinic site built end to end."),
          lesson("l3", "Handover and a ৳2,000/month care plan", 12, "Backups, plugin updates, and a simple SLA."),
        ],
      },
    ],
  },
  {
    slug: "figma-uiux",
    title: "UI/UX Design with Figma",
    banglaTitle: "ফিগমা দিয়ে ইউআই/ইউএক্স ডিজাইন",
    subtitle: "Mobile-first screens for apps Bangladeshi users actually open.",
    description:
      "Design a mobile flow for a local service — tuition, parcel, or food — with real constraints: Bangla type, low-end Android, and bKash-style payment screens. You leave with a case study, not a Dribbble shot.",
    category: "design",
    level: "Intermediate",
    language: "Bangla + English",
    priceBdt: 4490,
    originalPriceBdt: 6490,
    rating: 4.7,
    reviewCount: 198,
    students: 2140,
    outcomes: [
      "Map a user flow before drawing screens",
      "Design a 8-screen mobile app in Figma",
      "Handle Bangla UI without broken line heights",
      "Present a case study to a hiring manager",
    ],
    instructor: {
      name: "Shaila Karim",
      title: "Product designer, SuperApp alumni",
      bio: "Shaila has designed checkout and KYC flows used by millions of Bangladeshi mobile users.",
      initials: "SK",
    },
    cover: { from: "#DB2777", to: "#9D174D", pattern: "dots" },
    modules: [
      {
        id: "m1",
        title: "From flow to case study",
        lessons: [
          lesson("l1", "Jobs to be done for a local app", 16, "Interview notes and a flow for a tuition marketplace.", true),
          lesson("l2", "Components, type, and Bangla UI", 24, "A small design system that survives long Bangla labels."),
          lesson("l3", "Prototype and a hiring case study", 18, "Record the flow and write the story for your portfolio."),
        ],
      },
    ],
  },
  {
    slug: "youtube-video-edit",
    title: "Video Editing for YouTube & Reels",
    banglaTitle: "ইউটিউব ও রিলসের জন্য ভিডিও এডিটিং",
    subtitle: "Captions, hooks, and a weekly editing rhythm that ships.",
    description:
      "Edit talking-head and reel content for Bangladeshi creators and small brands. Premiere or CapCut — we cover both. You will cut a 10-minute video and three reels from the same shoot.",
    category: "design",
    level: "Beginner",
    language: "Bangla",
    priceBdt: 1890,
    rating: 4.6,
    reviewCount: 355,
    students: 5680,
    outcomes: [
      "Cut a 10-minute talking-head video",
      "Make three Reels from leftover footage",
      "Add Bangla captions that stay readable",
      "Deliver files a client can post the same day",
    ],
    instructor: {
      name: "Hasibul Alam",
      title: "Editor, YouTube channels 100k+",
      bio: "Hasib edits education and vlog channels from a home studio in Mirpur and takes brand reel retainers.",
      initials: "HA",
    },
    cover: { from: "#DC2626", to: "#7F1D1D", pattern: "waves" },
    modules: [
      {
        id: "m1",
        title: "Cut, caption, ship",
        lessons: [
          lesson("l1", "Hooks in the first two seconds", 10, "What keeps a Bangladeshi feed from scrolling past.", true),
          lesson("l2", "Talking-head edit in Premiere / CapCut", 26, "J-cuts, B-roll, and a loudness check for phone speakers."),
          lesson("l3", "Captions and a client folder", 14, "Export presets and a naming scheme that agencies copy."),
        ],
      },
    ],
  },
  {
    slug: "b2b-sales-bd",
    title: "B2B Sales & Client Communication",
    banglaTitle: "বি২বি সেলস ও ক্লায়েন্ট কমিউনিকেশন",
    subtitle: "Discovery calls, quotations, and follow-ups that close.",
    description:
      "Sell services to Bangladeshi businesses without sounding like a call centre. You will run a discovery call, write a quotation in Bangla and English, and follow up without being ignored. Built for agency owners and freelancers who hate ‘just circling back’.",
    category: "career",
    level: "Intermediate",
    language: "Bangla + English",
    priceBdt: 2590,
    originalPriceBdt: 3990,
    rating: 4.5,
    reviewCount: 188,
    students: 1960,
    outcomes: [
      "Run a 20-minute discovery call with a script",
      "Write a quotation a finance team can approve",
      "Follow up on WhatsApp without sounding desperate",
      "Handle ‘send a PDF’ and still book a next step",
    ],
    instructor: {
      name: "Adnan Kabir",
      title: "Sales lead, B2B SaaS",
      bio: "Adnan closed SME software deals across Dhaka and Chattogram and now coaches agency founders.",
      initials: "AK",
    },
    cover: { from: "#0F766E", to: "#042F2E", pattern: "grid" },
    modules: [
      {
        id: "m1",
        title: "Conversations that close",
        lessons: [
          lesson("l1", "Discovery: questions before a pitch", 16, "A call structure that works on Zoom and in a Uttara office.", true),
          lesson("l2", "Quotations, VAT notes, and scope", 18, "A one-pager finance will not bounce."),
          lesson("l3", "WhatsApp follow-up that gets a date", 12, "Three messages, then a graceful stop."),
        ],
      },
    ],
  },
];

export function getCourse(slug: string) {
  return courses.find((course) => course.slug === slug);
}

export function getFeaturedCourses() {
  return courses.filter((course) => course.featured);
}

export function courseHours(course: Course) {
  const minutes = course.modules
    .flatMap((module) => module.lessons)
    .reduce((sum, lessonItem) => sum + lessonItem.durationMin, 0);
  return Math.max(1, Math.round((minutes / 60) * 10) / 10);
}

export function lessonCount(course: Course) {
  return course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
}

export function categoryLabel(id: CategoryId) {
  return categories.find((category) => category.id === id)?.label ?? id;
}

export const levels: Level[] = ["Beginner", "Intermediate", "Advanced"];
