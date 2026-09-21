"use client";

import { useState } from "react";

import {
  Search,
  Loader2,
  Megaphone,
  ExternalLink,
  CalendarDays,
  Copy,
  Check,
} from "lucide-react";

import {
  scrapeFacebookAds,
  type FacebookAd,
} from "@/lib/api/facebookAds";
import Image from "next/image";

import {
  FaFacebookF,
  FaInstagram,
} from "react-icons/fa";

interface SearchData {
  url: string;
  activeStatus: "active" | "inactive";
  resultsLimit: number;
  includeAboutPage: boolean;
  isDetailsPerAd: boolean;
}

export default function FacebookAdsPage() {
  const [url, setUrl] = useState("");

  const [activeStatus, setActiveStatus] =
    useState<"active" | "inactive">("active");

  const [resultsLimit, setResultsLimit] =
    useState(20);

  const [includeAboutPage, setIncludeAboutPage] =
    useState(true);

  const [isDetailsPerAd, setIsDetailsPerAd] =
    useState(true);

  const [isLoading, setIsLoading] =
    useState(false);

  const [ads, setAds] = useState<FacebookAd[]>(
    []
  );

  const [error, setError] = useState("");

  const [copiedAdId, setCopiedAdId] =
    useState<string | null>(null);

  const handleSearch = async () => {
    if (!url.trim()) {
      setError(
        "Please enter a Facebook Page or Ads Library URL."
      );

      return;
    }

    const searchData: SearchData = {
      url: url.trim(),
      activeStatus,
      resultsLimit,
      includeAboutPage,
      isDetailsPerAd,
    };

    console.log(
      "FACEBOOK ADS SEARCH:",
      searchData
    );

    try {
      setIsLoading(true);
      setError("");
      setAds([]);

      const result =
        await scrapeFacebookAds(searchData);

      console.log(
        "FACEBOOK ADS RESPONSE:",
        result
      );

      setAds(result.data || []);
    } catch (error) {
      console.error(
        "FACEBOOK ADS SEARCH ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch Facebook ads."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getAdText = (ad: FacebookAd) => {
    return (
      ad.snapshot?.body?.text ||
      ad.snapshot?.caption ||
      ad.snapshot?.title ||
      ""
    );
  };

  const getAdTitle = (ad: FacebookAd) => {
    return (
      ad.snapshot?.title ||
      ad.snapshot?.caption ||
      "Facebook Advertisement"
    );
  };

  const getAdImage = (ad: FacebookAd) => {
    const image =
      ad.snapshot?.images?.[0];

    return (
      image?.resizedImageUrl ||
      image?.originalImageUrl ||
      null
    );
  };

  const getAdVideo = (ad: FacebookAd) => {
    return (
      ad.snapshot?.videos?.[0]
        ?.videoPreviewImageUrl || null
    );
  };

  const getAdLink = (ad: FacebookAd) => {
    return (
      ad.snapshot?.linkUrl ||
      ad.facebookUrl ||
      ad.inputUrl ||
      null
    );
  };

  const formatDate = (
    date?: string | null
  ) => {
    if (!date) {
      return "Unknown date";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  const handleCopy = async (
    ad: FacebookAd
  ) => {
    const text = getAdText(ad);

    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        text
      );

      const id =
        ad.adArchiveId ||
        ad.adArchiveID ||
        ad.adId ||
        "";

      setCopiedAdId(id);

      setTimeout(() => {
        setCopiedAdId(null);
      }, 2000);
    } catch (error) {
      console.error(
        "COPY AD TEXT ERROR:",
        error
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-7">
          <div className="flex items-center gap-2 font-['Poppins'] text-base text-[#64748B]">
            <span>Marketing</span>

            <span>/</span>

            <span className="text-[#0F766E]">
              Facebook Ads
            </span>
          </div>

          <div className="mt-3">
            <h1 className="font-['Poppins'] text-3xl font-semibold text-[#0F172A] sm:text-4xl">
              Facebook Ads Research
            </h1>

            <p className="mt-2 max-w-2xl font-['Poppins'] text-base leading-7 text-[#64748B]">
              Research competitor advertisements
              from Facebook and Instagram.
            </p>
          </div>
        </div>

        {/* Search Form */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6">

          {/* Form Header */}
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#E8F5F3] text-[#0F766E]">
              <Megaphone
                size={21}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <h2 className="font-['Poppins'] text-xl font-semibold text-[#0F172A]">
                Search Facebook Ads
              </h2>

              <p className="mt-1 font-['Poppins'] text-base text-[#64748B]">
                Enter a Facebook Page or Ads
                Library URL.
              </p>
            </div>
          </div>

          {/* URL */}
          <div>
            <label
              htmlFor="facebook-ads-url"
              className="mb-2 block font-['Poppins'] text-base font-medium text-[#334155]"
            >
              Facebook Page / Ads Library URL
            </label>

            <input
              id="facebook-ads-url"
              type="url"
              value={url}
              onChange={(e) =>
                setUrl(e.target.value)
              }
              placeholder="https://www.facebook.com/brandname"
              className="h-13 w-full rounded-xl border border-[#D9E1E7] bg-white px-4 font-['Poppins'] text-base text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
            />

            <p className="mt-2 font-['Poppins'] text-sm text-[#94A3B8]">
              You can enter a Facebook Page URL
              or a Facebook Ads Library URL.
            </p>
          </div>

          {/* Status + Results */}
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">

            {/* Status */}
            <div>
              <label
                htmlFor="ad-status"
                className="mb-2 block font-['Poppins'] text-base font-medium text-[#334155]"
              >
                Ad Status
              </label>

              <select
                id="ad-status"
                value={activeStatus}
                onChange={(e) =>
                  setActiveStatus(
                    e.target.value as
                      | "active"
                      | "inactive"
                  )
                }
                className="h-13 w-full rounded-xl border border-[#D9E1E7] bg-white px-4 font-['Poppins'] text-base text-[#0F172A] outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
              >
                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>
            </div>

            {/* Results */}
            <div>
              <label
                htmlFor="results-limit"
                className="mb-2 block font-['Poppins'] text-base font-medium text-[#334155]"
              >
                Results
              </label>

              <select
                id="results-limit"
                value={resultsLimit}
                onChange={(e) =>
                  setResultsLimit(
                    Number(e.target.value)
                  )
                }
                className="h-13 w-full rounded-xl border border-[#D9E1E7] bg-white px-4 font-['Poppins'] text-base text-[#0F172A] outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
              >
                <option value={5}>
                  5 Ads
                </option>

                <option value={10}>
                  10 Ads
                </option>

                <option value={20}>
                  20 Ads
                </option>

                <option value={30}>
                  30 Ads
                </option>

                <option value={50}>
                  50 Ads
                </option>
              </select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="mt-6 space-y-4">

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={isDetailsPerAd}
                onChange={(e) =>
                  setIsDetailsPerAd(
                    e.target.checked
                  )
                }
                className="h-4 w-4 cursor-pointer accent-[#0F766E]"
              />

              <span className="font-['Poppins'] text-base text-[#475569]">
                Include detailed ad information
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={includeAboutPage}
                onChange={(e) =>
                  setIncludeAboutPage(
                    e.target.checked
                  )
                }
                className="h-4 w-4 cursor-pointer accent-[#0F766E]"
              />

              <span className="font-['Poppins'] text-base text-[#475569]">
                Include advertiser information
              </span>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3">
              <p className="font-['Poppins'] text-sm text-[#DC2626]">
                {error}
              </p>
            </div>
          )}

          {/* Button */}
          <div className="mt-7 flex justify-end">
            <button
              type="button"
              onClick={handleSearch}
              disabled={
                isLoading || !url.trim()
              }
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-6 font-['Poppins'] text-base font-medium text-white transition-all duration-200 hover:bg-[#0B625C] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Finding Ads...
                </>
              ) : (
                <>
                  <Search size={18} />

                  Find Ads
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="mt-6 flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white">
            <Loader2
              size={32}
              className="animate-spin text-[#0F766E]"
            />

            <h3 className="mt-4 font-['Poppins'] text-lg font-semibold text-[#334155]">
              Finding Facebook Ads...
            </h3>

            <p className="mt-2 font-['Poppins'] text-sm text-[#94A3B8]">
              This may take a little while.
            </p>
          </div>
        )}

        {/* Results */}
        {!isLoading && ads.length > 0 && (
          <div className="mt-6">

            {/* Result Header */}
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-['Poppins'] text-xl font-semibold text-[#0F172A]">
                  Ads Found
                </h2>

                <p className="mt-1 font-['Poppins'] text-sm text-[#64748B]">
                  {ads.length} advertisement
                  {ads.length !== 1 ? "s" : ""} found.
                </p>
              </div>

              <span className="inline-flex w-fit rounded-full bg-[#E8F5F3] px-3 py-1.5 font-['Poppins'] text-sm font-medium text-[#0F766E]">
                {activeStatus === "active"
                  ? "Active Ads"
                  : "Inactive Ads"}
              </span>
            </div>

            {/* Ads Grid */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

              {ads.map((ad, index) => {
                const adId =
                  ad.adArchiveId ||
                  ad.adArchiveID ||
                  ad.adId ||
                  `ad-${index}`;

                const image =
                  getAdImage(ad) ||
                  getAdVideo(ad);

                const text =
                  getAdText(ad);

                const title =
                  getAdTitle(ad);

                const adLink =
                  getAdLink(ad);

                const copied =
                  copiedAdId === adId;

                return (
                  <div
                    key={adId}
                    className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
                  >

                    {/* Creative */}
                    {image ? (
                      <div className="aspect-[16/10] w-full overflow-hidden bg-[#F1F5F9]">
                        <Image
                          src={image}
                          alt={title}
                          className="h-full w-full object-cover"
                          height={512}
                          width={512}
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[16/10] w-full items-center justify-center bg-[#F1F5F9]">
                        <Megaphone
                          size={38}
                          className="text-[#94A3B8]"
                          strokeWidth={1.5}
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-5">

                      {/* Advertiser */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-['Poppins'] text-base font-semibold text-[#0F172A]">
                            {ad.pageName ||
                              "Unknown Advertiser"}
                          </p>

                          <div className="mt-1 flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-['Poppins'] text-xs font-medium ${
                                ad.isActive
                                  ? "bg-[#DCFCE7] text-[#15803D]"
                                  : "bg-[#F1F5F9] text-[#64748B]"
                              }`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />

                              {ad.isActive
                                ? "ACTIVE"
                                : "INACTIVE"}
                            </span>
                          </div>
                        </div>

                        <span className="shrink-0 rounded-lg bg-[#F8FAFC] px-2 py-1 font-['Poppins'] text-xs text-[#64748B]">
                          Ad #{index + 1}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="mt-4 line-clamp-2 font-['Poppins'] text-base font-semibold leading-6 text-[#1E293B]">
                        {title}
                      </h3>

                      {/* Body */}
                      {text && (
                        <p className="mt-2 line-clamp-4 font-['Poppins'] text-sm leading-6 text-[#64748B]">
                          {text}
                        </p>
                      )}

                      {/* CTA */}
                      {ad.snapshot?.ctaText && (
                        <div className="mt-4">
                          <span className="inline-flex rounded-lg bg-[#E8F5F3] px-3 py-1.5 font-['Poppins'] text-sm font-medium text-[#0F766E]">
                            {ad.snapshot.ctaText}
                          </span>
                        </div>
                      )}

                      {/* Platforms */}
                      {ad.publisherPlatform &&
                        ad.publisherPlatform.length > 0 && (
                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            {ad.publisherPlatform.map(
                              (platform) => (
                                <span
                                  key={platform}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1 font-['Poppins'] text-xs capitalize text-[#64748B]"
                                >
                                  {platform.toLowerCase() ===
                                    "facebook" ? (
                                    <FaFacebookF
                                      size={13}
                                    />
                                  ) : platform
                                      .toLowerCase() ===
                                    "instagram" ? (
                                    <FaInstagram
                                      size={13}
                                    />
                                  ) : null}

                                  {platform}
                                </span>
                              )
                            )}
                          </div>
                        )}

                      {/* Date */}
                      <div className="mt-4 flex items-center gap-2 font-['Poppins'] text-xs text-[#64748B]">
                        <CalendarDays
                          size={14}
                        />

                        <span>
                          Started{" "}
                          {formatDate(
                            ad.startDateFormatted
                          )}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="mt-5 flex items-center gap-2 border-t border-[#EEF2F3] pt-4">

                        {adLink && (
                          <a
                            href={adLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#D9E1E7] px-3 py-2.5 font-['Poppins'] text-sm font-medium text-[#475569] transition hover:border-[#0F766E] hover:bg-[#E8F5F3] hover:text-[#0F766E]"
                          >
                            <ExternalLink
                              size={15}
                            />

                            View Ad
                          </a>
                        )}

                        {text && (
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(ad)
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-3 py-2.5 font-['Poppins'] text-sm font-medium text-white transition hover:bg-[#0B625C]"
                          >
                            {copied ? (
                              <>
                                <Check
                                  size={15}
                                />

                                Copied
                              </>
                            ) : (
                              <>
                                <Copy
                                  size={15}
                                />

                                Copy
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading &&
          !error &&
          ads.length === 0 && (
            <div className="mt-6 flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#CBD5E1] bg-white px-6 py-10 text-center">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F5F9] text-[#64748B]">
                <Search
                  size={25}
                  strokeWidth={1.8}
                />
              </div>

              <h3 className="mt-4 font-['Poppins'] text-lg font-semibold text-[#334155]">
                No ads searched yet
              </h3>

              <p className="mt-2 max-w-md font-['Poppins'] text-base leading-7 text-[#94A3B8]">
                Enter a Facebook Page or Ads
                Library URL above and click Find
                Ads to start your research.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}