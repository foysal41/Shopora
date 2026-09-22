import { apiPost } from "@/lib/core/server";

export interface TikTokEmailSearchInput {
  keywords: string[];
  location?: string;
  customDomains?: string[];
  maxEmails?: number;
  excludeWords?: string[];
}

export interface TikTokEmailLead {
  network?: string;
  keyword?: string;
  title?: string;
  description?: string;
  url?: string;
  email?: string;

  [key: string]: unknown;
}

export interface TikTokEmailSearchMeta {
  total: number;
  keywords: string[];
  location: string | null;
  customDomains: string[];
  maxEmails: number;
  excludeWords: string[];
}

export interface TikTokEmailSearchResponse {
  success: boolean;
  message: string;
  data: TikTokEmailLead[];
  meta?: TikTokEmailSearchMeta;
}

export const searchTikTokEmails = async (
  data: TikTokEmailSearchInput
): Promise<TikTokEmailSearchResponse> => {
  return apiPost<TikTokEmailSearchResponse>(
    "/api/v1/seller/tiktok-email-leads",
    data
  );
};