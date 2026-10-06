"use client";

import * as React from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  CreditCard,
  Lock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  useCreateStripePaymentIntentMutation,
  useGetStripePaymentStatusQuery,
} from "@/services/api/payments/paymentsApi";
import { cn } from "@/lib/utils";

// ─── Stripe.js Singleton ──────────────────────────────────────────────────────
// loadStripe is called once outside the component to avoid re-loading on renders
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
);

// ─── Types ────────────────────────────────────────────────────────────────────

export type StripePaymentFormProps = {
  caseId: string;
  caseCode: string;
  installmentId?: string;
  installmentTitle?: string;
  onSuccess?: (paymentId: string) => void;
  onCancel?: () => void;
};

type PaymentStep =
  | "idle"
  | "creating_intent"
  | "entering_card"
  | "processing"
  | "succeeded"
  | "failed";

// ─── Stripe Appearance (matches AdSkill PayTrack dark design system) ──────────
const stripeAppearance: import("@stripe/stripe-js").Appearance = {
  theme: "night",
  variables: {
    colorPrimary: "#f59e0b",          // amber-500 — matches the existing CTA buttons
    colorBackground: "#0f172a",       // slate-900 — matches card backgrounds
    colorText: "#f8fafc",             // slate-50
    colorTextSecondary: "#94a3b8",    // slate-400
    colorDanger: "#ef4444",           // red-500
    fontFamily: "Inter, system-ui, sans-serif",
    spacingUnit: "4px",
    borderRadius: "10px",
    colorIcon: "#94a3b8",
    colorIconHover: "#f8fafc",
  },
  rules: {
    ".Input": {
      border: "1px solid #334155",
      boxShadow: "none",
      backgroundColor: "#1e293b",
      color: "#f8fafc",
    },
    ".Input:focus": {
      border: "1px solid #f59e0b",
      boxShadow: "0 0 0 2px rgba(245, 158, 11, 0.15)",
      outline: "none",
    },
    ".Label": {
      color: "#94a3b8",
      fontSize: "12px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    ".Error": {
      color: "#f87171",
      fontSize: "13px",
    },
    ".Tab": {
      border: "1px solid #334155",
      backgroundColor: "#1e293b",
      color: "#94a3b8",
    },
    ".Tab:hover": {
      backgroundColor: "#1e293b",
      color: "#f8fafc",
    },
    ".Tab--selected": {
      border: "1px solid #f59e0b",
      backgroundColor: "#1e293b",
      color: "#f59e0b",
      boxShadow: "0 0 0 1px #f59e0b",
    },
    ".TabIcon--selected": {
      fill: "#f59e0b",
    },
    ".TabLabel--selected": {
      color: "#f59e0b",
    },
    ".CheckboxInput": {
      border: "1px solid #334155",
      backgroundColor: "#1e293b",
    },
    ".CheckboxInput--checked": {
      backgroundColor: "#f59e0b",
      border: "1px solid #f59e0b",
    },
  },
};

// ─── Inner Form (must be inside <Elements> provider) ─────────────────────────

