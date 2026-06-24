import { collection, doc, getDocs, setDoc, deleteDoc, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "../context/FirebaseContext";

export interface Lead {
  id: string;
  userId: string | null;
  name: string;
  industry: string;
  website: string;
  phone: string;
  address: string;
  opportunityScore: number;
  status: "discovered" | "analyzed" | "contacted" | "won" | "lost";
  siteSpeed: number;
  mobileFriendly: boolean;
  seoScore: number;
  sslEnabled: boolean;
  aiAudit?: string;
  createdAt: any;
  updatedAt: any;
}

export interface UserSettings {
  agencyName: string;
  agencyWebsite: string;
  createdAt?: any;
  updatedAt?: any;
}

const GUEST_LEADS_KEY = "leadforme_guest_leads";
const GUEST_SETTINGS_KEY = "leadforme_guest_settings";

// Default/mock leads to make the dashboard look gorgeous on first visit
const DEFAULT_MOCK_LEADS: Lead[] = [
  {
    id: "mock-1",
    userId: null,
    name: "Summit Dental Group",
    industry: "Healthcare / Dental",
    website: "summitdentistry-mock.com",
    phone: "(303) 555-0143",
    address: "1042 Pine St, Boulder, CO 80302",
    opportunityScore: 84,
    status: "discovered",
    siteSpeed: 42,
    mobileFriendly: false,
    seoScore: 55,
    sslEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "mock-2",
    userId: null,
    name: "Apex Legal Partners",
    industry: "Legal Services",
    website: "apexlaw-denver-mock.co",
    phone: "(720) 555-0188",
    address: "1700 Broadway, Denver, CO 80202",
    opportunityScore: 72,
    status: "analyzed",
    siteSpeed: 55,
    mobileFriendly: true,
    seoScore: 68,
    sslEnabled: true,
    aiAudit: "### Website Audit Summary\n\n- **SEO**: Missing meta tags, h1 tags structured poorly.\n- **Mobile**: Site scales but layout breaks in mobile portrait view.\n- **Tech Stack**: Built on an outdated custom CMS.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "mock-3",
    userId: null,
    name: "Bella Italia Bistro",
    industry: "Restaurant",
    website: "bellaitaliaboulder.com",
    phone: "(303) 555-0211",
    address: "2014 Pearl St, Boulder, CO 80302",
    opportunityScore: 91,
    status: "contacted",
    siteSpeed: 28,
    mobileFriendly: false,
    seoScore: 41,
    sslEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export async function getLeads(userId: string | null, guestMode: boolean): Promise<Lead[]> {
  if (guestMode || !userId) {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(GUEST_LEADS_KEY);
    if (!saved) {
      localStorage.setItem(GUEST_LEADS_KEY, JSON.stringify(DEFAULT_MOCK_LEADS));
      return DEFAULT_MOCK_LEADS;
    }
    return JSON.parse(saved);
  }

  try {
    const q = query(collection(db, "leads"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const leads: Lead[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      leads.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
      } as Lead);
    });
    return leads;
  } catch (error) {
    console.error("Error getting Firestore leads:", error);
    return [];
  }
}

export async function saveLead(userId: string | null, guestMode: boolean, lead: Partial<Lead> & { id: string }): Promise<void> {
  if (guestMode || !userId) {
    if (typeof window === "undefined") return;
    const leads = await getLeads(userId, guestMode);
    const index = leads.findIndex(l => l.id === lead.id);
    const updatedLead: Lead = {
      ...leads[index] || {
        id: lead.id,
        userId: null,
        name: "",
        industry: "",
        website: "",
        phone: "",
        address: "",
        opportunityScore: 50,
        status: "discovered",
        siteSpeed: 70,
        mobileFriendly: true,
        seoScore: 70,
        sslEnabled: true,
        createdAt: new Date().toISOString()
      },
      ...lead,
      updatedAt: new Date().toISOString()
    };

    if (index >= 0) {
      leads[index] = updatedLead;
    } else {
      leads.push(updatedLead);
    }
    localStorage.setItem(GUEST_LEADS_KEY, JSON.stringify(leads));
    return;
  }

  try {
    const docRef = doc(db, "leads", lead.id);
    const dataToSave = {
      ...lead,
      userId,
      updatedAt: serverTimestamp(),
    };
    if (!lead.createdAt) {
      dataToSave.createdAt = serverTimestamp();
    }
    await setDoc(docRef, dataToSave, { merge: true });
  } catch (error) {
    console.error("Error saving lead to Firestore:", error);
  }
}

export async function deleteLead(userId: string | null, guestMode: boolean, leadId: string): Promise<void> {
  if (guestMode || !userId) {
    if (typeof window === "undefined") return;
    const leads = await getLeads(userId, guestMode);
    const filtered = leads.filter(l => l.id !== leadId);
    localStorage.setItem(GUEST_LEADS_KEY, JSON.stringify(filtered));
    return;
  }

  try {
    await deleteDoc(doc(db, "leads", leadId));
  } catch (error) {
    console.error("Error deleting lead from Firestore:", error);
  }
}

export async function getSettings(userId: string | null, guestMode: boolean): Promise<UserSettings> {
  const defaultSettings: UserSettings = {
    agencyName: "My Agency",
    agencyWebsite: "agencywebsite.com"
  };

  if (guestMode || !userId) {
    if (typeof window === "undefined") return defaultSettings;
    const saved = localStorage.getItem(GUEST_SETTINGS_KEY);
    return saved ? JSON.parse(saved) : defaultSettings;
  }

  try {
    const querySnapshot = await getDocs(query(collection(db, "settings"), where("__name__", "==", userId)));
    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data();
      return {
        agencyName: data.agencyName || "My Agency",
        agencyWebsite: data.agencyWebsite || "agencywebsite.com",
      };
    }
    return defaultSettings;
  } catch (error) {
    console.error("Error getting settings:", error);
    return defaultSettings;
  }
}

export async function saveSettings(userId: string | null, guestMode: boolean, settings: UserSettings): Promise<void> {
  if (guestMode || !userId) {
    if (typeof window === "undefined") return;
    localStorage.setItem(GUEST_SETTINGS_KEY, JSON.stringify(settings));
    return;
  }

  try {
    const docRef = doc(db, "settings", userId);
    await setDoc(docRef, {
      ...settings,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Error saving settings:", error);
  }
}
