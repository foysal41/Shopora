"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Mail,
  Phone,
  Clock3,
  MessageCircle,
  ShieldCheck,
  RefreshCcw,
  Truck,
  Headphones,
  Package,
  ArrowUpRight,
  Send,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* =========================================================
   CONTACT INFORMATION
========================================================= */

const contactInformation = [
  {
    icon: MapPin,
    title: "Our Address",
    value: "Shopora Center",
    description: "123 Commerce Street, Suite 500",
    secondLine: "Dhaka, Bangladesh",
  },
  {
    icon: Mail,
    title: "Email Us",
    value: "info@shopora.com",
    description: "support@shopora.com",
  },
  {
    icon: Phone,
    title: "Call Us",
    value: "+880 1234-567890",
    description: "Mon - Fri, 9AM - 6PM",
  },
  {
    icon: Clock3,
    title: "Business Hours",
    value: "Sunday - Thursday · 9AM - 6PM",
    description: "Friday - Closed",
  },
];

/* =========================================================
   FEATURES
========================================================= */

const features = [
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Safe & secure payment",
  },
  {
    icon: RefreshCcw,
    title: "Easy Returns",
    description: "Hassle-free returns",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Quick & reliable shipping",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "We're here to help",
  },
  {
    icon: Package,
    title: "100% Authentic",
    description: "Genuine products guaranteed",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

const ContactUs = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    orderNumber: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("Contact Form Data:", formData);

    // Backend API can be connected here later.

    setFormData({
      fullName: "",
      email: "",
      subject: "",
      orderNumber: "",
      message: "",
    });
  };

  return (
    <section className="bg-white px-4 py-8 sm:px-6 md:py-12 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            BREADCRUMB
        ====================================================== */}

        <div className="mb-7 flex items-center gap-2 font-['Poppins'] text-[14px] text-[#94A3B8]">
          <Link
            href="/"
            className="transition-colors hover:text-[#0F766E]"
          >
            Home
          </Link>

          <span>/</span>

          <span className="text-[#64748B]">
            Contact Us
          </span>
        </div>

        {/* =====================================================
            MAIN CONTACT SECTION
        ====================================================== */}

        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">

          {/* ===================================================
              LEFT SIDE
          =================================================== */}

          <div>

            {/* Heading */}

            <div className="mb-7">

              <div className="flex items-end gap-4">

                <div>

                  <p className="font-['Poppins'] text-[15px] font-semibold uppercase tracking-wide text-[#0F766E]">
                    Get In Touch
                  </p>

                  <h1 className="mt-2 font-['Poppins'] text-3xl font-bold leading-tight text-[#1E293B] sm:text-4xl lg:text-[40px]">
                    Contact Us
                  </h1>

                </div>

                <div className="mb-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E8F5F3]">
                  <MessageCircle
                    size={25}
                    strokeWidth={1.8}
                    className="text-[#0F766E]"
                  />
                </div>

              </div>

              <p className="mt-4 max-w-xl font-['Poppins'] text-[16px] leading-7 text-[#64748B]">
                Have a question, suggestion, or need support?
                Our team is ready to assist you.
              </p>

            </div>

            {/* =================================================
                CONTACT VISUAL
            ================================================== */}

            <div className="relative mb-6 h-[270px] overflow-hidden rounded-2xl bg-[#EAF6F4]">

              {/* Decorative circles */}

              <div className="absolute -left-12 -top-12 h-44 w-44 rounded-full bg-white/50" />

              <div className="absolute -bottom-16 -right-12 h-52 w-52 rounded-full bg-white/40" />

              <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/30" />

              {/* Chat bubble */}

              <div className="absolute right-[14%] top-8 flex h-14 w-16 items-center justify-center rounded-2xl bg-[#46B5AD] shadow-md">

                <MessageCircle
                  size={29}
                  className="text-white"
                />

              </div>

              {/* Chat dots */}

              <div className="absolute right-[15.5%] top-[54px] flex gap-1">

                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                <span className="h-1.5 w-1.5 rounded-full bg-white" />

              </div>

              {/* Shopping Bag */}

              <div className="absolute bottom-8 left-[22%]">

                {/* Handle */}

                <div className="absolute -top-9 left-1/2 h-11 w-14 -translate-x-1/2 rounded-t-full border-[7px] border-b-0 border-[#0F766E]" />

                {/* Bag */}

                <div className="flex h-[125px] w-[105px] items-center justify-center rounded-b-2xl bg-[#0F766E] shadow-lg">

                  <span className="font-['Poppins'] text-[52px] font-bold text-[#FF6B6B]">
                    S
                  </span>

                </div>

              </div>

              {/* Plant */}

              <div className="absolute bottom-7 right-[23%]">

                {/* Pot */}

                <div className="relative mx-auto h-16 w-12 rounded-b-xl bg-[#B97850]">

                  <div className="absolute -top-1 left-1/2 h-2.5 w-14 -translate-x-1/2 rounded-full bg-[#A96743]" />

                </div>

                {/* Leaves */}

                <div className="absolute -left-8 bottom-8 h-11 w-7 rotate-[-35deg] rounded-full bg-[#78A96B]" />

                <div className="absolute -left-1 bottom-14 h-12 w-7 rotate-[-10deg] rounded-full bg-[#5F9760]" />

                <div className="absolute left-6 bottom-10 h-12 w-7 rotate-[30deg] rounded-full bg-[#79AA6A]" />

                <div className="absolute left-8 bottom-18 h-10 w-6 rotate-[35deg] rounded-full bg-[#65995F]" />

              </div>

              {/* Small Product Card */}

              <div className="absolute bottom-5 left-[7%] h-14 w-20 rounded-lg bg-white shadow-md" />

            </div>

            {/* =================================================
                CONTACT INFORMATION
            ================================================== */}

            <div className="overflow-hidden rounded-xl border border-[#E8EEEE] bg-white shadow-sm">

              {contactInformation.map((item, index) => (
                <ContactInfo
                  key={item.title}
                  icon={item.icon}
                  title={item.title}
                  value={item.value}
                  description={item.description}
                  secondLine={item.secondLine}
                  last={
                    index ===
                    contactInformation.length - 1
                  }
                />
              ))}

            </div>

          </div>

          {/* ===================================================
              RIGHT SIDE - FORM
          =================================================== */}

          <div className="rounded-xl border border-[#E8EEEE] bg-white p-6 shadow-sm sm:p-8">

            <div className="mb-7">

              <h2 className="font-['Poppins'] text-2xl font-bold text-[#1E293B]">
                Send us a message
              </h2>

              <p className="mt-2 font-['Poppins'] text-[16px] leading-6 text-[#94A3B8]">
                Fill out the form below and we&apos;ll get
                back to you as soon as possible.
              </p>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Full Name + Email */}

              <div className="grid gap-5 sm:grid-cols-2">

                <FormField
                  label="Full Name"
                  name="fullName"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />

                <FormField
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

              </div>

              {/* Subject */}

              <FormField
                label="Subject"
                name="subject"
                placeholder="How can we help you?"
                value={formData.subject}
                onChange={handleChange}
                required
              />

              {/* Order Number */}

              <FormField
                label="Order Number"
                name="orderNumber"
                placeholder="e.g. #SP123456"
                value={formData.orderNumber}
                onChange={handleChange}
              />

              {/* Message */}

              <div>

                <label className="mb-2 block font-['Poppins'] text-[15px] font-medium text-[#334155]">
                  Message{" "}
                  <span className="text-[#FF6B6B]">
                    *
                  </span>
                </label>

                <textarea
                  name="message"
                  required
                  rows={7}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  className="w-full resize-none rounded-lg border border-[#DDE5E5] bg-white px-4 py-3 font-['Poppins'] text-[15px] leading-6 text-[#1E293B] outline-none transition placeholder:text-[#A8B2BD] focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
                />

              </div>

              {/* Submit */}

              <button
                type="submit"
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#FF6B6B] px-6 py-3 font-['Poppins'] text-[15px] font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F05252] hover:shadow-md"
              >
                Send Message

                <Send
                  size={17}
                  strokeWidth={2}
                />

              </button>

            </form>

          </div>

        </div>

        {/* =====================================================
            MAP
        ====================================================== */}

        <div className="mt-10">

          <div className="relative h-[270px] overflow-hidden rounded-xl border border-[#E8EEEE] bg-[#F6FAF9] shadow-sm">

            <iframe
              title="Shopora Location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=90.385%2C23.755%2C90.425%2C23.775&layer=mapnik&marker=23.765%2C90.405"
              className="h-full w-full border-0"
              loading="lazy"
            />

            {/* Map Card */}

            <div className="absolute left-5 top-5 w-[260px] rounded-xl border border-[#E8EEEE] bg-white p-5 shadow-md">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F5F3]">
                  <MapPin
                    size={19}
                    className="text-[#0F766E]"
                  />
                </div>

                <h3 className="font-['Poppins'] text-[16px] font-semibold text-[#1E293B]">
                  Find Us Here
                </h3>

              </div>

              <p className="mt-3 font-['Poppins'] text-[15px] leading-6 text-[#64748B]">
                Visit our store or contact us through
                any channel.
              </p>

              <button
                type="button"
                className="mt-4 inline-flex items-center gap-1.5 font-['Poppins'] text-[15px] font-semibold text-[#0F766E] transition-colors hover:text-[#0B625B]"
              >
                Get Directions
                <ArrowUpRight size={16} />
              </button>

            </div>

          </div>

        </div>

        {/* =====================================================
            FEATURES
        ====================================================== */}

        <div className="mt-6 grid overflow-hidden rounded-xl border border-[#E8EEEE] bg-white sm:grid-cols-2 lg:grid-cols-5">

          {features.map((feature, index) => (
            <Feature
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              last={index === features.length - 1}
            />
          ))}

        </div>

        {/* =====================================================
            NEWSLETTER
        ====================================================== */}

        <div className="mt-8 flex flex-col gap-6 rounded-xl bg-[#0F766E] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
              <Mail size={23} />
            </div>

            <div>

              <h3 className="font-['Poppins'] text-[16px] font-semibold text-white">
                Stay in the loop
              </h3>

              <p className="mt-1 font-['Poppins'] text-[14px] leading-5 text-white/75">
                Subscribe to get updates, exclusive deals
                and more.
              </p>

            </div>

          </div>

          <div className="flex w-full max-w-md overflow-hidden rounded-lg bg-white">

            <input
              type="email"
              placeholder="Enter your email"
              className="min-w-0 flex-1 bg-transparent px-4 py-3 font-['Poppins'] text-[15px] text-[#1E293B] outline-none placeholder:text-[#94A3B8]"
            />

            <button
              type="button"
              className="m-1 rounded-md bg-[#FF6B6B] px-6 font-['Poppins'] text-[15px] font-semibold text-white transition-colors hover:bg-[#F05252]"
            >
              Subscribe
            </button>

          </div>

        </div>

      </div>
    </section>
  );
};

