import {
  ShieldCheck,
  RotateCcw,
  BadgeCheck,
  Box,
  BrainCircuit,
  Truck,
} from "lucide-react";
import Link from "next/link";

const Hero = () => {
  const features = [
    {
      icon: Box,
      title: "Wide Selection",
      description: "Millions of products across all categories",
      color: "text-[#0F766E]",
      bg: "bg-[#E8F5F3]",
    },
    {
      icon: BrainCircuit,
      title: "AI Powered",
      description: "Smart recommendations just for you",
      color: "text-[#FF6B6B]",
      bg: "bg-[#FFF0F0]",
    },
    {
      icon: ShieldCheck,
      title: "Secure Checkout",
      description: "Safe & secure payments you can trust",
      color: "text-[#0F766E]",
      bg: "bg-[#E8F5F3]",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Quick and reliable shipping",
      color: "text-[#FF6B6B]",
      bg: "bg-[#FFF0F0]",
    },

  ];

  return (
    <section className="bg-[#F6FAF9]  pt-8  sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Hero */}
        <div className="grid min-h-130 items-center gap-10 overflow-hidden rounded-3xl px-6 py-10 sm:px-10 lg:grid-cols-2 lg:px-16 lg:py-12">
          {/* Left Content */}
          <div className="relative z-10 max-w-xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#E8F5F3] px-4 py-2 text-xs font-medium text-[#0F766E]">
              <BrainCircuit size={15} />
              AI-Powered Shopping
            </span>

            <h1 className="font-['Poppins'] text-4xl font-bold leading-[1.15] tracking-tight text-[#1E293B] sm:text-5xl lg:text-[52px]">
              Smart Shopping,
              <br />
              <span className="text-[#FF6B6B]">Made Simple</span>
            </h1>

            <p className="mt-5 max-w-lg font-['Poppins'] text-sm leading-6 text-[#64748B] sm:text-base">
              Discover products you love with AI-powered recommendations and a
              seamless shopping experience.
            </p>

            {/* CTA */}
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/shop`}>
              <button className="w-full cursor-pointer rounded-lg bg-[#0F766E] px-7 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0B625B] hover:shadow-lg sm:w-auto">
                Shop Now
              </button>
              </Link>


              <Link href={`/contact`}>
              <button className="w-full cursor-pointer rounded-lg border border-[#FF6B6B] bg-white px-7 py-3 text-sm font-semibold text-[#FF6B6B] transition-all duration-300 hover:bg-[#FF6B6B] hover:text-white sm:w-auto">
                Contact us
              </button>
              </Link>
            </div>

            {/* Trust Points */}
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 ">
              <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <ShieldCheck size={15} className="text-[#0F766E]" />
                Secure Payments
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <RotateCcw size={15} className="text-[#FF6B6B]" />
                Easy Returns
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <BadgeCheck size={15} className="text-[#FF6B6B]" />
                100% Authentic
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative flex min-h-95 items-center justify-center">
            {/* Background blobs */}
            <div className="absolute right-5 top-5 h-64 w-64 rounded-full bg-[#DDF2EF] blur-[1px]" />
            <div className="absolute bottom-5 left-10 h-40 w-40 rounded-full bg-[#E8F5F3]" />

            {/* Decorative circles */}
            <div className="absolute left-10 top-16 h-5 w-5 rounded-full bg-[#8DD6CE]" />
            <div className="absolute right-8 top-20 h-4 w-4 rounded-full bg-[#C8EAE6]" />
            <div className="absolute bottom-14 right-24 h-3 w-3 rounded-full bg-[#8DD6CE]" />

            {/* Plant */}
            <div className="absolute bottom-14 left-8 hidden sm:block ">
              <div className="relative h-28 w-20">
                <div className="absolute bottom-0 left-4 h-16 w-12 rounded-b-xl rounded-t-md bg-white shadow-md" />
                <div className="absolute bottom-14 left-9 h-20 w-1.5 rotate-[-8deg] bg-[#0F766E]" />

                <div className="absolute bottom-20 left-0 h-10 w-5 rotate-[-35deg] rounded-full rounded-br-none bg-[#6DBE76]" />
                <div className="absolute bottom-24 left-9 h-10 w-5 rotate-35 rounded-full rounded-bl-none bg-[#79C982]" />
                <div className="absolute bottom-28 left-2 h-8 w-4 rotate-[-20deg] rounded-full rounded-br-none bg-[#4FAE67]" />
              </div>
            </div>

            {/* Shopping Bag */}
            <div className="absolute bottom-16 left-1/4 hidden sm:block">
              <div className="relative">
                {/* Handle */}
                <div className="mx-auto h-12 w-14 rounded-t-full border-4 border-b-0 border-[#0F766E]" />

                {/* Bag */}
                <div className="flex h-28 w-28 items-center justify-center rounded-b-2xl rounded-t-md bg-[#0F766E] shadow-xl">
                  <span className="text-5xl font-bold text-[#FF6B6B]">S</span>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="relative z-20 h-75 w-37.5 rotate-[4deg] rounded-[28px] border-[6px] border-[#1E293B] bg-white shadow-2xl sm:h-85 sm:w-42.5">
              {/* Notch */}
              <div className="absolute left-1/2 top-1 z-30 h-5 w-16 -translate-x-1/2 rounded-full bg-[#1E293B]" />

              {/* Screen */}
              <div className="h-full overflow-hidden rounded-[21px] bg-white pt-7">
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-1">
                    <div className="flex h-4 w-4 items-center justify-center rounded bg-[#0F766E]">
                      <span className="text-[8px] font-bold text-white">S</span>
                    </div>

                    <span className="text-[9px] font-bold text-[#1E293B]">
                      Shopora
                    </span>
                  </div>

                  <span className="text-[10px] text-gray-400">⌕</span>
                </div>

                {/* Featured */}
                <div className="px-3">
                  <p className="mt-2 text-[9px] font-semibold text-[#1E293B]">
                    Featured
                  </p>

                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-[#F1F5F4] p-2">
                      <div className="flex h-16 items-center justify-center rounded-md bg-white">
                        <span className="text-xl">🎧</span>
                      </div>
                      <p className="mt-1 text-[7px] font-medium">Headphones</p>
                      <p className="text-[7px] text-[#0F766E]">$49.99</p>
                    </div>

                    <div className="rounded-lg bg-[#F1F5F4] p-2">
                      <div className="flex h-16 items-center justify-center rounded-md bg-white">
                        <span className="text-xl">⌚</span>
                      </div>
                      <p className="mt-1 text-[7px] font-medium">Smart Watch</p>
                      <p className="text-[7px] text-[#0F766E]">$79.99</p>
                    </div>
                  </div>

                  <p className="mt-3 text-[9px] font-semibold text-[#1E293B]">
                    Recommended
                  </p>

                  <div className="mt-2 flex gap-2">
                    <div className="h-14 flex-1 rounded-lg bg-[#E8F5F3]" />
                    <div className="h-14 flex-1 rounded-lg bg-[#FFF0F0]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Shopping Cart */}
            <div className="absolute bottom-10 right-3 z-30 hidden sm:block">
              {/* Cart basket */}
              <div className="relative h-20 w-28 -skew-x-6 rounded-b-xl rounded-t-md bg-[#FF6B6B] shadow-lg">
                <div className="absolute left-2 right-2 top-3 h-1 rounded-full bg-[#F04F4F]" />
                <div className="absolute left-4 top-6 h-1 w-20 bg-[#F04F4F]" />
                <div className="absolute left-4 top-11 h-1 w-20 bg-[#F04F4F]" />
              </div>

              {/* Cart handle */}
              <div className="absolute -left-5 -top-4 h-6 w-12 border-b-[5px] border-l-[5px] border-[#FF6B6B]" />

              {/* Wheels */}
              <div className="absolute -bottom-5 left-4 h-6 w-6 rounded-full bg-[#1E293B]" />
              <div className="absolute -bottom-5 right-3 h-6 w-6 rounded-full bg-[#1E293B]" />
            </div>
          </div>
        </div>

        {/* Slider Dots */}
        <div className="flex justify-center gap-1.5 pb-5">
          <span className="h-1.5 w-7 rounded-full bg-[#0F766E]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#CBD5E1]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#CBD5E1]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#CBD5E1]" />
        </div>

        {/* Feature Cards */}
        <div className="relative mx-2 z-30 -mb-10 grid grid-cols-2 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-lg sm:grid-cols-3 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className={`group flex flex-col items-center px-4 py-6 text-center transition-all duration-300 hover:bg-[#F6FAF9] ${
                  index !== features.length - 1
                    ? "border-b border-[#E2E8F0] sm:border-r"
                    : ""
                }`}
              >
                <div
                  className={`mb-3 flex h-11 w-11 items-center justify-center rounded-full ${feature.bg}`}
                >
                  <Icon size={21} className={feature.color} />
                </div>

                <h3 className="font-['Poppins'] text-xs font-semibold text-[#1E293B] sm:text-sm">
                  {feature.title}
                </h3>

                <p className="mt-1 max-w-37.5 font-['Poppins'] text-[12px] leading-4 text-[#94A3B8] md:text-[13px]">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Hero;
