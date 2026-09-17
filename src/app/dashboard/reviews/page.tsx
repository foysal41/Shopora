"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare, Package, Star } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import {
  getCustomerReviews,
  type ProductReview,
} from "@/lib/api/reviews";

type CustomerReview = ProductReview & {
  productName?: string;
  productImage?: string | null;
};

const ReviewsPage = () => {
  const { data: session, isPending } = useSession();
  const customerId = session?.user?.id;
  const sessionToken = session?.session?.token;
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!customerId) {
      return;
    }

    const loadReviews = async () => {
      try {
        setLoading(true);
        setError("");
        setReviews(
          (await getCustomerReviews(customerId, sessionToken)) as CustomerReview[],
        );
      } catch (err) {
        console.error("CUSTOMER REVIEWS FETCH ERROR:", err);
        setError(err instanceof Error ? err.message : "Unable to load reviews");
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [customerId, isPending, sessionToken]);

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <p className="font-['Poppins'] text-sm text-[#64748B]">Loading reviews...</p>
      </main>
    );
  }

  if (!customerId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-5">
        <div className="text-center">
          <MessageSquare className="mx-auto text-[#0F766E]" size={32} />
          <h1 className="mt-3 font-['Poppins'] text-xl font-semibold text-[#1E293B]">Sign in to see your reviews</h1>
          <Link href="/auth/login" className="mt-4 inline-flex rounded-lg bg-[#0F766E] px-4 py-2 font-['Poppins'] text-sm font-medium text-white">Sign in</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-3 py-5 sm:px-5 md:px-6 lg:px-7 xl:px-8">
      <div className="mb-6">
        <h1 className="font-['Poppins'] text-xl font-semibold text-[#0F172A]">My Reviews</h1>
        <p className="mt-1 font-['Poppins'] text-sm text-[#64748B]">See the products you reviewed and exactly what you shared.</p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-[#E8EEEE] bg-white py-16 text-center font-['Poppins'] text-sm text-[#64748B]">Loading your reviews...</div>
      ) : error ? (
        <div className="rounded-xl border border-red-100 bg-white py-16 text-center font-['Poppins'] text-sm text-red-500">{error}</div>
      ) : reviews.length === 0 ? (
        <div className="rounded-xl border border-[#E8EEEE] bg-white px-5 py-16 text-center">
          <MessageSquare className="mx-auto text-[#94A3B8]" size={34} />
          <p className="mt-3 font-['Poppins'] text-sm text-[#64748B]">You have not reviewed any products yet.</p>
          <Link href="/shop" className="mt-4 inline-flex rounded-lg bg-[#0F766E] px-4 py-2 font-['Poppins'] text-sm font-medium text-white">Browse products</Link>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-xl border border-[#E8EEEE] bg-white p-4 sm:p-5">
              <div className="flex gap-4">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F8FAFC]">
                  {review.productImage ? <Image src={review.productImage} alt={review.productName || "Reviewed product"} fill sizes="80px" className="object-contain p-1" /> : <Package size={25} className="text-[#94A3B8]" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-['Poppins'] text-base font-semibold text-[#1E293B]">{review.productName || "Product"}</h2>
                  <div className="mt-2 flex items-center gap-1 text-[#FFB020]" aria-label={`${review.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={17} fill={star <= review.rating ? "currentColor" : "none"} />)}
                    <span className="ml-1 font-['Poppins'] text-xs font-medium text-[#64748B]">{review.rating}/5</span>
                  </div>
                  <p className="mt-1 font-['Poppins'] text-xs text-[#94A3B8]">Reviewed {new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-[#F8FAFC] px-3 py-3">
                <p className="font-['Poppins'] text-sm leading-6 text-[#475569]">“{review.comment}”</p>
              </div>
              {review.productId && <Link href={`/products/${review.productId}`} className="mt-3 inline-flex font-['Poppins'] text-sm font-medium text-[#0F766E] hover:underline">View product</Link>}
            </article>
          ))}
        </div>
      )}
    </main>
  );
};

export default ReviewsPage;