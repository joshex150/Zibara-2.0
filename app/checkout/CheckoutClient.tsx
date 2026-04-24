"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import { usePaystackPayment } from "react-paystack";
import toast from "react-hot-toast";
import ZibaraPlaceholder from "@/components/ZibaraPlaceholder";

const inputClass =
  "w-full px-0 py-3 bg-transparent border-b border-zibara-cream/40 text-zibara-cream text-[11px] font-mono placeholder:text-zibara-cream/40 focus:outline-none focus:border-zibara-cream/70 transition-colors";
const labelClass =
  "block text-[8px] uppercase tracking-[0.4em] font-mono text-zibara-cream/60 mb-2";

export default function CheckoutClient() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();
  const { formatPrice, selectedCurrency, convertPrice } = useCurrency();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<
    "flutterwave" | "paystack" | ""
  >("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const paymentInitiatedRef = useRef(false);

  const shippingInUSD = cartTotal > 500 ? 0 : 10;
  const totalInUSD = cartTotal + shippingInUSD;

  const shipping = convertPrice(shippingInUSD, "USD");
  const total = convertPrice(totalInUSD, "USD");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateOrderReference = () =>
    `CRL-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

  const [txRef, setTxRef] = useState(generateOrderReference());

  const flutterwavePublicKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY;
  const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  const isFlutterwaveKeyValid =
    flutterwavePublicKey &&
    flutterwavePublicKey !== "FLWPUBK-your-public-key-here" &&
    flutterwavePublicKey.startsWith("FLWPUBK");

  const isPaystackKeyValid =
    paystackPublicKey &&
    paystackPublicKey !== "pk_test_your-public-key-here" &&
    (paystackPublicKey.startsWith("pk_test_") ||
      paystackPublicKey.startsWith("pk_live_"));

  const flutterwaveConfig = {
    public_key: flutterwavePublicKey || "FLWPUBK-your-public-key-here",
    tx_ref: txRef,
    amount: total,
    currency: selectedCurrency === "NGN" ? "NGN" : "USD",
    payment_options: "card,banktransfer,ussd",
    customer: {
      email: formData.email,
      phone_number: formData.phone,
      name: `${formData.firstName} ${formData.lastName}`,
    },
    customizations: {
      title: "ZIBARASTUDIO",
      description: "Afro-futurist luxury fashion",
      logo: "https://zibarastudio.com/android-chrome-512x512.png",
    },
  };

  const handleFlutterwavePayment = useFlutterwave(flutterwaveConfig);

  const paystackConfig = {
    reference: txRef,
    email: formData.email,
    amount: Math.round(total * 100),
    publicKey: paystackPublicKey || "pk_test_your-public-key-here",
  };

  const initializePaystackPayment = usePaystackPayment(paystackConfig);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError("");

    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "state",
    ];
    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof typeof formData],
    );

    if (missingFields.length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if (paymentMethod === "flutterwave" && !isFlutterwaveKeyValid) {
      toast.error(
        "Payment gateway configuration error. Please contact support.",
      );
      setPaymentError(
        "Payment gateway not configured. Please contact support.",
      );
      return;
    }

    if (paymentMethod === "paystack" && !isPaystackKeyValid) {
      toast.error(
        "Payment gateway configuration error. Please contact support.",
      );
      setPaymentError(
        "Payment gateway not configured. Please contact support.",
      );
      return;
    }

    if (paymentInitiatedRef.current || isPaymentProcessing) return;

    const newTxRef = generateOrderReference();
    setTxRef(newTxRef);
    paymentInitiatedRef.current = true;
    setIsPaymentProcessing(true);

    if (paymentMethod === "flutterwave") {
      handleFlutterwavePayment({
        callback: async (response: any) => {
          closePaymentModal();
          if (
            response.status === "successful" ||
            response.status === "completed"
          ) {
            try {
              const verifyResponse = await fetch(
                "/api/payments/flutterwave/verify",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    transactionId: String(response.transaction_id),
                    txRef: newTxRef,
                    amount: total,
                    customer: formData,
                    items: cart,
                  }),
                },
              );
              const verifyPayload = await verifyResponse.json();
              if (!verifyResponse.ok || !verifyPayload?.success)
                throw new Error(
                  verifyPayload?.error || "Payment verification failed.",
                );
              const orderData = verifyPayload.data;
              localStorage.setItem(
                "lastOrder",
                JSON.stringify({
                  _id: orderData._id,
                  orderId: orderData._id,
                  orderNumber: orderData.orderNumber,
                  customer: formData,
                  items: cart.map((item) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color,
                    image: item.image,
                  })),
                  total,
                  paymentMethod: "Flutterwave",
                }),
              );
              clearCart();
              setTimeout(() => {
                router.push(
                  `/order-confirmation?orderNumber=${encodeURIComponent(orderData.orderNumber)}&email=${encodeURIComponent(formData.email)}`,
                );
              }, 100);
            } catch (error: any) {
              toast.error(error.message || "Payment verification failed.");
              setPaymentError(error.message || "Payment verification failed.");
              setIsPaymentProcessing(false);
              paymentInitiatedRef.current = false;
            }
          } else {
            toast.error("Payment was not successful. Please try again.");
            setIsPaymentProcessing(false);
            paymentInitiatedRef.current = false;
          }
        },
        onClose: () => {
          setIsPaymentProcessing(false);
          paymentInitiatedRef.current = false;
        },
      });
    } else if (paymentMethod === "paystack") {
      initializePaystackPayment({
        onSuccess: async (ref: any) => {
          try {
            const verifyResponse = await fetch(
              "/api/payments/paystack/verify",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  reference: ref.reference,
                  amount: total,
                  customer: formData,
                  items: cart,
                }),
              },
            );
            const verifyPayload = await verifyResponse.json();
            if (!verifyResponse.ok || !verifyPayload?.success)
              throw new Error(
                verifyPayload?.error || "Payment verification failed.",
              );
            const orderData = verifyPayload.data;
            localStorage.setItem(
              "lastOrder",
              JSON.stringify({
                _id: orderData._id,
                orderId: orderData._id,
                orderNumber: orderData.orderNumber,
                customer: formData,
                items: cart.map((item) => ({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  size: item.size,
                  color: item.color,
                  image: item.image,
                })),
                total,
                paymentMethod: "Paystack",
              }),
            );
            clearCart();
            setTimeout(() => {
              router.push(
                `/order-confirmation?orderNumber=${encodeURIComponent(orderData.orderNumber)}&email=${encodeURIComponent(formData.email)}`,
              );
            }, 100);
          } catch (error: any) {
            toast.error(error.message || "Payment verification failed.");
            setPaymentError(error.message || "Payment verification failed.");
            setIsPaymentProcessing(false);
            paymentInitiatedRef.current = false;
          }
        },
        onClose: () => {
          setIsPaymentProcessing(false);
          paymentInitiatedRef.current = false;
        },
      });
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-zibara-black text-zibara-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-[11px] font-mono text-zibara-cream/70 uppercase tracking-widest mb-6">
            Your cart is empty
          </p>
          <button
            onClick={() => router.push("/shop")}
            className="px-10 py-3 border border-zibara-cream/35 text-[10px] uppercase tracking-[0.4em] font-mono text-zibara-cream/80 hover:bg-zibara-cream hover:text-zibara-black transition-all duration-300"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zibara-black text-zibara-cream min-h-screen">
      {isPaymentProcessing && (
        <div className="fixed inset-0 bg-zibara-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center">
          <div className="bg-zibara-deep border border-zibara-cream/10 p-10 flex flex-col items-center gap-5">
            <div className="animate-spin w-10 h-10 border border-zibara-cream/20 border-t-zibara-cream rounded-full" />
            <p className="text-[10px] font-mono text-zibara-cream/70 uppercase tracking-widest">
              Processing payment
            </p>
            <p className="text-[9px] font-mono text-zibara-cream/60 uppercase tracking-wider">
              Do not close this window
            </p>
          </div>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-12 md:py-16 pt-28 md:pt-32">
        <div className="mb-12 pb-8 border-b border-zibara-cream/5">
          <h1
            className="text-3xl md:text-4xl font-light uppercase tracking-[0.3em] text-center"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            Checkout
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* LEFT: SHIPPING */}
            <div>
              <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/60 uppercase mb-8">
                Shipping Information
              </p>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+234 XXX XXX XXXX"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Zip / Postal Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="12345"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="Nigeria"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* PAYMENT METHOD */}
                <div className="pt-8 mt-4 border-t border-zibara-cream/5">
                  <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/60 uppercase mb-6">
                    Payment Method
                  </p>

                  {!isFlutterwaveKeyValid && !isPaystackKeyValid && (
                    <div className="mb-5 p-4 bg-red-950/50 border border-red-500/30">
                      <p className="text-[10px] font-mono text-red-300/80">
                        Payment gateway not configured. Set
                        NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY and
                        NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY in your environment
                        variables.
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <label
                      className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${paymentMethod === "flutterwave" ? "border-zibara-cream/40 bg-zibara-cream/5" : "border-zibara-cream/10 hover:border-zibara-cream/25"} ${!isFlutterwaveKeyValid ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="flutterwave"
                        checked={paymentMethod === "flutterwave"}
                        disabled={!isFlutterwaveKeyValid}
                        onChange={(e) =>
                          setPaymentMethod(e.target.value as "flutterwave")
                        }
                        className="w-4 h-4 accent-zibara-cream"
                      />
                      <span className="text-[11px] font-mono text-zibara-cream/80">
                        Flutterwave — Card, Bank Transfer, USSD
                      </span>
                    </label>

                    <label
                      className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${paymentMethod === "paystack" ? "border-zibara-cream/40 bg-zibara-cream/5" : "border-zibara-cream/10 hover:border-zibara-cream/25"} ${!isPaystackKeyValid ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paystack"
                        checked={paymentMethod === "paystack"}
                        disabled={!isPaystackKeyValid}
                        onChange={(e) =>
                          setPaymentMethod(e.target.value as "paystack")
                        }
                        className="w-4 h-4 accent-zibara-cream"
                      />
                      <span className="text-[11px] font-mono text-zibara-cream/80">
                        Paystack — Card, Bank Transfer
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: ORDER SUMMARY */}
            <div>
              <div className="lg:sticky lg:top-32">
                <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/60 uppercase mb-8">
                  Order Summary
                </p>

                <div className="space-y-5 mb-8">
                  {cart.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex gap-4">
                      <div className="w-20 aspect-[3/4] bg-zibara-espresso overflow-hidden flex-shrink-0">
                        <ZibaraPlaceholder
                          label={item.name}
                          sublabel={item.color || item.size || "ORDER ITEM"}
                          variant="compact"
                          tone="espresso"
                          className="w-full h-full"
                        />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-[10px] uppercase tracking-wider font-mono text-zibara-cream/85">
                          {item.name}
                        </p>
                        <p className="text-[9px] font-mono text-zibara-cream/60 mt-1">
                          Size: {item.size}
                          {item.color ? ` · ${item.color}` : ""} ×{" "}
                          {item.quantity}
                        </p>
                        <p className="text-[11px] font-mono text-zibara-cream mt-2">
                          {formatPrice(item.price * item.quantity, "USD")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 py-6 border-y border-zibara-cream/10">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-zibara-cream/65">Subtotal</span>
                    <span className="text-zibara-cream/80">
                      {formatPrice(cartTotal, "USD")}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-zibara-cream/65">Shipping</span>
                    <span className="text-zibara-cream/80">
                      {shippingInUSD === 0
                        ? "FREE"
                        : formatPrice(shippingInUSD, "USD")}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between py-5">
                  <span className="text-[11px] font-mono text-zibara-cream/70 uppercase tracking-wider">
                    Total
                  </span>
                  <span className="text-base font-mono text-zibara-cream">
                    {formatPrice(totalInUSD, "USD")}
                  </span>
                </div>

                {paymentError && (
                  <p className="text-[9px] uppercase tracking-wider font-mono text-red-400/80 mb-4">
                    {paymentError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 border border-zibara-cream/35 text-[10px] uppercase tracking-[0.4em] font-mono bg-zibara-crimson border-zibara-crimson text-zibara-cream hover:bg-zibara-cream hover:text-zibara-black hover:border-zibara-cream transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Processing..." : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
