"use client";

import { useState } from "react";

import {
  Search,
  Loader2,
  MapPin,
  Mail,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react";

import {
  searchInstagramEmails,
  type InstagramEmailLead,
} from "@/lib/api/instagramEmailLeads";

type EmailLimit =
  | 1
  | 5
  | 10
  | 20
  | 50
  | 100
  | 200
  | 500
  | 1000;

export default function InstagramLeadsPage() {
  const [keywords, setKeywords] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [customDomains, setCustomDomains] =
    useState("@gmail.com");

  const [maxEmails, setMaxEmails] =
    useState<EmailLimit>(10);

  const [excludeWords, setExcludeWords] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [leads, setLeads] =
    useState<InstagramEmailLead[]>([]);

  const [error, setError] =
    useState("");

  const [copiedEmail, setCopiedEmail] =
    useState<string | null>(null);

  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch = async () => {
    const cleanedKeywords =
      keywords
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    const cleanedLocation =
      location.trim();

    const cleanedDomains =
      customDomains
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    const cleanedExcludeWords =
      excludeWords
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    if (cleanedKeywords.length === 0) {
      setError(
        "Please enter at least one keyword."
      );
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setLeads([]);

      const result =
        await searchInstagramEmails({
          keywords:
            cleanedKeywords,

          ...(cleanedLocation
            ? {
                location:
                  cleanedLocation,
              }
            : {}),

          ...(cleanedDomains.length
            ? {
                customDomains:
                  cleanedDomains,
              }
            : {}),

          maxEmails,

          ...(cleanedExcludeWords.length
            ? {
                excludeWords:
                  cleanedExcludeWords,
              }
            : {}),
        });

      if (!result.success) {
        throw new Error(
          result.message ||
            "Failed to fetch Instagram email leads."
        );
      }

      setLeads(
        result.data || []
      );
    } catch (error) {
      console.error(
        "INSTAGRAM EMAIL SEARCH ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to search Instagram email leads."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // COPY EMAIL
  // ==========================================

  const handleCopyEmail = async (
    email: string
  ) => {
    try {
      await navigator.clipboard.writeText(
        email
      );

      setCopiedEmail(email);

      setTimeout(() => {
        setCopiedEmail(null);
      }, 2000);
    } catch (error) {
      console.error(
        "COPY EMAIL ERROR:",
        error
      );

      setError(
        "Failed to copy email."
      );
    }
  };

  // ==========================================
  // ENTER KEY
  // ==========================================

  const handleKeywordKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      e.key === "Enter" &&
      !isLoading
    ) {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">

        {/* =========================
            HEADER
        ========================== */}

        <div className="mb-7">
          <div className="flex items-center gap-2 font-['Poppins'] text-base text-[#64748B]">
            <span>
              Marketing
            </span>

            <span>
              /
            </span>

            <span className="text-[#0F766E]">
              Instagram Leads
            </span>
          </div>

          <div className="mt-3">
            <h1 className="font-['Poppins'] text-3xl font-semibold text-[#0F172A] sm:text-4xl">
              Instagram Email Leads
            </h1>

            <p className="mt-2 max-w-3xl font-['Poppins'] text-base leading-7 text-[#64748B]">
              Find publicly surfaced email
              addresses from Instagram-related
              search results using keywords and
              locations.
            </p>
          </div>
        </div>

        {/* =========================
            SEARCH FORM
        ========================== */}

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6">

          {/* Form Header */}

          <div className="mb-6 flex items-start gap-3">

            <div>
              <h2 className="font-['Poppins'] text-xl font-semibold text-[#0F172A]">
                Find Instagram Leads
              </h2>

              <p className="mt-1 font-['Poppins'] text-base text-[#64748B]">
                Search for publicly available
                email leads.
              </p>
            </div>
          </div>

          {/* Keywords */}

          <div>
            <label
              htmlFor="instagram-keywords"
              className="mb-2 block font-['Poppins'] text-base font-medium text-[#334155]"
            >
              Keywords
            </label>

            <input
              id="instagram-keywords"
              type="text"
              value={keywords}
              onChange={(e) => {
                setKeywords(
                  e.target.value
                );

                if (error) {
                  setError("");
                }
              }}
              onKeyDown={
                handleKeywordKeyDown
              }
              placeholder="e.g. founder, clothing store, restaurant"
              className="h-13 w-full rounded-xl border border-[#D9E1E7] bg-white px-4 font-['Poppins'] text-base text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
            />

            <p className="mt-2 font-['Poppins'] text-sm text-[#94A3B8]">
              Enter multiple keywords separated
              by commas.
            </p>
          </div>

          {/* Location */}

          <div className="mt-5">
            <label
              htmlFor="instagram-location"
              className="mb-2 block font-['Poppins'] text-base font-medium text-[#334155]"
            >
              Location
              <span className="ml-1 font-normal text-[#94A3B8]">
                (Optional)
              </span>
            </label>

            <div className="relative">
              <MapPin
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              />

              <input
                id="instagram-location"
                type="text"
                value={location}
                onChange={(e) =>
                  setLocation(
                    e.target.value
                  )
                }
                placeholder="e.g. Dhaka, Bangladesh"
                className="h-13 w-full rounded-xl border border-[#D9E1E7] bg-white pl-11 pr-4 font-['Poppins'] text-base text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
              />
            </div>

            <p className="mt-2 font-['Poppins'] text-sm text-[#94A3B8]">
              Narrow the search to a specific
              country, state, or city.
            </p>
          </div>

          {/* Email Domains */}

          <div className="mt-5">
            <label
              htmlFor="instagram-domains"
              className="mb-2 block font-['Poppins'] text-base font-medium text-[#334155]"
            >
              Email Domains
              <span className="ml-1 font-normal text-[#94A3B8]">
                (Optional)
              </span>
            </label>

            <input
              id="instagram-domains"
              type="text"
              value={customDomains}
              onChange={(e) =>
                setCustomDomains(
                  e.target.value
                )
              }
              placeholder="@gmail.com, @yahoo.com, @outlook.com"
              className="h-13 w-full rounded-xl border border-[#D9E1E7] bg-white px-4 font-['Poppins'] text-base text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
            />

            <p className="mt-2 font-['Poppins'] text-sm text-[#94A3B8]">
              Enter domains separated by commas.
            </p>
          </div>

          {/* Max Emails */}

          <div className="mt-5">
            <label
              htmlFor="instagram-max-emails"
              className="mb-2 block font-['Poppins'] text-base font-medium text-[#334155]"
            >
              Max Emails Per Keyword +
              Domain
            </label>

            <select
              id="instagram-max-emails"
              value={maxEmails}
              onChange={(e) =>
                setMaxEmails(
                  Number(
                    e.target.value
                  ) as EmailLimit
                )
              }
              className="h-13 w-full rounded-xl border border-[#D9E1E7] bg-white px-4 font-['Poppins'] text-base text-[#0F172A] outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
            >
              <option value={1}>
                1 Email
              </option>

              <option value={5}>
                5 Emails
              </option>

              <option value={10}>
                10 Emails
              </option>

              <option value={20}>
                20 Emails
              </option>

              <option value={50}>
                50 Emails
              </option>

              <option value={100}>
                100 Emails
              </option>

              <option value={200}>
                200 Emails
              </option>

              <option value={500}>
                500 Emails
              </option>

              <option value={1000}>
                1000 Emails
              </option>
            </select>

            <p className="mt-2 font-['Poppins'] text-sm text-[#94A3B8]">
              This limit applies to each keyword
              and email-domain combination.
            </p>
          </div>

          {/* Exclude Words */}

          <div className="mt-5">
            <label
              htmlFor="instagram-exclude-words"
              className="mb-2 block font-['Poppins'] text-base font-medium text-[#334155]"
            >
              Exclude Words
              <span className="ml-1 font-normal text-[#94A3B8]">
                (Optional)
              </span>
            </label>

            <input
              id="instagram-exclude-words"
              type="text"
              value={excludeWords}
              onChange={(e) =>
                setExcludeWords(
                  e.target.value
                )
              }
              placeholder="e.g. example, test, spam"
              className="h-13 w-full rounded-xl border border-[#D9E1E7] bg-white px-4 font-['Poppins'] text-base text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
            />

            <p className="mt-2 font-['Poppins'] text-sm text-[#94A3B8]">
              Separate multiple words with commas.
            </p>
          </div>

          {/* Info */}

          <div className="mt-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-[#0F766E]"
              />

              <div>
                <p className="font-['Poppins'] text-sm font-medium text-[#334155]">
                  Public email information
                </p>

                <p className="mt-1 font-['Poppins'] text-xs leading-5 text-[#94A3B8]">
                  Only publicly surfaced email
                  addresses from search results are
                  displayed.
                </p>
              </div>
            </div>
          </div>

          {/* Error */}

          {error && (
            <div className="mt-5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3">
              <p className="font-['Poppins'] text-sm leading-6 text-[#DC2626]">
                {error}
              </p>
            </div>
          )}

          {/* Search Button */}

          <div className="mt-7 flex justify-end">
            <button
              type="button"
              onClick={
                handleSearch
              }
              disabled={
                isLoading ||
                !keywords.trim()
              }
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-6 font-['Poppins'] text-base font-medium text-white transition-all duration-200 hover:bg-[#0B625C] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Finding Emails...
                </>
              ) : (
                <>
                  <Search size={18} />

                  Find Instagram Leads
                </>
              )}
            </button>
          </div>
        </div>

        {/* =========================
            LOADING
        ========================== */}

        {isLoading && (
          <div className="mt-6 flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white">
            <Loader2
              size={32}
              className="animate-spin text-[#0F766E]"
            />

            <h3 className="mt-4 font-['Poppins'] text-lg font-semibold text-[#334155]">
              Finding Instagram Leads...
            </h3>

            <p className="mt-2 max-w-md text-center font-['Poppins'] text-sm leading-6 text-[#94A3B8]">
              Searching publicly surfaced
              Instagram-related results and
              collecting available email
              information.
            </p>
          </div>
        )}

        {/* =========================
            RESULTS TABLE
        ========================== */}

        {!isLoading &&
          leads.length > 0 && (
            <div className="mt-6">

              {/* Header */}

              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-['Poppins'] text-xl font-semibold text-[#0F172A]">
                    Instagram Email Leads
                  </h2>

                  <p className="mt-1 font-['Poppins'] text-sm text-[#64748B]">
                    {leads.length} leads found
                    from your search.
                  </p>
                </div>

                <span className="inline-flex w-fit rounded-full bg-[#E8F5F3] px-3 py-1.5 font-['Poppins'] text-sm font-medium text-[#0F766E]">
                  {leads.length} Leads
                </span>
              </div>

              {/* Table */}

              <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px] border-collapse">

                    {/* Head */}

                    <thead>
                      <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC]">

                        <th className="whitespace-nowrap px-5 py-4 text-left font-['Poppins'] text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                          #
                        </th>

                        <th className="whitespace-nowrap px-5 py-4 text-left font-['Poppins'] text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                          Email
                        </th>

                        <th className="whitespace-nowrap px-5 py-4 text-left font-['Poppins'] text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                          Title
                        </th>

                        <th className="whitespace-nowrap px-5 py-4 text-left font-['Poppins'] text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                          Description
                        </th>

                        <th className="whitespace-nowrap px-5 py-4 text-left font-['Poppins'] text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                          Keyword
                        </th>

                        <th className="whitespace-nowrap px-5 py-4 text-center font-['Poppins'] text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                          Source
                        </th>

                        <th className="whitespace-nowrap px-5 py-4 text-center font-['Poppins'] text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                          Action
                        </th>

                      </tr>
                    </thead>

                    {/* Body */}

                    <tbody className="divide-y divide-[#EEF2F3]">

                      {leads.map(
                        (
                          lead,
                          index
                        ) => (
                          <tr
                            key={`${lead.email || "lead"}-${index}`}
                            className="transition-colors hover:bg-[#F8FAFC]"
                          >

                            {/* Number */}

                            <td className="px-5 py-4 align-middle">
                              <span className="font-['Poppins'] text-sm text-[#94A3B8]">
                                {index + 1}
                              </span>
                            </td>

                            {/* Email */}

                            <td className="px-5 py-4 align-middle">
                              <div className="flex min-w-[250px] items-center gap-2">

                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E8F5F3] text-[#0F766E]">
                                  <Mail
                                    size={
                                      15
                                    }
                                  />
                                </div>

                                {lead.email ? (
                                  <>
                                    <span className="max-w-[220px] truncate font-['Poppins'] text-sm font-medium text-[#334155]">
                                      {
                                        lead.email
                                      }
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleCopyEmail(
                                          lead.email as string
                                        )
                                      }
                                      title="Copy email"
                                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#64748B] transition hover:bg-[#E8F5F3] hover:text-[#0F766E]"
                                    >
                                      {copiedEmail ===
                                      lead.email ? (
                                        <Check
                                          size={
                                            14
                                          }
                                        />
                                      ) : (
                                        <Copy
                                          size={
                                            14
                                          }
                                        />
                                      )}
                                    </button>
                                  </>
                                ) : (
                                  <span className="font-['Poppins'] text-sm text-[#CBD5E1]">
                                    No email
                                  </span>
                                )}

                              </div>
                            </td>

                            {/* Title */}

                            <td className="px-5 py-4 align-middle">
                              <p className="min-w-[180px] max-w-[250px] truncate font-['Poppins'] text-sm font-medium text-[#475569]">
                                {lead.title ||
                                  "—"}
                              </p>
                            </td>

                            {/* Description */}

                            <td className="px-5 py-4 align-middle">
                              <p className="line-clamp-2 min-w-[280px] max-w-[380px] font-['Poppins'] text-sm leading-5 text-[#64748B]">
                                {lead.description ||
                                  "—"}
                              </p>
                            </td>

                            {/* Keyword */}

                            <td className="px-5 py-4 align-middle">
                              {lead.keyword ? (
                                <span className="inline-flex whitespace-nowrap rounded-full bg-[#F1F5F9] px-2.5 py-1 font-['Poppins'] text-xs font-medium text-[#475569]">
                                  {
                                    lead.keyword
                                  }
                                </span>
                              ) : (
                                <span className="font-['Poppins'] text-sm text-[#CBD5E1]">
                                  —
                                </span>
                              )}
                            </td>

                            {/* Source */}

                            <td className="px-5 py-4 text-center align-middle">
                              {lead.url ? (
                                <a
                                  href={
                                    lead.url
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Open source"
                                  className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg border border-[#D9E1E7] text-[#64748B] transition hover:border-[#0F766E] hover:bg-[#E8F5F3] hover:text-[#0F766E]"
                                >
                                  <ExternalLink
                                    size={
                                      16
                                    }
                                  />
                                </a>
                              ) : (
                                <span className="font-['Poppins'] text-sm text-[#CBD5E1]">
                                  —
                                </span>
                              )}
                            </td>

                            {/* Action */}

                            <td className="px-5 py-4 text-center align-middle">
                              {lead.email ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopyEmail(
                                      lead.email as string
                                    )
                                  }
                                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-3 py-2 font-['Poppins'] text-xs font-medium text-white transition hover:bg-[#0B625C]"
                                >
                                  {copiedEmail ===
                                  lead.email ? (
                                    <>
                                      <Check
                                        size={
                                          14
                                        }
                                      />

                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy
                                        size={
                                          14
                                        }
                                      />

                                      Copy Email
                                    </>
                                  )}
                                </button>
                              ) : (
                                <span className="font-['Poppins'] text-xs text-[#CBD5E1]">
                                  —
                                </span>
                              )}
                            </td>

                          </tr>
                        )
                      )}

                    </tbody>
                  </table>
                </div>

                {/* Footer */}

                <div className="flex items-center justify-between border-t border-[#E5E7EB] bg-[#F8FAFC] px-5 py-3">

                  <p className="font-['Poppins'] text-sm text-[#64748B]">
                    Showing{" "}
                    <span className="font-semibold text-[#334155]">
                      {leads.length}
                    </span>{" "}
                    email leads
                  </p>

                  <p className="font-['Poppins'] text-xs text-[#94A3B8]">
                    Scroll horizontally to view
                    all columns
                  </p>

                </div>

              </div>
            </div>
          )}

        {/* =========================
            EMPTY STATE
        ========================== */}

        {!isLoading &&
          !error &&
          leads.length === 0 && (
            <div className="mt-6 flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#CBD5E1] bg-white px-6 py-10 text-center">
    

              <h3 className="mt-4 font-['Poppins'] text-lg font-semibold text-[#334155]">
                No Instagram leads yet
              </h3>

              <p className="mt-2 max-w-md font-['Poppins'] text-base leading-7 text-[#94A3B8]">
                Enter keywords above and click
                Find Instagram Leads to search
                for publicly surfaced email
                addresses.
              </p>

            </div>
          )}

      </div>
    </div>
  );
}