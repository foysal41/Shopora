"use client";

import { useState } from "react";
import {
  Search,
  Loader2,
  Users,
  ExternalLink,
  MapPin,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react";

import {
  searchFacebookLeads,
  type FacebookLead,
  type FacebookSearchType,
} from "@/lib/api/facebookLeads";
import Image from "next/image";

export default function FacebookLeadsPage() {
  const [query, setQuery] = useState("");

  const [searchType, setSearchType] =
    useState<FacebookSearchType>("people");

  const [locationUid, setLocationUid] = useState("");

  const [maxItems, setMaxItems] = useState(20);

  const [isLoading, setIsLoading] = useState(false);

  const [leads, setLeads] = useState<FacebookLead[]>([]);

  const [error, setError] = useState("");

  const [copiedLeadId, setCopiedLeadId] = useState<
    string | null
  >(null);

  const handleSearch = async () => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Please enter a search keyword.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setLeads([]);

      const result = await searchFacebookLeads({
        searchType,
        searchQueries: [trimmedQuery],
        maxItems,
        ...(locationUid.trim()
          ? {
              locationUid: locationUid.trim(),
            }
          : {}),
      });

      if (!result.success) {
        throw new Error(
          result.message ||
            "Failed to search Facebook leads."
        );
      }

      setLeads(result.data || []);
    } catch (error) {
      console.error(
        "FACEBOOK LEAD SEARCH ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to search Facebook leads."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyProfileUrl = async (
    lead: FacebookLead
  ) => {
    if (!lead.url) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        lead.url
      );

      const id =
        lead.id ||
        lead.url ||
        "";

      setCopiedLeadId(id);

      setTimeout(() => {
        setCopiedLeadId(null);
      }, 2000);
    } catch (error) {
      console.error(
        "COPY PROFILE URL ERROR:",
        error
      );

      setError(
        "Failed to copy profile URL."
      );
    }
  };

  const getSearchTypeLabel = () => {
    switch (searchType) {
      case "people":
        return "People";

      case "pages":
        return "Pages";

      case "places":
        return "Places";

      case "posts":
        return "Posts";

      case "videos":
        return "Videos";

      case "events":
        return "Events";

      case "top":
        return "Top";

      default:
        return "People";
    }
  };

  const getLeadTitle = (lead: FacebookLead) => {
    if (lead.name) {
      return lead.name;
    }

    if (searchType === "people") {
      return "Unknown Profile";
    }

    if (searchType === "pages") {
      return "Facebook Page";
    }

    if (searchType === "places") {
      return "Facebook Place";
    }

    if (searchType === "events") {
      return "Facebook Event";
    }

    if (searchType === "posts") {
      return "Facebook Post";
    }

    if (searchType === "videos") {
      return "Facebook Video";
    }

    return "Facebook Result";
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
              Facebook Leads
            </span>
          </div>

          <div className="mt-3">
            <h1 className="font-['Poppins'] text-3xl font-semibold text-[#0F172A] sm:text-4xl">
              Facebook Lead Generation
            </h1>

            <p className="mt-2 max-w-2xl font-['Poppins'] text-base leading-7 text-[#64748B]">
              Find public Facebook profiles,
              pages, places, posts, videos, and
              events using keywords.
            </p>
          </div>
        </div>

        {/* Search Form */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6">

          {/* Form Header */}
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#E8F5F3] text-[#0F766E]">
              <Users
                size={21}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <h2 className="font-['Poppins'] text-xl font-semibold text-[#0F172A]">
                Find Facebook Leads
              </h2>

              <p className="mt-1 font-['Poppins'] text-base text-[#64748B]">
                Search publicly available
                Facebook results using a keyword.
              </p>
            </div>
          </div>

          {/* Search Keyword */}
          <div>
            <label
              htmlFor="facebook-lead-query"
              className="mb-2 block font-['Poppins'] text-base font-medium text-[#334155]"
            >
              Search Keyword
            </label>

            <input
              id="facebook-lead-query"
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);

                if (error) {
                  setError("");
                }
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  query.trim() &&
                  !isLoading
                ) {
                  handleSearch();
                }
              }}
              placeholder="e.g. cloth, fashion, clothing store"
              className="h-13 w-full rounded-xl border border-[#D9E1E7] bg-white px-4 font-['Poppins'] text-base text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
            />

            <p className="mt-2 font-['Poppins'] text-sm text-[#94A3B8]">
              Enter a keyword you want to search
              on Facebook.
            </p>
          </div>

          {/* Search Type + Results */}
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">

            {/* Search Type */}
            <div>
              <label
                htmlFor="facebook-search-type"
                className="mb-2 block font-['Poppins'] text-base font-medium text-[#334155]"
              >
                Search Type
              </label>

              <select
                id="facebook-search-type"
                value={searchType}
                onChange={(e) => {
                  setSearchType(
                    e.target.value as FacebookSearchType
                  );

                  setLeads([]);
                  setError("");
                }}
                className="h-13 w-full rounded-xl border border-[#D9E1E7] bg-white px-4 font-['Poppins'] text-base text-[#0F172A] outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
              >
                <option value="people">
                  People
                </option>

                <option value="pages">
                  Pages
                </option>

                <option value="places">
                  Places
                </option>

                <option value="posts">
                  Posts
                </option>

                <option value="videos">
                  Videos
                </option>

                <option value="events">
                  Events
                </option>
              </select>
            </div>

            {/* Results */}
            <div>
              <label
                htmlFor="facebook-results-limit"
                className="mb-2 block font-['Poppins'] text-base font-medium text-[#334155]"
              >
                Results
              </label>

              <select
                id="facebook-results-limit"
                value={maxItems}
                onChange={(e) =>
                  setMaxItems(
                    Number(e.target.value)
                  )
                }
                className="h-13 w-full rounded-xl border border-[#D9E1E7] bg-white px-4 font-['Poppins'] text-base text-[#0F172A] outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
              >
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
              </select>
            </div>
          </div>

          {/* Location UID */}
          {/* <div className="mt-5">
            <label
              htmlFor="facebook-location"
              className="mb-2 block font-['Poppins'] text-base font-medium text-[#334155]"
            >
              Facebook Location
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
                id="facebook-location"
                type="text"
                value={locationUid}
                onChange={(e) =>
                  setLocationUid(e.target.value)
                }
                placeholder="Facebook Place UID or Place URL"
                className="h-13 w-full rounded-xl border border-[#D9E1E7] bg-white pl-11 pr-4 font-['Poppins'] text-base text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
              />
            </div>

            <p className="mt-2 font-['Poppins'] text-sm leading-5 text-[#94A3B8]">
              Optional. Use a Facebook Place UID
              or Facebook Place URL. Example:
              /places/.../
            </p>
          </div> */}

          {/* Search Info */}
          <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-[#0F766E]"
              />

              <div>
                <p className="font-['Poppins'] text-sm font-medium text-[#334155]">
                  Public Facebook results
                </p>

                <p className="mt-1 font-['Poppins'] text-xs leading-5 text-[#94A3B8]">
                  This search works with publicly
                  visible Facebook search results.
                  Private profile information is
                  not collected.
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

          {/* Button */}
          <div className="mt-7 flex justify-end">
            <button
              type="button"
              onClick={handleSearch}
              disabled={
                isLoading || !query.trim()
              }
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-6 font-['Poppins'] text-base font-medium text-white transition-all duration-200 hover:bg-[#0B625C] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Finding Leads...
                </>
              ) : (
                <>
                  <Search size={18} />

                  Find Leads
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
              Finding Facebook Leads...
            </h3>

            <p className="mt-2 font-['Poppins'] text-sm text-[#94A3B8]">
              Searching public Facebook
              results. This may take a little
              while.
            </p>
          </div>
        )}

        {/* Results */}
        {!isLoading && leads.length > 0 && (
          <div className="mt-6">

            {/* Result Header */}
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-['Poppins'] text-xl font-semibold text-[#0F172A]">
                  Leads Found
                </h2>

                <p className="mt-1 font-['Poppins'] text-sm text-[#64748B]">
                  {leads.length}{" "}
                  {getSearchTypeLabel().toLowerCase()}{" "}
                  result
                  {leads.length !== 1
                    ? "s"
                    : ""}{" "}
                  found for &quot;
                  {query}
                  &quot;.
                </p>
              </div>

              <span className="inline-flex w-fit rounded-full bg-[#E8F5F3] px-3 py-1.5 font-['Poppins'] text-sm font-medium text-[#0F766E]">
                {getSearchTypeLabel()}
              </span>
            </div>

            {/* Leads Grid */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {leads.map((lead, index) => {
                const leadId =
                  lead.id ||
                  lead.url ||
                  `lead-${index}`;

                const copied =
                  copiedLeadId === leadId;

                return (
                  <div
                    key={leadId}
                    className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
                  >
                    {/* Result Header */}
                    <div className="flex items-center gap-4 p-5">
                      {lead.profilePicture ? (
                        <Image
                          src={lead.profilePicture}
                          alt={
                            lead.name ||
                            "Facebook result"
                          }
                          className="h-16 w-16 shrink-0 rounded-full border border-[#E2E8F0] object-cover"
                          height={512}
                          width={512}
                        />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#E8F5F3] text-[#0F766E]">
                          <Users
                            size={27}
                            strokeWidth={1.7}
                          />
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="truncate font-['Poppins'] text-base font-semibold text-[#0F172A]">
                            {getLeadTitle(
                              lead
                            )}
                          </h3>

                          {lead.isVerified && (
                            <ShieldCheck
                              size={16}
                              className="shrink-0 text-[#0F766E]"
                            />
                          )}
                        </div>

                        {lead.subtitle && (
                          <div className="mt-1 flex items-start gap-1.5">
                            <MapPin
                              size={13}
                              className="mt-0.5 shrink-0 text-[#94A3B8]"
                            />

                            <p className="line-clamp-2 font-['Poppins'] text-xs leading-5 text-[#64748B]">
                              {lead.subtitle}
                            </p>
                          </div>
                        )}

                        {!lead.subtitle &&
                          lead.locationDescriptor && (
                            <div className="mt-1 flex items-start gap-1.5">
                              <MapPin
                                size={13}
                                className="mt-0.5 shrink-0 text-[#94A3B8]"
                              />

                              <p className="line-clamp-2 font-['Poppins'] text-xs leading-5 text-[#64748B]">
                                {
                                  lead.locationDescriptor
                                }
                              </p>
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="px-5 pb-5">

                      {/* Search Keyword */}
                      <div className="rounded-lg bg-[#F8FAFC] px-3 py-2.5">
                        <p className="font-['Poppins'] text-xs text-[#94A3B8]">
                          Search keyword
                        </p>

                        <p className="mt-0.5 truncate font-['Poppins'] text-sm font-medium text-[#475569]">
                          {lead.query ||
                            query}
                        </p>
                      </div>

                      {/* Description */}
                      {lead.description && (
                        <div className="mt-3">
                          <p className="line-clamp-3 font-['Poppins'] text-xs leading-5 text-[#64748B]">
                            {lead.description}
                          </p>
                        </div>
                      )}

                      {/* Status */}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-['Poppins'] text-xs text-[#64748B]">
                          Profile status
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-['Poppins'] text-xs font-medium ${
                            lead.isVerified
                              ? "bg-[#DCFCE7] text-[#15803D]"
                              : "bg-[#F1F5F9] text-[#64748B]"
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />

                          {lead.isVerified
                            ? "Verified"
                            : "Public Result"}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="mt-5 flex items-center gap-2 border-t border-[#EEF2F3] pt-4">
                        {lead.url && (
                          <a
                            href={lead.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#D9E1E7] px-3 py-2.5 font-['Poppins'] text-sm font-medium text-[#475569] transition hover:border-[#0F766E] hover:bg-[#E8F5F3] hover:text-[#0F766E]"
                          >
                            <ExternalLink
                              size={15}
                            />

                            View
                          </a>
                        )}

                        {lead.url && (
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyProfileUrl(
                                lead
                              )
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

                        {!lead.url && (
                          <div className="w-full rounded-lg bg-[#F8FAFC] px-3 py-2.5 text-center font-['Poppins'] text-xs text-[#94A3B8]">
                            No public URL available
                          </div>
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
          leads.length === 0 && (
            <div className="mt-6 flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#CBD5E1] bg-white px-6 py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F5F9] text-[#64748B]">
                <Users
                  size={25}
                  strokeWidth={1.8}
                />
              </div>

              <h3 className="mt-4 font-['Poppins'] text-lg font-semibold text-[#334155]">
                No leads searched yet
              </h3>

              <p className="mt-2 max-w-md font-['Poppins'] text-base leading-7 text-[#94A3B8]">
                Enter a keyword above and click
                Find Leads to search public
                Facebook results.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}