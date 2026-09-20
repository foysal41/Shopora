import { useSession } from '@/app/lib/auth-client'
import { CircleUserRound } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const HeaderStart = () => {
    const {data:session} = useSession()
    const userName = session?.user?.name;
    console.log(userName)
  return (
       <section className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="font-['Poppins'] text-[22px] font-bold leading-tight text-[#0F172A] sm:text-[24px] md:text-[26px]">
            Welcome back, {userName}! 👋
          </h1>

          <p className="mt-1 font-['Poppins'] text-[14px] text-[#64748B]">
            Here&apos;s what&apos;s happening with your account today.
          </p>
        </div>

        <Link
          href="/dashboard/settings"
          className="flex cursor-pointer w-fit cursor-pointer items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 font-['Poppins'] text-[14px] font-medium text-[#334155] shadow-sm transition hover:border-[#0F766E] hover:text-[#0F766E]"
        >
          <CircleUserRound
            size={18}
            strokeWidth={1.7}
          />

          View My Profile
        </Link>

      </section>
  )
}

export default HeaderStart