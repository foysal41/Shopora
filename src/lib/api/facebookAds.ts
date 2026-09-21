import { apiPost } from "@/lib/core/server";

export interface FacebookAd {
  facebookUrl?: string | null;
  inputUrl?: string | null;

  totalCount?: number | null;

  pageID?: string | null;
  pageId?: string | null;
  pageName?: string | null;

  adArchiveID?: string | null;
  adArchiveId?: string | null;
  adId?: string | null;

  startDateFormatted?: string | null;
  endDateFormatted?: string | null;

  isActive?: boolean | null;

  currency?: string | null;

  spend?: unknown;
  reachEstimate?: unknown;
  impressions?: unknown;

  publisherPlatform?: string[] | null;

  targetedOrReachedCountries?: string[] | null;

  snapshot?: {
    title?: string | null;

    body?: {
      text?: string | null;
    } | null;

    caption?: string | null;

    ctaText?: string | null;

    ctaType?: string | null;

    linkUrl?: string | null;

    linkDescription?: string | null;

    displayFormat?: string | null;

    images?: Array<{
      originalImageUrl?: string;
      resizedImageUrl?: string;
    }> | null;

    videos?: Array<{
      videoPreviewImageUrl?: string;
      videoHdUrl?: string;
    }> | null;

    cards?: unknown[] | null;
  } | null;

  ad_details?: unknown;

  pageInfo?: unknown;

  error?: string | null;
  errorDescription?: string | null;
}

export interface FacebookAdsRequest {
  url: string;
  activeStatus: "active" | "inactive";
  resultsLimit: number;
  includeAboutPage: boolean;
  isDetailsPerAd: boolean;
}

export interface FacebookAdsResponse {
  success: boolean;
  message: string;
  data: FacebookAd[];
}

export const scrapeFacebookAds = async (
  data: FacebookAdsRequest
) => {
  return apiPost<FacebookAdsResponse>(
    "/api/v1/seller/marketing/facebook-ads",
    data
  );
};