export default ContactUs;

/* =========================================================
   CONTACT INFO COMPONENT
========================================================= */

type ContactInfoProps = {
  icon: LucideIcon;
  title: string;
  value: string;
  description: string;
  secondLine?: string;
  last?: boolean;
};

const ContactInfo = ({
  icon: Icon,
  title,
  value,
  description,
  secondLine,
  last,
}: ContactInfoProps) => {
  return (
    <div
      className={`flex gap-4 px-5 py-4 ${
        !last ? "border-b border-[#EEF2F2]" : ""
      }`}
    >
      {/* Icon */}

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E8F5F3] text-[#0F766E]">
        <Icon
          size={20}
          strokeWidth={1.8}
        />
      </div>

      {/* Content */}

      <div>

        <h4 className="font-['Poppins'] text-[15px] font-semibold text-[#334155]">
          {title}
        </h4>

        <p className="mt-0.5 font-['Poppins'] text-[15px] font-medium text-[#172033]">
          {value}
        </p>

        <p className="mt-0.5 font-['Poppins'] text-[15px] leading-6 text-[#94A3B8]">
          {description}

          {secondLine && (
            <>
              <br />
              {secondLine}
            </>
          )}
        </p>

      </div>

    </div>
  );
};

/* =========================================================
   FORM FIELD COMPONENT
========================================================= */

