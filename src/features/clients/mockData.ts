import { ClientItem, ClientSummaryStats } from "./types";

export const INITIAL_CLIENT_STATS: ClientSummaryStats = {
  inProgress: 1284,
  approved: 8492,
  actionRequired: 243,
  delayed: 15,
};

export const MOCK_CLIENTS: ClientItem[] = [
  {
    id: "1",
    clientId: "#APP-2026-9482",
    name: "Arjun Sharma",
    email: "arjun.sharma@example.com",
    phone: "+1 (416) 555-0192",
    whatsapp: "+14165550192",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    initials: "AS",
    destination: {
      code: "CA",
      country: "Canada",
    },
    visaCategory: {
      title: "Express Entry",
      subCategory: "Federal Skilled Worker",
    },
    submission: {
      date: "Jan 12, 2026",
      agentName: "Sarah K.",
    },
    status: "Processing",
    passportNumber: "P4829104",
    totalFee: 4500,
    paidAmount: 3000,
    dueAmount: 1500,
    notes: "Biometrics pending at VFS New Delhi. Medical exams successfully cleared.",
    activityLogs: [
      {
        id: "log-1",
        action: "Biometrics Appointment Scheduled",
        target: "VFS Global New Delhi",
        timestamp: "Jan 14, 2026 at 11:00 AM",
        agentName: "Sarah K.",
      },
      {
        id: "log-2",
        action: "Payment Milestone #1 Received ($3,000)",
        target: "Stripe Invoice #INV-2026-0812",
        timestamp: "Jan 12, 2026 at 3:15 PM",
        agentName: "Michael B.",
      },
    ],
  },
  {
    id: "2",
    clientId: "#APP-2026-8571",
    name: "Maria Gonzales",
    email: "maria.gonzales@example.com",
    phone: "+44 20 7946 0912",
    whatsapp: "+442079460912",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    initials: "MG",
    destination: {
      code: "GB",
      country: "United Kingdom",
    },
    visaCategory: {
      title: "Student Visa",
      subCategory: "Higher Education",
    },
    submission: {
      date: "Jan 10, 2026",
      agentName: "Michael B.",
    },
    status: "Missing Docs",
    passportNumber: "UK891048",
    totalFee: 3200,
    paidAmount: 1600,
    dueAmount: 1600,
    notes: "Awaiting updated bank sponsorship statements and CAS confirmation letter.",
    activityLogs: [
      {
        id: "log-3",
        action: "Document Request Dispatched via WhatsApp",
        target: "Financial Evidence Required",
        timestamp: "Jan 11, 2026 at 4:30 PM",
        agentName: "Michael B.",
      },
    ],
  },
  {
    id: "3",
    clientId: "#APP-2026-7731",
    name: "Johnathan Doe",
    email: "j.doe@example.com",
    phone: "+61 2 9876 5432",
    whatsapp: "+61298765432",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    initials: "JD",
    destination: {
      code: "AU",
      country: "Australia",
    },
    visaCategory: {
      title: "Work Visa",
      subCategory: "Skilled Nominated",
    },
    submission: {
      date: "Jan 08, 2026",
      agentName: "Self",
    },
    status: "Approved",
    passportNumber: "AU773190",
    totalFee: 5800,
    paidAmount: 5800,
    dueAmount: 0,
    notes: "Visa grant notice issued. Relocation scheduled for Q2 2026.",
    activityLogs: [
      {
        id: "log-4",
        action: "Official Grant Notice Issued",
        target: "Department of Home Affairs",
        timestamp: "Jan 08, 2026 at 10:15 AM",
        agentName: "System",
      },
      {
        id: "log-5",
        action: "Final Fee Settlement ($2,900)",
        target: "Paid in Full",
        timestamp: "Jan 07, 2026 at 2:00 PM",
        agentName: "Michael B.",
      },
    ],
  },
  {
    id: "4",
    clientId: "#APP-2026-6419",
    name: "Elena Rostova",
    email: "elena.rostova@example.com",
    phone: "+49 30 1234 5678",
    whatsapp: "+493012345678",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    initials: "ER",
    destination: {
      code: "DE",
      country: "Germany",
    },
    visaCategory: {
      title: "EU Blue Card",
      subCategory: "Software Engineering",
    },
    submission: {
      date: "Jan 05, 2026",
      agentName: "Sarah K.",
    },
    status: "Processing",
    passportNumber: "DE641902",
    totalFee: 3800,
    paidAmount: 2500,
    dueAmount: 1300,
    notes: "Employment contract verified by Federal Employment Agency (ZAV).",
    activityLogs: [
      {
        id: "log-6",
        action: "ZAV Labor Clearance Verified",
        target: "Federal Employment Agency",
        timestamp: "Jan 06, 2026 at 9:00 AM",
        agentName: "Sarah K.",
      },
    ],
  },
  {
    id: "5",
    clientId: "#APP-2026-5120",
    name: "David Chen",
    email: "david.chen@example.com",
    phone: "+1 (415) 882-9011",
    whatsapp: "+14158829011",
    avatarUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    initials: "DC",
    destination: {
      code: "US",
      country: "United States",
    },
    visaCategory: {
      title: "H-1B Specialty",
      subCategory: "Technology & AI",
    },
    submission: {
      date: "Dec 28, 2025",
      agentName: "Michael B.",
    },
    status: "Under Review",
    passportNumber: "US512033",
    totalFee: 6200,
    paidAmount: 4000,
    dueAmount: 2200,
    notes: "Petition filed with USCIS premium processing. Awaiting receipt notice.",
    activityLogs: [
      {
        id: "log-7",
        action: "USCIS Petition Form I-129 Submitted",
        target: "California Service Center",
        timestamp: "Dec 28, 2025 at 1:45 PM",
        agentName: "Michael B.",
      },
    ],
  },
  {
    id: "6",
    clientId: "#APP-2026-4890",
    name: "Fatima Al-Zahra",
    email: "fatima.zahra@example.com",
    phone: "+971 4 332 9012",
    whatsapp: "+97143329012",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    initials: "FA",
    destination: {
      code: "CA",
      country: "Canada",
    },
    visaCategory: {
      title: "Start-Up Visa",
      subCategory: "Designated Angel Group",
    },
    submission: {
      date: "Dec 20, 2025",
      agentName: "Sarah K.",
    },
    status: "Delayed",
    passportNumber: "AE489022",
    totalFee: 8500,
    paidAmount: 5000,
    dueAmount: 3500,
    notes: "Security background check screening extended by IRCC.",
    activityLogs: [
      {
        id: "log-8",
        action: "IRCC Security Screening Delay Notice",
        target: "Case File #CA-9812",
        timestamp: "Jan 03, 2026 at 11:30 AM",
        agentName: "Sarah K.",
      },
    ],
  },
  {
    id: "7",
    clientId: "#APP-2026-3912",
    name: "Carlos Mendez",
    email: "carlos.m@example.com",
    phone: "+34 91 554 1120",
    whatsapp: "+34915541120",
    avatarUrl:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    initials: "CM",
    destination: {
      code: "GB",
      country: "United Kingdom",
    },
    visaCategory: {
      title: "Global Talent",
      subCategory: "Digital Technology",
    },
    submission: {
      date: "Dec 15, 2025",
      agentName: "Self",
    },
    status: "Approved",
    passportNumber: "ES391288",
    totalFee: 4900,
    paidAmount: 4900,
    dueAmount: 0,
    notes: "Endorsement approved by Tech Nation. Entry clearance vignette issued.",
    activityLogs: [
      {
        id: "log-9",
        action: "Tech Nation Endorsement Granted",
        target: "Exceptional Promise Route",
        timestamp: "Dec 18, 2025 at 3:20 PM",
        agentName: "Sarah K.",
      },
    ],
  },
];

export function addMockClient(client: ClientItem): void {
  MOCK_CLIENTS.unshift(client);
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("adskill_custom_clients");
      const list: ClientItem[] = stored ? JSON.parse(stored) : [];
      list.unshift(client);
      localStorage.setItem("adskill_custom_clients", JSON.stringify(list));
    } catch {
      // ignore storage errors
    }
  }
}

export function getMockClients(): ClientItem[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("adskill_custom_clients");
      if (stored) {
        const customList: ClientItem[] = JSON.parse(stored);
        const ids = new Set(customList.map((c) => c.id));
        const rest = MOCK_CLIENTS.filter((c) => !ids.has(c.id));
        return [...customList, ...rest];
      }
    } catch {
      // ignore
    }
  }
  return MOCK_CLIENTS;
}
