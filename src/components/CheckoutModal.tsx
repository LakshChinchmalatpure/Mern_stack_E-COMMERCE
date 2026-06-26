import React, { useState, useEffect } from "react";
import { X, CreditCard, ChevronRight, Truck, CheckCircle2, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { CartItem, Product, Order } from "../types";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  catalog: Product[];
  userToken: string;
  onOrderComplete: (order: Order) => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  catalog,
  userToken,
  onOrderComplete
}: CheckoutModalProps) {
  if (!isOpen) return null;

  const [step, setStep] = useState<'shipping' | 'payment' | 'processing' | 'success'>('shipping');
  const [shippingForm, setShippingForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    zipCode: ""
  });
  const [cardForm, setCardForm] = useState({
    number: "4242 4242 4242 4242",
    expiry: "12/28",
    cvc: "123"
  });
  const [isSimulated, setIsSimulated] = useState(true);
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");

  const hydratedCart = cart.map(item => {
    const prod = catalog.find(p => p.id === item.productId);
    return {
      productId: item.productId,
      name: prod!.name,
      price: prod!.price,
      quantity: item.quantity,
      image: prod!.image
    };
  });

  const cartTotal = hydratedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Initialize payment intent on mounting to payment step
  const handleToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingForm.name || !shippingForm.email || !shippingForm.address || !shippingForm.city || !shippingForm.zipCode) {
      setError("Please fill in all shipping details");
      return;
    }
    setError("");
    setStep('payment');

    try {
      const response = await fetch("/api/checkout/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: cartTotal })
      });
      const data = await response.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setIsSimulated(data.simulated);
      }
    } catch (err) {
      console.error("Stripe payment intent failed, falling back to fully-simulated checkout", err);
      setIsSimulated(true);
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStep('processing');

    // Artificial payment process delay
    setTimeout(async () => {
      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${userToken}`
          },
          body: JSON.stringify({
            items: hydratedCart,
            total: cartTotal,
            simulatedPayment: isSimulated
          })
        });

        const data = await response.json();
        if (response.ok && data.order) {
          setOrderId(data.order.id);
          setStep('success');
          onOrderComplete(data.order);
        } else {
          setError(data.error || "Order creation failed");
          setStep('payment');
        }
      } catch (err) {
        setError("Network error. Please try again.");
        setStep('payment');
      }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={step !== 'processing' ? onClose : undefined} className="absolute inset-0 bg-black/55 backdrop-blur-xs"></div>

      {/* Card Wrapper */}
      <div className="relative bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-indigo-600" />
            <span className="font-bold text-gray-900">Secure Checkout</span>
          </div>
          {step !== 'processing' && step !== 'success' && (
            <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-900">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Body Scroll area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-3.5 text-xs font-semibold text-red-600">
              {error}
            </div>
          )}

          {/* STEP 1: SHIPPING ADDRESS */}
          {step === 'shipping' && (
            <form onSubmit={handleToPayment} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">1</span>
                <span className="text-sm font-bold text-gray-900">Shipping Details</span>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={shippingForm.name}
                    onChange={e => setShippingForm({ ...shippingForm, name: e.target.value })}
                    placeholder="E.g., John Doe"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={shippingForm.email}
                    onChange={e => setShippingForm({ ...shippingForm, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Delivery Address</label>
                  <input
                    type="text"
                    required
                    value={shippingForm.address}
                    onChange={e => setShippingForm({ ...shippingForm, address: e.target.value })}
                    placeholder="123 Curated Lane"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={shippingForm.city}
                      onChange={e => setShippingForm({ ...shippingForm, city: e.target.value })}
                      placeholder="New York"
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">ZIP / Postal Code</label>
                    <input
                      type="text"
                      required
                      value={shippingForm.zipCode}
                      onChange={e => setShippingForm({ ...shippingForm, zipCode: e.target.value })}
                      placeholder="10001"
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Order total info */}
              <div className="mt-6 rounded-xl bg-gray-50 p-4 border border-gray-100 flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-500">Total payable amount:</span>
                <span className="text-sm font-extrabold text-gray-900">${cartTotal}</span>
              </div>

              <button
                type="submit"
                className="w-full mt-4 flex items-center justify-center gap-1 rounded-xl bg-indigo-600 py-3.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition"
              >
                <span>Continue to Payment</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* STEP 2: PAYMENT METHOD */}
          {step === 'payment' && (
            <form onSubmit={handlePay} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
                <button
                  type="button"
                  onClick={() => setStep('shipping')}
                  className="mr-1 text-gray-400 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">2</span>
                <span className="text-sm font-bold text-gray-900">Payment Authorization</span>
              </div>

              <div className="rounded-xl border border-indigo-100 bg-indigo-50/20 p-4 flex gap-3 items-start">
                <ShieldCheck className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-indigo-950">256-bit Bank-grade Encryption</h4>
                  <p className="text-[10px] text-indigo-700 leading-normal mt-0.5">
                    Your payments are secure. {isSimulated ? "We are running in Simulated Sandbox payment mode." : "Stripe Payment Intent is live and armed."}
                  </p>
                </div>
              </div>

              {/* Mock Card Input Graphic */}
              <div className="space-y-4 pt-2">
                <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 p-5 text-white shadow-md">
                  <div className="flex justify-between items-start">
                    <CreditCard className="h-10 w-10 text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">VISA</span>
                  </div>
                  <div className="mt-8 font-mono text-base tracking-wider">{cardForm.number}</div>
                  <div className="mt-5 flex justify-between items-center text-[10px] uppercase font-semibold">
                    <div>
                      <span className="text-gray-400 block text-[8px]">Card Holder</span>
                      <span>{shippingForm.name || "CARDHOLDER"}</span>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <span className="text-gray-400 block text-[8px]">Expiry</span>
                        <span>{cardForm.expiry}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[8px]">CVC</span>
                        <span>{cardForm.cvc}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Card Number</label>
                    <input
                      type="text"
                      required
                      value={cardForm.number}
                      onChange={e => setCardForm({ ...cardForm, number: e.target.value })}
                      placeholder="4242 4242 4242 4242"
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs focus:border-indigo-500 focus:outline-none font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Expiration Date</label>
                      <input
                        type="text"
                        required
                        value={cardForm.expiry}
                        onChange={e => setCardForm({ ...cardForm, expiry: e.target.value })}
                        placeholder="MM/YY"
                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs focus:border-indigo-500 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Security Code (CVC)</label>
                      <input
                        type="text"
                        required
                        value={cardForm.cvc}
                        onChange={e => setCardForm({ ...cardForm, cvc: e.target.value })}
                        placeholder="123"
                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs focus:border-indigo-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order summary row */}
              <div className="rounded-xl bg-gray-50 p-4 border border-gray-100 flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-500">Order total charged:</span>
                <span className="text-sm font-extrabold text-gray-950">${cartTotal}</span>
              </div>

              <button
                type="submit"
                className="w-full mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-3.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition"
              >
                <span>Authorize & Pay ${cartTotal}</span>
              </button>
            </form>
          )}

          {/* STEP 3: PROCESSING STATE */}
          {step === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-gray-900">Contacting Payment Gateway...</h3>
                <p className="text-[11px] text-gray-500 mt-1 max-w-xs mx-auto">
                  Verifying merchant assets and conducting secure bank transaction logic. Do not close this tab or hit refresh.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: ORDER SUCCESS */}
          {step === 'success' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600 shadow-sm">
                <CheckCircle2 className="h-9 w-9 stroke-2" />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-gray-950">Thank you for your order!</h3>
                <p className="text-xs text-gray-500 mt-1">We've received your payment and are packaging your curated premium selections.</p>
              </div>

              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50/50 w-full text-xs text-left font-semibold space-y-2">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-400">Order ID:</span>
                  <span className="text-gray-900 font-mono font-bold">{orderId}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-400">Paid Amount:</span>
                  <span className="text-gray-950">${cartTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Shipped To:</span>
                  <span className="text-gray-900 text-right">{shippingForm.name} ({shippingForm.city})</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full mt-4 flex items-center justify-center rounded-xl bg-gray-900 py-3 text-xs font-semibold text-white hover:bg-black transition"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
