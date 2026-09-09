# Project Knowledge & AI Architecture Playbook — AdSkill PayTrack AI

> **MASTER SPECIFICATION & TRACKER REFERENCE:**  
> - Specification Document: [project-docs/PROJECT_SPECIFICATION.md](file:///c:/AdSkill/AI%20Client%20Payment%20Tracker/AdSkill%20PayTrack%20AI%20Frontend/project-docs/PROJECT_SPECIFICATION.md)  
> - Live Feature & Role Tracker: [project-docs/FEATURES_TRACKER.md](file:///c:/AdSkill/AI%20Client%20Payment%20Tracker/AdSkill%20PayTrack%20AI%20Frontend/project-docs/FEATURES_TRACKER.md)

> **ROLE & MINDSET:**
> Act as a **Staff / Senior Frontend Software Engineer with 10+ years of experience**.
> When writing, extending, or refactoring code in this project, use this document as your primary architectural guide. Build clean, modular, scalable, and production-ready code aligned with the established structure below. Be practical, flexible, and maintain high code quality.

---

## 1. Project Tech Stack & Brand System

- **Framework**: Next.js 16+ (App Router, Turbopack)
- **Language**: TypeScript (clean, strongly typed)
- **Server State & APIs**: **RTK Query** with `baseApi.injectEndpoints()`
- **Client / UI State**: **Zustand** (lightweight stores for UI toggles, modals, sidebar)
- **Styling**: **Tailwind CSS v4** (via `@tailwindcss/postcss`)
- **Theme & Aesthetics**: Warm luxury creamy-white background (`#FAF8F5`), Deep Navy (`#092244`), Warm Mustard Gold (`#F3A712`), Slate Gray (`#475569`)
- **Fonts**: **Plus Jakarta Sans** (sans font) & **JetBrains Mono** (mono font) loaded via `next/font/google`
- **Official Brand Logos**:
  - `public/logo.svg` (Primary light mode lockup)
  - `public/logo-dark.svg` (Dark mode lockup)
  - `public/logo-icon.svg` (Interlocking "PT" squircle monogram)
  - `public/favicon.svg` (Browser favicon)
- **UI Primitives**: Native React + Tailwind CSS in `components/common/`
- **Forms & Validation**: **React Hook Form** + **Zod**
- **Icons**: **Lucide React** (`lucide-react`)
- **Analytics**: `@vercel/analytics`

---

## 2. Directory Architecture & Responsibilities

```
src/
├── app/                  # Route URLs & Layouts ONLY (Keep page.tsx thin & clean)
│   ├── (public)/         # Public marketing pages & auth flows
│   │   ├── (auth)/       # Nested auth: /login, /register, /forgot-password, /reset-password
│   │   ├── layout.tsx    # Shared Public shell (Header + Footer)
│   │   └── page.tsx      # Public landing page (/)
│   ├── (protected)/      # Authenticated app: /dashboard, /payments, /clients, /tracking, etc.
│   │   └── layout.tsx    # Protected shell (Collapsible Sidebar + Header)
│   ├── globals.css       # Tailwind v4 import & theme variables
│   └── layout.tsx        # Root HTML layout with providers, fonts, analytics
│
├── components/           # Reusable UI & Layout Components (NO Domain Business Logic)
│   ├── common/           # Atomic UI primitives (Button, Input, Table, Loader, EmptyState)
│   ├── layouts/          # Shell components (Header, Footer, Sidebar)
│   └── shared/           # Cross-cutting layout blocks (PageHeader, SectionTitle)
│
├── features/             # Feature-Driven Business Modules (THE REAL UI & LOGIC)
│   ├── auth/             # Auth forms (LoginForm, RegisterForm), session hooks
│   ├── clients/          # Client tables, client cards, client modals
│   ├── payments/         # Payment tables, invoice forms, calculation hooks
│   ├── reports/          # Analytics tables, chart widgets, filter bars
│   └── tracking/         # Booking/time tracking cards and widgets
│
├── services/             # Server State & API Layer (RTK QUERY)
│   └── api/              # Domain-scoped endpoint definitions
│       ├── auth/         # authEndpoints.ts
│       ├── clients/      # clientEndpoints.ts
│       └── payments/     # paymentEndpoints.ts
│
├── stores/               # Client UI State (ZUSTAND)
│   ├── auth.store.ts     # Current user, access token storage
│   ├── modal.store.ts    # Global modal open/close states
│   └── sidebar.store.ts  # Sidebar collapsed/expanded state
│
├── validations/          # Zod Validation Schemas
│   ├── auth.schema.ts    # Login, registration, password validation
│   └── payment.schema.ts # Payment & invoice creation validation
│
├── constants/            # Central Constants (Single Source of Truth)
│   ├── routes.ts         # ROUTES object (URL paths)
│   └── app.ts            # App metadata, default pagination, storage keys
│
├── lib/                  # Utilities & Base Setup
│   ├── rtk-query/        # baseApi.ts (RTK Query root)
│   ├── store.ts          # Redux Toolkit store (hosts RTK Query reducer/middleware)
│   └── utils.ts          # Tailwind merge helper (`cn`)
│
├── providers/            # Top-level Application Providers
│   ├── QueryProvider.tsx # Wraps Redux store for RTK Query
│   └── ThemeProvider.tsx # Dark/light theme provider
│
└── proxy.ts              # Edge Route Protection & Auth Redirects (Next.js 16+ convention)
```

---

## 3. "Where Do I Put Code?" — Action Guide

Use this quick-reference table whenever adding new functionality:

| Task                      | Where to Put It                                      | Implementation Guidelines                                                                                                                       |
| ------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Add a Table**           | `src/features/<domain>/components/<Domain>Table.tsx` | Import `<Table>`, `<TableHeader>`, `<TableRow>`, etc. from `@/components/common`. Style rows cleanly with Tailwind.                             |
| **New API Endpoint**      | `src/services/api/<domain>/<domain>Endpoints.ts`     | Inject into `baseApi` using `baseApi.injectEndpoints({ ... })`. Export generated hooks (e.g. `useGet...Query`).                                 |
| **New Page / Route**      | `src/app/(public)/...` or `src/app/(protected)/...`  | Create `page.tsx`. Keep it concise: set metadata, import `<PageHeader>`, and render the feature components.                                     |
| **New Popup / Modal**     | `src/features/<domain>/components/<Domain>Modal.tsx` | Control open/close state via `src/stores/modal.store.ts` or local state if single-use.                                                          |
| **New Form**              | `src/features/<domain>/components/<Domain>Form.tsx`  | Use `react-hook-form` connected with a Zod schema from `src/validations/`.                                                                      |
| **Client UI State**       | `src/stores/<name>.store.ts`                         | Use Zustand `create()`. Good for sidebars, active filters, open dialogs, and theme state.                                                       |
| **New Atomic UI Element** | `src/components/common/`                             | Build reusable elements (e.g., Badge, Modal shell, Dropdown) using pure React + Tailwind. Export in `components/common/index.ts` & update doc. |
| **Route Links & URLs**    | `src/constants/routes.ts`                            | Always use `ROUTES.<PATH>` instead of hardcoding raw strings.                                                                                   |
| **Global Styles**         | `src/app/globals.css`                                | Update CSS variables or theme tokens.                                                                                                           |

---

## 4. Reusable Common Components Policy (STRICT DRY RULE)

> **MANDATORY POLICY FOR ALL DEVELOPERS & AI SESSIONS:**
> 1. **Zero Duplication**: Never write raw `<button>` or raw styled form elements inside pages or features. All buttons, inputs, tables, loaders, and empty states **MUST** be imported from `@/components/common`.
> 2. **Check Before Creating**: Before building any UI element, check the inventory table below. If a component exists in `src/components/common/`, you **MUST** reuse it.
> 3. **Protocol for New Reusable Components**:
>    - If a component or pattern is needed in 2 or more places (e.g., `Badge`, `Modal`, `Card`, `StatusPill`, `Dropdown`), create it in `src/components/common/<Name>.tsx`.
>    - Export it immediately in `src/components/common/index.ts`.
>    - **Immediately document it in the table below** so future AI sessions and developers reuse it instead of creating duplicates.
> 4. **Links Styled as Buttons**: Always use `<Button asChild><Link href="...">Text</Link></Button>`. Never apply raw button styles directly onto a `<Link>` tag.

### Active Common Inventory (`src/components/common`)

| Component | Export / Import | Variants / Props | Description & Example Usage |
| :--- | :--- | :--- | :--- |
| **`Button`** | `{ Button, buttonVariants } from "@/components/common"` | `variant`: `default`, `outline`, `secondary`, `ghost`, `link`, `destructive`<br>`size`: `default`, `sm`, `lg`, `icon`<br>`asChild`: `boolean` (to wrap Next.js `<Link>`) | Central button primitive for all CTAs, submits, and links.<br>`<Button size="sm">Click</Button>`<br>`<Button asChild><Link href="/login">Login</Link></Button>` |
| **`Input`** | `{ Input } from "@/components/common"` | Standard `React.InputHTMLAttributes<HTMLInputElement>` + Tailwind styling | Styled input supporting text, password, email, number. Compatible with `react-hook-form` via `{...register("fieldName")}`. |
| **`Table`** | `{ Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "@/components/common"` | Full semantic HTML table wrapper components with responsive container | Standard ledger and milestone tables. Consistent border, font, and row styling across all modules. |
| **`Loader`** | `{ Loader } from "@/components/common"` | `size`: `sm`, `default`, `lg`<br>`className` | Circular animated loading indicator with branding colors for async states. |
| **`EmptyState`** | `{ EmptyState } from "@/components/common"` | `icon`, `title`, `description`, `action` | Clean, high-polish placeholder rendered when lists, tables, or search filters return 0 results. |
| **`ApplicationsTable`** | `{ ApplicationsTable } from "@/components/common"` | `title`, `data?: ApplicationItem[]`, `totalCount`, `currentPage`, `totalPages`, `sortBy`, `onView`, `onMore`, `onPageChange`, `onSortChange` | Standard reusable data table matching the approved UI design with client avatar, destination, visa category, submission date, status pills, and action buttons. Falls back to hardcoded mock data if no prop is supplied. |


---

## 5. Key Implementation Patterns

### A. Reusable Table (`components/common/Table.tsx`)

```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/common";

export function PaymentsTable({ data }: { data: PaymentItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice #</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.invoiceNo}</TableCell>
            <TableCell>{item.clientName}</TableCell>
            <TableCell>${item.amount.toLocaleString()}</TableCell>
            <TableCell>{item.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### B. Clean Route Page (`app/.../page.tsx`)

```tsx
import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { PaymentsTable } from "@/features/payments/components/PaymentsTable";

export const metadata: Metadata = {
  title: "Payments",
};

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Client Payments"
        description="Track all incoming invoices and payment milestones."
      />
      <PaymentsTable data={[]} />
    </div>
  );
}
```

### C. RTK Query API Injection (`services/api/`)

```typescript
import { baseApi } from "@/lib/rtk-query/baseApi";
import type { Payment } from "./payment.types";

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query<Payment[], void>({
      query: () => "/payments",
      providesTags: ["Payments"],
    }),
    createPayment: builder.mutation<Payment, Partial<Payment>>({
      query: (body) => ({
        url: "/payments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Payments"],
    }),
  }),
});

