'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, ShieldCheck, Info, CreditCard } from 'lucide-react';

export default function BookingForm({ car, userId, selectedDriver }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    pickupLocation: car.location || '',
    dropoffLocation: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });
  const [totalDays, setTotalDays] = useState(0);
  const [carPrice, setCarPrice] = useState(0);
  const [driverPrice, setDriverPrice] = useState(0);
  const [insurancePrice, setInsurancePrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [insuranceAccepted, setInsuranceAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calculatePrice();
  }, [formData.startDate, formData.endDate, selectedDriver]);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const calculatePrice = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      if (days > 0) {
        setTotalDays(days);
        const carCost = car.pricePerDay * days;
        setCarPrice(carCost);

        // Calculate driver price if driver is selected
        let driverCost = 0;
        if (selectedDriver) {
          const { amount, paymentFrequency } = selectedDriver.salary;

          if (paymentFrequency === 'daily') {
            driverCost = amount * days;
          } else if (paymentFrequency === 'weekly') {
            driverCost = amount * (days / 7);
          } else if (paymentFrequency === 'monthly') {
            driverCost = amount * (days / 30);
          }
        }
        setDriverPrice(driverCost);

        // Calculate insurance (10% of booking total - car + driver)
        const bookingSubtotal = carCost + driverCost;
        const insurance = bookingSubtotal * 0.10;
        setInsurancePrice(insurance);

        // Total including insurance
        setTotalPrice(bookingSubtotal + insurance);
      } else {
        setTotalDays(0);
        setCarPrice(0);
        setDriverPrice(0);
        setInsurancePrice(0);
        setTotalPrice(0);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (totalDays <= 0) {
      alert('Please select valid dates');
      return;
    }

    if (!insuranceAccepted) {
      alert('Please accept the Security Deposit (Insurance) to proceed with booking');
      return;
    }

    setLoading(true);

    try {
      // Create car booking order
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalPrice,
          carId: car._id,
          userId,
          bookingDetails: {
            ...formData,
            totalDays,
            totalPrice,
            driverId: selectedDriver?._id || null,
            driverAmount: driverPrice,
            insuranceAmount: insurancePrice,
            insuranceAccepted: true,
          },
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Initialize Razorpay
      const options = {
        key: orderData.razorpayKeyId,
        amount: orderData.amount,
        currency: 'INR',
        name: 'DriveNest - Premium Car Rental',
        description: `Booking for ${car.name}${selectedDriver ? ` with driver ${selectedDriver.name}` : ''}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                carId: car._id,
                userId,
                bookingDetails: {
                  ...formData,
                  totalDays,
                  totalPrice,
                  driverId: selectedDriver?._id || null,
                  driverAmount: driverPrice,
                  insuranceAmount: insurancePrice,
                  insuranceAccepted: true,
                },
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              alert('Booking confirmed successfully!');
              router.push('/bookings');
            } else {
              alert('Payment verification failed: ' + verifyData.error);
            }
          } catch (error) {
            alert('Payment verification failed: ' + error.message);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: userId,
          email: '',
          contact: '',
        },
        theme: {
          color: '#f97316', // Orange theme
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert('Payment failed: ' + response.error.description);
        setLoading(false);
      });

      rzp.open();
    } catch (error) {
      alert('Failed to create booking: ' + error.message);
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-[40px] border border-deep-graphite shadow-2xl p-8 md:p-10">
      <h3 className="text-[24px] font-black text-cloud-white uppercase tracking-tighter mb-8 flex items-center gap-3">
        <CreditCard size={24} className="text-interactive-blue" /> Secure Booking
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-ghost-white uppercase tracking-widest">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                min={today}
                required
                className="w-full bg-space-gray border border-deep-graphite px-5 py-4 rounded-2xl outline-none text-cloud-white font-bold text-[14px] focus:border-interactive-blue transition appearance-none"
              />
              <Calendar size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-ghost-white pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-ghost-white uppercase tracking-widest">
              End Date
            </label>
            <div className="relative">
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                min={formData.startDate || today}
                required
                className="w-full bg-space-gray border border-deep-graphite px-5 py-4 rounded-2xl outline-none text-cloud-white font-bold text-[14px] focus:border-interactive-blue transition appearance-none"
              />
              <Calendar size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-ghost-white pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-ghost-white uppercase tracking-widest">
            Pickup Point
          </label>
          <div className="relative">
            <input
              type="text"
              name="pickupLocation"
              value={formData.pickupLocation}
              onChange={handleInputChange}
              placeholder="Enter pickup address"
              required
              className="w-full bg-space-gray border border-deep-graphite px-5 py-4 rounded-2xl outline-none text-cloud-white font-bold text-[14px] focus:border-interactive-blue transition"
            />
            <MapPin size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-ghost-white pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-ghost-white uppercase tracking-widest">
            Drop-off Point
          </label>
          <div className="relative">
            <input
              type="text"
              name="dropoffLocation"
              value={formData.dropoffLocation}
              onChange={handleInputChange}
              placeholder="Enter drop-off address"
              required
              className="w-full bg-space-gray border border-deep-graphite px-5 py-4 rounded-2xl outline-none text-cloud-white font-bold text-[14px] focus:border-interactive-blue transition"
            />
            <MapPin size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-ghost-white pointer-events-none" />
          </div>
        </div>

        {/* Price Breakdown */}
        {totalDays > 0 && (
          <div className="bg-space-gray rounded-3xl p-6 border border-deep-graphite space-y-4">
            <div className="flex justify-between text-[14px] font-bold text-ghost-white uppercase tracking-wider">
              <span>Car ({totalDays} Days)</span>
              <span className="text-cloud-white">₹{carPrice.toFixed(0)}</span>
            </div>

            {selectedDriver && driverPrice > 0 && (
              <div className="flex justify-between text-[14px] font-bold text-ghost-white uppercase tracking-wider">
                <span>Pilot ({selectedDriver.name})</span>
                <span className="text-cloud-white">₹{driverPrice.toFixed(0)}</span>
              </div>
            )}

            <div className="flex justify-between text-[14px] font-bold text-ghost-white uppercase tracking-wider">
              <span>Security Deposit (10%)</span>
              <span className="text-cloud-white">₹{insurancePrice.toFixed(0)}</span>
            </div>

            <div className="pt-4 border-t border-deep-graphite flex justify-between items-end">
              <span className="text-[12px] font-black text-ghost-white uppercase tracking-widest">Total Amount</span>
              <span className="text-[28px] font-black text-interactive-blue leading-none">₹{totalPrice.toFixed(0)}</span>
            </div>
          </div>
        )}

        {/* Security Deposit Acceptance */}
        {totalDays > 0 && (
          <div className={`p-5 rounded-3xl border-2 transition-all ${insuranceAccepted ? 'bg-accent-teal/5 border-accent-teal/30' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                id="insuranceAccept"
                checked={insuranceAccepted}
                onChange={(e) => setInsuranceAccepted(e.target.checked)}
                required
                className="mt-1 w-5 h-5 rounded border-deep-graphite text-interactive-blue focus:ring-interactive-blue"
              />
              <label htmlFor="insuranceAccept" className="text-[13px] font-bold text-cloud-white cursor-pointer select-none">
                I accept the mandatory Security Deposit (Insurance)
                <p className="mt-2 text-[11px] font-medium text-ghost-white leading-relaxed">
                  Deposit of <span className="text-cloud-white font-bold">₹{insurancePrice.toFixed(0)}</span> is fully refundable after vehicle inspection.
                </p>
              </label>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || totalDays <= 0 || !insuranceAccepted}
          className="w-full bg-interactive-blue text-white py-5 rounded-buttons font-black uppercase tracking-widest hover:bg-vivid-blue transition disabled:bg-deep-graphite disabled:text-ghost-white disabled:cursor-not-allowed shadow-xl shadow-interactive-blue/10 text-[14px]"
        >
          {loading ? 'Securing Machine...' : 'Confirm & Pay'}
        </button>

        {totalDays > 0 && !insuranceAccepted && (
          <p className="text-[11px] font-bold text-red-500 text-center uppercase tracking-wider">
             Accept deposit terms to proceed
          </p>
        )}
      </form>

      <div className="mt-8 flex items-center justify-center gap-4 text-ghost-white opacity-40">
         <ShieldCheck size={16} />
         <span className="text-[10px] font-black uppercase tracking-widest">256-bit SSL encrypted</span>
      </div>
    </div>
  );
}
