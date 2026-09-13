"use client";

import React, { useState } from "react";
import { useSession } from "@/app/lib/auth-client";

import SellerHeader from "@/components/dashboard/seller/SellerHeader";
import SellerStatCard from "@/components/dashboard/seller/SellerStatCard";
import MainAnalytics from "@/components/dashboard/seller/MainAnalytics";

const getCurrentWeek = () => {
  const today = new Date();

  const day = today.getDay();

  const start = new Date(today);
  start.setDate(today.getDate() - day);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
};

const SellerDashboard = () => {
  const { isPending } = useSession();

  const currentWeek = getCurrentWeek();

  const [startDate, setStartDate] = useState(
    currentWeek.startDate
  );

  const [endDate, setEndDate] = useState(
    currentWeek.endDate
  );

  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="font-['Poppins'] text-[16px] text-[#64748B]">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#F8FAFC] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">

        <SellerHeader
          startDate={startDate}
          endDate={endDate}
          onDateChange={(newStartDate, newEndDate) => {
            setStartDate(newStartDate);
            setEndDate(newEndDate);
          }}
        />

        <SellerStatCard
          startDate={startDate}
          endDate={endDate}
        />

        <MainAnalytics
          startDate={startDate}
          endDate={endDate}
        />

      </div>
    </section>
  );
};

export default SellerDashboard;