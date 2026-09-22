"use client";

import {
  useState,
} from "react";

import {
  Search,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Share2,
  Heart,
  ThumbsUp,
  AlertCircle,
  CheckCircle2,
  MinusCircle,
  HelpCircle,
  Loader2,
  BarChart3,
  Copy,
  Check,
} from "lucide-react";

import {
  analyzeProductInsights,
  ProductInsightPost,
  ProductInsightsResponse,
} from "@/lib/api/productInsights";

const sentimentConfig = {
  positive: {
    label: "Positive",
    icon: CheckCircle2,
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
  },

  negative: {
    label: "Negative",
    icon: AlertCircle,
    className:
      "bg-red-50 text-red-700 border-red-200",
  },

  neutral: {
    label: "Neutral",
    icon: MinusCircle,
    className:
      "bg-slate-50 text-slate-700 border-slate-200",
  },
} as const;

const formatNumber = (
  value: number
) => {
  return new Intl.NumberFormat(
    "en-US",
    {
      notation: "compact",
      maximumFractionDigits: 1,
    }
  ).format(value);
};

export default function ProductInsightsPage() {
  const [productQuery, setProductQuery] =
    useState("");

  const [customQueries, setCustomQueries] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [maxResults, setMaxResults] =
    useState(50);

  const [result, setResult] =
    useState<ProductInsightsResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [copiedUrl, setCopiedUrl] =
    useState("");

  const handleAnalyze =
    async () => {
      const query =
        productQuery.trim();

      if (!query) {
        setError(
          "Please enter a product name or search query."
        );

        return;
      }

      setLoading(true);
      setError("");
      setResult(null);

      try {
        const searchQueries =
          customQueries
            .split(",")
            .map((item) =>
              item.trim()
            )
            .filter(Boolean);

        const response =
          await analyzeProductInsights({
            productQuery: query,

            ...(searchQueries.length
              ? {
                  searchQueries,
                }
              : {}),

            ...(location.trim()
              ? {
                  location:
                    location.trim(),
                }
              : {}),

            maxResults,
          });

        setResult(response);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to analyze product."
        );
      } finally {
        setLoading(false);
      }
    };

  const copyUrl = async (
    url: string
  ) => {
    try {
      await navigator.clipboard.writeText(
        url
      );

      setCopiedUrl(url);

      setTimeout(() => {
        setCopiedUrl("");
      }, 1500);
    } catch {
      // Ignore clipboard errors
    }
  };

  const analysis =
    result?.data.analysis;

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-6 md:px-6 lg:px-8">
      <div className="">
        {/* HEADER */}

        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B625C] text-white">
              <BarChart3
                size={22}
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[#0F172A]">
                Product Insights
              </h1>

              <p className="mt-1 text-sm text-[#64748B]">
                Analyze public Facebook posts
                and understand customer sentiment.
              </p>
            </div>
          </div>
        </div>

        {/* SEARCH CARD */}

        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-[#0F172A]">
              Search product
            </h2>

            <p className="mt-1 text-sm text-[#64748B]">
              Enter a product and we will find
              relevant public Facebook posts.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* PRODUCT */}

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-[#334155]">
                Product / Search Query
              </label>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                />

                <input
                  value={productQuery}
                  onChange={(event) =>
                    setProductQuery(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      void handleAnalyze();
                    }
                  }}
                  placeholder="e.g. Nike Air Max"
                  className="w-full rounded-xl border border-[#CBD5E1] bg-white py-3 pl-10 pr-4 text-sm text-[#0F172A] outline-none transition focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/10"
                />
              </div>
            </div>

            {/* CUSTOM SEARCHES */}

            <div>
              <label className="mb-2 block text-sm font-medium text-[#334155]">
                Additional Queries
              </label>

              <input
                value={customQueries}
                onChange={(event) =>
                  setCustomQueries(
                    event.target.value
                  )
                }
                placeholder="review, experience, problem, price"
                className="w-full rounded-xl border border-[#CBD5E1] px-4 py-3 text-sm outline-none focus:border-[#1877F2]"
              />

              <p className="mt-1 text-xs text-[#94A3B8]">
                Separate multiple queries with commas.
              </p>
            </div>

            {/* LOCATION */}

            <div>
              <label className="mb-2 block text-sm font-medium text-[#334155]">
                Location
              </label>

              <input
                value={location}
                onChange={(event) =>
                  setLocation(
                    event.target.value
                  )
                }
                placeholder="e.g. Bangladesh"
                className="w-full rounded-xl border border-[#CBD5E1] px-4 py-3 text-sm outline-none focus:border-[#1877F2]"
              />
            </div>

            {/* MAX RESULTS */}

            <div>
              <label className="mb-2 block text-sm font-medium text-[#334155]">
                Maximum Posts
              </label>

              <input
                type="number"
                min={1}
                max={500}
                value={maxResults}
                onChange={(event) =>
                  setMaxResults(
                    Number(
                      event.target.value
                    )
                  )
                }
                className="w-full rounded-xl border border-[#CBD5E1] px-4 py-3 text-sm outline-none focus:border-[#1877F2]"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>{error}</span>
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() =>
                void handleAnalyze()
              }
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-3 py-2 font-['Poppins'] text-xs font-medium text-white transition hover:bg-[#0B625C]"
            >
              {loading ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Sparkles
                  size={18}
                />
              )}

              {loading
                ? "Analyzing..."
                : "Analyze Product"}
            </button>
          </div>

        </section>

        {/* RESULTS */}

        {result && analysis && (
          <div className="mt-6 space-y-6">
            {/* SUMMARY */}

            <section className="grid gap-4 md:grid-cols-4">
              {/* POSTS */}

              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
                <p className="text-sm text-[#64748B]">
                  Posts Found
                </p>

                <p className="mt-2 text-3xl font-bold text-[#0F172A]">
                  {result.data.totalPosts}
                </p>
              </div>

              {/* POSITIVE */}

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-sm text-emerald-700">
                  Positive
                </p>

                <p className="mt-2 text-3xl font-bold text-emerald-700">
                  {
                    analysis
                      .overallSentiment
                      .positive
                  }
                  %
                </p>
              </div>

              {/* NEUTRAL */}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-700">
                  Neutral
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-700">
                  {
                    analysis
                      .overallSentiment
                      .neutral
                  }
                  %
                </p>
              </div>

              {/* NEGATIVE */}

              <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                <p className="text-sm text-red-700">
                  Negative
                </p>

                <p className="mt-2 text-3xl font-bold text-red-700">
                  {
                    analysis
                      .overallSentiment
                      .negative
                  }
                  %
                </p>
              </div>
            </section>

            {/* FEEDBACK */}

            <section className="grid gap-6 lg:grid-cols-2">
              {/* POSITIVE */}

              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <ThumbsUp
                      size={19}
                    />
                  </div>

                  <div>
                    <h2 className="font-semibold text-[#0F172A]">
                      Common Positive Feedback
                    </h2>

                    <p className="text-xs text-[#64748B]">
                      What people liked
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  {analysis
                    .commonPositiveFeedback
                    .length ? (
                    analysis.commonPositiveFeedback.map(
                      (item, index) => (
                        <div
                          key={`${item}-${index}`}
                          className="flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
                        >
                          <CheckCircle2
                            size={16}
                            className="mt-0.5 shrink-0"
                          />

                          <span>
                            {item}
                          </span>
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-sm text-[#94A3B8]">
                      No clear positive themes found.
                    </p>
                  )}
                </div>
              </div>

              {/* NEGATIVE */}

              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                    <AlertCircle
                      size={19}
                    />
                  </div>

                  <div>
                    <h2 className="font-semibold text-[#0F172A]">
                      Common Negative Feedback
                    </h2>

                    <p className="text-xs text-[#64748B]">
                      Problems and complaints
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  {analysis
                    .commonNegativeFeedback
                    .length ? (
                    analysis.commonNegativeFeedback.map(
                      (item, index) => (
                        <div
                          key={`${item}-${index}`}
                          className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
                        >
                          <AlertCircle
                            size={16}
                            className="mt-0.5 shrink-0"
                          />

                          <span>
                            {item}
                          </span>
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-sm text-[#94A3B8]">
                      No clear negative themes found.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* QUESTIONS + INSIGHTS */}

            <section className="grid gap-6 lg:grid-cols-2">
              {/* QUESTIONS */}

              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <HelpCircle
                      size={19}
                    />
                  </div>

                  <div>
                    <h2 className="font-semibold text-[#0F172A]">
                      Customer Questions
                    </h2>

                    <p className="text-xs text-[#64748B]">
                      Questions found in post text
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  {analysis.customerQuestions
                    .length ? (
                    analysis.customerQuestions.map(
                      (question, index) => (
                        <div
                          key={`${question}-${index}`}
                          className="flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800"
                        >
                          <MessageCircle
                            size={16}
                            className="mt-0.5 shrink-0"
                          />

                          <span>
                            {question}
                          </span>
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-sm text-[#94A3B8]">
                      No customer questions found
                      in the collected posts.
                    </p>
                  )}
                </div>
              </div>

              {/* INSIGHTS */}

              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                    <Sparkles
                      size={19}
                    />
                  </div>

                  <div>
                    <h2 className="font-semibold text-[#0F172A]">
                      Key Insights
                    </h2>

                    <p className="text-xs text-[#64748B]">
                      AI-generated observations
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  {analysis.keyInsights
                    .length ? (
                    analysis.keyInsights.map(
                      (item, index) => (
                        <div
                          key={`${item}-${index}`}
                          className="rounded-lg bg-purple-50 px-3 py-2 text-sm text-purple-800"
                        >
                          {item}
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-sm text-[#94A3B8]">
                      No additional insights found.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* POSTS TABLE */}

            <section className="rounded-2xl border border-[#E2E8F0] bg-white">
              <div className="border-b border-[#E2E8F0] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-[#0F172A]">
                      Facebook Posts
                    </h2>

                    <p className="mt-1 text-xs text-[#64748B]">
                      Public posts collected for{" "}
                      <span className="font-medium text-[#334155]">
                        {result.data.productQuery}
                      </span>
                    </p>
                  </div>

                  <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-medium text-[#2563EB]">
                    {result.data.totalPosts} posts
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left">
                  <thead className="bg-[#F8FAFC]">
                    <tr className="border-b border-[#E2E8F0]">
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                        #
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                        Post
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                        Sentiment
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                        Engagement
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                        Facebook
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {result.data.posts.map(
                      (
                        post: ProductInsightPost,
                        index
                      ) => {
                        const config =
                          sentimentConfig[
                            post.sentiment
                          ];

                        const Icon =
                          config.icon;

                        return (
                          <tr
                            key={
                              post.postId
                            }
                            className="border-b border-[#F1F5F9] align-top last:border-0 hover:bg-[#FAFCFF]"
                          >
                            <td className="px-5 py-4 text-sm text-[#64748B]">
                              {index + 1}
                            </td>

                            <td className="max-w-[600px] px-5 py-4">
                              <div className="mb-1 text-sm font-semibold text-[#334155]">
                                {post.author}
                              </div>

                              <p className="line-clamp-4 text-sm leading-6 text-[#64748B]">
                                {post.text}
                              </p>

                              {post.publishedAt && (
                                <p className="mt-2 text-xs text-[#94A3B8]">
                                  {new Date(
                                    post.publishedAt
                                  ).toLocaleDateString()}
                                </p>
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}
                              >
                                <Icon
                                  size={14}
                                />

                                {
                                  config.label
                                }
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="space-y-2 text-xs text-[#64748B]">
                                <div className="flex items-center gap-2">
                                  <Heart
                                    size={14}
                                  />

                                  {formatNumber(
                                    post.reactions
                                  )}{" "}
                                  reactions
                                </div>

                                <div className="flex items-center gap-2">
                                  <MessageCircle
                                    size={14}
                                  />

                                  {formatNumber(
                                    post.comments
                                  )}{" "}
                                  comments
                                </div>

                                <div className="flex items-center gap-2">
                                  <Share2
                                    size={14}
                                  />

                                  {formatNumber(
                                    post.shares
                                  )}{" "}
                                  shares
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex flex-col gap-2">
                                <a
                                  href={
                                    post.postUrl
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-[#1877F2] px-3 py-2 text-xs font-semibold text-white hover:bg-[#166FE5]"
                                >
                                  <ExternalLink
                                    size={14}
                                  />

                                  View Post
                                </a>

                                <button
                                  type="button"
                                  onClick={() =>
                                    void copyUrl(
                                      post.postUrl
                                    )
                                  }
                                  className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-[#64748B] hover:text-[#1877F2]"
                                >
                                  {copiedUrl ===
                                  post.postUrl ? (
                                    <Check
                                      size={14}
                                    />
                                  ) : (
                                    <Copy
                                      size={14}
                                    />
                                  )}

                                  {copiedUrl ===
                                  post.postUrl
                                    ? "Copied"
                                    : "Copy URL"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              {!result.data.posts.length && (
                <div className="p-10 text-center">
                  <Search
                    size={30}
                    className="mx-auto text-[#CBD5E1]"
                  />

                  <p className="mt-3 text-sm font-medium text-[#475569]">
                    No relevant Facebook posts found.
                  </p>

                  <p className="mt-1 text-xs text-[#94A3B8]">
                    Try a different product name or
                    broader search query.
                  </p>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}