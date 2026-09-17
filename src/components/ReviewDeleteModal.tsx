"use client";

interface ReviewDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

const ReviewDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: ReviewDeleteModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-delete-title"
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
      >
        <h2
          id="review-delete-title"
          className="font-['Poppins'] text-lg font-semibold text-[#0F172A]"
        >
          Delete your review?
        </h2>
        <p className="mt-2 font-['Poppins'] text-sm leading-6 text-[#64748B]">
          This will permanently remove your rating and comment from this product.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg border border-[#DDE5E5] px-4 py-2 font-['Poppins'] text-sm font-medium text-[#475569] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-lg bg-[#EF4444] px-4 py-2 font-['Poppins'] text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete review"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewDeleteModal;
