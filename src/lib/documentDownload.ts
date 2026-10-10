import { useAuthStore } from "@/stores/auth.store";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export async function downloadAndPrintCaseInvoice(
  caseId: string,
  fileNameLabel?: string,
  token?: string | null,
): Promise<void> {
  const authToken = token ?? useAuthStore.getState().accessToken;
  const endpointUrl = `${API_URL}/invoices/cases/${caseId}/pdf${authToken ? `?token=${encodeURIComponent(authToken)}` : ""}`;

  try {
    const res = await fetch(endpointUrl, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(
        errorData?.message ||
          "Could not generate or download invoice. Please ensure an active payment plan exists for this case.",
      );
    }

    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    // 1. Trigger direct file download
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `Invoice-${fileNameLabel || caseId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // 2. Open PDF for instant viewing and printing
    try {
      const printWindow = window.open(blobUrl, "_blank");
      if (printWindow) {
        printWindow.focus();
      }
    } catch {
      // If pop-up is blocked, the downloaded file is already saved
    }

    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : String(err);
    // If browser fetch was intercepted or blocked (e.g. by Internet Download Manager / IDM),
    // fallback to direct link opening with authentication query token so IDM or browser downloads it
    if (
      errMessage.includes("Failed to fetch") ||
      errMessage.includes("ERR_FAILED") ||
      errMessage.includes("NetworkError") ||
      errMessage.includes("Intercepted") ||
      errMessage.includes("Load failed")
    ) {
      window.open(endpointUrl, "_blank");
      return;
    }
    throw err;
  }
}

export async function downloadAndPrintPaymentReceipt(
  paymentId: string,
  fileNameLabel?: string,
  token?: string | null,
): Promise<void> {
  const authToken = token ?? useAuthStore.getState().accessToken;
  const endpointUrl = `${API_URL}/receipts/payments/${paymentId}/pdf${authToken ? `?token=${encodeURIComponent(authToken)}` : ""}`;

  try {
    const res = await fetch(endpointUrl, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(
        errorData?.message ||
          "Could not generate or download payment receipt. Please verify that this payment has been confirmed.",
      );
    }

    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    // 1. Trigger direct file download
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `Receipt-${fileNameLabel || paymentId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // 2. Open PDF for instant viewing and printing
    try {
      const printWindow = window.open(blobUrl, "_blank");
      if (printWindow) {
        printWindow.focus();
      }
    } catch {
      // If pop-up is blocked, the downloaded file is already saved
    }

    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : String(err);
    // If browser fetch was intercepted or blocked (e.g. by Internet Download Manager / IDM),
    // fallback to direct link opening with authentication query token so IDM or browser downloads it
    if (
      errMessage.includes("Failed to fetch") ||
      errMessage.includes("ERR_FAILED") ||
      errMessage.includes("NetworkError") ||
      errMessage.includes("Intercepted") ||
      errMessage.includes("Load failed")
    ) {
      window.open(endpointUrl, "_blank");
      return;
    }
    throw err;
  }
}
