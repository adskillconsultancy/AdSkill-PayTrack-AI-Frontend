import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="container py-10">
      <PageHeader
        title="Contact"
        description="Get in touch with our team."
      />
      <div className="rounded-lg border bg-card p-8 text-card-foreground">
        <p className="text-sm text-muted-foreground">
          Contact page content will be implemented here.
        </p>
      </div>
    </div>
  );
}
