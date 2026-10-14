"use client";

import { useConfirmStore } from "@/stores/confirm.store";

export function useConfirm() {
  const confirm = useConfirmStore((s) => s.confirm);
  const alert = useConfirmStore((s) => s.alert);

  return { confirm, alert };
}

export default useConfirm;
