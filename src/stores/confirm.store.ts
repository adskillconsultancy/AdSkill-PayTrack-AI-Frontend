import { create } from "zustand";

export type ConfirmVariant = "danger" | "warning" | "info" | "success";

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

export interface AlertOptions {
  title?: string;
  message: string;
  buttonText?: string;
  variant?: ConfirmVariant;
}

interface ConfirmModalState {
  isOpen: boolean;
  type: "confirm" | "alert";
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: ConfirmVariant;
  resolveCallback: ((value: boolean) => void) | null;
}

interface ConfirmStoreActions {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions | string) => Promise<void>;
  closeWithResult: (result: boolean) => void;
}

export type ConfirmStore = ConfirmModalState & ConfirmStoreActions;

export const useConfirmStore = create<ConfirmStore>((set, get) => ({
  isOpen: false,
  type: "confirm",
  title: "Confirm Action",
  message: "",
  confirmText: "Confirm",
  cancelText: "Cancel",
  variant: "danger",
  resolveCallback: null,

  confirm: (options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        type: "confirm",
        title: options.title || "Confirm Action",
        message: options.message,
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        variant: options.variant || "danger",
        resolveCallback: resolve,
      });
    });
  },

  alert: (options: AlertOptions | string) => {
    const opts: AlertOptions =
      typeof options === "string" ? { message: options } : options;

    return new Promise<void>((resolve) => {
      set({
        isOpen: true,
        type: "alert",
        title: opts.title || (opts.variant === "danger" ? "Error" : "Notification"),
        message: opts.message,
        confirmText: opts.buttonText || "Okay",
        cancelText: "",
        variant: opts.variant || "info",
        resolveCallback: () => resolve(),
      });
    });
  },

  closeWithResult: (result: boolean) => {
    const { resolveCallback } = get();
    if (resolveCallback) {
      resolveCallback(result);
    }
    set({
      isOpen: false,
      resolveCallback: null,
    });
  },
}));
