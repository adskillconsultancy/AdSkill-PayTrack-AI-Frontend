"use client";

import * as React from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ClientItem, ClientStatus } from "../types";
import { X, UserPlus } from "lucide-react";

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (client: ClientItem) => void;
}

export function NewClientModal({
  isOpen,
  onClose,
  onSubmit,
}: NewClientModalProps) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [country, setCountry] = React.useState("Canada");
  const [countryCode, setCountryCode] = React.useState("CA");
  const [visaTitle, setVisaTitle] = React.useState("Express Entry");
  const [visaSub, setVisaSub] = React.useState("Federal Skilled Worker");
  const [status, setStatus] = React.useState<ClientStatus>("Processing");
  const [agentName, setAgentName] = React.useState("Sarah K.");
  const [totalFee, setTotalFee] = React.useState("4500");

  if (!isOpen) return null;

  const handleCountryChange = (c: string) => {
    setCountry(c);
    if (c === "Canada") setCountryCode("CA");
    else if (c === "United Kingdom") setCountryCode("GB");
    else if (c === "Australia") setCountryCode("AU");
    else if (c === "Germany") setCountryCode("DE");
    else if (c === "United States") setCountryCode("US");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const randomIdNum = Math.floor(1000 + Math.random() * 9000);
    const newClient: ClientItem = {
      id: Date.now().toString(),
      clientId: `#APP-2026-${randomIdNum}`,
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      initials: name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
      destination: {
        code: countryCode,
        country: country,
      },
      visaCategory: {
        title: visaTitle,
        subCategory: visaSub,
      },
      submission: {
        date: "Just now",
        agentName: agentName,
      },
      status: status,
      totalFee: Number(totalFee) || 4500,
      paidAmount: Math.round((Number(totalFee) || 4500) * 0.5),
      dueAmount: Math.round((Number(totalFee) || 4500) * 0.5),
      notes: "Newly onboarded client case.",
    };

    onSubmit(newClient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-[#EAE6DF] bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0ECE6] bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#092244] text-[#F3A712] shadow-2xs">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#092244] tracking-tight">
                Add New Client Case
              </h3>
              <p className="text-xs text-[#64748B]">
                Create a client record with immigration category
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-[#EAE6DF] text-[#64748B] hover:text-[#092244] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
              Full Client Name *
            </label>
            <Input
              required
              placeholder="e.g. Liam Henderson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#092244]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="liam@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#092244]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                Phone Number
              </label>
              <Input
                placeholder="+1 555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-10 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#092244]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                Destination Country
              </label>
              <select
                value={country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-semibold text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244]"
              >
                <option value="Canada">Canada (CA)</option>
                <option value="United Kingdom">United Kingdom (GB)</option>
                <option value="Australia">Australia (AU)</option>
                <option value="Germany">Germany (DE)</option>
                <option value="United States">United States (US)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ClientStatus)}
                className="w-full h-10 px-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-semibold text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244]"
              >
                <option value="Processing">Processing</option>
                <option value="Approved">Approved</option>
                <option value="Missing Docs">Missing Docs</option>
                <option value="Under Review">Under Review</option>
                <option value="Delayed">Delayed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                Visa Category
              </label>
              <Input
                placeholder="e.g. Express Entry"
                value={visaTitle}
                onChange={(e) => setVisaTitle(e.target.value)}
                className="h-10 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#092244]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                Sub Category
              </label>
              <Input
                placeholder="e.g. Federal Skilled Worker"
                value={visaSub}
                onChange={(e) => setVisaSub(e.target.value)}
                className="h-10 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#092244]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                Assigned Agent
              </label>
              <Input
                placeholder="Sarah K."
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="h-10 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#092244]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                Contract Fee ($)
              </label>
              <Input
                type="number"
                placeholder="4500"
                value={totalFee}
                onChange={(e) => setTotalFee(e.target.value)}
                className="h-10 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#092244]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#F0ECE6] flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-10 text-xs font-bold bg-[#092244] text-white hover:bg-[#071933]"
            >
              Save Client Record
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
