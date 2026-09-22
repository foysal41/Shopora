"use client";

import { useState } from "react";

import {
  Search,
  Loader2,
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

import {
  searchBusinessLeads,
  type BusinessLead,
} from "@/lib/api/businessLeads";

type SearchLimit =
  | 5
  | 10
  | 20
  | 50
  | 100
  | 200
  | 500
  | 1000;

export default function BusinessLeadsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");

  const [maxResults, setMaxResults] =
    useState<SearchLimit>(10);

  const [extractContacts, setExtractContacts] =
    useState(true);

  const [isLoading, setIsLoading] =
    useState(false);

  const [leads, setLeads] =
    useState<BusinessLead[]>([]);

  const [error, setError] =
    useState("");

  const [copiedEmail, setCopiedEmail] =
    useState<string | null>(null);

  const handleSearch = async () => {
    const trimmedSearchTerm =
      searchTerm.trim();

    const trimmedLocation =
      location.trim();

    if (!trimmedSearchTerm) {
      setError(
        "Please enter a business search keyword."
      );
      return;
    }

    if (!trimmedLocation) {
      setError(
        "Please enter a location."
      );
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setLeads([]);

      const result =
        await searchBusinessLeads({
          searchStringsArray: [
            trimmedSearchTerm,
          ],
          locationQueries: [
            trimmedLocation,
          ],
          maxCrawledPlacesPerSearch:
            maxResults,
          extractContactsFromWebsite:
            extractContacts,
        });

      if (!result.success) {
        throw new Error(
          result.message ||
            "Failed to fetch business leads."
        );
      }

      setLeads(result.data || []);
    } catch (error) {
      console.error(
        "BUSINESS LEAD SEARCH ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to search business leads."
      );
    } finally {
      setIsLoading(false);
    }
  };

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

  const getPrimaryEmail = (
    lead: BusinessLead
  ) => {
    return lead.emails?.find(
      (email) => email?.trim()
    );
  };

  const getPrimaryFacebook = (
    lead: BusinessLead
  ) => {
    return lead.facebooks?.find(
      (url) => url?.trim()
    );
  };

  const getPrimaryInstagram = (
    lead: BusinessLead
  ) => {
    return lead.instagrams?.find(
      (url) => url?.trim()
    );
  };

  const getPrimaryLinkedIn = (
    lead: BusinessLead
  ) => {
    return lead.linkedIns?.find(
      (url) => url?.trim()
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">

        {/* =========================
            PAGE HEADER
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
              Business Leads
            </span>
          </div>

          <div className="mt-3">
            <h1 className="font-['Poppins'] text-3xl font-semibold text-[#0F172A] sm:text-4xl">
              Business Lead Generation
            </h1>

            <p className="mt-2 max-w-3xl font-['Poppins'] text-base leading-7 text-[#64748B]">
              Find local businesses on Google
              Maps and discover publicly
              available business contact
              information.
            </p>
          </div>
        </div>

        {/* =========================
            SEARCH FORM
        ========================== */}

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6">

          {/* Form Header */}

          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#E8F5F3] text-[#0F766E]">
              <Building2
                size={21}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <h2 className="font-['Poppins'] text-xl font-semibold text-[#0F172A]">
                Find Business Leads
              </h2>

              <p className="mt-1 font-['Poppins'] text-base text-[#64748B]">
                Search businesses by keyword
                and location.
              </p>
            </div>
          </div>

          {/* Search Keyword */}

          <div>
            <label
              htmlFor="business-search-term"
              className="mb-2 block font-['Poppins'] text-base font-medium text-[#334155]"
            >
              Search Keyword
            </label>

            <input
              id="business-search-term"
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(
                  e.target.value
                );

                if (error) {
                  setError("");
                }
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  searchTerm.trim() &&
                  location.trim() &&
                  !isLoading
                ) {
                  handleSearch();
                }
              }}
              placeholder="e.g. clothing store, restaurant, dentist"
              className="h-13 w-full rounded-xl border border-[#D9E1E7] bg-white px-4 font-['Poppins'] text-base text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
            />

            <p className="mt-2 font-['Poppins'] text-sm text-[#94A3B8]">
              Enter the type of business
              you want to find.
            </p>
          </div>

          {/* Location */}

          <div className="mt-5">
            <label
              htmlFor="business-location"
              className="mb-2 block font-['Poppins'] text-base font-medium text-[#334155]"
            >
              Location
            </label>

            <div className="relative">
              <MapPin
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              />

              <input
                id="business-location"
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(
                    e.target.value
                  );

                  if (error) {
                    setError("");
                  }
                }}
                placeholder="e.g. Dhaka, Bangladesh"
                className="h-13 w-full rounded-xl border border-[#D9E1E7] bg-white pl-11 pr-4 font-['Poppins'] text-base text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
              />
            </div>

            <p className="mt-2 font-['Poppins'] text-sm text-[#94A3B8]">
              Enter a city, area, or country
              where you want to find businesses.
            </p>
          </div>

          {/* Results */}

          <div className="mt-5">
            <label
              htmlFor="business-results-limit"
              className="mb-2 block font-['Poppins'] text-base font-medium text-[#334155]"
            >
              Number of Results
            </label>

            <select
              id="business-results-limit"
              value={maxResults}
              onChange={(e) =>
                setMaxResults(
                  Number(
                    e.target.value
                  ) as SearchLimit
                )
              }
              className="h-13 w-full rounded-xl border border-[#D9E1E7] bg-white px-4 font-['Poppins'] text-base text-[#0F172A] outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
            >
              <option value={5}>
                5 Results
              </option>

              <option value={10}>
                10 Results
              </option>

              <option value={20}>
                20 Results
              </option>

              <option value={50}>
                50 Results
              </option>

              <option value={100}>
                100 Results
              </option>

              <option value={200}>
                200 Results
              </option>

              <option value={500}>
                500 Results
              </option>

              <option value={1000}>
                1000 Results
              </option>
            </select>
          </div>

          {/* Contact Extraction */}

          <div className="mt-5">
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={
                    extractContacts
                  }
                  onChange={(e) =>
                    setExtractContacts(
                      e.target.checked
                    )
                  }
                  className="mt-1 h-4 w-4 rounded border-[#CBD5E1] accent-[#0F766E]"
                />

                <div>
                  <p className="font-['Poppins'] text-sm font-medium text-[#334155]">
                    Extract business contacts
                  </p>

                  <p className="mt-1 font-['Poppins'] text-xs leading-5 text-[#94A3B8]">
                    Find publicly available
                    emails, phone numbers,
                    WhatsApp numbers, and
                    social links from the
                    business website when
                    available.
                  </p>
                </div>
              </label>
            </div>
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
                  Public business information
                </p>

                <p className="mt-1 font-['Poppins'] text-xs leading-5 text-[#94A3B8]">
                  Contact information is
                  collected only when it is
                  publicly available from the
                  business listing or its own
                  website.
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
                !searchTerm.trim() ||
                !location.trim()
              }
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-6 font-['Poppins'] text-base font-medium text-white transition-all duration-200 hover:bg-[#0B625C] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Finding Businesses...
                </>
              ) : (
                <>
                  <Search size={18} />

                  Find Business Leads
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
              Finding Business Leads...
            </h3>

            <p className="mt-2 max-w-md text-center font-['Poppins'] text-sm leading-6 text-[#94A3B8]">
              Searching Google Maps and
              checking public business contact
              information. This may take a
              little while.
            </p>
          </div>
        )}

        {/* =========================
            RESULTS TABLE
        ========================== */}

        {!isLoading &&
          leads.length > 0 && (
            <div className="mt-6">

              {/* Results Header */}

              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-['Poppins'] text-xl font-semibold text-[#0F172A]">
                    Businesses Found
                  </h2>

                  <p className="mt-1 font-['Poppins'] text-sm text-[#64748B]">
                    {leads.length} businesses
                    found for &quot;
                    {searchTerm}
                    &quot; in {location}.
                  </p>
                </div>

                <span className="inline-flex w-fit rounded-full bg-[#E8F5F3] px-3 py-1.5 font-['Poppins'] text-sm font-medium text-[#0F766E]">
                  {leads.length} Results
                </span>
              </div>

              {/* Table */}

              <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1500px] border-collapse">

                    {/* Table Header */}

                    <thead>
                      <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC]">

                        <th className="whitespace-nowrap px-5 py-4 text-left font-['Poppins'] text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                          Business
                        </th>

                        <th className="whitespace-nowrap px-5 py-4 text-left font-['Poppins'] text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                          Category
                        </th>

                        <th className="whitespace-nowrap px-5 py-4 text-left font-['Poppins'] text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                          Location
                        </th>

                        <th className="whitespace-nowrap px-5 py-4 text-left font-['Poppins'] text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                          Phone
                        </th>

                        <th className="whitespace-nowrap px-5 py-4 text-left font-['Poppins'] text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                          Email
                        </th>

                        <th className="whitespace-nowrap px-5 py-4 text-left font-['Poppins'] text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                          Website
                        </th>

                        <th className="whitespace-nowrap px-5 py-4 text-center font-['Poppins'] text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                          Social
                        </th>

                        <th className="whitespace-nowrap px-5 py-4 text-center font-['Poppins'] text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                          Rating
                        </th>

                        <th className="whitespace-nowrap px-5 py-4 text-center font-['Poppins'] text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                          Status
                        </th>

                        <th className="whitespace-nowrap px-5 py-4 text-center font-['Poppins'] text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                          Actions
                        </th>

                      </tr>
                    </thead>

                    {/* Table Body */}

                    <tbody className="divide-y divide-[#EEF2F3]">

                      {leads.map(
                        (
                          lead,
                          index
                        ) => {
                          const primaryEmail =
                            getPrimaryEmail(
                              lead
                            );

                          const facebook =
                            getPrimaryFacebook(
                              lead
                            );

                          const instagram =
                            getPrimaryInstagram(
                              lead
                            );

                          const linkedin =
                            getPrimaryLinkedIn(
                              lead
                            );

                          return (
                            <tr
                              key={
                                lead.placeId ||
                                `${lead.title}-${index}`
                              }
                              className="transition-colors hover:bg-[#F8FAFC]"
                            >

                              {/* Business */}

                              <td className="px-5 py-4 align-middle">
                                <div className="flex min-w-[220px] items-center gap-3">

                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E8F5F3] text-[#0F766E]">
                                    <Building2
                                      size={18}
                                      strokeWidth={
                                        1.8
                                      }
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="line-clamp-2 font-['Poppins'] text-sm font-semibold text-[#0F172A]">
                                      {lead.title ||
                                        "Unknown Business"}
                                    </p>

                                    {lead.subTitle && (
                                      <p className="mt-1 truncate font-['Poppins'] text-xs text-[#94A3B8]">
                                        {
                                          lead.subTitle
                                        }
                                      </p>
                                    )}
                                  </div>

                                </div>
                              </td>

                              {/* Category */}

                              <td className="px-5 py-4 align-middle">
                                <div className="min-w-[160px]">
                                  <p className="font-['Poppins'] text-sm text-[#475569]">
                                    {lead.categoryName ||
                                      "—"}
                                  </p>
                                </div>
                              </td>

                              {/* Location */}

                              <td className="px-5 py-4 align-middle">
                                <div className="flex min-w-[230px] items-start gap-2">
                                  <MapPin
                                    size={15}
                                    className="mt-0.5 shrink-0 text-[#94A3B8]"
                                  />

                                  <p className="line-clamp-2 font-['Poppins'] text-sm leading-5 text-[#64748B]">
                                    {lead.address ||
                                      [
                                        lead.city,
                                        lead.state,
                                        lead.countryCode,
                                      ]
                                        .filter(
                                          Boolean
                                        )
                                        .join(
                                          ", "
                                        ) ||
                                      "—"}
                                  </p>
                                </div>
                              </td>

                              {/* Phone */}

                              <td className="px-5 py-4 align-middle">
                                {lead.phone ? (
                                  <div className="flex min-w-[150px] items-center gap-2">
                                    <Phone
                                      size={15}
                                      className="shrink-0 text-[#0F766E]"
                                    />

                                    <span className="font-['Poppins'] text-sm text-[#475569]">
                                      {
                                        lead.phone
                                      }
                                    </span>
                                  </div>
                                ) : (
                                  <span className="font-['Poppins'] text-sm text-[#CBD5E1]">
                                    —
                                  </span>
                                )}
                              </td>

                              {/* Email */}

                              <td className="px-5 py-4 align-middle">
                                {primaryEmail ? (
                                  <div className="flex min-w-[230px] items-center gap-2">
                                    <Mail
                                      size={15}
                                      className="shrink-0 text-[#0F766E]"
                                    />

                                    <span className="max-w-[200px] truncate font-['Poppins'] text-sm text-[#475569]">
                                      {
                                        primaryEmail
                                      }
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleCopyEmail(
                                          primaryEmail
                                        )
                                      }
                                      title="Copy email"
                                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#64748B] transition hover:bg-[#E8F5F3] hover:text-[#0F766E]"
                                    >
                                      {copiedEmail ===
                                      primaryEmail ? (
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
                                  </div>
                                ) : (
                                  <span className="font-['Poppins'] text-sm text-[#CBD5E1]">
                                    No email
                                  </span>
                                )}
                              </td>

                              {/* Website */}

                              <td className="px-5 py-4 align-middle">
                                {lead.website ? (
                                  <a
                                    href={
                                      lead.website
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex min-w-[180px] items-center gap-2"
                                  >
                                    <Globe
                                      size={
                                        15
                                      }
                                      className="shrink-0 text-[#0F766E]"
                                    />

                                    <span className="max-w-[150px] truncate font-['Poppins'] text-sm text-[#475569] group-hover:text-[#0F766E]">
                                      {lead.websiteDisplay ||
                                        lead.website}
                                    </span>

                                    <ExternalLink
                                      size={
                                        13
                                      }
                                      className="shrink-0 text-[#94A3B8] group-hover:text-[#0F766E]"
                                    />
                                  </a>
                                ) : (
                                  <span className="font-['Poppins'] text-sm text-[#CBD5E1]">
                                    —
                                  </span>
                                )}
                              </td>

                              {/* Social */}

                              <td className="px-5 py-4 align-middle">
                                <div className="flex min-w-[120px] items-center justify-center gap-2">

                                  {facebook ? (
                                    <a
                                      href={
                                        facebook
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="Facebook"
                                      aria-label="Facebook"
                                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] transition hover:border-[#0F766E] hover:bg-[#E8F5F3] hover:text-[#0F766E]"
                                    >
                                      <FaFacebookF
                                        size={
                                          14
                                        }
                                      />
                                    </a>
                                  ) : null}

                                  {instagram ? (
                                    <a
                                      href={
                                        instagram
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="Instagram"
                                      aria-label="Instagram"
                                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] transition hover:border-[#0F766E] hover:bg-[#E8F5F3] hover:text-[#0F766E]"
                                    >
                                      <FaInstagram
                                        size={
                                          15
                                        }
                                      />
                                    </a>
                                  ) : null}

                                  {linkedin ? (
                                    <a
                                      href={
                                        linkedin
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="LinkedIn"
                                      aria-label="LinkedIn"
                                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] transition hover:border-[#0F766E] hover:bg-[#E8F5F3] hover:text-[#0F766E]"
                                    >
                                      <FaLinkedinIn
                                        size={
                                          14
                                        }
                                      />
                                    </a>
                                  ) : null}

                                  {!facebook &&
                                    !instagram &&
                                    !linkedin && (
                                      <span className="font-['Poppins'] text-sm text-[#CBD5E1]">
                                        —
                                      </span>
                                    )}

                                </div>
                              </td>

                              {/* Rating */}

                              <td className="px-5 py-4 align-middle text-center">
                                {lead.totalScore !==
                                undefined ? (
                                  <div className="min-w-[90px]">
                                    <p className="font-['Poppins'] text-sm font-semibold text-[#C2410C]">
                                      ★{" "}
                                      {
                                        lead.totalScore
                                      }
                                    </p>

                                    {lead.reviewsCount !==
                                      undefined && (
                                      <p className="mt-0.5 font-['Poppins'] text-xs text-[#94A3B8]">
                                        {
                                          lead.reviewsCount
                                        }{" "}
                                        reviews
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="font-['Poppins'] text-sm text-[#CBD5E1]">
                                    —
                                  </span>
                                )}
                              </td>

                              {/* Status */}

                              <td className="px-5 py-4 align-middle text-center">
                                <span
                                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 font-['Poppins'] text-xs font-medium ${
                                    lead.currentStatus ===
                                    "Open"
                                      ? "bg-[#DCFCE7] text-[#15803D]"
                                      : lead.currentStatus ===
                                          "Closed"
                                        ? "bg-[#FEE2E2] text-[#DC2626]"
                                        : "bg-[#F1F5F9] text-[#64748B]"
                                  }`}
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-current" />

                                  {lead.currentStatus ||
                                    "Unknown"}
                                </span>
                              </td>

                              {/* Actions */}

                              <td className="px-5 py-4 align-middle">
                                <div className="flex min-w-[100px] items-center justify-center gap-2">

                                  {lead.url && (
                                    <a
                                      href={
                                        lead.url
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="Open Google Maps"
                                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D9E1E7] text-[#64748B] transition hover:border-[#0F766E] hover:bg-[#E8F5F3] hover:text-[#0F766E]"
                                    >
                                      <MapPin
                                        size={
                                          16
                                        }
                                      />
                                    </a>
                                  )}

                                  {primaryEmail && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleCopyEmail(
                                          primaryEmail
                                        )
                                      }
                                      title="Copy email"
                                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D9E1E7] text-[#64748B] transition hover:border-[#0F766E] hover:bg-[#E8F5F3] hover:text-[#0F766E]"
                                    >
                                      {copiedEmail ===
                                      primaryEmail ? (
                                        <Check
                                          size={
                                            15
                                          }
                                        />
                                      ) : (
                                        <Copy
                                          size={
                                            15
                                          }
                                        />
                                      )}
                                    </button>
                                  )}

                                </div>
                              </td>

                            </tr>
                          );
                        }
                      )}

                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}

                <div className="flex items-center justify-between border-t border-[#E5E7EB] bg-[#F8FAFC] px-5 py-3">
                  <p className="font-['Poppins'] text-sm text-[#64748B]">
                    Showing{" "}
                    <span className="font-semibold text-[#334155]">
                      {leads.length}
                    </span>{" "}
                    business leads
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

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F5F9] text-[#64748B]">
                <Building2
                  size={25}
                  strokeWidth={1.8}
                />
              </div>

              <h3 className="mt-4 font-['Poppins'] text-lg font-semibold text-[#334155]">
                No business leads yet
              </h3>

              <p className="mt-2 max-w-md font-['Poppins'] text-base leading-7 text-[#94A3B8]">
                Enter a business keyword and
                location above, then click Find
                Business Leads.
              </p>

            </div>
          )}

      </div>
    </div>
  );
}