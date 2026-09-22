"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient, useSession } from "@/app/lib/auth-client";

import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  Ticket,
  MapPin,
  CreditCard,
  Settings,
  Bell,
  Star,
  Sparkles,
  Headphones,
  LogOut,
  X,
  Sidebar,
  Package,
  Grid2X2,
  Users,
  Store,
  Warehouse,
  FileBarChart,
  BarChart3,
  ShieldCheck,
  ChevronDown,
  Home,
  Megaphone,
  Search,
  
} from "lucide-react";
import Image from "next/image";
import { getUnreadCount } from "@/lib/api/notifications";
import { FaResearchgate } from "react-icons/fa";

type UserRole = "Customer" | "Seller" | "Admin";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  badgeText?: string;
}


const customerNavItems: NavItem[] = [

  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Dashboard",
    href: "/dashboard/customer",
    icon: LayoutDashboard,
  },
  {
    label: "My Orders",
    href: "/dashboard/customer/my-order",
    icon: ShoppingBag,
  },
  {
    label: "Wishlist",
    href: "/dashboard/customer/wishlist",
    icon: Heart,
  },
  {
    label: "Coupons",
    href: "/dashboard/customer/coupons",
    icon: Ticket,
  },
  {
    label: "Addresses",
    href: "/dashboard/customer/addresses",
    icon: MapPin,
  },
  {
    label: "Payment Methods",
    href: "/dashboard/customer/payment-methods",
    icon: CreditCard,
  },
  {
    label: "Account Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell
  },
  {
    label: "Reviews",
    href: "/dashboard/reviews",
    icon: Star,
  },
  {
    label: "Product Insights",
    href: "/dashboard/customer/product-insights",
    icon: Search,
  },
  {
    label: "AI Recommendations",
    href: "/dashboard/ai-recommendations",
    icon: Sparkles,
  },
  {
    label: "Help & Support",
    href: "/dashboard/support",
    icon: Headphones,
  },
];


//  SELLER NAVIGATION


const sellerNavItems: NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Dashboard",
    href: "/dashboard/seller",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/dashboard/seller/products",
    icon: Package,
  },
  {
    label: "Orders",
    href: "/dashboard/seller/orders",
    icon: ShoppingBag,
  },
  {
    label: "Inventory",
    href: "/dashboard/seller/inventory",
    icon: Warehouse,
  },
  {
    label: "Store Analytics",
    href: "/dashboard/seller/analytics",
    icon: BarChart3,
  },
  {
    label: "Coupons",
    href: "/dashboard/seller/coupons",
    icon: Ticket,
  },

  {
  label: "Marketing",
  href: "#",
  icon: Megaphone,
},

  {
    label: "AI Assistant",
    href: "/dashboard/seller/ai-tools",
    icon: Sparkles,
    badgeText: "New",
  },
  {
    label: "Support",
    href: "/dashboard/seller/support",
    icon: Headphones,
  },
];

//Sub Menu
const productLinks = [
  {
    label: "All Products",
    href: "/dashboard/seller/products",
  },
  {
    label: "Add New Product",
    href: "/dashboard/seller/products/add",
  },
  {
    label: "Categories",
    href: "/dashboard/seller/products/categories",
  },
  {
    label: "Brands",
    href: "/dashboard/seller/products/brands",
  },
];


const marketingLinks = [
  {
    label: "Facebook Ads",
    href: "/dashboard/seller/marketing/facebook-ads",
  },
  {
    label: "Facebook Leads",
    href: "/dashboard/seller/marketing/facebook-leads",
  },
  {
    label: "Business Leads",
    href: "/dashboard/seller/marketing/business-leads",
  },
   {
    label: "Instagram Leads",
    href: "/dashboard/seller/marketing/instagram-leads",
  },
  {
  label: "TikTok Leads",
  href: "/dashboard/seller/marketing/tiktok-leads",
},
];



//  ADMIN NAVIGATION


const adminNavItems: NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Dashboard",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/dashboard/admin/products",
    icon: Package,
  },
  {
    label: "Categories",
    href: "/dashboard/admin/categories",
    icon: Grid2X2,
  },
  {
    label: "Catalog Health",
    href: "/dashboard/admin/catalog-health",
    icon: ShoppingBag,
  },
  {
    label: "Customers",
    href: "/dashboard/admin/customers",
    icon: Users,
  },
  {
    label: "Manage Sellers",
    href: "/dashboard/admin/sellers",
    icon: Store,
  },
  {
    label: "Product Moderation",
    href: "/dashboard/admin/moderation",
    icon: ShieldCheck,
  },
  {
    label: "Coupons",
    href: "/dashboard/admin/coupons",
    icon: Ticket,
  },
  {
    label: "Customer Support",
    href: "/dashboard/support",
    icon: Headphones,
  },
  {
    label: "AI Tools",
    href: "/dashboard/admin/ai-tools",
    icon: Sparkles,
    badgeText: "New",
  },
  {
    label: "Reports",
    href: "/dashboard/admin/reports",
    icon: FileBarChart,
  },
  {
    label: "Notifications",
    href: "/dashboard/admin/notifications",
    icon: Bell,
    badge: 5,
  },
  {
    label: "Account Settings",
    href: "/dashboard/admin/settings",
    icon: Settings,
  },
];



const DashboardSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const [isProductsOpen, setIsProductsOpen] = useState(
    pathname.startsWith("/dashboard/products")
  );

  const [isMarketingOpen, setIsMarketingOpen] = useState(
  pathname.startsWith("/dashboard/seller/marketing")
);
  const { data: session, isPending } = useSession();



  const user = session?.user;

  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const fetchUnread = async () => {
      try {
        const count = await getUnreadCount(user.id);
        setUnreadNotifications(count);
      } catch (error) {
        console.error("FETCH UNREAD NOTIFICATIONS ERROR:", error);
      }
    };

    fetchUnread();

    window.addEventListener("notifications-updated", fetchUnread);

    const interval = setInterval(fetchUnread, 30000);

    return () => {
      window.removeEventListener("notifications-updated", fetchUnread);
      clearInterval(interval);
    };
  }, [user?.id]);

  const visibleUnreadNotifications = user?.id ? unreadNotifications : 0;

  const userRole: UserRole =
    ((user as { role?: UserRole } | undefined)?.role as UserRole) ??
    "Customer";

  const navLinksMap: Record<UserRole, NavItem[]> = {
    Customer: customerNavItems,
    Seller: sellerNavItems,
    Admin: adminNavItems,
  };

  const dashboardHrefMap: Record<UserRole, string> = {
    Customer: "/dashboard/customer",
    Seller: "/dashboard/seller",
    Admin: "/dashboard/admin",
  };

  const navItems = (navLinksMap[userRole] ?? customerNavItems).map((item) =>
    item.label === "Dashboard"
      ? { ...item, href: dashboardHrefMap[userRole] }
      : item
  );



  const userName = user?.name || "John Smith";

  const userEmail = user?.email || "john.smith@email.com";



  const userInitials = userName
    .split(" ")
    .map((name) => name.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();



  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    if (
      href === "/dashboard/customer" ||
      href === "/dashboard/seller" ||
      href === "/dashboard/admin"
    ) {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await authClient.signOut();
      setIsOpen(false);
      router.replace("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
      setIsLoggingOut(false);
    }
  };



  const roleLabel =
    userRole === "Admin"
      ? "Super Admin"
      : userRole === "Seller"
        ? "Verified Seller"
        : "Verified Customer";


  if (isPending) {
    return (
      <aside className="hidden w-64 shrink-0 border-r border-[#E8EEEE] bg-white lg:block">
        <div className="flex h-screen items-center justify-center">
          <p className="font-['Poppins'] text-[14px] text-[#64748B]">
            Loading...
          </p>
        </div>
      </aside>
    );
  }



  const navigationContent = (
    <nav className="px-3 py-4">
      <div className="space-y-1">
        {navItems.map((item) => {


          if (userRole === "Seller" && item.label === "Products") {
            return (
              <div key={item.label}>
                {/* Products Button */}
                <button
                  type="button"
                  onClick={() => setIsProductsOpen((prev) => !prev)}
                  className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-['Poppins'] text-[14px] font-medium transition-all duration-200 ${pathname.startsWith("/dashboard/seller/products")
                    ? "bg-[#E8F5F3] text-[#0F766E]"
                    : "text-[#475569] hover:bg-[#F6FAF9] hover:text-[#0F766E]"
                    }`}
                >
                  <Package size={18} strokeWidth={1.8} />

                  <span className="flex-1 text-left">Products</span>

                  <ChevronDown
                    size={16}
                    strokeWidth={1.8}
                    className={`transition-transform duration-200 ${isProductsOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {/* Products Dropdown */}
                {isProductsOpen && (
                  <div className="relative ml-4 mt-1 space-y-1 border-l border-[#DDE8E7] pl-3">
                    {productLinks.map((product) => {
                      const active = isActive(product.href);

                      return (
                        <Link
                          key={product.href}
                          href={product.href}
                          onClick={() => setIsOpen(false)}
                          className={`block rounded-md px-3 py-2 font-['Poppins'] text-[14px] font-medium transition-colors duration-200 ${active
                            ? "bg-[#E8F5F3] text-[#0F766E]"
                            : "text-[#475569] hover:bg-[#F6FAF9] hover:text-[#0F766E]"
                            }`}
                        >
                          {product.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }


if (userRole === "Seller" && item.label === "Marketing") {
  return (
    <div key={item.label}>
      {/* Marketing Button */}
      <button
        type="button"
        onClick={() => setIsMarketingOpen((prev) => !prev)}
        className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-['Poppins'] text-[14px] font-medium transition-all duration-200 ${
          pathname.startsWith("/dashboard/seller/marketing")
            ? "bg-[#E8F5F3] text-[#0F766E]"
            : "text-[#475569] hover:bg-[#F6FAF9] hover:text-[#0F766E]"
        }`}
      >
        <Megaphone size={18} strokeWidth={1.8} />

        <span className="flex-1 text-left">Marketing</span>

        <ChevronDown
          size={16}
          strokeWidth={1.8}
          className={`transition-transform duration-200 ${
            isMarketingOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Marketing Dropdown */}
      {isMarketingOpen && (
        <div className="relative ml-4 mt-1 space-y-1 border-l border-[#DDE8E7] pl-3">
          {marketingLinks.map((marketing) => {
            const active = isActive(marketing.href);

            return (
              <Link
                key={marketing.href}
                href={marketing.href}
                onClick={() => setIsOpen(false)}
                className={`block rounded-md px-3 py-2 font-['Poppins'] text-[14px] font-medium transition-colors duration-200 ${
                  active
                    ? "bg-[#E8F5F3] text-[#0F766E]"
                    : "text-[#475569] hover:bg-[#F6FAF9] hover:text-[#0F766E]"
                }`}
              >
                {marketing.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}





          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-['Poppins'] text-[14px] font-medium transition-all duration-200 ${active
                ? "bg-[#E8F5F3] text-[#0F766E]"
                : "text-[#475569] hover:bg-[#F6FAF9] hover:text-[#0F766E]"
                }`}
            >
              <Icon
                size={18}
                strokeWidth={1.7}
                className={`shrink-0 transition-colors ${active
                  ? "text-[#0F766E]"
                  : "text-[#64748B] group-hover:text-[#0F766E]"
                  }`}
              />

              <span className="flex-1">{item.label}</span>

              {/* Number Badge */}

              {item.label === "Notifications" ? (
                visibleUnreadNotifications > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF6B6B] px-1.5 font-['Poppins'] text-[14px] font-semibold text-white">
                    {visibleUnreadNotifications}
                  </span>
                )
              ) : (
                item.badge && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF6B6B] px-1.5 font-['Poppins'] text-[14px] font-semibold text-white">
                    {item.badge}
                  </span>
                )
              )}

              {/* New Badge */}
              {item.badgeText && (
                <span className="rounded-full bg-[#0F766E] px-2 py-0.5 font-['Poppins'] text-[14px] font-semibold text-white">
                  {item.badgeText}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );

  return (
    <>

      {/* MOBILE MENU BUTTON */}


      <div className="w-full border-b border-[#E8EEEE] bg-white lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center gap-3 px-4 py-3 font-['Poppins'] text-[14px] font-medium text-[#475569] transition-all duration-200 hover:bg-[#F6FAF9] hover:text-[#0F766E]"
        >
          <Sidebar size={19} strokeWidth={1.8} />

          <span>Menu</span>
        </button>
      </div>



      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}



      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 border-r border-[#E8EEEE] bg-white transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
          } lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-64 lg:translate-x-0`}
      >


        <div className="flex items-center justify-end border-b border-[#E8EEEE] px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] transition-all hover:bg-[#FFF5F5] hover:text-[#FF6B6B]"
          >
            <X size={20} strokeWidth={1.8} />
          </button>
        </div>


        {/* USER PROFILE */}


        <div className="border-b border-[#E8EEEE] px-4 py-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#0F766E] bg-[#E8F5F3]">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={userName}
                  className="h-full w-full object-cover"
                  height={512}
                  width={512}
                />
              ) : (
                <span className="font-['Poppins'] text-[14px] font-semibold text-[#0F766E]">
                  {userInitials}
                </span>
              )}
            </div>

            {/* User Info */}
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-['Poppins'] text-[14px] font-semibold text-[#1E293B]">
                {userName}
              </h3>

              <p className="truncate font-['Poppins'] text-[14px] text-[#64748B]">
                {userEmail}
              </p>

              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#E8F5F3] px-2 py-0.5 font-['Poppins'] text-[14px] font-medium text-[#0F766E]">
                ✓ {roleLabel}
              </span>
            </div>
          </div>
        </div>



        <div className="h-[calc(100vh-235px)] overflow-y-auto">
          {navigationContent}
        </div>



        <div className="border-t border-[#E8EEEE] bg-white px-3 py-3">

          {/* Logout */}
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
            className="group flex cursor-pointer w-full items-center gap-3 rounded-lg px-3 py-2.5 font-['Poppins'] text-[14px] font-medium text-[#475569] transition-all hover:bg-[#FFF5F5] hover:text-[#FF6B6B]"
          >
            <LogOut
              size={18}
              strokeWidth={1.7}
              className="text-[#64748B] group-hover:text-[#FF6B6B]"
            />

            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;