export const { useGetPaymentsQuery, useCreatePaymentMutation } = paymentApi;
```

### D. Zustand Client Store (`stores/`)

```typescript
import { create } from "zustand";

interface SidebarState {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: false,
  toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setCollapsed: (isCollapsed) => set({ isCollapsed }),
}));
```

---

## 6. Guidelines for AI Sessions

1. **Check Existing Components First**: Before building new primitives, check `src/components/common/` and Section 4 above to reuse existing components (`Button`, `Input`, `Table`, `Loader`, `EmptyState`).
2. **Never Reinvent the Wheel**: If a button, input, or table is needed, always import from `@/components/common`. No raw `<button>` elements.
3. **Register New Common Code Here**: When creating a new reusable primitive in `src/components/common/`, always update Section 4 of this document.
4. **Keep UI Primitives Clean**: Build UI components using native React + Tailwind CSS (no heavy external component libraries unless approved).
5. **Keep `page.tsx` Focused**: Place business logic, state handling, and detailed layouts inside `features/<domain>/` and keep route `page.tsx` as lightweight containers.
6. **Centralize Routes**: Always reference `ROUTES` from `@/constants`.
7. **Always Verify**: Ensure all TypeScript types and builds pass (`npm run build`) without errors.
8. **Maintain this Document**: If you create a new root folder, feature module, or architectural pattern, update this file so future AI sessions stay synchronized.
