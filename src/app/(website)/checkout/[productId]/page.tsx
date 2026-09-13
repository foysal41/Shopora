"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  MapPin,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { createOrder } from "@/lib/api/checkout";
import { useSession } from "@/lib/auth-client";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import Image from "next/image";
import { homePageSingleProduct } from "@/type/homePage";
import { apiGet } from "@/lib/core/server";
import {
  getCoupons,
  type Coupon,
} from "@/lib/api/coupons";
import { createStripeCheckoutSession } from "@/lib/stripe";

/* =========================================================
   TYPES
========================================================= */

type CustomerInfo = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type CheckoutItem = {
  id: string;
  name: string;
  image: string | null;
  price: number;
  quantity: number;
  inStock: boolean;
};

/* =========================================================
   CONSTANTS
========================================================= */

const STANDARD_SHIPPING_FEE = 0;
const CART_SHIPPING_FEE = 10;
const EXPRESS_SHIPPING_FEE = 4.99;

const FREE_SHIPPING_THRESHOLD = 50;

/* =========================================================
   COMPONENT
========================================================= */

export default function CheckoutPage() {
  /* =========================================================
     ROUTER / SESSION
  ========================================================= */

  const { data: session } = useSession();

  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const customerId = session?.user?.id;
  const productId = params?.productId as string;

  /* =========================================================
     CHECKOUT MODE
  ========================================================= */

  const quantity =
    Number(searchParams.get("quantity")) || 1;

  const fromCart =
    searchParams.get("fromCart") === "true";

  /* =========================================================
     PRODUCT STATE - BUY NOW
  ========================================================= */

  const [product, setProduct] =
    useState<homePageSingleProduct | null>(null);

  /* =========================================================
     CART CHECKOUT STATE
  ========================================================= */

  const [checkoutItems, setCheckoutItems] =
    useState<CheckoutItem[]>([]);

  const [cartShipping, setCartShipping] =
    useState(0);

  /* =========================================================
     GENERAL STATE
  ========================================================= */

const [loading, setLoading] = useState(!fromCart);

  const [currentStep, setCurrentStep] =
    useState(1);

  const [isPlacingOrder, setIsPlacingOrder] =
    useState(false);

  const [orderError, setOrderError] =
    useState("");

  /* =========================================================
     CUSTOMER INFO
  ========================================================= */

  const [customerInfo, setCustomerInfo] =
    useState<CustomerInfo>({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      apartment: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Bangladesh",
    });

  /* =========================================================
     DELIVERY
  ========================================================= */

  const [deliveryMethod, setDeliveryMethod] =
    useState("standard");

  /* =========================================================
     COUPON
  ========================================================= */

  const [couponCode, setCouponCode] =
    useState("");

  const [appliedCoupon, setAppliedCoupon] =
    useState<Coupon | null>(null);

  const [discount, setDiscount] =
    useState(0);

  /* =========================================================
     LOAD BUY NOW PRODUCT
     
     Only needed when coming from Buy Now.
  ========================================================= */

useEffect(() => {
  if (fromCart) {
    return;
  }

  const fetchProduct = async () => {
    try {
      setLoading(true);

      const response = await apiGet<{
        success: boolean;
        message: string;
        data: homePageSingleProduct;
      }>(`/api/v1/products/${productId}`);

      setProduct(response.data);
    } catch (error) {
      console.error(
        "CHECKOUT PRODUCT ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  if (productId) {
    fetchProduct();
  }
}, [productId, fromCart]);

  /* =========================================================
     LOAD CART CHECKOUT DATA
  ========================================================= */

useEffect(() => {
  if (!fromCart) return;

  try {
    const savedCheckout =
      localStorage.getItem("shopora-checkout");

    if (!savedCheckout) {
      toast.error("Checkout information not found.");
      router.push("/cart");
      return;
    }

    const parsedCheckout = JSON.parse(savedCheckout);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCheckoutItems(parsedCheckout.items || []);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCartShipping(
      Number(parsedCheckout.shipping) || 0
    );
  } catch (error) {
    console.error(
      "FAILED TO LOAD CHECKOUT DATA:",
      error
    );

    toast.error(
      "Failed to load checkout information."
    );

    router.push("/cart");
  }
}, [fromCart, router]);
  /* =========================================================
     CUSTOMER INFO CHANGE
  ========================================================= */

  const handleChange = (
    field: keyof CustomerInfo,
    value: string
  ) => {
    setCustomerInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* =========================================================
     CONTINUE TO STEP 2
  ========================================================= */

  const handleContinue = () => {
    if (
      !customerInfo.fullName.trim() ||
      !customerInfo.email.trim() ||
      !customerInfo.phone.trim() ||
      !customerInfo.address.trim() ||
      !customerInfo.city.trim() ||
      !customerInfo.state.trim() ||
      !customerInfo.postalCode.trim()
    ) {
      alert(
        "Please complete all required fields."
      );

      return;
    }

    setCurrentStep(2);
  };

  /* =========================================================
     BACK TO STEP 1
  ========================================================= */

  const handleBack = () => {
    setCurrentStep(1);
  };

  /* =========================================================
     PRICE - BUY NOW
  ========================================================= */

  const productPrice =
    product?.salePrice &&
    product.salePrice > 0
      ? product.salePrice
      : product?.regularPrice || 0;

  /* =========================================================
     CART SUBTOTAL
  ========================================================= */

  const cartSubtotal =
    checkoutItems.reduce(
      (sum, item) =>
        sum +
        item.price * item.quantity,
      0
    );

  /* =========================================================
     FINAL SUBTOTAL
  ========================================================= */

  const subtotal = fromCart
    ? cartSubtotal
    : productPrice * quantity;

  /* =========================================================
     SHIPPING
  ========================================================= */

  const shippingFee =
    deliveryMethod === "express"
      ? EXPRESS_SHIPPING_FEE
      : fromCart
        ? cartShipping
        : STANDARD_SHIPPING_FEE;

  /* =========================================================
     COUPON DISCOUNT
  ========================================================= */

  const calculateDiscount = (
    coupon: Coupon
  ) => {
    /* FIXED CART */

    if (
      coupon.discountType ===
      "FIXED_CART"
    ) {
      return Math.min(
        coupon.amount,
        subtotal
      );
    }

    /* PERCENTAGE */

    if (
      coupon.discountType ===
      "PERCENTAGE"
    ) {
      return Math.min(
        (subtotal *
          coupon.amount) /
          100,
        subtotal
      );
    }

    /* FIXED PRODUCT */

    if (
      coupon.discountType ===
      "FIXED_PRODUCT"
    ) {
      if (fromCart) {
        const totalQuantity =
          checkoutItems.reduce(
            (sum, item) =>
              sum + item.quantity,
            0
          );

        return Math.min(
          coupon.amount *
            totalQuantity,
          subtotal
        );
      }

      return Math.min(
        coupon.amount * quantity,
        subtotal
      );
    }

    return 0;
  };

  /* =========================================================
     APPLY COUPON
  ========================================================= */

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error(
        "Please enter a coupon code."
      );

      return;
    }

    try {
      const response =
        await getCoupons();

      const coupon =
        response.data.find(
          (item) =>
            item.couponCode.toUpperCase() ===
            couponCode
              .trim()
              .toUpperCase()
        );

      if (!coupon) {
        toast.error(
          "Invalid coupon code."
        );

        return;
      }

      const expiryDate =
        new Date(coupon.expiryDate);

      if (
        expiryDate < new Date()
      ) {
        toast.error(
          "This coupon has expired."
        );

        return;
      }

      const calculatedDiscount =
        calculateDiscount(coupon);

      setAppliedCoupon(coupon);
      setDiscount(
        calculatedDiscount
      );

      toast.success(
        "Coupon applied successfully!"
      );
    } catch (error) {
      console.error(
        "APPLY COUPON ERROR:",
        error
      );

      toast.error(
        "Failed to apply coupon."
      );
    }
  };

  /* =========================================================
     TOTAL
  ========================================================= */

  const total = Math.max(
    subtotal +
      shippingFee -
      discount,
    0
  );

  /* =========================================================
     CREATE ORDER ITEMS
  ========================================================= */

  const getOrderItems = () => {
    if (fromCart) {
      return checkoutItems.map(
        (item) => ({
          productId: item.id,
          quantity: item.quantity,
        })
      );
    }

    return [
      {
        productId,
        quantity,
      },
    ];
  };

  /* =========================================================
     PLACE ORDER - COD
  ========================================================= */

  const handlePlaceOrder = async () => {
    try {
      setIsPlacingOrder(true);
      setOrderError("");

      /* LOGIN CHECK */

      if (!customerId) {
        setOrderError(
          "Please login to place an order."
        );

        return;
      }

      /* CART CHECK */

      if (
        fromCart &&
        checkoutItems.length === 0
      ) {
        setOrderError(
          "No products selected for checkout."
        );

        return;
      }

      /* BUY NOW CHECK */

      if (!fromCart && !productId) {
        setOrderError(
          "Product information is missing."
        );

        return;
      }

      const result =
        await createOrder({
          customerId,

          items: getOrderItems(),

          shippingName:
            customerInfo.fullName,

          shippingPhone:
            customerInfo.phone,

          shippingAddress:
            customerInfo.address,

          shippingCity:
            customerInfo.city,

          shippingPostalCode:
            customerInfo.postalCode,

          shippingCountry:
            customerInfo.country,

          paymentMethod: "COD",

          shippingFee,

          discount,

          couponCode:
            appliedCoupon?.couponCode,

          notes: undefined,
        });

      if (!result) {
        throw new Error(
          "Failed to create order."
        );
      }

      /* CLEAR CART CHECKOUT DATA */

      if (fromCart) {
        localStorage.removeItem(
          "shopora-checkout"
        );
      }

      toast.success(
        "Order has been placed!"
      );

      setTimeout(() => {
        router.push(
          "/dashboard/customer/my-order"
        );
      }, 1000);
    } catch (error) {
      console.error(
        "PLACE ORDER ERROR:",
        error
      );

      setOrderError(
        error instanceof Error
          ? error.message
          : "Failed to place order"
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  /* =========================================================
     STRIPE PAYMENT
  ========================================================= */

  const handleStripePayment = async () => {
    try {
      setIsPlacingOrder(true);
      setOrderError("");

      /* LOGIN CHECK */

      if (!customerId) {
        toast.error(
          "Please login to continue."
        );

        return;
      }

      /* CART CHECK */

      if (
        fromCart &&
        checkoutItems.length === 0
      ) {
        toast.error(
          "No products selected for checkout."
        );

        return;
      }

      /* BUY NOW CHECK */

      if (!fromCart && !product) {
        toast.error(
          "Product information is missing."
        );

        return;
      }

      /* STRIPE ITEMS */

      const stripeItems = fromCart
        ? checkoutItems.map(
            (item) => ({
              productId: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
            })
          )
        : [
            {
              productId: product!.id,
              name: product!.name,
              price: productPrice,
              quantity,
              image:
                product!.images?.[0] ||
                null,
            },
          ];

      /* CREATE STRIPE SESSION */

      const response =
        await createStripeCheckoutSession(
          {
            customerId,

            items: stripeItems,

            shippingName:
              customerInfo.fullName,

            shippingPhone:
              customerInfo.phone,

            shippingAddress:
              customerInfo.address,

            shippingCity:
              customerInfo.city,

            shippingPostalCode:
              customerInfo.postalCode,

            shippingCountry:
              customerInfo.country,

            shippingFee,

            discount,
          }
        );

      if (
        !response.success ||
        !response.data?.url
      ) {
        toast.error(
          "Failed to create Stripe checkout."
        );

        return;
      }

      window.location.href =
        response.data.url;
    } catch (error) {
      console.error(
        "STRIPE PAYMENT ERROR:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to start Stripe payment."
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAFA] px-4 font-['Poppins']">
        <p className="text-base text-[#64748B]">
          Loading checkout...
        </p>
      </main>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#F8FAFA] px-4 py-8 font-['Poppins'] text-[#1E293B]">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-7">
          <h1 className="text-2xl font-semibold text-[#172033]">
            Checkout
          </h1>
        </div>

        {/* =====================================================
            STEP INDICATOR
        ===================================================== */}

        <div className="mb-8 flex items-center justify-center">
          <div className="flex items-center">

            {/* STEP 1 */}

            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                  currentStep >= 1
                    ? "bg-[#0F766E] text-white"
                    : "bg-[#E5EEEE] text-[#64748B]"
                }`}
              >
                {currentStep > 1 ? (
                  <Check size={17} />
                ) : (
                  "1"
                )}
              </div>

              <span className="mt-2 text-sm font-medium text-[#0F766E]">
                Shipping & Delivery
              </span>
            </div>

            {/* LINE */}

            <div
              className={`mx-3 h-px w-28 ${
                currentStep > 1
                  ? "bg-[#0F766E]"
                  : "bg-[#CBD5E1]"
              }`}
            />

            {/* STEP 2 */}

            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                  currentStep === 2
                    ? "bg-[#0F766E] text-white"
                    : "bg-[#E5EEEE] text-[#64748B]"
                }`}
              >
                2
              </div>

              <span
                className={`mt-2 text-sm font-medium ${
                  currentStep === 2
                    ? "text-[#0F766E]"
                    : "text-[#64748B]"
                }`}
              >
                Review & Payment
              </span>
            </div>

          </div>
        </div>

        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">

          {/* ===================================================
              LEFT
          =================================================== */}

          <div>

            {currentStep === 1 ? (

              <div className="space-y-4">

                {/* =================================================
                    SHIPPING INFORMATION
                ================================================= */}

                <section className="rounded-lg border border-[#E5EEEE] bg-white p-5">

                  <div className="mb-5 flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F6F4] text-[#0F766E]">
                      <MapPin size={18} />
                    </div>

                    <div>
                      <h2 className="text-[16px] font-semibold text-[#172033]">
                        Shipping Information
                      </h2>

                      <p className="text-sm text-[#64748B]">
                        Enter your shipping address
                      </p>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                    {/* FULL NAME */}

                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        Full Name{" "}
                        <span className="text-[#FF6B6B]">
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        value={
                          customerInfo.fullName
                        }
                        onChange={(e) =>
                          handleChange(
                            "fullName",
                            e.target.value
                          )
                        }
                        placeholder="Enter your full name"
                        className="h-10 w-full rounded-md border border-[#DDE5E5] px-3 text-base outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
                      />
                    </div>

                    {/* EMAIL */}

                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        Email Address{" "}
                        <span className="text-[#FF6B6B]">
                          *
                        </span>
                      </label>

                      <input
                        type="email"
                        value={
                          customerInfo.email
                        }
                        onChange={(e) =>
                          handleChange(
                            "email",
                            e.target.value
                          )
                        }
                        placeholder="Enter your email"
                        className="h-10 w-full rounded-md border border-[#DDE5E5] px-3 text-base outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
                      />
                    </div>

                    {/* PHONE */}

                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        Phone Number{" "}
                        <span className="text-[#FF6B6B]">
                          *
                        </span>
                      </label>

                      <input
                        type="tel"
                        value={
                          customerInfo.phone
                        }
                        onChange={(e) =>
                          handleChange(
                            "phone",
                            e.target.value
                          )
                        }
                        placeholder="Enter your phone number"
                        className="h-10 w-full rounded-md border border-[#DDE5E5] px-3 text-base outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
                      />
                    </div>

                    {/* ADDRESS */}

                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium">
                        Address{" "}
                        <span className="text-[#FF6B6B]">
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        value={
                          customerInfo.address
                        }
                        onChange={(e) =>
                          handleChange(
                            "address",
                            e.target.value
                          )
                        }
                        placeholder="House number, Street name"
                        className="h-10 w-full rounded-md border border-[#DDE5E5] px-3 text-base outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
                      />
                    </div>

                    {/* APARTMENT */}

                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        Apartment, Suite, etc.
                      </label>

                      <input
                        type="text"
                        value={
                          customerInfo.apartment
                        }
                        onChange={(e) =>
                          handleChange(
                            "apartment",
                            e.target.value
                          )
                        }
                        placeholder="Apartment, suite, unit, building, etc."
                        className="h-10 w-full rounded-md border border-[#DDE5E5] px-3 text-base outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
                      />
                    </div>

                    {/* CITY */}

                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        City{" "}
                        <span className="text-[#FF6B6B]">
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        value={
                          customerInfo.city
                        }
                        onChange={(e) =>
                          handleChange(
                            "city",
                            e.target.value
                          )
                        }
                        placeholder="Enter your city"
                        className="h-10 w-full rounded-md border border-[#DDE5E5] px-3 text-base outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
                      />
                    </div>

                    {/* STATE */}

                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        State / Division{" "}
                        <span className="text-[#FF6B6B]">
                          *
                        </span>
                      </label>

                      <select
                        value={
                          customerInfo.state
                        }
                        onChange={(e) =>
                          handleChange(
                            "state",
                            e.target.value
                          )
                        }
                        className="h-10 w-full rounded-md border border-[#DDE5E5] bg-white px-3 text-base outline-none focus:border-[#0F766E]"
                      >
                        <option value="">
                          Select your state
                        </option>

                        <option value="Dhaka">
                          Dhaka
                        </option>

                        <option value="Chattogram">
                          Chattogram
                        </option>

                        <option value="Khulna">
                          Khulna
                        </option>

                        <option value="Rajshahi">
                          Rajshahi
                        </option>

                        <option value="Barishal">
                          Barishal
                        </option>

                        <option value="Sylhet">
                          Sylhet
                        </option>

                        <option value="Rangpur">
                          Rangpur
                        </option>

                        <option value="Mymensingh">
                          Mymensingh
                        </option>
                      </select>
                    </div>

                    {/* POSTAL CODE */}

                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        Postal Code{" "}
                        <span className="text-[#FF6B6B]">
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        value={
                          customerInfo.postalCode
                        }
                        onChange={(e) =>
                          handleChange(
                            "postalCode",
                            e.target.value
                          )
                        }
                        placeholder="Enter postal code"
                        className="h-10 w-full rounded-md border border-[#DDE5E5] px-3 text-base outline-none focus:border-[#0F766E]"
                      />
                    </div>

                    {/* COUNTRY */}

                    <div className="md:col-span-3">
                      <label className="mb-1.5 block text-sm font-medium">
                        Country
                      </label>

                      <select
                        value={
                          customerInfo.country
                        }
                        onChange={(e) =>
                          handleChange(
                            "country",
                            e.target.value
                          )
                        }
                        className="h-10 w-full rounded-md border border-[#DDE5E5] bg-white px-3 text-base outline-none focus:border-[#0F766E]"
                      >
                        <option value="Bangladesh">
                          Bangladesh
                        </option>
                      </select>
                    </div>

                  </div>
                </section>

                {/* =================================================
                    DELIVERY METHOD
                ================================================= */}

                <section className="rounded-lg border border-[#E5EEEE] bg-white p-5">

                  <div className="mb-4 flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F6F4] text-[#0F766E]">
                      <Truck size={18} />
                    </div>

                    <div>
                      <h2 className="text-[16px] font-semibold">
                        Delivery Method
                      </h2>

                      <p className="text-sm text-[#64748B]">
                        Select your preferred delivery option
                      </p>
                    </div>

                  </div>

                  <div className="space-y-2">

                    {/* STANDARD */}

                    <button
                      type="button"
                      onClick={() =>
                        setDeliveryMethod(
                          "standard"
                        )
                      }
                      className={`flex w-full items-center justify-between rounded-md border px-3 py-3 text-left transition ${
                        deliveryMethod ===
                        "standard"
                          ? "border-[#0F766E] bg-[#F4FBFA]"
                          : "border-[#DDE5E5]"
                      }`}
                    >
                      <div className="flex items-center gap-3">

                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                            deliveryMethod ===
                            "standard"
                              ? "border-[#0F766E]"
                              : "border-[#CBD5E1]"
                          }`}
                        >
                          {deliveryMethod ===
                            "standard" && (
                            <div className="h-2.5 w-2.5 rounded-full bg-[#0F766E]" />
                          )}
                        </div>

                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8F6F4] text-[#0F766E]">
                          <Truck size={16} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold">
                            Standard Delivery
                          </p>

                          <p className="text-xs text-[#64748B]">
                            3-5 business days
                          </p>
                        </div>

                      </div>

                      <span className="text-sm font-semibold text-[#0F766E]">
                        {fromCart &&
                        cartShipping > 0
                          ? `$${cartShipping.toFixed(
                              2
                            )}`
                          : "Free"}
                      </span>
                    </button>

                    {/* EXPRESS */}

                    <button
                      type="button"
                      onClick={() =>
                        setDeliveryMethod(
                          "express"
                        )
                      }
                      className={`flex w-full items-center justify-between rounded-md border px-3 py-3 text-left transition ${
                        deliveryMethod ===
                        "express"
                          ? "border-[#0F766E] bg-[#F4FBFA]"
                          : "border-[#DDE5E5]"
                      }`}
                    >
                      <div className="flex items-center gap-3">

                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                            deliveryMethod ===
                            "express"
                              ? "border-[#0F766E]"
                              : "border-[#CBD5E1]"
                          }`}
                        >
                          {deliveryMethod ===
                            "express" && (
                            <div className="h-2.5 w-2.5 rounded-full bg-[#0F766E]" />
                          )}
                        </div>

                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF1F1] text-[#FF6B6B]">
                          <Truck size={16} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold">
                            Express Delivery
                          </p>

                          <p className="text-xs text-[#64748B]">
                            1-2 business days
                          </p>
                        </div>

                      </div>

                      <span className="text-sm font-semibold text-[#334155]">
                        $
                        {EXPRESS_SHIPPING_FEE.toFixed(
                          2
                        )}
                      </span>
                    </button>

                  </div>
                </section>

                {/* CONTINUE */}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={
                      handleContinue
                    }
                    className="flex items-center gap-2 rounded-md bg-[#0F766E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0B625B]"
                  >
                    Continue to Review

                    <ArrowRight size={16} />
                  </button>
                </div>

              </div>

            ) : (

              /* =================================================
                 STEP 2
              ================================================= */

              <section className="rounded-lg border border-[#E5EEEE] bg-white p-5">

                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-[#172033]">
                    Review & Payment
                  </h2>

                  <p className="mt-1 text-sm text-[#64748B]">
                    Review your order details before placing the order.
                  </p>
                </div>

                <div className="space-y-4">

                  {/* SHIPPING ADDRESS */}

                  <div className="rounded-md border border-[#E5EEEE] p-4">

                    <h3 className="mb-2 text-sm font-semibold">
                      Shipping Address
                    </h3>

                    <p className="text-sm text-[#64748B]">
                      {customerInfo.fullName}
                    </p>

                    <p className="text-sm text-[#64748B]">
                      {customerInfo.address}
                    </p>

                    <p className="text-sm text-[#64748B]">
                      {customerInfo.city},{" "}
                      {customerInfo.state}{" "}
                      {customerInfo.postalCode}
                    </p>

                    <p className="text-sm text-[#64748B]">
                      {customerInfo.phone}
                    </p>

                  </div>

                  {/* PAYMENT */}

                  <div className="rounded-md border border-[#E5EEEE] p-4">

                    <h3 className="mb-3 text-sm font-semibold">
                      Payment Method
                    </h3>

                    <div className="rounded-md border border-[#0F766E] bg-[#F4FBFA] p-4">

                      <p className="text-sm font-semibold text-[#0F766E]">
                        Cash on Delivery
                      </p>

                      <p className="mt-1 text-sm text-[#64748B]">
                        Pay when your order arrives.
                      </p>

                    </div>

                  </div>

                  {/* SECURITY */}

                  <div className="flex items-center gap-2 rounded-md bg-[#F4FBFA] p-4">

                    <ShieldCheck
                      size={19}
                      className="text-[#0F766E]"
                    />

                    <p className="text-sm text-[#64748B]">
                      Your payment information is secure.
                    </p>

                  </div>

                  {/* BUTTONS */}

                  <div className="flex justify-between pt-2">

                    <button
                      type="button"
                      onClick={
                        handleBack
                      }
                      className="flex items-center gap-2 rounded-md border border-[#DDE5E5] px-5 py-2.5 text-sm font-medium text-[#475569] hover:bg-[#F8FAFA]"
                    >
                      <ArrowLeft size={16} />
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleStripePayment
                      }
                      disabled={
                        isPlacingOrder
                      }
                      className="rounded-md bg-[#FF6B6B] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#F45B5B] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isPlacingOrder
                        ? "Placing Order..."
                        : "Place Order"}
                    </button>

                  </div>

                  {/* ERROR */}

                  {orderError && (
                    <div className="flex items-center gap-2 rounded-md border border-red-100 bg-red-50 px-3 py-2.5">

                      <p className="text-sm text-red-500">
                        {orderError}
                      </p>

                      <Link
                        href="/auth/login"
                        className="text-sm font-semibold text-[#0F766E] transition hover:text-[#0B625B] hover:underline"
                      >
                        Login Here
                      </Link>

                    </div>
                  )}

                </div>
              </section>
            )}
          </div>

          {/* ===================================================
              ORDER SUMMARY
          =================================================== */}

          <aside className="h-fit rounded-lg border border-[#E5EEEE] bg-white p-5">

            {/* HEADER */}

            <div className="mb-5 flex items-center justify-between">

              <h2 className="text-[16px] font-semibold">
                Order Summary
              </h2>

              <span className="text-sm text-[#64748B]">
                {fromCart
                  ? `${checkoutItems.length} ${
                      checkoutItems.length ===
                      1
                        ? "Item"
                        : "Items"
                    }`
                  : `${quantity} ${
                      quantity === 1
                        ? "Item"
                        : "Items"
                    }`}
              </span>

            </div>

            {/* =================================================
                COUPON
            ================================================= */}

            <div className="mb-5 border-b border-[#E5EEEE] pb-4">

              <label className="mb-2 block text-sm font-medium text-[#172033]">
                Coupon Code
              </label>

              <div className="flex gap-2">

                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) =>
                    setCouponCode(
                      e.target.value
                    )
                  }
                  placeholder="Enter coupon code"
                  disabled={
                    !!appliedCoupon
                  }
                  className="h-10 min-w-0 flex-1 rounded-md border border-[#DDE5E5] px-3 text-base outline-none focus:border-[#0F766E]"
                />

                <button
                  type="button"
                  onClick={
                    handleApplyCoupon
                  }
                  disabled={
                    !!appliedCoupon
                  }
                  className="rounded-md bg-[#0F766E] px-4 text-sm font-semibold text-white hover:bg-[#0B625B] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {appliedCoupon
                    ? "Applied"
                    : "Apply"}
                </button>

              </div>

              {appliedCoupon && (
                <p className="mt-2 text-sm text-[#0F766E]">
                  {
                    appliedCoupon.couponCode
                  }{" "}
                  applied successfully
                </p>
              )}

            </div>

            {/* =================================================
                PRODUCTS
            ================================================= */}

            {fromCart ? (

              <div className="space-y-3 border-b border-[#E5EEEE] pb-4">

                {checkoutItems.map(
                  (item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3"
                    >

                      {/* IMAGE */}

                      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#E5EEEE] bg-[#F8FAFA]">

                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="64px"
                            className="object-contain p-1"
                          />
                        ) : (
                          <span className="text-xs text-[#94A3B8]">
                            Image
                          </span>
                        )}

                      </div>

                      {/* INFO */}

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-semibold text-[#172033]">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-[#64748B]">
                          Quantity:{" "}
                          {item.quantity}
                        </p>

                      </div>

                      {/* ITEM TOTAL */}

                      <span className="text-sm font-semibold text-[#172033]">
                        $
                        {(
                          item.price *
                          item.quantity
                        ).toFixed(2)}
                      </span>

                    </div>
                  )
                )}

              </div>

            ) : (

              /* =================================================
                 BUY NOW PRODUCT
              ================================================= */

              <div className="flex gap-3 border-b border-[#E5EEEE] pb-4">

                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#E5EEEE] bg-[#F8FAFA]">

                  {product?.images?.[0] ? (
                    <Image
                      src={
                        product.images[0]
                      }
                      alt={
                        product.name
                      }
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  ) : (
                    <span className="text-xs text-[#94A3B8]">
                      Image
                    </span>
                  )}

                </div>

                <div className="min-w-0 flex-1">

                  <p className="truncate text-sm font-semibold text-[#172033]">
                    {product?.name ||
                      "Selected Product"}
                  </p>

                  <p className="mt-1 text-xs text-[#64748B]">
                    Quantity:{" "}
                    {quantity}
                  </p>

                </div>

                <span className="text-sm font-semibold">
                  $
                  {subtotal.toFixed(2)}
                </span>

              </div>
            )}

            {/* =================================================
                PRICE SUMMARY
            ================================================= */}

            <div className="space-y-3 pt-4 text-sm">

              {/* SUBTOTAL */}

              <div className="flex justify-between">

                <span className="text-[#64748B]">
                  Subtotal
                </span>

                <span className="font-medium">
                  $
                  {subtotal.toFixed(2)}
                </span>

              </div>

              {/* SHIPPING */}

              <div className="flex justify-between">

                <span className="text-[#64748B]">
                  Shipping
                </span>

                <span
                  className={`font-medium ${
                    shippingFee === 0
                      ? "text-[#0F766E]"
                      : "text-[#334155]"
                  }`}
                >
                  {shippingFee === 0
                    ? "Free"
                    : `$${shippingFee.toFixed(
                        2
                      )}`}
                </span>

              </div>

              {/* DISCOUNT */}

              {discount > 0 && (
                <div className="flex justify-between">

                  <span className="text-[#64748B]">
                    Discount
                  </span>

                  <span className="font-medium text-[#FF6B6B]">
                    -$
                    {discount.toFixed(
                      2
                    )}
                  </span>

                </div>
              )}

              {/* TOTAL */}

              <div className="border-t border-[#E5EEEE] pt-3">

                <div className="flex justify-between">

                  <span className="font-semibold">
                    Total
                  </span>

                  <span className="text-lg font-semibold text-[#0F766E]">
                    $
                    {total.toFixed(2)}
                  </span>

                </div>

              </div>

            </div>

            {/* =================================================
                SECURITY
            ================================================= */}

            <div className="mt-5 flex items-start gap-2 rounded-md bg-[#F4FBFA] p-3">

              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-[#0F766E]"
              />

              <p className="text-xs leading-5 text-[#64748B]">
                Secure checkout. Your information is protected.
              </p>

            </div>

          </aside>
        </div>
      </div>
    </main>
  );
}