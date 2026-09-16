"use client";

import { AlertTriangle, X } from "lucide-react";

interface DeletePaymentModalProps {
  isOpen: boolean;
  cardLabel: string;
  last4: string;
  deleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeletePaymentModal = ({
  isOpen,
  cardLabel,
  last4,
  deleting = false,
  onClose,
  onConfirm,
}: DeletePaymentModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-payment-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-red-50 p-2 text-red-500">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2
                id="delete-payment-title"
                className="font-['Poppins'] text-[18px] font-semibold text-[#0F172A]"
              >
                Delete payment method?
              </h2>
              <p className="mt-2 font-['Poppins'] text-[13px] leading-5 text-[#64748B]">
                This will remove {cardLabel} ending in {last4} from your account.
                This action cannot be undone.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-full cursor-pointer p-1.5 text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#0F172A] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close delete payment method dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-lg cursor-pointer border border-[#DDE5E5] px-4 py-2.5 font-['Poppins'] text-[14px] font-medium text-[#475569] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="rounded-lg cursor-pointer bg-[#DC2626] px-4 py-2.5 font-['Poppins'] text-[14px] font-medium text-white transition hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete payment method"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePaymentModal;