function StripePaymentInnerForm({
  paymentId,
  amount,
  currency,
  caseCode,
  installmentTitle,
  onSuccess,
  onCancel,
}: {
  paymentId: string;
  amount: number;
  currency: string;
  caseCode: string;
  installmentTitle?: string;
  onSuccess?: (paymentId: string) => void;
  onCancel?: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [step, setStep] = React.useState<"entering_card" | "processing" | "succeeded" | "failed">("entering_card");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isReady, setIsReady] = React.useState(false);

  // Poll payment status after confirmation for webhook-driven verification
  const { data: statusResponse, refetch: refetchStatus } = useGetStripePaymentStatusQuery(
    paymentId,
    { skip: step !== "processing" && step !== "succeeded", pollingInterval: 3000 },
  );

  // When webhook processes and status becomes VERIFIED, fire success callback
  React.useEffect(() => {
    const status = statusResponse?.data?.status;
    if (status === "VERIFIED" && step !== "succeeded") {
      setStep("succeeded");
      onSuccess?.(paymentId);
    }
    if (status === "FAILED" && step !== "failed") {
      setStep("failed");
      setErrorMessage(statusResponse?.data?.failureMessage || "Payment failed. Please try a different card.");
    }
  }, [statusResponse?.data?.status, step, paymentId, onSuccess, statusResponse?.data?.failureMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setStep("processing");
    setErrorMessage(null);

    // Trigger Payment Element validation
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setStep("entering_card");
      setErrorMessage(submitError.message || "Please check your card details.");
      return;
    }

    // Confirm the PaymentIntent — Stripe handles 3DS automatically
    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return URL for redirect-based payment methods (bank redirects, etc.)
        // For card payments, Stripe doesn't redirect but this is required by the API
        return_url: `${window.location.origin}/payments?stripe_return=1&paymentId=${paymentId}`,
      },
      // Prevent redirect for card payments — we handle result in-page
      redirect: "if_required",
    });

    if (confirmError) {
      setStep("failed");
      setErrorMessage(confirmError.message || "Payment confirmation failed.");
      return;
    }

    // Payment submitted — waiting for webhook to confirm (status will poll to VERIFIED)
    setStep("processing");
  };

  const formatMoney = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

  // ── Success State ───────────────────────────────────────────────────────────
  if (step === "succeeded") {
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center ring-4 ring-emerald-500/20">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <div>
          <p className="text-xl font-bold text-slate-100">Payment Successful</p>
          <p className="text-sm text-slate-400 mt-1">
            {formatMoney(amount, currency)} has been charged to your card.
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Your payment is being verified. A receipt will be available shortly.
          </p>
        </div>
      </div>
    );
  }

  // ── Failed State ────────────────────────────────────────────────────────────
  if (step === "failed" && !isReady) {
    // If failed, reset to show the form again with error
    setIsReady(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount Summary */}
      <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {installmentTitle ? "Installment Payment" : "Balance Due"}
            </p>
            {installmentTitle && (
              <p className="text-xs text-amber-400 mt-0.5">{installmentTitle}</p>
            )}
            <p className="text-xs text-slate-500 mt-0.5">Case {caseCode}</p>
          </div>
          <p className="text-2xl font-black text-amber-400">
            {formatMoney(amount, currency)}
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/30 p-4">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-300">Payment Failed</p>
            <p className="text-xs text-red-400 mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setErrorMessage(null);
              setStep("entering_card");
            }}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stripe Payment Element */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <CreditCard className="w-3.5 h-3.5" />
          Card Details
        </label>
        <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 transition-colors focus-within:border-amber-500/50">
          <PaymentElement
            onReady={() => setIsReady(true)}
            options={{
              layout: "tabs",
              defaultValues: {},
            }}
          />
        </div>
      </div>

      {/* Security Badges */}
      <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5" />
          <span>256-bit SSL</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>PCI DSS Compliant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5" />
          <span>Powered by Stripe</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={step === "processing"}
            className="flex-1 h-12 rounded-xl border border-slate-700 text-slate-400 text-sm font-semibold hover:bg-slate-800 hover:text-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!stripe || !elements || !isReady || step === "processing"}
          className={cn(
            "flex-[2] h-12 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2",
            "bg-amber-500 text-slate-950 hover:bg-amber-400",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-amber-500",
            "shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30",
          )}
        >
          {step === "processing" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Pay {formatMoney(amount, currency)} Securely</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// ─── Main Component (handles PI creation and <Elements> mounting) ─────────────

/**
 * StripePaymentForm — Full Stripe Payment Element integration
 *
 * Flow:
 *   1. User clicks "Pay Online" → this component mounts
 *   2. createStripePaymentIntent API call → backend creates PI + DB record
 *   3. clientSecret returned → used to initialize <Elements> provider
 *   4. Stripe mounts PaymentElement (card input iframe — never touches our server)
 *   5. User fills card → clicks Pay → stripe.confirmPayment()
 *   6. Stripe processes charge → fires webhook → backend auto-verifies payment
 *   7. Status polling detects VERIFIED → onSuccess() callback fires
 *
 * Security:
 *   - Card data never touches our server (PCI SAQ A compliance)
 *   - Amount is server-computed — client cannot alter the charge amount
 *   - clientSecret is ephemeral — never stored in DB or localStorage
 */
export function StripePaymentForm({
  caseId,
  caseCode,
  installmentId,
  installmentTitle,
  onSuccess,
  onCancel,
}: StripePaymentFormProps) {
  const [createIntent, { isLoading: isCreating, error: intentError }] =
    useCreateStripePaymentIntentMutation();

  const [intentData, setIntentData] = React.useState<{
    clientSecret: string;
    paymentId: string;
    amount: number;
    currency: string;
  } | null>(null);

  // Create the PaymentIntent when the component mounts
  React.useEffect(() => {
    let cancelled = false;

    const initIntent = async () => {
      try {
        const result = await createIntent({
          caseId,
          installmentId,
        }).unwrap();

        if (!cancelled && result.data) {
          setIntentData({
            clientSecret: result.data.clientSecret,
            paymentId: result.data.paymentId,
            amount: result.data.amount,
            currency: result.data.currency,
          });
        }
      } catch (err) {
        // Error is available via intentError from RTK Query
        console.error("[STRIPE] Failed to create PaymentIntent:", err);
      }
    };

    initIntent();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId, installmentId]);

  const errorMsg =
    intentError && "data" in intentError
      ? (intentError.data as any)?.message
      : null;

  // ── Loading State ───────────────────────────────────────────────────────────
  if (isCreating || (!intentData && !intentError)) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <div className="w-12 h-12 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
        <p className="text-sm text-slate-400">Initializing secure payment...</p>
      </div>
    );
  }

  // ── Error State ─────────────────────────────────────────────────────────────
  if (intentError || !intentData) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <div>
          <p className="text-base font-bold text-slate-200">Payment Initialization Failed</p>
          <p className="text-sm text-slate-400 mt-1">
            {errorMsg || "Unable to initialize payment. Please try again."}
          </p>
        </div>
        <div className="flex gap-3 mt-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition-all"
            >
              Go Back
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-sm font-bold hover:bg-amber-400 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Payment Element (mounted with clientSecret) ─────────────────────────────
  const options: import("@stripe/stripe-js").StripeElementsOptions = {
    clientSecret: intentData.clientSecret,
    appearance: stripeAppearance,
    loader: "auto",
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <StripePaymentInnerForm
        paymentId={intentData.paymentId}
        amount={intentData.amount}
        currency={intentData.currency}
        caseCode={caseCode}
        installmentTitle={installmentTitle}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
}
