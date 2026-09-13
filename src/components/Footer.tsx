"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

const shopLinks = [
  {
    label: "All Products",
    href: "/shop",
  },
  {
    label: "Deals of the Day",
    href: "/deals",
  },
  {
    label: "New Arrivals",
    href: "/new-arrivals",
  },

];

const customerLinks = [


  {
    label: "Returns & Refunds",
    href: "/returns",
  },
  {
    label: "FAQs",
    href: "/faqs",
  },
  {
    label: "Contact Us",
    href: "/contact",
  },
];

const companyLinks = [
  {
    label: "About Us",
    href: "/about",
  },
  {
    label: "Privacy Policy",
    href: "/privacy-policy",
  },
  {
    label: "Terms & Conditions",
    href: "/terms",
  },
  {
    label: "Cookie Policy",
    href: "/cookie-policy",
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-[#E8EEEE] bg-white">

      {/* =====================================================
          MAIN FOOTER
      ====================================================== */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">

        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5 lg:gap-10">

          {/* =================================================
              BRAND
          ================================================== */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F766E]">
                <ShoppingBag
                  size={21}
                  strokeWidth={2}
                  className="text-[#FF6B6B]"
                />
              </div>

              <div>
                <h2 className="font-['Poppins'] text-base font-bold leading-4 text-[#1E293B]">
                  Shopora
                </h2>

                <p className="font-['Poppins'] text-[6px] text-[#94A3B8]">
                  Smart Shopping, Made Simple
                </p>
              </div>
            </Link>

            {/* Description */}
            <p className="mt-5 max-w-47.5 font-['Poppins'] text-[14px] leading-5 text-[#64748B]">
              Your one-stop destination for smart, secure and simple online
              shopping.
            </p>

          </div>

          {/* =================================================
              SHOP
          ================================================== */}
          <div>

            <h3 className="font-['Poppins'] text-xs font-semibold text-[#1E293B] sm:text-sm">
              Shop
            </h3>

            <ul className="mt-4 space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-['Poppins'] text-[14px] text-[#64748B] transition-colors duration-300 hover:text-[#0F766E]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

          </div>

          {/* =================================================
              CUSTOMER SERVICE
          ================================================== */}
          <div>

            <h3 className="font-['Poppins'] text-xs font-semibold text-[#1E293B] sm:text-sm">
              Customer Service
            </h3>

            <ul className="mt-4 space-y-2.5">
              {customerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-['Poppins'] text-[14px] text-[#64748B] transition-colors duration-300 hover:text-[#0F766E]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

          </div>

          {/* =================================================
              COMPANY
          ================================================== */}
          <div>

            <h3 className="font-['Poppins'] text-xs font-semibold text-[#1E293B] sm:text-sm">
              Company
            </h3>

            <ul className="mt-4 space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-['Poppins'] text-[14px] text-[#64748B] transition-colors duration-300 hover:text-[#0F766E]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

          </div>

          {/* =================================================
              SECURE PAYMENTS
          ================================================== */}
          <div>

            <h3 className="font-['Poppins'] text-xs font-semibold text-[#1E293B] sm:text-sm">
              Secure Payments
            </h3>

            {/* Payment Methods */}
            <div className="mt-4 flex flex-wrap gap-2">

              {/* VISA */}
              <div className="flex h-8 w-12 items-center justify-center rounded-md border border-[#E8EEEE] bg-[#F8FAFC]">
                <span className="font-['Poppins'] text-[10px] font-bold italic text-[#2563EB]">
                  VISA
                </span>
              </div>

              {/* Mastercard */}
              <div className="flex h-8 w-12 items-center justify-center rounded-md border border-[#E8EEEE] bg-[#F8FAFC]">
                <div className="flex items-center">
                  <span className="h-3 w-5 rounded-full bg-[#EB001B]" />
                  <span className="-ml-2 h-3 w-5 rounded-full bg-[#F79E1B] opacity-90" />
                </div>
              </div>

              {/* PayPal */}
              <div className="flex h-8 w-12 items-center justify-center rounded-md border border-[#E8EEEE] bg-[#F8FAFC]">
                <span className="font-['Poppins'] text-[8px] font-bold italic text-[#0070BA]">
                  PayPal
                </span>
              </div>

              {/* Stripe */}
              <div className="flex h-8 w-12 items-center justify-center rounded-md border border-[#E8EEEE] bg-[#F8FAFC]">
                <span className="font-['Poppins'] text-[9px] font-bold text-[#635BFF]">
                  stripe
                </span>
              </div>

            </div>

            {/* Security Text */}
            <p className="mt-4 max-w-47.5 font-['Poppins'] text-[14px] leading-5 text-[#64748B]">
              We protect your payment information with industry-leading
              security.
            </p>

          </div>

        </div>
      </div>

      {/* =====================================================
          BOTTOM COPYRIGHT
      ====================================================== */}
      <div className="border-t border-[#E8EEEE]">

        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-4 sm:px-6 lg:px-8">

          <p className="font-['Poppins'] text-[10px] text-[#94A3B8] md:text-[12px]">
            © 2026 Shopora. All rights reserved.
          </p>

        </div>

      </div>

    </footer>
  );
};

export default Footer;