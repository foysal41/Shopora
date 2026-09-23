"use client";

interface CouponDeleteModalAdminProps {
  isOpen: boolean;
  couponCode?: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

const CouponDeleteModalAdmin = ({
  isOpen,
  couponCode,
  onClose,
  onConfirm,
  isDeleting = false,
}: CouponDeleteModalAdminProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-delete-coupon-title"
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
      >
        <h2
          id="admin-delete-coupon-title"
          className="font-['Poppins'] text-lg font-semibold text-[#0F172A]"
        >
          Delete coupon?
        </h2>
        <p className="mt-2 font-['Poppins'] text-sm leading-6 text-[#64748B]">
          {couponCode
            ? `This will permanently remove the ${couponCode} coupon.`
            : "This will permanently remove this coupon."}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="cursor-pointer rounded-lg border border-[#DDE5E5] px-4 py-2 font-['Poppins'] text-sm font-medium text-[#475569] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="cursor-pointer rounded-lg bg-[#EF4444] px-4 py-2 font-['Poppins'] text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete coupon"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CouponDeleteModalAdmin;