'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, ShieldCheck, MapPin, Star, Calendar, Clock, DollarSign, X, ChevronRight, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DriversPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('available');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showHireModal, setShowHireModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [hireFormData, setHireFormData] = useState({
    startDate: '',
    duration: '',
    durationType: 'days',
    carId: '',
    specialRequirements: '',
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  });

  useEffect(() => {
    fetchDrivers();
  }, [filter]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (session?.user) {
      setHireFormData(prev => ({
        ...prev,
        customerName: session.user.name || '',
        customerEmail: session.user.email || '',
      }));
    }
  }, [session]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const queryParam = filter === 'available' ? '?available=true' : 
                        filter !== 'all' ? `?status=${filter}` : '';
      
      const response = await fetch(`/api/drivers${queryParam}`);
      const data = await response.json();
      
      if (data.success) {
        setDrivers(data.data);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHireClick = (driver) => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    setSelectedDriver(driver);
    setShowHireModal(true);
  };

  const calculateTotalAmount = () => {
    if (!selectedDriver || !hireFormData.duration) return 0;
    
    const { amount, paymentFrequency } = selectedDriver.salary;
    const { duration, durationType } = hireFormData;
    
    let multiplier = 1;
    if (durationType === 'weeks') multiplier = 7;
    else if (durationType === 'months') multiplier = 30;
    
    const totalDays = duration * multiplier;
    
    if (paymentFrequency === 'daily') return amount * totalDays;
    if (paymentFrequency === 'weekly') return amount * (totalDays / 7);
    return amount * (totalDays / 30);
  };

  const handlePayment = async () => {
    if (!hireFormData.startDate || !hireFormData.duration || 
        !hireFormData.customerName || !hireFormData.customerEmail || 
        !hireFormData.customerPhone) {
      alert('Please fill in all required fields');
      return;
    }
    
    setProcessingPayment(true);
    
    try {
      const totalAmount = calculateTotalAmount();
      const orderResponse = await fetch('/api/payment/driver/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          driverId: selectedDriver._id,
          hireDetails: hireFormData
        }),
      });
      
      const orderData = await orderResponse.json();
      if (!orderData.success) throw new Error(orderData.error || 'Failed to create order');

      const options = {
        key: orderData.razorpayKeyId,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Drivenest - Pilot Roster',
        description: `Hire ${selectedDriver.name} for ${hireFormData.duration} ${hireFormData.durationType}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            const verifyResponse = await fetch('/api/payment/driver/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                driverId: selectedDriver._id,
                hireDetails: hireFormData
              }),
            });
            
            const verifyData = await verifyResponse.json();
            if (verifyData.success) {
              alert('Pilot hired successfully!');
              setShowHireModal(false);
              fetchDrivers();
              router.push('/bookings');
            }
          } catch (error) {
            alert('Verification failed: ' + error.message);
          } finally {
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: hireFormData.customerName,
          email: hireFormData.customerEmail,
          contact: hireFormData.customerPhone
        },
        theme: { color: '#f97316' },
        modal: { ondismiss: () => setProcessingPayment(false) }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert('Payment failed: ' + error.message);
      setProcessingPayment(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHireFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Hero Header */}
      <div className="bg-pitch-black pt-28 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-pitch-black"></div>
        
        <div className="max-w-[1200px] mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-[48px] md:text-[64px] font-black text-cloud-white leading-tight uppercase tracking-tighter mb-4">
              Professional <span className="text-interactive-blue">Pilots</span>
            </h1>
            <p className="text-ghost-white text-[16px] md:text-[18px] max-w-2xl font-medium leading-relaxed">
              Experience the luxury of being driven. Our professional pilots are verified, experienced, and ready to take the wheel while you focus on your journey.
            </p>
          </motion.div>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto px-4 -mt-12 relative z-20">
        {/* Filter Section */}
        <div className="bg-white p-6 rounded-[32px] border border-deep-graphite shadow-2xl mb-10 flex flex-wrap gap-3">
          {[
            { id: 'available', label: 'Ready for Duty' },
            { id: 'all', label: 'All Pilots' },
            { id: 'active', label: 'Currently Active' }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`px-6 py-3 rounded-full font-bold text-[13px] uppercase tracking-wider transition-all ${
                filter === btn.id 
                ? 'bg-interactive-blue text-white shadow-lg shadow-interactive-blue/20' 
                : 'bg-space-gray text-ghost-white border border-deep-graphite hover:border-interactive-blue'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Drivers Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-interactive-blue/20 border-t-interactive-blue rounded-full animate-spin mb-4"></div>
            <p className="text-ghost-white font-bold uppercase tracking-widest text-[12px]">Scanning Roster...</p>
          </div>
        ) : drivers.length === 0 ? (
          <div className="bg-space-gray rounded-[40px] border border-deep-graphite p-20 text-center">
            <User size={64} className="mx-auto text-cool-gray mb-6 opacity-20" />
            <p className="text-[20px] text-cloud-white font-bold mb-2">No pilots found</p>
            <p className="text-ghost-white text-[14px]">Try adjusting your search filters to find available pilots.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {drivers.map((driver, idx) => (
              <motion.div
                key={driver._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-[40px] border border-deep-graphite overflow-hidden hover:border-interactive-blue transition-all group shadow-sm hover:shadow-2xl"
              >
                <div className="relative h-48 bg-space-gray overflow-hidden">
                   <img
                     src={driver.photo || 'https://i.pravatar.cc/150?u=pilot'}
                     alt={driver.name}
                     className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                     onError={(e) => { e.target.src = 'https://i.pravatar.cc/150?u=pilot'; }}
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-pitch-black/80 to-transparent"></div>
                   <div className="absolute bottom-4 left-6">
                      <div className="flex items-center gap-2 mb-1">
                         <span className="bg-interactive-blue text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                           {driver.licenceDetails.licenceType}
                         </span>
                         {driver.experience && (
                           <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/20 uppercase">
                             {driver.experience} Yrs Exp
                           </span>
                         )}
                      </div>
                      <h3 className="text-[22px] font-black text-cloud-white uppercase tracking-tighter">{driver.name}</h3>
                   </div>
                   <div className="absolute top-4 right-6">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        driver.status === 'active' ? 'bg-accent-teal/10 text-accent-teal border-accent-teal/30' : 'bg-red-500/10 text-red-500 border-red-500/30'
                      }`}>
                        {driver.status === 'active' ? 'Available' : 'Busy'}
                      </div>
                   </div>
                </div>

                <div className="p-8 space-y-6">
                   <div className="grid grid-cols-2 gap-4 pb-6 border-b border-deep-graphite">
                      <div className="space-y-1">
                         <div className="text-[10px] font-bold text-ghost-white uppercase tracking-wider">Salary Rate</div>
                         <div className="text-[18px] font-black text-interactive-blue">₹{driver.salary.amount}<span className="text-[11px] font-medium text-ghost-white lowercase">/{driver.salary.paymentFrequency}</span></div>
                      </div>
                      <div className="space-y-1 text-right">
                         <div className="text-[10px] font-bold text-ghost-white uppercase tracking-wider">License</div>
                         <div className="text-[14px] font-bold text-cloud-white truncate">{driver.licenceDetails.licenceNumber}</div>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <div className="flex items-center gap-3 text-[13px] font-medium text-ghost-white">
                         <Phone size={14} className="text-interactive-blue" /> {driver.contactNumber}
                      </div>
                      <div className="flex items-center gap-3 text-[13px] font-medium text-ghost-white">
                         <Mail size={14} className="text-interactive-blue" /> {driver.email}
                      </div>
                   </div>

                   <button
                     onClick={() => handleHireClick(driver)}
                     disabled={driver.status !== 'active'}
                     className={`w-full py-4 rounded-buttons font-black text-[13px] uppercase tracking-widest transition-all ${
                       driver.status === 'active'
                       ? 'bg-interactive-blue text-white hover:bg-vivid-blue shadow-lg shadow-interactive-blue/20'
                       : 'bg-space-gray text-cool-gray cursor-not-allowed border border-deep-graphite'
                     }`}
                   >
                     {driver.status === 'active' ? 'Engage Pilot' : 'Currently On Duty'}
                   </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Hire Modal */}
        <AnimatePresence>
          {showHireModal && selectedDriver && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-pitch-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[40px] border border-deep-graphite shadow-3xl max-w-2xl w-full my-auto overflow-hidden"
              >
                <div className="p-8 md:p-12 relative">
                  <button 
                    onClick={() => setShowHireModal(false)}
                    className="absolute right-8 top-8 text-ghost-white hover:text-interactive-blue transition"
                  >
                    <X size={24} />
                  </button>

                  <div className="flex items-center gap-6 mb-10 pb-8 border-b border-deep-graphite">
                     <img
                       src={selectedDriver.photo || 'https://i.pravatar.cc/150?u=pilot'}
                       alt={selectedDriver.name}
                       className="w-24 h-24 rounded-[28px] object-cover border-2 border-interactive-blue"
                       onError={(e) => { e.target.src = 'https://i.pravatar.cc/150?u=pilot'; }}
                     />
                     <div>
                        <h2 className="text-[28px] font-black text-cloud-white uppercase tracking-tighter leading-none mb-2">Hire {selectedDriver.name}</h2>
                        <div className="flex items-center gap-3">
                           <span className="text-[12px] font-bold text-interactive-blue uppercase tracking-widest">{selectedDriver.licenceDetails.licenceType}</span>
                           <span className="w-1.5 h-1.5 rounded-full bg-deep-graphite"></span>
                           <span className="text-[12px] font-bold text-ghost-white uppercase tracking-widest">{selectedDriver.experience} Years Exp</span>
                        </div>
                     </div>
                  </div>

                  <form className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[11px] font-black text-ghost-white uppercase tracking-widest">Start Date</label>
                           <div className="relative">
                              <input
                                type="date"
                                name="startDate"
                                value={hireFormData.startDate}
                                onChange={handleInputChange}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full bg-space-gray border border-deep-graphite px-5 py-4 rounded-2xl outline-none text-cloud-white font-bold text-[14px] focus:border-interactive-blue transition appearance-none"
                              />
                              <Calendar size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-ghost-white pointer-events-none" />
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[11px] font-black text-ghost-white uppercase tracking-widest">Duration</label>
                              <input
                                type="number"
                                name="duration"
                                value={hireFormData.duration}
                                onChange={handleInputChange}
                                min="1"
                                className="w-full bg-space-gray border border-deep-graphite px-5 py-4 rounded-2xl outline-none text-cloud-white font-bold text-[14px] focus:border-interactive-blue transition"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[11px] font-black text-ghost-white uppercase tracking-widest">Unit</label>
                              <select
                                name="durationType"
                                value={hireFormData.durationType}
                                onChange={handleInputChange}
                                className="w-full bg-space-gray border border-deep-graphite px-5 py-4 rounded-2xl outline-none text-cloud-white font-bold text-[14px] focus:border-interactive-blue transition appearance-none"
                              >
                                <option value="days">Days</option>
                                <option value="weeks">Weeks</option>
                                <option value="months">Months</option>
                              </select>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[11px] font-black text-ghost-white uppercase tracking-widest">Special Requirements</label>
                        <textarea
                          name="specialRequirements"
                          value={hireFormData.specialRequirements}
                          onChange={handleInputChange}
                          rows="3"
                          placeholder="e.g. Needs to know hill driving, night shifts, etc."
                          className="w-full bg-space-gray border border-deep-graphite px-5 py-4 rounded-2xl outline-none text-cloud-white font-bold text-[14px] focus:border-interactive-blue transition resize-none"
                        />
                     </div>

                     {hireFormData.duration && (
                       <div className="bg-space-gray p-8 rounded-[32px] border border-deep-graphite">
                          <div className="flex justify-between items-center mb-2">
                             <span className="text-[12px] font-bold text-ghost-white uppercase tracking-widest">Hire Duration</span>
                             <span className="text-[14px] font-black text-cloud-white">{hireFormData.duration} {hireFormData.durationType}</span>
                          </div>
                          <div className="flex justify-between items-center mb-6">
                             <span className="text-[12px] font-bold text-ghost-white uppercase tracking-widest">Pilot Rate</span>
                             <span className="text-[14px] font-black text-cloud-white">₹{selectedDriver.salary.amount}/{selectedDriver.salary.paymentFrequency}</span>
                          </div>
                          <div className="pt-6 border-t border-deep-graphite flex justify-between items-end">
                             <span className="text-[14px] font-black text-cloud-white uppercase tracking-tighter">Total Salary</span>
                             <span className="text-[32px] font-black text-interactive-blue leading-none">₹{calculateTotalAmount().toFixed(0)}</span>
                          </div>
                       </div>
                     )}

                     <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowHireModal(false)}
                          className="flex-1 px-8 py-5 rounded-buttons font-black text-[14px] uppercase tracking-widest text-ghost-white bg-space-gray hover:bg-deep-graphite transition border border-deep-graphite"
                        >
                          Abort
                        </button>
                        <button
                          type="button"
                          onClick={handlePayment}
                          disabled={processingPayment || !hireFormData.duration}
                          className="flex-[2] px-8 py-5 rounded-buttons font-black text-[14px] uppercase tracking-widest text-white bg-interactive-blue hover:bg-vivid-blue transition shadow-xl shadow-interactive-blue/20 disabled:opacity-50"
                        >
                          {processingPayment ? 'Securing Pilot...' : 'Confirm & Proceed'}
                        </button>
                     </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
