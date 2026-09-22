import { apiPost } from "@/lib/core/server";

export type ProductInsightSentiment =
  | "positive"
  | "negative"
  | "neutral";

export interface ProductInsightsInput {
  productQuery: string;
  searchQueries?: string[];
  location?: string;
  maxResults?: number;
  dateFrom?: string;
  dateTo?: string;
  minReactions?: number;
  minComments?: number;
  minShares?: number;
}

export interface ProductInsightPost {
  postId: string;
  postUrl: string;
  author: string;
  publishedAt: string | null;
  text: string;

  sentiment: ProductInsightSentiment;

  reactions: number;
  comments: number;
  shares: number;

  reactionBreakdown: {
    like?: number;
    love?: number;
    care?: number;
    haha?: number;
    wow?: number;
    sad?: number;
    angry?: number;
  };

  keyword: string | null;
}

export interface ProductInsightsAnalysis {
  overallSentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };

  commonPositiveFeedback: string[];

  commonNegativeFeedback: string[];

  customerQuestions: string[];

  keyInsights: string[];

  analyzedPosts: Array<{
    postId: string;
    sentiment: ProductInsightSentiment;
  }>;
}

export interface ProductInsightsResponse {
  success: boolean;
  message: string;

  data: {
    productQuery: string;
    searchQueries: string[];
    totalPosts: number;

    analysis: ProductInsightsAnalysis;

    posts: ProductInsightPost[];
  };
}

export const analyzeProductInsights =
  async (
    data: ProductInsightsInput
  ): Promise<ProductInsightsResponse> => {
    return apiPost<ProductInsightsResponse>(
      "/api/v1/seller/product-insights",
      data
    );
  };