'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { usePaystackPayment } from 'react-paystack';
import toast from 'react-hot-toast';
import ZibaraPlaceholder from '@/components/ZibaraPlaceholder';

export default function CheckoutClient() {
   const router = useRouter();
   const { cart, cartTotal, clearCart } = useCart();
   const { formatPrice, selectedCurrency, convertPrice } = useCurrency();
   
   const [formData, setFormData] = useState({
     firstName: '',
     lastName: '',
     email: '',
     phone: '',
     address: '',
     city: '',
     state: '',
     country: '',
     zipCode: '',
   });

  const [paymentMethod, setPaymentMethod] = useState<'flutterwave' | 'paystack' | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const paymentInitiatedRef = useRef(false);

   // Calculate shipping in USD first
   const shippingInUSD = cartTotal > 500 ? 0 : 10;
   const totalInUSD = cartTotal + shippingInUSD;
   
   // Convert to selected currency for payment gateway
   const shipping = convertPrice(shippingInUSD, 'USD');
   const total = convertPrice(totalInUSD, 'USD');

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     setFormData({
       ...formData,
       [e.target.name]: e.target.value,
     });
   };
 
  // Generate order reference for payment
  const generateOrderReference = () => {
    return `CRL-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
  };

  // Store current transaction reference - will be updated before payment
  const [txRef, setTxRef] = useState(generateOrderReference());

  // Get payment public keys with validation
  const flutterwavePublicKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY;
  const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  // Validate payment keys
  const isFlutterwaveKeyValid = flutterwavePublicKey && 
    flutterwavePublicKey !== 'FLWPUBK-your-public-key-here' && 
    flutterwavePublicKey.startsWith('FLWPUBK');
  
  const isPaystackKeyValid = paystackPublicKey && 
    paystackPublicKey !== 'pk_test_your-public-key-here' && 
    (paystackPublicKey.startsWith('pk_test_') || paystackPublicKey.startsWith('pk_live_'));

  // Flutterwave Configuration - use converted total
  const flutterwaveConfig = {
    public_key: flutterwavePublicKey || 'FLWPUBK-your-public-key-here',
    tx_ref: txRef,
    amount: total, // Already converted to selected currency
    currency: selectedCurrency === 'NGN' ? 'NGN' : 'USD',
    payment_options: 'card,banktransfer,ussd',
    customer: {
      email: formData.email,
      phone_number: formData.phone,
      name: `${formData.firstName} ${formData.lastName}`,
    },
    customizations: {
      title: 'Crochellaa.ng',
      description: 'Handmade Crochet Fashion',
      logo: 'https://crochellaa.ng/logo.png',
    },
  };

  const handleFlutterwavePayment = useFlutterwave(flutterwaveConfig);

  // Paystack Configuration - use converted total
  const paystackConfig = {
    reference: txRef,
    email: formData.email,
    amount: Math.round(total * 100), // Paystack expects amount in kobo (for NGN) or cents (for USD) - total is already converted
    publicKey: paystackPublicKey || 'pk_test_your-public-key-here',
  };

  const initializePaystackPayment = usePaystackPayment(paystackConfig);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');

    // Validate form
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

    if (missingFields.length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    // Validate payment keys before proceeding
    if (paymentMethod === 'flutterwave' && !isFlutterwaveKeyValid) {
      toast.error('Payment gateway configuration error. Please contact support or check your environment variables.');
      console.error('Flutterwave public key is missing or invalid. Set NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY in your environment variables.');
      setPaymentError('Payment gateway not configured. Please contact support.');
      return;
    }

    if (paymentMethod === 'paystack' && !isPaystackKeyValid) {
      toast.error('Payment gateway configuration error. Please contact support or check your environment variables.');
      console.error('Paystack public key is missing or invalid. Set NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY in your environment variables.');
      setPaymentError('Payment gateway not configured. Please contact support.');
      return;
    }

    if (paymentInitiatedRef.current || isPaymentProcessing) {
      return; // Prevent double submission
    }

    // Generate new reference for this payment attempt
    const newTxRef = generateOrderReference();
    setTxRef(newTxRef);
    paymentInitiatedRef.current = true;
    setIsPaymentProcessing(true);

    // Trigger payment based on selected method
    if (paymentMethod === 'flutterwave') {
      // Use the hook function - it will use the updated txRef from state
      handleFlutterwavePayment({
        callback: async (response: any) => {
          console.log('Flutterwave payment response:', response);
          closePaymentModal();
          
          if (response.status === 'successful' || response.status === 'completed') {
            try {
              // Verify payment with backend using secret key
              const verifyResponse = await fetch('/api/payments/flutterwave/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  transactionId: String(response.transaction_id),
                  txRef: newTxRef,
                  amount: total,
                  customer: formData,
                  items: cart,
                }),
              });
              const verifyPayload = await verifyResponse.json();

              if (!verifyResponse.ok || !verifyPayload?.success) {
                throw new Error(verifyPayload?.error || 'Payment verification failed.');
              }

              // Order is created by the verification endpoint (like jeel)
              const orderData = verifyPayload.data;

              // Save order data to localStorage
              const savedOrderData = {
                _id: orderData._id,
                orderId: orderData._id,
                orderNumber: orderData.orderNumber,
                customer: formData,
                items: cart.map(item => ({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  size: item.size,
                  color: item.color,
                  image: item.image,
                })),
                total,
                paymentMethod: 'Flutterwave',
              };
              
              localStorage.setItem('lastOrder', JSON.stringify(savedOrderData));
              clearCart();
              
              // Navigate to confirmation page
              setTimeout(() => {
                router.push(`/order-confirmation?orderNumber=${encodeURIComponent(orderData.orderNumber)}&email=${encodeURIComponent(formData.email)}`);
              }, 100);
            } catch (error: any) {
              console.error('Payment verification error:', error);
              toast.error(error.message || 'Payment verification failed.');
              setPaymentError(error.message || 'Payment verification failed.');
              setIsPaymentProcessing(false);
              paymentInitiatedRef.current = false;
            }
          } else {
            toast.error('Payment was not successful. Please try again.');
            setIsPaymentProcessing(false);
            paymentInitiatedRef.current = false;
          }
        },
        onClose: () => {
          console.log('Payment modal closed');
          setIsPaymentProcessing(false);
          paymentInitiatedRef.current = false;
        },
      });
    } else if (paymentMethod === 'paystack') {
      initializePaystackPayment({
        onSuccess: async (ref: any) => {
          console.log('Paystack payment successful:', ref);
          try {
            // Verify payment with backend using secret key
            const verifyResponse = await fetch('/api/payments/paystack/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                reference: ref.reference,
                amount: total,
                customer: formData,
                items: cart,
              }),
            });
            const verifyPayload = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyPayload?.success) {
              throw new Error(verifyPayload?.error || 'Payment verification failed.');
            }

            // Order is created by the verification endpoint (like jeel)
            const orderData = verifyPayload.data;

            // Save order data to localStorage
            const savedOrderData = {
              _id: orderData._id,
              orderId: orderData._id,
              orderNumber: orderData.orderNumber,
              customer: formData,
              items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                image: item.image,
              })),
              total,
              paymentMethod: 'Paystack',
            };
            
            localStorage.setItem('lastOrder', JSON.stringify(savedOrderData));
            clearCart();
            
            // Navigate to confirmation page
            setTimeout(() => {
              router.push(`/order-confirmation?orderNumber=${encodeURIComponent(orderData.orderNumber)}&email=${encodeURIComponent(formData.email)}`);
            }, 100);
          } catch (error: any) {
            console.error('Payment verification error:', error);
            toast.error(error.message || 'Payment verification failed.');
            setPaymentError(error.message || 'Payment verification failed.');
            setIsPaymentProcessing(false);
            paymentInitiatedRef.current = false;
          }
        },
        onClose: () => {
          console.log('Payment modal closed');
          setIsPaymentProcessing(false);
          paymentInitiatedRef.current = false;
        },
      });
    }
  };

 
   if (cart.length === 0) {
     return (
      <div className="min-h-screen bg-zibara-black text-zibara-cream flex items-center justify-center scroll-mt-32">
         <div className="text-center">
           <p className="text-lg mb-4">Your cart is empty</p>
           <button
             onClick={() => router.push('/collection')}
             className="px-8 py-3 bg-[#8b2b4d] text-white text-xs uppercase tracking-[0.3em] font-bold hover:bg-[#6d1f3a] transition-colors rounded-sm"
           >
             Start Shopping
           </button>
         </div>
       </div>
     );
   }
 
   return (
    <div className="bg-zibara-black text-zibara-cream scroll-mt-32">
      {/* Payment Processing Overlay */}
      {isPaymentProcessing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center">
          <div className="bg-zibara-deep rounded-lg p-8 shadow-2xl border border-zibara-cream/10 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zibara-gold"></div>
            <p className="text-zibara-cream font-medium">Processing payment...</p>
            <p className="text-sm text-zibara-cream/55">Please do not close this window</p>
          </div>
        </div>
      )}
      
       <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
         
         <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-[0.3em] mb-8 text-center">
           CHECKOUT
         </h1>
 
         <form onSubmit={handleSubmit}>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
             
             {/* LEFT: SHIPPING INFORMATION */}
             <div>
               <h2 className="text-lg font-bold uppercase tracking-[0.25em] mb-6 pb-3 border-b border-[#8b2b4d]/20">
                 SHIPPING INFORMATION
               </h2>
 
               <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs uppercase tracking-wider font-semibold mb-2">
                       First Name *
                     </label>
                     <input
                       type="text"
                       name="firstName"
                       value={formData.firstName}
                       onChange={handleInputChange}
                       required
                       className="w-full px-4 py-3 bg-white/50 border-2 border-[#8b2b4d]/20 rounded-sm focus:outline-none focus:border-[#8b2b4d]/60"
                     />
                   </div>
                   <div>
                     <label className="block text-xs uppercase tracking-wider font-semibold mb-2">
                       Last Name *
                     </label>
                     <input
                       type="text"
                       name="lastName"
                       value={formData.lastName}
                       onChange={handleInputChange}
                       required
                       className="w-full px-4 py-3 bg-white/50 border-2 border-[#8b2b4d]/20 rounded-sm focus:outline-none focus:border-[#8b2b4d]/60"
                     />
                   </div>
                 </div>
 
                 <div>
                   <label className="block text-xs uppercase tracking-wider font-semibold mb-2">
                     Email *
                   </label>
                   <input
                     type="email"
                     name="email"
                     value={formData.email}
                     onChange={handleInputChange}
                     required
                     className="w-full px-4 py-3 bg-white/50 border-2 border-[#8b2b4d]/20 rounded-sm focus:outline-none focus:border-[#8b2b4d]/60"
                   />
                 </div>
 
                 <div>
                   <label className="block text-xs uppercase tracking-wider font-semibold mb-2">
                     Phone *
                   </label>
                   <input
                     type="tel"
                     name="phone"
                     value={formData.phone}
                     onChange={handleInputChange}
                     required
                     placeholder="+234 XXX XXX XXXX"
                     className="w-full px-4 py-3 bg-white/50 border-2 border-[#8b2b4d]/20 rounded-sm focus:outline-none focus:border-[#8b2b4d]/60"
                   />
                 </div>
 
                 <div>
                   <label className="block text-xs uppercase tracking-wider font-semibold mb-2">
                     Address *
                   </label>
                   <input
                     type="text"
                     name="address"
                     value={formData.address}
                     onChange={handleInputChange}
                     required
                     className="w-full px-4 py-3 bg-white/50 border-2 border-[#8b2b4d]/20 rounded-sm focus:outline-none focus:border-[#8b2b4d]/60"
                   />
                 </div>
 
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs uppercase tracking-wider font-semibold mb-2">
                       City *
                     </label>
                     <input
                       type="text"
                       name="city"
                       value={formData.city}
                       onChange={handleInputChange}
                       required
                       className="w-full px-4 py-3 bg-white/50 border-2 border-[#8b2b4d]/20 rounded-sm focus:outline-none focus:border-[#8b2b4d]/60"
                     />
                   </div>
                   <div>
                     <label className="block text-xs uppercase tracking-wider font-semibold mb-2">
                       State *
                     </label>
                     <input
                       type="text"
                       name="state"
                       value={formData.state}
                       onChange={handleInputChange}
                       required
                       className="w-full px-4 py-3 bg-white/50 border-2 border-[#8b2b4d]/20 rounded-sm focus:outline-none focus:border-[#8b2b4d]/60"
                     />
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs uppercase tracking-wider font-semibold mb-2">
                       Zip/Postal Code
                     </label>
                     <input
                       type="text"
                       name="zipCode"
                       value={formData.zipCode}
                       onChange={handleInputChange}
                       className="w-full px-4 py-3 bg-white/50 border-2 border-[#8b2b4d]/20 rounded-sm focus:outline-none focus:border-[#8b2b4d]/60"
                       placeholder="12345"
                     />
                   </div>
                   <div>
                     <label className="block text-xs uppercase tracking-wider font-semibold mb-2">
                       Country
                     </label>
                     <input
                       type="text"
                       name="country"
                       value={formData.country}
                       onChange={handleInputChange}
                       className="w-full px-4 py-3 bg-white/50 border-2 border-[#8b2b4d]/20 rounded-sm focus:outline-none focus:border-[#8b2b4d]/60"
                       placeholder="Nigeria"
                     />
                   </div>
                 </div>
 
                 {/* PAYMENT METHOD */}
                 <div className="pt-6 mt-6 border-t border-[#8b2b4d]/20">
                   <h3 className="text-lg font-bold uppercase tracking-[0.25em] mb-4">
                     PAYMENT METHOD
                   </h3>
                   
                   {/* Payment Key Validation Warnings */}
                   {!isFlutterwaveKeyValid && !isPaystackKeyValid && (
                     <div className="mb-4 p-4 bg-red-100 border-2 border-red-300 rounded-sm">
                       <p className="text-sm font-semibold text-red-800 mb-1">
                         ⚠️ Payment Gateway Not Configured
                       </p>
                       <p className="text-xs text-red-700">
                         Payment keys are missing. Please set NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY and NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY in your environment variables.
                       </p>
                     </div>
                   )}
                   
                   <div className="space-y-3">
                     <label className={`flex items-center gap-3 p-4 bg-white/30 rounded-sm cursor-pointer hover:bg-white/40 transition-colors ${!isFlutterwaveKeyValid ? 'opacity-50 cursor-not-allowed' : ''}`}>
                       <input
                         type="radio"
                         name="paymentMethod"
                         value="flutterwave"
                         checked={paymentMethod === 'flutterwave'}
                         disabled={!isFlutterwaveKeyValid}
                         onChange={(e) => setPaymentMethod(e.target.value as 'flutterwave')}
                         className="w-4 h-4"
                       />
                       <span className="text-sm font-semibold">Flutterwave (Card, Bank Transfer, USSD)</span>
                     </label>
 
                     <label className={`flex items-center gap-3 p-4 bg-white/30 rounded-sm cursor-pointer hover:bg-white/40 transition-colors ${!isPaystackKeyValid ? 'opacity-50 cursor-not-allowed' : ''}`}>
                       <input
                         type="radio"
                         name="paymentMethod"
                         value="paystack"
                         checked={paymentMethod === 'paystack'}
                         disabled={!isPaystackKeyValid}
                         onChange={(e) => setPaymentMethod(e.target.value as 'paystack')}
                         className="w-4 h-4"
                       />
                       <span className="text-sm font-semibold">Paystack (Card, Bank Transfer)</span>
                     </label>
                   </div>
                 </div>
               </div>
             </div>
 
             {/* RIGHT: ORDER SUMMARY */}
             <div>
               <div className="lg:sticky lg:top-32">
                 <h2 className="text-lg font-bold uppercase tracking-[0.25em] mb-6 pb-3 border-b border-[#8b2b4d]/20">
                   ORDER SUMMARY
                 </h2>
 
                 <div className="space-y-4 mb-6">
                   {cart.map((item) => (
                     <div key={`${item.id}-${item.size}`} className="flex gap-4">
                       <div className="w-20 aspect-[3/4] bg-zibara-espresso rounded-sm overflow-hidden flex-shrink-0">
                         <ZibaraPlaceholder
                           label={item.name}
                           sublabel={item.color || item.size || 'ORDER ITEM'}
                           variant="compact"
                           tone="espresso"
                           className="w-full h-full"
                         />
                       </div>
                       <div className="flex-1">
                         <p className="text-xs font-semibold uppercase tracking-wider">{item.name}</p>
                        <p className="text-xs opacity-70 mt-1">
                          Size: {item.size}
                          {item.color ? ` • Color: ${item.color}` : ''} × {item.quantity}
                        </p>
                         <p className="text-sm font-bold mt-2">{formatPrice(item.price * item.quantity, 'USD')}</p>
                       </div>
                     </div>
                   ))}
                 </div>
 
                 <div className="space-y-3 py-6 border-y border-[#8b2b4d]/20">
                   <div className="flex justify-between text-sm">
                     <span>Subtotal</span>
                     <span className="font-semibold">{formatPrice(cartTotal, 'USD')}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span>Shipping</span>
                     <span className="font-semibold">{shippingInUSD === 0 ? 'FREE' : formatPrice(shippingInUSD, 'USD')}</span>
                   </div>
                 </div>

                 <div className="flex justify-between text-lg font-bold py-4">
                   <span>Total</span>
                   <span>{formatPrice(totalInUSD, 'USD')}</span>
                 </div>
 
                {paymentError && (
                  <p className="text-xs uppercase tracking-wider text-red-700 mb-3">
                    {paymentError}
                  </p>
                )}

                 <button
                   type="submit"
                   disabled={isProcessing}
                   className="w-full py-4 bg-[#8b2b4d] text-white text-xs md:text-sm uppercase tracking-[0.3em] font-bold hover:bg-[#6d1f3a] transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {isProcessing ? 'PROCESSING...' : 'PLACE ORDER'}
                 </button>
               </div>
             </div>
           </div>
         </form>
       </div>
     </div>
   );
 }
