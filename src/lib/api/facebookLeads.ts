import { apiPost } from "@/lib/core/server";

export type FacebookSearchType =
  | "people"
  | "pages"
  | "places"
  | "events"
  | "posts"
  | "videos"
  | "top";

export interface FacebookLeadSearchInput {
  searchType: FacebookSearchType;
  searchQueries: string[];
  locationUid?: string;
  maxItems: number;
}

export interface FacebookLead {
  rowType?: string;
  id?: string;
  name?: string;
  url?: string;
  profilePicture?: string;
  isVerified?: boolean;
  subtitle?: string;
  description?: string;
  website?: string;
  locationDescriptor?: string;
  text?: string;
  authorName?: string;
  authorId?: string;
  authorUrl?: string;
  postUrl?: string;
  creationTime?: string;
  query?: string;
  searchType?: string;
  locationUid?: string;
}

export interface FacebookLeadSearchResponse {
  success: boolean;
  message: string;
  data: FacebookLead[];
}

export const searchFacebookLeads = async (
  data: FacebookLeadSearchInput
): Promise<FacebookLeadSearchResponse> => {
  return apiPost<FacebookLeadSearchResponse>(
    "/api/v1/seller/facebook-leads",
    data
  );
};