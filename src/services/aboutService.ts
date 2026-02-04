import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const DEFAULT_CONTENT = {
  hero: {
    title: "About Bari Samaj",
    subtitle: "Rooted in heritage — united for progress.",
    intro:
      "Bari Samaj is a community platform created to connect families, preserve traditions, and support the social and cultural life of our community.",
    backgroundImage: "",
  },
  history: [
    {
      year: "Origin",
      title: "Our beginnings",
      description:
        "Bari Samaj traces its roots to generations of families who cultivated strong community bonds, mutual support, and shared traditions.",
    },
    {
      year: "20th Century",
      title: "Community growth",
      description:
        "Over decades, community centres, gatherings, and shared rites strengthened our identity and values.",
    },
  ],
  vision: {
    title: "Vision",
    statement:
      "A connected, thriving Bari community that preserves cultural dignity while embracing the future.",
  },
  mission: {
    title: "Mission",
    statement:
      "Provide a trusted digital home for connections, matrimony, announcements, and cultural preservation—managed responsibly by community stewards.",
  },
  features: [
    {
      id: "announcements",
      title: "Announcements & Notifications",
      description:
        "Timely community updates, important notices, and event information delivered with priority and clarity.",
    },
    {
      id: "matrimony",
      title: "Matrimony & Profile Verification",
      description:
        "A respectful matrimony experience with verification and admin oversight to build trust.",
    },
    {
      id: "kundli",
      title: "Kundli Matching",
      description:
        "Optional compatibility checks to support traditional match-making practices.",
    },
    {
      id: "directory",
      title: "Member Directory",
      description:
        "Find professionals, mentors, and friends within the Bari community for social and career connections.",
    },
  ],
  governance: {
    intro:
      "Administrators and moderators oversee content, approve sensitive entries, and ensure respectful use of the platform.",
  },
  values: ["Respect", "Integrity", "Inclusiveness", "Cultural dignity"],
  future: [
    "Expanded events and initiatives",
    "Educational and cultural programs",
    "Improved privacy and verification workflows",
  ],
};

export async function fetchAboutContent() {
  try {
    if (!db) return DEFAULT_CONTENT;
    const ref = doc(db, "pages", "about");
    const snap = await getDoc(ref);
    if (!snap.exists()) return DEFAULT_CONTENT;
    return { ...DEFAULT_CONTENT, ...(snap.data() as object) };
  } catch (err) {
    console.error("fetchAboutContent error", err);
    return DEFAULT_CONTENT;
  }
}
