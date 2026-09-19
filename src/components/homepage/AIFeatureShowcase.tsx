
'use client';

import { AIFeature } from "@/type/homePage";
import Image from "next/image";
import React from "react";

const aiFeatures: AIFeature[] = [
  {
    id: "ai-shopping-assistant",
    title: "AI-Powered\nShopping Assistant",
    description: "Find the perfect products with natural conversation",
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=700&q=80",
    cta: "Chat Now",
  },
  {
    id: "visual-search",
    title: "Visual Search",
    description: "Upload an image and find similar products",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=80",
    cta: "Try Visual Search",
  },
];

const AIFeatureShowcase = () => {
  return (
    <section className="bg-white px-4 py-15 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          {aiFeatures.map((feature, index) => (
            <div
              key={feature.id}
              className={`group relative h-52 overflow-hidden rounded-xl sm:h-56 ${
                index === 0 ? "bg-[#E8F5F3]" : "bg-[#FFF0EB]"
              }`}
            >
              {/* Content */}
              <div className="relative z-10 flex h-full w-[55%] flex-col justify-center px-5 sm:w-[53%] sm:px-7">

                <h2
                  className={`whitespace-pre-line font-['Poppins'] text-base font-semibold leading-6 md:text-lg sm:leading-7 ${
                    index === 0
                      ? "text-[#0F766E]"
                      : "text-[#FF6B6B]"
                  }`}
                >
                  {feature.title}
                </h2>

                <p className="mt-2 max-w-57.5 font-['Poppins'] text-[10px] leading-4 text-[#475569] md:text-[16px] sm:leading-5">
                  {feature.description}
                </p>

                {/* CTA */}
                <button
                  type="button"
                  onClick={() => {
                    if (feature.id === "ai-shopping-assistant") {
                      window.dispatchEvent(new CustomEvent("open-shopora-assistant"));
                    }

                    if (feature.id === "visual-search") {
                      window.dispatchEvent(new CustomEvent("open-visual-search"));
                    }
                  }}
                  className={`mt-4 w-fit cursor-pointer rounded-md px-4 py-2 font-['Poppins'] text-[12px] md:text-[16px]  font-medium text-white transition-all duration-300 hover:-translate-y-0.5 sm:px-5 sm:py-2.5  ${
                    index === 0
                      ? "bg-[#0F766E] hover:bg-[#0B625B]"
                      : "bg-[#FF6B6B] hover:bg-[#F05454]"
                  }`}
                >
                  {feature.cta}
                </button>
              </div>

              {/* Image */}
              <div className="absolute right-0 top-0 h-full w-[48%] overflow-hidden">
                <Image
                  src={feature.image}
                  alt={feature.title.replace("\n", " ")}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />

                {/* Soft overlay */}
                <div
                  className={`absolute inset-0 ${
                    index === 0
                      ? "bg-linear-to-r from-[#E8F5F3] via-transparent to-transparent"
                      : "bg-linear-to-r from-[#FFF0EB] via-transparent to-transparent"
                  }`}
                />
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default AIFeatureShowcase;