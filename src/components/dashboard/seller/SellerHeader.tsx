"use client";

import { useSession } from "@/app/lib/auth-client";
import {
  CalendarDays,
  ChevronDown,
} from "lucide-react";
import React, { useState } from "react";

type SellerHeaderProps = {
  startDate: string;
  endDate: string;
  onDateChange: (
    startDate: string,
    endDate: string
  ) => void;
};

const SellerHeader = ({
  startDate,
  endDate,
  onDateChange,
}: SellerHeaderProps) => {
  const { data: session } = useSession();

  const username = session?.user?.name;

  const [isOpen, setIsOpen] = useState(false);

  

  const formatDate = (date: Date) => {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };



  const formatDisplayDate = (date: string) => {
    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

 
  const handleThisWeek = () => {
    const today = new Date();

    const day = today.getDay();

    const start = new Date(today);

    start.setDate(
      today.getDate() - day
    );

    const end = new Date(start);

    end.setDate(
      start.getDate() + 6
    );

    onDateChange(
      formatDate(start),
      formatDate(end)
    );

    setIsOpen(false);
  };

 
  const handleLastWeek = () => {
    const today = new Date();

    const day = today.getDay();

    const start = new Date(today);

    start.setDate(
      today.getDate() - day - 7
    );

    const end = new Date(start);

    end.setDate(
      start.getDate() + 6
    );

    onDateChange(
      formatDate(start),
      formatDate(end)
    );

    setIsOpen(false);
  };

 
  const handleThisMonth = () => {
    const today = new Date();

    // First day of current month
    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    // Last day of current month
    const end = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );

    onDateChange(
      formatDate(start),
      formatDate(end)
    );

    setIsOpen(false);
  };


  const getSelectedRange = () => {
    const today = new Date();

  

    const day = today.getDay();

    const thisWeekStart = new Date(today);

    thisWeekStart.setDate(
      today.getDate() - day
    );

    const thisWeekEnd = new Date(
      thisWeekStart
    );

    thisWeekEnd.setDate(
      thisWeekStart.getDate() + 6
    );

   

    const lastWeekStart = new Date(today);

    lastWeekStart.setDate(
      today.getDate() - day - 7
    );

    const lastWeekEnd = new Date(
      lastWeekStart
    );

    lastWeekEnd.setDate(
      lastWeekStart.getDate() + 6
    );

  

    const thisMonthStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    const thisMonthEnd = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );

    

    if (
      startDate === formatDate(thisWeekStart) &&
      endDate === formatDate(thisWeekEnd)
    ) {
      return "This Week";
    }

    if (
      startDate === formatDate(lastWeekStart) &&
      endDate === formatDate(lastWeekEnd)
    ) {
      return "Last Week";
    }

    if (
      startDate === formatDate(thisMonthStart) &&
      endDate === formatDate(thisMonthEnd)
    ) {
      return "This Month";
    }

    return null;
  };

  const selectedRange = getSelectedRange();

 
  return (
    <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

      {/* Welcome */}

      <div>
        <h1 className="font-['Poppins'] text-2xl font-bold text-[#1E293B] sm:text-3xl">
          Welcome back, {username}! 👋
        </h1>

        <p className="mt-1 font-['Poppins'] text-[14px] text-[#64748B]">
          Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      {/* Date Selector */}

      <div className="relative">

        <button
          type="button"
          onClick={() =>
            setIsOpen(!isOpen)
          }
          className="flex cursor-pointer h-11 items-center gap-2 self-start rounded-lg border border-[#E2E8F0] bg-white px-4 font-['Poppins'] text-[14px] font-medium text-[#475569] shadow-sm transition-colors hover:border-[#0F766E] hover:text-[#0F766E]"
        >
          <CalendarDays size={17} />

          <span>
            {formatDisplayDate(startDate)}
            {" - "}
            {formatDisplayDate(endDate)}
          </span>

          <ChevronDown
            size={16}
            className={`transition-transform ${
              isOpen
                ? "rotate-180"
                : ""
            }`}
          />
        </button>

        {/* Dropdown */}

        {isOpen && (
          <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-[#E2E8F0] bg-white p-2 shadow-lg">

            {/* This Week */}

            <button
              type="button"
              onClick={handleThisWeek}
              className={`w-full cursor-pointer rounded-lg px-3 py-2.5 text-left font-['Poppins'] text-[14px] transition-colors ${
                selectedRange === "This Week"
                  ? "bg-[#E8F7F4] font-semibold text-[#0F766E]"
                  : "text-[#475569] hover:bg-[#E8F7F4] hover:text-[#0F766E]"
              }`}
            >
              This Week
            </button>

            {/* Last Week */}

            <button
              type="button"
              onClick={handleLastWeek}
              className={`w-full cursor-pointer rounded-lg px-3 py-2.5 text-left font-['Poppins'] text-[14px] transition-colors ${
                selectedRange === "Last Week"
                  ? "bg-[#E8F7F4] font-semibold text-[#0F766E]"
                  : "text-[#475569] hover:bg-[#E8F7F4] hover:text-[#0F766E]"
              }`}
            >
              Last Week
            </button>

            {/* This Month */}

            <button
              type="button"
              onClick={handleThisMonth}
              className={`w-full cursor-pointer rounded-lg px-3 py-2.5 text-left font-['Poppins'] text-[14px] transition-colors ${
                selectedRange === "This Month"
                  ? "bg-[#E8F7F4] font-semibold text-[#0F766E]"
                  : "text-[#475569] hover:bg-[#E8F7F4] hover:text-[#0F766E]"
              }`}
            >
              This Month
            </button>

          </div>
        )}

      </div>

    </div>
  );
};

export default SellerHeader;