# Form Field & Placeholder Design Standard

## Context & Purpose
All inputs, textareas, and search bars across the application must strictly adhere to the unified placeholder and form design system derived from `/users/create` (`CreateUserForm.tsx`).

## Core Rules

1. **Placeholder Color & Opacity**:
   - Always use `#94A3B8` at 60% opacity: `placeholder:text-[#94A3B8]/60`.
   - Global fallback is declared in `src/app/globals.css` under `@layer base`:
     ```css
     input::placeholder,
     textarea::placeholder {
       color: rgb(148 163 184 / 0.6);
       font-weight: 400;
     }
     ```

2. **Placeholder Font Weight**:
   - **Always** `font-normal` (`400`): `placeholder:font-normal`.
   - Placeholders must NEVER inherit bold weights (`font-bold`, `font-semibold`) from the input's text style. Even if an input is styled with `font-bold` or `font-mono font-bold`, the placeholder text MUST explicitly be `placeholder:font-normal`.

3. **Input Component Centralization**:
   - **Always** import `<Input />` from `@/components/common` (`src/components/common/Input.tsx`).
   - The `<Input />` primitive includes `placeholder:text-[#94A3B8]/60 placeholder:font-normal` by default.

4. **Standard Input & Textarea Styling**:
   - **Form Input**:
     ```tsx
     <Input
       {...register("fieldName")}
       placeholder="Placeholder text"
       className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-bold text-[#092244] placeholder:text-[#94A3B8]/60 placeholder:font-normal"
     />
     ```
   - **Textarea**:
     ```tsx
     <textarea
       {...register("notes")}
       rows={3}
       placeholder="Placeholder text..."
       className="w-full p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-medium text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244] placeholder:text-[#94A3B8]/60 placeholder:font-normal"
     />
     ```
   - **Search Input**:
     ```tsx
     <input
       type="text"
       value={search}
       onChange={(e) => setSearch(e.target.value)}
       placeholder="Search..."
       className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-semibold text-[#092244] placeholder:text-[#94A3B8]/60 placeholder:font-normal focus:outline-none focus:ring-1 focus:ring-[#092244] transition-all"
     />
     ```
