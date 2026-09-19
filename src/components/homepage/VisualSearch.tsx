"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import {
  ImagePlus,
  LoaderCircle,
  Search,
  Sparkles,
  X,
} from "lucide-react";

interface VisualSearchProduct {
  id: string;
  name: string;
  regularPrice: number | string;
  salePrice?: number | string | null;
  images?: string[];
  similarity?: number;
}

interface VisualSearchResponse {
  success: boolean;
  message?: string;
  data?: VisualSearchProduct[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const VisualSearch = () => {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [results, setResults] = useState<VisualSearchProduct[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const openVisualSearch = () => {
      setIsOpen(true);
      window.setTimeout(() => {
        document.getElementById("visual-search-section")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 0);
    };

    window.addEventListener("open-visual-search", openVisualSearch);
    return () =>
      window.removeEventListener("open-visual-search", openVisualSearch);
  }, []);

  const selectImage = (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError("Images must be smaller than 8 MB.");
      return;
    }

    setError("");
    setResults([]);
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    selectImage(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    selectImage(event.dataTransfer.files[0]);
  };

  const clearImage = () => {
    setImage(null);
    setPreviewUrl("");
    setResults([]);
    setError("");
  };

  const searchByImage = async () => {
    if (!image) return;

    if (!API_URL) {
      setError(
        "Visual search is not connected. Configure NEXT_PUBLIC_API_URL first.",
      );
      return;
    }

    try {
      setError("");
      setIsSearching(true);
      const formData = new FormData();
      formData.append("image", image);

      const response = await fetch(`${API_URL}/api/v1/products/visual-search`, {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as VisualSearchResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Could not find similar products.");
      }

      const matchedProducts = (payload.data || []).filter(
        (product) =>
          typeof product.similarity === "number" &&
          Number.isFinite(product.similarity),
      );

      if (
        payload.data?.length &&
        matchedProducts.length !== payload.data.length
      ) {
        setResults([]);
        setError(
          "Visual matching is not enabled on the backend yet. No placeholder products were shown.",
        );
        return;
      }

      setResults(matchedProducts);
      if (!matchedProducts.length) {
        setError("No similar products found. Try a clearer product image.");
      }
    } catch (searchError) {
      setError(
        searchError instanceof Error
          ? searchError.message
          : "Could not find similar products.",
      );
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section
      id="visual-search-section"
      className={
        isOpen
          ? "bg-[#F6FAF9] px-4 py-16 sm:px-6 lg:px-8"
          : "hidden"
      }
    >
      {isOpen && (
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-[#DCEDEA] bg-white shadow-[0_14px_45px_rgba(15,118,110,0.08)]">
          <div className="grid items-center gap-8 px-6 py-8 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-16 lg:py-12">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF0F0] px-3 py-1.5 font-['Poppins'] text-xs font-semibold text-[#FF6B6B]">
                <Sparkles size={14} />
                Shop by sight 
              </span>
              <h2 className="mt-4 max-w-md font-['Poppins'] text-2xl font-semibold leading-tight text-[#1E293B] sm:text-3xl">
                See something you love? Find it here.
              </h2>
              <p className="mt-3 max-w-md font-['Poppins'] text-sm leading-6 text-[#64748B]">
                Upload a product photo and discover visually similar products from
                the Shopora catalog.
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-xs text-[#64748B]">
                <span className="flex items-center gap-2">
                  <ImagePlus size={15} className="text-[#0F766E]" />
                  JPG, PNG or WEBP
                </span>
                <span className="flex items-center gap-2">
                  <Sparkles size={15} className="text-[#FF6B6B]" />
                  Up to 8 MB
                </span>
              </div>
            </div>

            <div>
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative min-h-64 overflow-hidden rounded-2xl border-2 border-dashed transition-colors ${
                  isDragging
                    ? "border-[#0F766E] bg-[#E8F5F3]"
                    : "border-[#BBDDD8] bg-[#F8FCFB]"
                }`}
              >
                {previewUrl ? (
                  <>
                    <Image
                      src={previewUrl}
                      alt="Selected product"
                      fill
                      unoptimized
                      className="object-contain p-4"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      aria-label="Remove selected image"
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1E293B] shadow-md transition hover:text-[#FF6B6B]"
                    >
                      <X size={17} />
                    </button>
                  </>
                ) : (
                  <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F5F3] text-[#0F766E]">
                      <ImagePlus size={25} />
                    </div>
                    <p className="mt-4 font-['Poppins'] text-sm font-semibold text-[#1E293B]">
                      Drop an image here
                    </p>
                    <p className="mt-1 font-['Poppins'] text-xs text-[#94A3B8]">
                      or choose a photo from your device
                    </p>
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="mt-5 flex items-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2.5 font-['Poppins'] text-xs font-semibold text-white transition hover:bg-[#0B625B]"
                    >
                      <ImagePlus size={15} />
                      Choose image
                    </button>
                  </div>
                )}
              </div>

              <input
                ref={galleryInputRef}
                aria-label="Choose product image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="visual-search-file"
              />

              {previewUrl && (
                <button
                  type="button"
                  onClick={searchByImage}
                  disabled={isSearching}
                  className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#FF6B6B] px-5 py-3 font-['Poppins'] text-sm font-semibold text-white transition hover:bg-[#F05454] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSearching ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <Search size={17} />
                  )}
                  {isSearching
                    ? "Finding similar products..."
                    : "Find similar products"}
                </button>
              )}

              {error && (
                <p role="alert" className="mt-3 font-['Poppins'] text-xs text-[#D64545]">
                  {error}
                </p>
              )}

              {results.length > 0 && (
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {results.slice(0, 3).map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="group overflow-hidden rounded-xl border border-[#E8EEEE] bg-white"
                    >
                      <div className="relative aspect-square bg-[#F6FAF9]">
                        {product.images?.[0] && (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            unoptimized
                            className="object-contain p-2 transition group-hover:scale-105"
                          />
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="truncate font-['Poppins'] text-xs font-medium text-[#1E293B]">
                          {product.name}
                        </p>
                        <p className="mt-1 font-['Poppins'] text-xs font-semibold text-[#0F766E]">
                          ${Number(product.salePrice ?? product.regularPrice).toFixed(2)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default VisualSearch;