"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Copy,
  Check,
  Share2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

import { toast } from "react-toastify";
import { apiPost } from "@/lib/core/server";


interface AIProductShareResponse {
  success: boolean;
  message: string;
  data: {
    hook: string;
    caption: string;
    hashtags: string[];
  };
}

interface AIProductShareModalProps {
  isOpen: boolean;
  productId: string | null;
  productName?: string;
  onClose: () => void;
}

interface ShareContent {
  hook: string;
  caption: string;
  hashtags: string[];
}

const AIProductShareModal = ({
  isOpen,
  productId,
  productName,
  onClose,
}: AIProductShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  /*
   * =========================================================
   * AI SHARE CONTENT
   * =========================================================
   *
   * Later these values will come from the AI API.
   */

  const [content, setContent] = useState<ShareContent>({
    hook: "",
    caption: "",
    hashtags: [],
  });

  /*
   * =========================================================
   * PRODUCT LINK
   * =========================================================
   *
   * Product link does NOT belong to AI content.
   * It is directly generated from the selected product ID.
   */

  const productLink = productId
    ? `https://shopora-ashen.vercel.app/products/${productId}`
    : "";

  if (!isOpen) {
    return null;
  }

  /*
   * =========================================================
   * FULL SHARE TEXT
   * =========================================================
   */

  const fullShareText = `${content.hook}

${content.caption}

${content.hashtags.join(" ")}

${productLink}`;

  /*
   * =========================================================
   * COPY
   * =========================================================
   */

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullShareText);

      setCopied(true);

      toast.success("AI share content copied!");

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("COPY ERROR:", error);

      toast.error("Failed to copy content");
    }
  };

  /*
   * =========================================================
   * SHARE
   * =========================================================
   */

  const handleShare = async () => {
    try {
      if (!productLink) {
        toast.error("Product link is missing");
        return;
      }

      if (
        typeof navigator !== "undefined" &&
        navigator.share
      ) {
        await navigator.share({
          title:
            content.hook ||
            productName ||
            "Shopora Product",

          text: `${content.hook}

${content.caption}

${content.hashtags.join(" ")}`,

          url: productLink,
        });

        return;
      }

      await handleCopy();

      toast.info(
        "Sharing is not supported here. Content copied instead."
      );
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      console.error("SHARE ERROR:", error);

      toast.error("Unable to share product");
    }
  };

  /*
   * =========================================================
   * REGENERATE
   * =========================================================
   *
   * TEMPORARY TEST
   *
   * Later:
   *
   * POST /api/v1/products/:productId/ai-share
   *
   * Then:
   *
   * setContent({
   *   hook: result.data.hook,
   *   caption: result.data.caption,
   *   hashtags: result.data.hashtags,
   * });
   */

 const handleRegenerate = async () => {
  if (!productId) {
    toast.error("Product ID is missing");
    return;
  }

  try {
    setIsRegenerating(true);

    const result = await apiPost<AIProductShareResponse>(
      `/api/v1/products/${productId}/ai-share`,
      {}
    );

    setContent({
      hook: result.data.hook,
      caption: result.data.caption,
      hashtags: result.data.hashtags,
    });

    setCopied(false);

    toast.success("AI content generated successfully!");
  } catch (error) {
    console.error("AI REGENERATE ERROR:", error);

    toast.error(
      error instanceof Error
        ? error.message
        : "Failed to generate AI content"
    );
  } finally {
    setIsRegenerating(false);
  }
};

  /*
   * =========================================================
   * MODAL
   * =========================================================
   */

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E8EEEE] bg-white px-5 py-4 sm:px-6">

          <div className="flex items-center gap-3">

            {/* AI Icon */}

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F5F3] text-[#0F766E]">
              <Sparkles size={20} fill="currentColor" />
            </div>

            {/* Title */}

            <div>
              <h2 className="font-['Poppins'] text-lg font-bold text-[#1E293B]">
                AI Product Share
              </h2>

              {productName && (
                <p className="mt-0.5 max-w-75 truncate font-['Poppins'] text-xs text-[#64748B]">
                  {productName}
                </p>
              )}
            </div>

          </div>

          {/* Close */}

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#F1F5F5] hover:text-[#1E293B]"
            aria-label="Close"
          >
            <X size={20} />
          </button>

        </div>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <div className="space-y-5 p-5 sm:p-6">

          {/* ===================================================
              PRODUCT LINK
          ==================================================== */}

          <div>

            <label className="mb-2 block font-['Poppins'] text-sm font-semibold text-[#334155]">
              Product Link
            </label>

            <div className="flex items-center gap-2 rounded-xl border border-[#DDE5E5] bg-[#F8FBFB] p-3">

              <div className="min-w-0 flex-1">

                <p className="truncate font-['Poppins'] text-sm text-[#475569]">
                  {productLink || "Product link unavailable"}
                </p>

              </div>

              {productLink && (
                <a
                  href={productLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-white hover:text-[#0F766E]"
                  title="Open product"
                >
                  <ExternalLink size={16} />
                </a>
              )}

            </div>

          </div>

          {/* ===================================================
              SHARE PREVIEW
          ==================================================== */}

          <div className="rounded-xl border border-[#DDE5E5] bg-white p-4">

            <p className="mb-3 font-['Poppins'] text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
              Share Preview
            </p>

            <div className="space-y-3">

              {/* Hook */}

              {content.hook && (
                <p className="font-['Poppins'] text-sm font-bold text-[#1E293B]">
                  {content.hook}
                </p>
              )}

              {/* Caption */}

              {content.caption && (
                <p className="whitespace-pre-wrap font-['Poppins'] text-sm leading-6 text-[#475569]">
                  {content.caption}
                </p>
              )}

              {/* Hashtags */}

              {content.hashtags.length > 0 && (
                <p className="font-['Poppins'] text-sm leading-6 text-[#0F766E]">
                  {content.hashtags.join(" ")}
                </p>
              )}

              {/* Product Link */}

              {productLink && (
                <a
                  href={productLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all font-['Poppins'] text-sm text-[#0F766E] underline"
                >
                  {productLink}
                </a>
              )}

              {/* Empty State */}

              {!content.hook &&
                !content.caption &&
                content.hashtags.length === 0 && (
                  <p className="font-['Poppins'] text-sm text-[#94A3B8]">
                    Click Regenerate to generate AI share
                    content.
                  </p>
                )}

            </div>

          </div>

        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-[#E8EEEE] bg-white p-4 sm:flex-row sm:justify-end sm:p-5">

          {/* ===================================================
              REGENERATE
          ==================================================== */}

          <button
            type="button"
            onClick={handleRegenerate}
            disabled={isRegenerating || !productId}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#DDE5E5] px-4 font-['Poppins'] text-sm font-medium text-[#475569] transition hover:border-[#0F766E] hover:bg-[#F6FAF9] hover:text-[#0F766E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={
                isRegenerating
                  ? "animate-spin"
                  : ""
              }
            />

            {isRegenerating
              ? "Generating..."
              : "Regenerate"}
          </button>

          {/* ===================================================
              COPY
          ==================================================== */}

          <button
            type="button"
            onClick={handleCopy}
            disabled={
              !content.hook &&
              !content.caption &&
              content.hashtags.length === 0
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#DDE5E5] px-4 font-['Poppins'] text-sm font-medium text-[#475569] transition hover:border-[#0F766E] hover:bg-[#F6FAF9] hover:text-[#0F766E] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? (
              <Check size={16} />
            ) : (
              <Copy size={16} />
            )}

            {copied ? "Copied" : "Copy"}
          </button>

          {/* ===================================================
              SHARE
          ==================================================== */}

          <button
            type="button"
            onClick={handleShare}
            disabled={
              !productLink ||
              (!content.hook &&
                !content.caption &&
                content.hashtags.length === 0)
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-5 font-['Poppins'] text-sm font-semibold text-white shadow-sm transition hover:bg-[#0B625B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Share2 size={16} />
            Share
          </button>

        </div>

      </div>
    </div>
  );
};

export default AIProductShareModal;