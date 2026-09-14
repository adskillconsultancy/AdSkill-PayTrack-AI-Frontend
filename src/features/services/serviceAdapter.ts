import type {
  BackendService,
  ServiceItem,
  PassThroughFeeItem,
  DefaultMilestonePhase,
} from "./types";

export function backendToServiceItem(b: BackendService): ServiceItem {
  const passThroughFees: PassThroughFeeItem[] = [];

  const govFee = Number(b.estimatedGovFee || 0);
  if (govFee > 0) {
    passThroughFees.push({
      id: `${b.id}-gov`,
      name: "Government Statutory Filing Fee",
      category: "USCIS & Government",
      amount: govFee,
      isMandatory: true,
      payableTo: "Department of Homeland Security / USCIS",
      description: "Mandatory statutory agency fee.",
    });
  }

  const attyFee = Number(b.estimatedAttorneyFee || 0);
  if (attyFee > 0) {
    passThroughFees.push({
      id: `${b.id}-atty`,
      name: "Attorney Legal Representation",
      category: "Attorney Representation",
      amount: attyFee,
      isMandatory: false,
      payableTo: "Outside Legal Counsel",
      description: "Direct outside legal counsel representation.",
    });
  }

  const thirdFee = Number(b.estimatedThirdPartyFee || 0);
  if (thirdFee > 0) {
    passThroughFees.push({
      id: `${b.id}-third`,
      name: "Evaluations, Translations & Business Plans",
      category: "Credential Evaluation",
      amount: thirdFee,
      isMandatory: false,
      payableTo: "Third-Party Evaluation Service",
      description: "Pass-through evaluation, translation, or business drafting.",
    });
  }

  const base = Number(b.baseFee || 0);
  const totalPt = passThroughFees.reduce((sum, f) => sum + f.amount, 0);
  const totalCost = base + totalPt;

  // Derive milestone structure
  const milestones: DefaultMilestonePhase[] = [];
  const deposit = b.defaultDeposit ? Number(b.defaultDeposit) : 0;
  const installments = b.defaultInstallments || (deposit > 0 ? 3 : 1);

  if (deposit > 0 && totalCost > deposit) {
    const depositPct = Math.round((deposit / totalCost) * 100);
    milestones.push({
      id: `${b.id}-m1`,
      name: "Initial Retainer Deposit",
      percentage: depositPct,
      amount: deposit,
      triggerEvent: "Upon contract execution & case setup",
    });

    const remaining = totalCost - deposit;
    const count = Math.max(1, installments);
    const instAmt = Math.round(remaining / count);
    const instPct = Math.round((100 - depositPct) / count);

    for (let i = 1; i <= count; i++) {
      milestones.push({
        id: `${b.id}-m${i + 1}`,
        name: `Milestone Phase ${i}`,
        percentage: i === count ? Math.max(0, 100 - depositPct - instPct * (count - 1)) : instPct,
        amount: i === count ? Math.max(0, remaining - instAmt * (count - 1)) : instAmt,
        triggerEvent: `Milestone ${i} deliverable completed`,
      });
    }
  } else {
    milestones.push({
      id: `${b.id}-m1`,
      name: "Full Professional Fee",
      percentage: 100,
      amount: totalCost,
      triggerEvent: "Upon contract execution",
    });
  }

  let categoryLabel: any = b.category;
  if (b.category === "IMMIGRATION") categoryLabel = "Employment Immigration";
  else if (b.category === "BUSINESS") categoryLabel = "Corporate Advisory";
  else if (b.category === "CONSULTATION") categoryLabel = "Investor & Corporate";
  else if (b.category === "DMV_PSB") categoryLabel = "Permanent Residency";
  else if (b.category === "CUSTOM") categoryLabel = "Priority & Talent";

  return {
    id: b.id,
    code: b.code,
    title: b.name,
    subCategory: b.category,
    category: categoryLabel,
    description: b.description || "",
    destination: {
      code: "US",
      country: "United States",
      flag: "🇺🇸",
    },
    professionalFee: base,
    passThroughFees,
    totalClientCost: totalCost,
    currency: b.currency || "USD",
    schedulePreset: deposit > 0 ? "deposit_2_milestones" : "single",
    defaultMilestones: milestones,
    activeCasesCount: 0,
    status: b.isActive ? "Active" : "Archived",
    eligibilityChecklist: [
      "Initial Intake Documentation & Client Questionnaire",
      "Regulatory Credential Assessment",
      "Payment Agreement Execution",
    ],
    estimatedLeadTime: b.estimatedDuration || "6-9 Months",
    internalNotes: "",
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}
