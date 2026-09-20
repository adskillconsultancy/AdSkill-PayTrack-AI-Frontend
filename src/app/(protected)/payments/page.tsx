"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/common/Button";
import { PageHeader } from "@/components/shared/PageHeader";
import { useGetMyCasesQuery } from "@/services/api/clients/clientCasesApi";
import { useGetCasePaymentsQuery, useVerifyPaymentMutation } from "@/services/api/payments/paymentsApi";
import { usePermissions } from "@/hooks/usePermissions";

const money = (value: number | string, currency = "USD") => new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(value) || 0);
const date = (value: string) => new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));

export default function PaymentsPage() {
  const { data: casesResponse, isLoading, isError, refetch } = useGetMyCasesQuery();
  const { hasPermission } = usePermissions();
  const [selectedCaseId, setSelectedCaseId] = React.useState<string | null>(null);
  const cases = casesResponse?.data || [];
  const selected = selectedCaseId || cases[0]?.id;
  const { data: paymentsResponse, isFetching } = useGetCasePaymentsQuery(selected!, { skip: !selected });
  const [verifyPayment] = useVerifyPaymentMutation();
  const payments = paymentsResponse?.data || [];
  if (isLoading) return <div className="container py-10 text-sm text-muted-foreground">Loading payments...</div>;
  if (isError) return <div className="container py-10 text-center"><p className="text-sm text-red-600">Could not load payments.</p><Button className="mt-4 gap-2" variant="outline" onClick={() => refetch()}><RefreshCw className="h-4 w-4" />Retry</Button></div>;
  return <div className="container space-y-6 py-10"><PageHeader title="Payments" description="Track payment submissions and verification status." /><div className="grid gap-6 lg:grid-cols-[280px_1fr]"><div className="rounded-2xl border bg-card p-3"><h2 className="px-3 py-2 text-xs font-black uppercase text-muted-foreground">Cases</h2>{cases.map((item) => <button key={item.id} type="button" onClick={() => setSelectedCaseId(item.id)} className={`w-full rounded-xl p-3 text-left text-sm ${selected === item.id ? "bg-slate-100" : "hover:bg-slate-50"}`}><b>{item.caseCode}</b><span className="mt-1 block text-xs text-muted-foreground">{item.user?.name || "Client"}</span></button>)}{!cases.length && <p className="p-3 text-sm text-muted-foreground">No cases found.</p>}</div><div className="rounded-2xl border bg-card p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-black">Payment activity</h2><p className="text-xs text-muted-foreground">{cases.find((item) => item.id === selected)?.caseCode || "Select case"}</p></div>{isFetching && <span className="text-xs text-muted-foreground">Refreshing...</span>}</div><div className="divide-y">{payments.map((payment) => <div key={payment.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-semibold">{money(payment.amount, payment.currency)}</p><p className="text-xs text-muted-foreground">{payment.paymentMethod} · {date(payment.paymentDate)}</p></div><div className="flex items-center gap-3"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{payment.status}</span>{hasPermission("payment:verify") && payment.status === "PENDING" && <Button size="sm" onClick={() => verifyPayment(payment.id)}>Verify</Button>}{payment.status === "VERIFIED" && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}<Button asChild size="sm" variant="outline"><Link href={`/clients/${payment.caseId}`}><Eye className="h-4 w-4" /></Link></Button></div></div>)}{!payments.length && <p className="py-10 text-center text-sm text-muted-foreground">No payments recorded for selected case.</p>}</div></div></div></div>;
}