type FormFieldProps = {
  label: string;
  name: string;
  placeholder: string;
  value: string;
  type?: string;
  required?: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
};

const FormField = ({
  label,
  name,
  placeholder,
  value,
  type = "text",
  required,
  onChange,
}: FormFieldProps) => {
  return (
    <div>

      <label className="mb-2 block font-['Poppins'] text-[15px] font-medium text-[#334155]">
        {label}

        {required && (
          <span className="text-[#FF6B6B]">
            {" "}*
          </span>
        )}
      </label>

      <input
        type={type}
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-[#DDE5E5] bg-white px-4 font-['Poppins'] text-[15px] text-[#1E293B] outline-none transition placeholder:text-[#A8B2BD] focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
      />

    </div>
  );
};

/* =========================================================
   FEATURE COMPONENT
========================================================= */

type FeatureProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  last?: boolean;
};

const Feature = ({
  icon: Icon,
  title,
  description,
  last,
}: FeatureProps) => {
  return (
    <div
      className={`flex items-center gap-4 px-5 py-5 ${
        !last
          ? "border-b border-[#EEF2F2] lg:border-b-0 lg:border-r"
          : ""
      }`}
    >

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F0F9F7] text-[#0F766E]">
        <Icon
          size={21}
          strokeWidth={1.8}
        />
      </div>

      <div>

        <h4 className="font-['Poppins'] text-[15px] font-semibold text-[#334155]">
          {title}
        </h4>

        <p className="mt-1 font-['Poppins'] text-[14px] leading-5 text-[#94A3B8]">
          {description}
        </p>

      </div>

    </div>
  );
};