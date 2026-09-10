import { ServiceItem, ServiceSummaryStats } from "./types";

export const INITIAL_SERVICE_STATS: ServiceSummaryStats = {
  totalServices: 12,
  activePrograms: 10,
  avgProfessionalFee: 5125,
  totalPassThroughTracked: 34,
};

export const MOCK_SERVICES: ServiceItem[] = [
  {
    id: "1",
    code: "SRV-EB2-NIW",
    title: "EB-2 NIW",
    subCategory: "National Interest Waiver",
    category: "Employment Immigration",
    description:
      "Comprehensive consultation, endeavor drafting, proposed endeavor roadmap, and petition dossier preparation for professionals, researchers, and engineers of exceptional ability.",
    destination: {
      code: "US",
      country: "United States",
      flag: "🇺🇸",
    },
    professionalFee: 6500,
    passThroughFees: [
      {
        id: "pt-1-1",
        name: "USCIS Form I-140 Immigrant Petition Filing Fee",
        category: "USCIS & Government",
        amount: 715,
        isMandatory: true,
        payableTo: "US Department of Homeland Security (USCIS)",
        description: "Official federal agency statutory filing fee.",
      },
      {
        id: "pt-1-2",
        name: "USCIS Asylum Program Fee (Small Employer / Individual)",
        category: "USCIS & Government",
        amount: 300,
        isMandatory: true,
        payableTo: "US Department of Homeland Security (USCIS)",
        description: "Statutory mandatory surcharge under 2024 fee rule.",
      },
      {
        id: "pt-1-3",
        name: "WES Academic Credential Evaluation",
        category: "Credential Evaluation",
        amount: 250,
        isMandatory: false,
        payableTo: "World Education Services (WES)",
        description: "Foreign degree equivalency verification.",
      },
      {
        id: "pt-1-4",
        name: "Certified Document Translations (Estimated 3-5 docs)",
        category: "Certified Translation",
        amount: 350,
        isMandatory: false,
        payableTo: "Certified Translation Partners",
        description: "ATA-certified non-English evidence translations.",
      },
    ],
    totalClientCost: 8115,
    currency: "USD",
    schedulePreset: "deposit_2_milestones",
    defaultMilestones: [
      {
        id: "m-1",
        name: "Initial Retainer & Dossier Architecture Setup",
        percentage: 40,
        amount: 2600,
        triggerEvent: "Upon contract execution & attorney onboarding",
      },
      {
        id: "m-2",
        name: "Milestone 1 — Proposed Endeavor & Letters Complete",
        percentage: 30,
        amount: 1950,
        triggerEvent: "Draft endeavor delivery & 4 expert letters approved",
      },
      {
        id: "m-3",
        name: "Milestone 2 — Final Form I-140 Dossier Filing",
        percentage: 30,
        amount: 1950,
        triggerEvent: "Final petition package dispatched to USCIS Lockbox",
      },
    ],
    activeCasesCount: 428,
    status: "Active",
    eligibilityChecklist: [
      "Advanced degree (Master's or Ph.D.) OR Bachelor's with 5 years progressive experience",
      "Substantial intrinsic merit and national importance of proposed endeavor",
      "Well-positioned candidate evidence (citations, patents, key roles, media)",
    ],
    estimatedLeadTime: "6 - 12 Months",
    internalNotes: "Highest volume program. Ensure third-party fees are paid directly to agencies.",
    createdAt: "Jan 10, 2025",
    updatedAt: "Sep 01, 2026",
  },
  {
    id: "2",
    code: "SRV-EB1A",
    title: "EB-1A",
    subCategory: "Extraordinary Ability",
    category: "Priority & Talent",
    description:
      "Elite petition curation for extraordinary individuals in sciences, arts, education, business, or athletics meeting at least three regulatory criteria.",
    destination: {
      code: "US",
      country: "United States",
      flag: "🇺🇸",
    },
    professionalFee: 8000,
    passThroughFees: [
      {
        id: "pt-2-1",
        name: "USCIS Form I-140 Filing Fee",
        category: "USCIS & Government",
        amount: 715,
        isMandatory: true,
        payableTo: "US Department of Homeland Security",
        description: "Statutory immigrant petition fee.",
      },
      {
        id: "pt-2-2",
        name: "Independent Advisory Opinion & Peer Letters",
        category: "Attorney Representation",
        amount: 2500,
        isMandatory: true,
        payableTo: "Independent Expert Evaluation Counsel",
        description: "Field authority letters from top citations/scholars.",
      },
      {
        id: "pt-2-3",
        name: "Academic Equivalency & Media Translation",
        category: "Credential Evaluation",
        amount: 400,
        isMandatory: false,
        payableTo: "Trustforte / WES",
      },
    ],
    totalClientCost: 11615,
    currency: "USD",
    schedulePreset: "deposit_2_milestones",
    defaultMilestones: [
      {
        id: "m-1",
        name: "Executive Case Retainer",
        percentage: 50,
        amount: 4000,
        triggerEvent: "Dossier kickoff & evidence audit",
      },
      {
        id: "m-2",
        name: "Milestone 1 — 3/10 Regulatory Criteria Satisfied",
        percentage: 25,
        amount: 2000,
        triggerEvent: "Submission of peer citations, judge panels, and major media",
      },
      {
        id: "m-3",
        name: "Milestone 2 — Final USCIS Adjudication Dispatch",
        percentage: 25,
        amount: 2000,
        triggerEvent: "Final dispatch with Form I-907 Premium option",
      },
    ],
    activeCasesCount: 184,
    status: "Active",
    eligibilityChecklist: [
      "Evidence of sustained national or international acclaim",
      "Satisfies at least 3 of the 10 USCIS evidentiary criteria",
      "Substantial benefit to the United States prospective work",
    ],
    estimatedLeadTime: "4 - 8 Months",
    createdAt: "Jan 15, 2025",
    updatedAt: "Aug 20, 2026",
  },
  {
    id: "3",
    code: "SRV-EB3",
    title: "EB-3 Professional",
    subCategory: "Skilled & Professional Worker",
    category: "Permanent Residency",
    description:
      "Employment-based third preference support for skilled professionals and employer-sponsored candidates navigating PERM labor certification.",
    destination: {
      code: "US",
      country: "United States",
      flag: "🇺🇸",
    },
    professionalFee: 5500,
    passThroughFees: [
      {
        id: "pt-3-1",
        name: "USCIS Form I-140 Petition Fee",
        category: "USCIS & Government",
        amount: 715,
        isMandatory: true,
        payableTo: "US Department of Homeland Security",
      },
      {
        id: "pt-3-2",
        name: "Mandatory Labor Recruitment Newspaper & SWA Ads",
        category: "Other Expense",
        amount: 1400,
        isMandatory: true,
        payableTo: "Major Metropolitan Newspaper / State Workforce Agency",
        description: "Mandatory DOL PERM recruitment advertising costs.",
      },
      {
        id: "pt-3-3",
        name: "Prevailing Wage Determination (PWD) Filing",
        category: "USCIS & Government",
        amount: 0,
        isMandatory: true,
        payableTo: "US Department of Labor",
      },
    ],
    totalClientCost: 7615,
    currency: "USD",
    schedulePreset: "deposit_3_monthly",
    defaultMilestones: [
      {
        id: "m-1",
        name: "PERM Intake & Wage Request",
        percentage: 34,
        amount: 1870,
        triggerEvent: "PWD submission to DOL",
      },
      {
        id: "m-2",
        name: "Recruitment Window Execution",
        percentage: 33,
        amount: 1815,
        triggerEvent: "Completion of 30-day quiet period",
      },
      {
        id: "m-3",
        name: "Form ETA-9089 Filing & I-140 Prep",
        percentage: 33,
        amount: 1815,
        triggerEvent: "Certified Labor Certification receipt",
      },
    ],
    activeCasesCount: 96,
    status: "Active",
    eligibilityChecklist: [
      "Qualified employer sponsor with valid corporate EIN",
      "Prevailing wage determination compliance",
      "Bachelor's degree or minimum 2 years skilled experience",
    ],
    estimatedLeadTime: "14 - 24 Months",
    createdAt: "Feb 01, 2025",
    updatedAt: "Jul 15, 2026",
  },
  {
    id: "4",
    code: "SRV-E2-INV",
    title: "E-2 Treaty Investor",
    subCategory: "Principal Investor Visa",
    category: "Investor & Corporate",
    description:
      "Enterprise structuring, escrow verification, commercial business plan development, and DS-160/DS-156E consular appointment dossier management.",
    destination: {
      code: "US",
      country: "United States",
      flag: "🇺🇸",
    },
    professionalFee: 7500,
    passThroughFees: [
      {
        id: "pt-4-1",
        name: "DS-160 & MRV Consular Visa Fee",
        category: "USCIS & Government",
        amount: 315,
        isMandatory: true,
        payableTo: "US Department of State / Consular Services",
      },
      {
        id: "pt-4-2",
        name: "Comprehensive E-2 5-Year Matter of Ho Business Plan",
        category: "Business Plan Drafting",
        amount: 2500,
        isMandatory: true,
        payableTo: "Master Business Plan Specialists Inc.",
        description: "5-year financial forecast and job creation analysis.",
      },
      {
        id: "pt-4-3",
        name: "State Entity Setup, Registered Agent & EIN",
        category: "Corporate & State Filing",
        amount: 850,
        isMandatory: true,
        payableTo: "State Secretary of State & Corporate Registrar",
      },
    ],
    totalClientCost: 11165,
    currency: "USD",
    schedulePreset: "deposit_2_milestones",
    defaultMilestones: [
      {
        id: "m-1",
        name: "Corporate Formation & Escrow Setup",
        percentage: 40,
        amount: 3000,
        triggerEvent: "Entity registered & bank account verified",
      },
      {
        id: "m-2",
        name: "5-Year Business Plan Delivery",
        percentage: 30,
        amount: 2250,
        triggerEvent: "Final Matter of Ho compliant business plan approved",
      },
      {
        id: "m-3",
        name: "Consular Dossier Dispatched",
        percentage: 30,
        amount: 2250,
        triggerEvent: "Embassy submission and interview preparation complete",
      },
    ],
    activeCasesCount: 62,
    status: "Active",
    eligibilityChecklist: [
      "National of a qualifying bilateral investment treaty country",
      "Substantial capital placed at commercial risk (typically $100k+)",
      "Enterprise is active, commercial, and non-marginal",
    ],
    estimatedLeadTime: "3 - 6 Months",
    createdAt: "Feb 10, 2025",
    updatedAt: "Aug 12, 2026",
  },
  {
    id: "5",
    code: "SRV-L1-CORP",
    title: "L-1 Intracompany Transferee",
    subCategory: "Executive & Managerial (L-1A / L-1B)",
    category: "Investor & Corporate",
    description:
      "Cross-border executive and specialized knowledge transfer petition management between qualifying foreign affiliate and US corporate entity.",
    destination: {
      code: "US",
      country: "United States",
      flag: "🇺🇸",
    },
    professionalFee: 6000,
    passThroughFees: [
      {
        id: "pt-5-1",
        name: "USCIS Form I-129 Base Filing Fee",
        category: "USCIS & Government",
        amount: 1385,
        isMandatory: true,
        payableTo: "US Department of Homeland Security",
      },
      {
        id: "pt-5-2",
        name: "Fraud Prevention & Detection Fee",
        category: "USCIS & Government",
        amount: 500,
        isMandatory: true,
        payableTo: "USCIS Anti-Fraud Unit",
      },
      {
        id: "pt-5-3",
        name: "Corporate Hierarchy & Org Chart Audit",
        category: "Attorney Representation",
        amount: 1200,
        isMandatory: false,
        payableTo: "Corporate Governance Legal Partners",
      },
    ],
    totalClientCost: 9085,
    currency: "USD",
    schedulePreset: "deposit_2_milestones",
    defaultMilestones: [
      {
        id: "m-1",
        name: "Qualifying Relationship Audit",
        percentage: 50,
        amount: 3000,
        triggerEvent: "Cross-border corporate link verified",
      },
      {
        id: "m-2",
        name: "I-129 Petition Package Finalization",
        percentage: 50,
        amount: 3000,
        triggerEvent: "Filing dispatched to USCIS Service Center",
      },
    ],
    activeCasesCount: 45,
    status: "Active",
    eligibilityChecklist: [
      "1 continuous year of employment abroad in the prior 3 years",
      "Executive, managerial, or specialized knowledge capacity",
      "Qualifying parent, subsidiary, branch, or affiliate relationship",
    ],
    estimatedLeadTime: "3 - 5 Months",
    createdAt: "Feb 20, 2025",
    updatedAt: "Aug 02, 2026",
  },
  {
    id: "6",
    code: "SRV-CA-EE",
    title: "Canada Express Entry",
    subCategory: "Federal Skilled Worker (FSW)",
    category: "Permanent Residency",
    description:
      "Comprehensive CRS score maximization, NOC/TEER classification mapping, ECA credential oversight, and post-ITA Permanent Residence electronic application.",
    destination: {
      code: "CA",
      country: "Canada",
      flag: "🇨🇦",
    },
    professionalFee: 4500,
    passThroughFees: [
      {
        id: "pt-6-1",
        name: "IRCC Right of Permanent Residence Fee (RPRF)",
        category: "USCIS & Government",
        amount: 1365,
        isMandatory: true,
        payableTo: "Receiver General for Canada (IRCC)",
        description: "Mandatory processing & right of permanent residence fee.",
      },
      {
        id: "pt-6-2",
        name: "Biometrics Fee (Per Applicant)",
        category: "USCIS & Government",
        amount: 85,
        isMandatory: true,
        payableTo: "IRCC / VFS Global",
      },
      {
        id: "pt-6-3",
        name: "WES Canada Educational Credential Assessment",
        category: "Credential Evaluation",
        amount: 250,
        isMandatory: true,
        payableTo: "World Education Services Canada",
      },
      {
        id: "pt-6-4",
        name: "Certified English/French Translation Package",
        category: "Certified Translation",
        amount: 300,
        isMandatory: false,
        payableTo: "STIBC Certified Translators",
      },
    ],
    totalClientCost: 6500,
    currency: "CAD",
    schedulePreset: "deposit_2_milestones",
    defaultMilestones: [
      {
        id: "m-1",
        name: "Profile Creation & Pool Entry",
        percentage: 40,
        amount: 1800,
        triggerEvent: "CRS score calculated & profile in Express Entry pool",
      },
      {
        id: "m-2",
        name: "ITA Document Preparation",
        percentage: 30,
        amount: 1350,
        triggerEvent: "Invitation to Apply (ITA) received & dossier assembled",
      },
      {
        id: "m-3",
        name: "Final e-APR Submission to IRCC",
        percentage: 30,
        amount: 1350,
        triggerEvent: "Confirmation of PR application received (AOR)",
      },
    ],
    activeCasesCount: 512,
    status: "Active",
    eligibilityChecklist: [
      "Minimum CLB 7 in approved language examination (IELTS/CELPIP/TEF)",
      "Foreign educational credential assessment equivalency",
      "At least 1 year of continuous full-time skilled work under TEER 0, 1, 2, or 3",
    ],
    estimatedLeadTime: "6 - 9 Months",
    createdAt: "Jan 12, 2025",
    updatedAt: "Sep 05, 2026",
  },
  {
    id: "7",
    code: "SRV-CA-PNP",
    title: "Canada PNP",
    subCategory: "Provincial Nominee Program",
    category: "Permanent Residency",
    description:
      "Targeted provincial nomination routing across OINP, BC PNP, AAIP, and MPNP, followed by federal permanent residence processing.",
    destination: {
      code: "CA",
      country: "Canada",
      flag: "🇨🇦",
    },
    professionalFee: 5200,
    passThroughFees: [
      {
        id: "pt-7-1",
        name: "Provincial Nomination Statutory Application Fee",
        category: "USCIS & Government",
        amount: 1500,
        isMandatory: true,
        payableTo: "Provincial Ministry of Immigration (e.g. OINP / BC PNP)",
      },
      {
        id: "pt-7-2",
        name: "IRCC Federal Permanent Residency Fee",
        category: "USCIS & Government",
        amount: 1365,
        isMandatory: true,
        payableTo: "Receiver General for Canada",
      },
    ],
    totalClientCost: 8065,
    currency: "CAD",
    schedulePreset: "deposit_2_milestones",
    defaultMilestones: [
      {
        id: "m-1",
        name: "EOI & Provincial Stream Filing",
        percentage: 50,
        amount: 2600,
        triggerEvent: "Provincial expression of interest lodged",
      },
      {
        id: "m-2",
        name: "Nomination Certificate & Federal Filing",
        percentage: 50,
        amount: 2600,
        triggerEvent: "600 CRS point provincial nomination awarded",
      },
    ],
    activeCasesCount: 198,
    status: "Active",
    eligibilityChecklist: [
      "Meets provincial stream criteria (tech draw, in-demand skills, or graduate)",
      "Verified intent to reside in nominating province",
      "Sufficient settlement funds evidence",
    ],
    estimatedLeadTime: "9 - 14 Months",
    createdAt: "Feb 05, 2025",
    updatedAt: "Aug 25, 2026",
  },
  {
    id: "8",
    code: "SRV-UK-SKILL",
    title: "UK Skilled Worker",
    subCategory: "Shortage Occupation & Health / Care Route",
    category: "Employment Immigration",
    description:
      "Certificate of Sponsorship (CoS) compliance review, English proficiency vetting, and UK Visas and Immigration (UKVI) entry clearance submission.",
    destination: {
      code: "GB",
      country: "United Kingdom",
      flag: "🇬🇧",
    },
    professionalFee: 4200,
    passThroughFees: [
      {
        id: "pt-8-1",
        name: "UKVI Application Fee (3 Years)",
        category: "USCIS & Government",
        amount: 920,
        isMandatory: true,
        payableTo: "UK Visas and Immigration (Home Office)",
      },
      {
        id: "pt-8-2",
        name: "Immigration Health Surcharge (IHS) (£1,035/yr)",
        category: "USCIS & Government",
        amount: 1320,
        isMandatory: true,
        payableTo: "National Health Service / Home Office",
      },
    ],
    totalClientCost: 6440,
    currency: "GBP",
    schedulePreset: "deposit_2_milestones",
    defaultMilestones: [
      {
        id: "m-1",
        name: "CoS Verification & Points Audit",
        percentage: 50,
        amount: 2100,
        triggerEvent: "Valid Certificate of Sponsorship verified with UK sponsor",
      },
      {
        id: "m-2",
        name: "UKVI Entry Clearance Submission",
        percentage: 50,
        amount: 2100,
        triggerEvent: "VFS Global biometrics appointment scheduled",
      },
    ],
    activeCasesCount: 110,
    status: "Active",
    eligibilityChecklist: [
      "Confirmed job offer with licensed UK sponsor",
      "Salary meets minimum general threshold or going rate for SOC code",
      "B1 CEFR English language requirement",
    ],
    estimatedLeadTime: "4 - 8 Weeks",
    createdAt: "Mar 01, 2025",
    updatedAt: "Aug 15, 2026",
  },
  {
    id: "9",
    code: "SRV-AU-GTI",
    title: "Australia GTI",
    subCategory: "Global Talent Independent (Subclass 858)",
    category: "Priority & Talent",
    description:
      "Direct Australian permanent residency for internationally recognized talents in designated target sectors (DigiTech, Health, Energy, FinTech).",
    destination: {
      code: "AU",
      country: "Australia",
      flag: "🇦🇺",
    },
    professionalFee: 4800,
    passThroughFees: [
      {
        id: "pt-9-1",
        name: "Department of Home Affairs Visa Application Charge (VAC)",
        category: "USCIS & Government",
        amount: 4305,
        isMandatory: true,
        payableTo: "Department of Home Affairs Australia",
      },
      {
        id: "pt-9-2",
        name: "Australian Peak Industry Body Nominator Endorsement",
        category: "Attorney Representation",
        amount: 1500,
        isMandatory: true,
        payableTo: "Australian National Acclaim Nominator",
      },
    ],
    totalClientCost: 10605,
    currency: "AUD",
    schedulePreset: "deposit_2_milestones",
    defaultMilestones: [
      {
        id: "m-1",
        name: "Expression of Interest (EOI) Lodgement",
        percentage: 40,
        amount: 1920,
        triggerEvent: "EOI submitted to Global Talent Taskforce",
      },
      {
        id: "m-2",
        name: "Unique Identifier Award & Subclass 858 Lodgement",
        percentage: 60,
        amount: 2880,
        triggerEvent: "GTI invitation received and visa application lodged",
      },
    ],
    activeCasesCount: 75,
    status: "Active",
    eligibilityChecklist: [
      "International prominence in designated target sector",
      "Ability to attract income at or above Fair Work high income threshold ($175k AUD)",
      "Nomination by Australian citizen, permanent resident, or peak body",
    ],
    estimatedLeadTime: "3 - 6 Months",
    createdAt: "Mar 10, 2025",
    updatedAt: "Jul 28, 2026",
  },
  {
    id: "10",
    code: "SRV-CORP-US",
    title: "US Corporate Setup & EIN",
    subCategory: "Entity Incorporation & State Registration",
    category: "Corporate Advisory",
    description:
      "State-level incorporation (Delaware, Wyoming, Florida, California), federal Employer Identification Number (EIN) procurement, and operating agreements.",
    destination: {
      code: "US",
      country: "United States",
      flag: "🇺🇸",
    },
    professionalFee: 3800,
    passThroughFees: [
      {
        id: "pt-10-1",
        name: "State Division of Corporations Expedited Filing Fee",
        category: "Corporate & State Filing",
        amount: 350,
        isMandatory: true,
        payableTo: "State Secretary of State",
      },
      {
        id: "pt-10-2",
        name: "Registered Agent Annual Fee (Year 1)",
        category: "Corporate & State Filing",
        amount: 250,
        isMandatory: true,
        payableTo: "Commercial Registered Agent Service",
      },
      {
        id: "pt-10-3",
        name: "IRS Form SS-4 Expedited Processing",
        category: "Corporate & State Filing",
        amount: 150,
        isMandatory: false,
        payableTo: "IRS Certified Acceptance Representative",
      },
    ],
    totalClientCost: 4550,
    currency: "USD",
    schedulePreset: "single",
    defaultMilestones: [
      {
        id: "m-1",
        name: "Articles of Organization Filed",
        percentage: 50,
        amount: 1900,
        triggerEvent: "Certificate of formation issued by state",
      },
      {
        id: "m-2",
        name: "EIN & Corporate Governance Delivery",
        percentage: 50,
        amount: 1900,
        triggerEvent: "IRS EIN letter and operating agreement dispatched",
      },
    ],
    activeCasesCount: 88,
    status: "Active",
    eligibilityChecklist: [
      "Clear corporate name check in target jurisdiction",
      "Designated company organizers and initial member structure",
      "Valid foreign or domestic principal officer identity",
    ],
    estimatedLeadTime: "10 - 15 Business Days",
    createdAt: "Jan 05, 2025",
    updatedAt: "Aug 10, 2026",
  },
  {
    id: "11",
    code: "SRV-FAM-CA",
    title: "Family Sponsorship",
    subCategory: "Spousal & Dependent Route",
    category: "Family & Dependent",
    description:
      "Sponsorship undertaking for spouses, common-law partners, and dependent children immigrating to Canada.",
    destination: {
      code: "CA",
      country: "Canada",
      flag: "🇨🇦",
    },
    professionalFee: 3500,
    passThroughFees: [
      {
        id: "pt-11-1",
        name: "IRCC Sponsorship & Principal Applicant Fee",
        category: "USCIS & Government",
        amount: 1080,
        isMandatory: true,
        payableTo: "Receiver General for Canada",
      },
      {
        id: "pt-11-2",
        name: "Biometrics & Police Clearance Certification",
        category: "USCIS & Government",
        amount: 150,
        isMandatory: true,
        payableTo: "IRCC / Local Law Enforcement Authorities",
      },
    ],
    totalClientCost: 4730,
    currency: "CAD",
    schedulePreset: "deposit_2_milestones",
    defaultMilestones: [
      {
        id: "m-1",
        name: "Sponsor Eligibility Package Setup",
        percentage: 50,
        amount: 1750,
        triggerEvent: "Sponsorship agreement & undertaking compiled",
      },
      {
        id: "m-2",
        name: "Complete Relationship Dossier Filed",
        percentage: 50,
        amount: 1750,
        triggerEvent: "Application lodged to IRCC Case Processing Centre",
      },
    ],
    activeCasesCount: 140,
    status: "Active",
    eligibilityChecklist: [
      "Sponsor is 18+ and Canadian Citizen or Permanent Resident",
      "No default on previous undertakings or bankruptcy",
      "Genuine continuing relationship evidence",
    ],
    estimatedLeadTime: "10 - 14 Months",
    createdAt: "Mar 15, 2025",
    updatedAt: "Aug 18, 2026",
  },
  {
    id: "12",
    code: "SRV-CONSULT",
    title: "Strategic Advisory Consultation",
    subCategory: "Comprehensive Legal Strategy",
    category: "Corporate Advisory",
    description:
      "Comprehensive multi-jurisdiction immigration readiness evaluation, feasibility audit, and custom strategy roadmap.",
    destination: {
      code: "US",
      country: "United States",
      flag: "🇺🇸",
    },
    professionalFee: 1500,
    passThroughFees: [],
    totalClientCost: 1500,
    currency: "USD",
    schedulePreset: "single",
    defaultMilestones: [
      {
        id: "m-1",
        name: "Full Consultation & Written Strategy Roadmap",
        percentage: 100,
        amount: 1500,
        triggerEvent: "60-minute strategy call & custom written opinion delivered",
      },
    ],
    activeCasesCount: 215,
    status: "Active",
    eligibilityChecklist: [
      "Submission of updated CV and biographical profile prior to consultation",
    ],
    estimatedLeadTime: "3 - 5 Days",
    createdAt: "Jan 01, 2025",
    updatedAt: "Sep 02, 2026",
  },
];

// Helper to access mock services in browser localStorage
const STORAGE_KEY = "adskill_mock_services_v1";

export function getMockServices(): ServiceItem[] {
  if (typeof window === "undefined") {
    return MOCK_SERVICES;
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // fallback
  }
  return MOCK_SERVICES;
}

export function saveMockServices(services: ServiceItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
  } catch {
    // fallback
  }
}

export function addMockService(service: ServiceItem): void {
  const current = getMockServices();
  const updated = [service, ...current];
  saveMockServices(updated);
}

export function updateMockService(service: ServiceItem): void {
  const current = getMockServices();
  const updated = current.map((s) => (s.id === service.id ? service : s));
  saveMockServices(updated);
}

export function deleteMockService(id: string): void {
  const current = getMockServices();
  const updated = current.filter((s) => s.id !== id);
  saveMockServices(updated);
}
