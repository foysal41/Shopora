import { apiPost } from "@/lib/core/server";

export interface InstagramEmailSearchInput {
  keywords: string[];
  location?: string;
  customDomains?: string[];
  maxEmails?: number;
  excludeWords?: string[];
}

export interface InstagramEmailLead {
  email?: string;
  title?: string;
  description?: string;
  url?: string;
  keyword?: string;
  location?: string;

  [key: string]: unknown;
}

export interface InstagramEmailSearchMeta {
  total: number;
  keywords: string[];
  location: string | null;
  customDomains: string[];
  maxEmails: number;
  excludeWords: string[];
}

export interface InstagramEmailSearchResponse {
  success: boolean;
  message: string;
  data: InstagramEmailLead[];
  meta?: InstagramEmailSearchMeta;
}

export const searchInstagramEmails = async (
  data: InstagramEmailSearchInput
): Promise<InstagramEmailSearchResponse> => {
  return apiPost<InstagramEmailSearchResponse>(
    "/api/v1/seller/instagram-email-leads",
    data
  );
};