// Role & Permission Human-Friendly Formatters for non-technical users

export const ROLE_DISPLAY_NAMES: Record<
  string,
  { label: string; description: string }
> = {
  SUPER_ADMIN: {
    label: "Super Administrator",
    description: "Complete universal access across all modules, settings, and financial records.",
  },
  MANAGER: {
    label: "Operations Manager",
    description: "Manages client cases, payment verification, reports, services, and team operations.",
  },
  CONSULTANT: {
    label: "Case Consultant",
    description: "Handles assigned client cases, milestones, case notes, and direct client support.",
  },
  CLIENT: {
    label: "Client Portal",
    description: "Self-service portal for tracking cases, making payments, and viewing receipts.",
  },
};

export const PERMISSION_DISPLAY_NAMES: Record<
  string,
  { label: string; description: string }
> = {
  // User Management
  "user:read": {
    label: "View Users & Clients",
    description: "Browse directory and view user profiles",
  },
  "user:create": {
    label: "Create User Accounts",
    description: "Register new staff members or clients",
  },
  "user:update": {
    label: "Edit User Profiles",
    description: "Update personal and contact information",
  },
  "user:delete": {
    label: "Suspend / Deactivate Users",
    description: "Disable user access or soft delete accounts",
  },
  "user:manage-role": {
    label: "Manage Roles & Permissions",
    description: "Configure dynamic roles and capability overrides",
  },

  // Service Catalog
  "service:read": {
    label: "View Service Catalog",
    description: "Browse legal & advisory services and standard fees",
  },
  "service:manage": {
    label: "Create & Edit Services",
    description: "Add new service offerings or update fee structures",
  },

  // Client Cases
  "case:read": {
    label: "View Client Cases",
    description: "Access case tracking and lifecycle progress",
  },
  "case:create": {
    label: "Open New Cases",
    description: "Initiate new case applications for clients",
  },
  "case:manage": {
    label: "Manage & Update Cases",
    description: "Reassign consultants, update status, and track milestones",
  },

  // Payment Plans & Milestones
  "plan:read": {
    label: "View Payment Plans",
    description: "View contracted installment milestones and schedules",
  },
  "plan:create": {
    label: "Create Payment Plans",
    description: "Set up milestone installment contracts for cases",
  },
  "plan:update": {
    label: "Modify Payment Plans",
    description: "Adjust installment due dates or milestone amounts",
  },
  "plan:delete": {
    label: "Cancel Payment Plans",
    description: "Void or remove contracted payment plans",
  },

  // Payments & Transactions
  "payment:read": {
    label: "View Payments & History",
    description: "View financial ledger, payment proofs, and transaction records",
  },
  "payment:record": {
    label: "Record Offline Payments",
    description: "Log offline manual payments (Bank Wire, Zelle, Cash)",
  },
  "payment:verify": {
    label: "Verify Offline Payments",
    description: "Review proof documents and approve pending offline payments",
  },
  "payment:refund": {
    label: "Issue Payment Refunds",
    description: "Approve and process transaction refunds",
  },
  "payment:pay": {
    label: "Make Online Payments",
    description: "Checkout and pay securely via Stripe",
  },

  // Invoices & Receipts
  "invoice:read": {
    label: "View & Download Invoices",
    description: "Access sequential branded PDF invoices",
  },
  "invoice:generate": {
    label: "Generate PDF Invoices",
    description: "Issue official sequential invoices for cases",
  },
  "receipt:read": {
    label: "View & Download Receipts",
    description: "Access payment receipts and transaction vouchers",
  },
  "receipt:generate": {
    label: "Generate Payment Receipts",
    description: "Issue official receipts for verified payments",
  },

  // Document Management
  "document:read": {
    label: "View Case Documents",
    description: "Browse and download client files and contracts",
  },
  "document:upload": {
    label: "Upload Documents",
    description: "Upload case evidence, IDs, and payment proofs",
  },
  "document:delete": {
    label: "Delete Documents",
    description: "Remove uploaded files and attachments",
  },

  // Reports & Financial Intelligence
  "report:view": {
    label: "View Financial Reports",
    description: "Analyze revenue KPIs, receivables aging, and cash flow",
  },
  "report:export": {
    label: "Export Financial Reports",
    description: "Download reports in CSV, Excel, or PDF formats",
  },

  // Executive Dashboard
  "dashboard:view": {
    label: "Executive CRM Dashboard",
    description: "Access management KPI cards, charts, and queues",
  },

  // Case Notes & Collaboration
  "note:read": {
    label: "View Case Notes",
    description: "Read client-visible case updates and timelines",
  },
  "note:create": {
    label: "Write Case Notes",
    description: "Post updates and notes on client cases",
  },
  "note:read-internal": {
    label: "View Confidential Staff Notes",
    description: "Access private internal notes hidden from clients",
  },

  // Support & Client Communication Desk
  "support:read": {
    label: "View Support Tickets",
    description: "Access help desk conversations and client inquiries",
  },
  "support:create": {
    label: "Open Support Inquiries",
    description: "Submit new support inquiries and help tickets",
  },
  "support:reply": {
    label: "Reply to Messages",
    description: "Send threaded chat messages in support tickets",
  },
  "support:manage": {
    label: "Manage & Resolve Tickets",
    description: "Assign staff handlers, change status, and close tickets",
  },

  // Audit Logs
  "audit:read": {
    label: "View System Audit Logs",
    description: "Inspect immutable audit trail of system activities",
  },
};

export function getRoleDisplayName(roleName: string): string {
  if (ROLE_DISPLAY_NAMES[roleName]) {
    return ROLE_DISPLAY_NAMES[roleName].label;
  }
  return roleName
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function getRoleDescription(roleName: string): string {
  return ROLE_DISPLAY_NAMES[roleName]?.description || "Custom configured dynamic role.";
}

export function getPermissionDisplayName(permName: string): string {
  return PERMISSION_DISPLAY_NAMES[permName]?.label || permName;
}

export function getPermissionDescription(permName: string, fallback?: string | null): string {
  return PERMISSION_DISPLAY_NAMES[permName]?.description || fallback || "Granular system capability";
}
