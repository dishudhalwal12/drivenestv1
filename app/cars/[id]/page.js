'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import BookingForm from '@/components/BookingForm';
import Link from 'next/link';
import { MapPin, Users, ShieldCheck, Clock, Star, ArrowLeft, ChevronRight, User, Info, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CarDetailsPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDrivers, setShowDrivers] = useState(false);

  useEffect(() => {
    fetchCarDetails();
    fetchAvailableDrivers();
  }, [params.id]);

  const fetchCarDetails = async () => {
    try {
      const response = await fetch(`/api/cars/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setCar(data.car);
      }
    } catch (error) {
      console.error('Error fetching car details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableDrivers = async () => {
    try {
      const response = await fetch('/api/drivers?available=true');
      const data = await response.json();

      if (data.success) {
        setAvailableDrivers(data.data);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const handleDriverSelect = (driver) => {
    setSelectedDriver(driver);
    setShowDrivers(false);
  };

  const handleRemoveDriver = () => {
    setSelectedDriver(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-interactive-blue"></div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center p-8 bg-space-gray rounded-3xl border border-deep-graphite shadow-xl">
          <h1 className="text-2xl font-bold text-cloud-white mb-4">Car not found</h1>
          <Link href="/cars" className="text-interactive-blue font-bold hover:underline flex items-center justify-center gap-2">
            <ArrowLeft size={18} /> Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Header / Breadcrumb */}
      <div className="max-w-[1200px] mx-auto px-4 pt-12 mb-8">
        <Link href="/cars" className="inline-flex items-center gap-2 text-ghost-white hover:text-interactive-blue font-bold transition mb-6">
          <ArrowLeft size={18} /> Back to browse
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-[14px] font-bold text-interactive-blue uppercase tracking-widest">
              <span className="bg-interactive-blue/10 px-3 py-1 rounded-full">{car.category}</span>
              {car.rating && <span className="flex items-center gap-1 bg-space-gray px-3 py-1 rounded-full"><Star size={14} fill="currentColor" /> {car.rating}</span>}
            </div>
            <h1 className="text-[36px] md:text-[48px] font-black text-cloud-white leading-tight tracking-tighter uppercase">{car.name}</h1>
            <p className="text-ghost-white text-[16px] font-medium flex items-center gap-2">
              <MapPin size={18} className="text-interactive-blue" /> {car.location}
            </p>
          </div>
          <div className="text-left md:text-right">
             <div className="text-[14px] font-bold text-ghost-white uppercase tracking-widest mb-1">Starting at</div>
             <div className="text-[40px] font-black text-cloud-white leading-none">₹{car.pricePerDay}<span className="text-[18px] font-normal text-ghost-white tracking-normal uppercase"> / Day</span></div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Car Details */}
        <div className="lg:col-span-2 space-y-10">
          {/* Main Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-space-gray rounded-[40px] overflow-hidden border border-deep-graphite shadow-2xl relative group"
          >
            <img
              src={car.images[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200'}
              alt={car.name}
              className="w-full h-[300px] md:h-[500px] object-cover"
            />
            {!car.available && (
              <div className="absolute inset-0 bg-pitch-black/60 backdrop-blur-sm flex items-center justify-center">
                 <span className="bg-red-600 text-white px-8 py-3 rounded-full text-xl font-black uppercase tracking-widest shadow-2xl">Currently Rented</span>
              </div>
            )}
          </motion.div>

          {/* Quick Specs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Users size={20} />, label: "Seats", value: `${car.seats} Person` },
              { icon: <ShieldCheck size={20} />, label: "Transmission", value: car.transmission },
              { icon: <Clock size={20} />, label: "Year", value: car.year },
              { icon: <Star size={20} />, label: "Fuel Type", value: car.fuelType }
            ].map((spec, i) => (
              <div key={i} className="bg-white p-6 rounded-[24px] border border-deep-graphite shadow-sm flex flex-col items-center text-center group hover:border-interactive-blue transition-colors">
                <div className="w-12 h-12 bg-space-gray rounded-2xl flex items-center justify-center text-interactive-blue mb-4 group-hover:bg-interactive-blue group-hover:text-white transition-all">
                  {spec.icon}
                </div>
                <div className="text-[12px] font-bold text-ghost-white uppercase tracking-wider mb-1">{spec.label}</div>
                <div className="text-[15px] font-black text-cloud-white uppercase tracking-tight">{spec.value}</div>
              </div>
            ))}
          </div>

          {/* Description & Features */}
          <div className="bg-white p-8 md:p-12 rounded-[40px] border border-deep-graphite shadow-sm">
            <h2 className="text-[24px] font-black text-cloud-white mb-6 uppercase tracking-tighter">About this machine</h2>
            <p className="text-ghost-white leading-relaxed text-[16px] mb-10 font-medium">
              {car.description || "Experience unparalleled performance and comfort with this premium vehicle. Perfectly maintained and ready to elevate your journey to the next level."}
            </p>

            <h2 className="text-[20px] font-black text-cloud-white mb-6 uppercase tracking-tighter">Premium Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(car.features || ["Air Conditioning", "Bluetooth", "Backup Camera", "GPS Navigation"]).map((feature, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-space-gray rounded-2xl border border-deep-graphite">
                  <div className="w-8 h-8 bg-accent-teal/10 rounded-full flex items-center justify-center text-accent-teal">
                    <ShieldCheck size={16} />
                  </div>
                  <span className="text-cloud-white font-bold text-[14px]">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Driver Section */}
          {session && car.available && (
            <div className="bg-white p-8 md:p-12 rounded-[40px] border border-deep-graphite shadow-sm relative overflow-hidden">
               <div className="absolute right-0 top-0 w-32 h-32 bg-accent-teal opacity-5 rounded-bl-full"></div>
               
               <h2 className="text-[24px] font-black text-cloud-white mb-4 uppercase tracking-tighter flex items-center gap-3">
                 <User size={24} className="text-interactive-blue" /> Need a professional Pilot?
               </h2>
               
               {!selectedDriver ? (
                 <div className="space-y-6">
                    <p className="text-ghost-white text-[15px] font-medium max-w-md">
                      Hire a professional, verified driver for your journey. Focus on the view while we handle the road.
                    </p>
                    
                    {availableDrivers.length > 0 ? (
                      <div>
                        <button
                          onClick={() => setShowDrivers(!showDrivers)}
                          className="bg-interactive-blue text-white px-8 py-4 rounded-buttons font-black uppercase tracking-widest hover:bg-vivid-blue transition shadow-lg shadow-interactive-blue/20 text-[14px]"
                        >
                          {showDrivers ? 'Close Roster' : 'Browse Driver Roster'}
                        </button>

                        {/* Driver List - Horizontal Scroll on Mobile */}
                        {showDrivers && (
                          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availableDrivers.map((driver) => (
                              <div 
                                key={driver._id} 
                                className="bg-space-gray p-6 rounded-[24px] border border-deep-graphite hover:border-interactive-blue transition group cursor-pointer"
                                onClick={() => handleDriverSelect(driver)}
                              >
                                <div className="flex items-center gap-5">
                                  <div className="relative">
                                    <img
                                      src={driver.photo || 'https://i.pravatar.cc/150?u=driver'}
                                      alt={driver.name}
                                      className="w-20 h-20 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                      onError={(e) => { e.target.src = 'https://i.pravatar.cc/150?u=driver'; }}
                                    />
                                    <div className="absolute -bottom-2 -right-2 bg-accent-teal text-white p-1 rounded-lg">
                                       <Star size={12} fill="currentColor" />
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-black text-cloud-white uppercase tracking-tight">{driver.name}</h3>
                                    <p className="text-[12px] font-bold text-ghost-white uppercase tracking-widest mb-2">
                                      {driver.experience} Yrs Experience
                                    </p>
                                    <div className="text-[16px] font-black text-interactive-blue">
                                      ₹{driver.salary.amount} <span className="text-[10px] text-ghost-white font-normal">/ {driver.salary.paymentFrequency}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-ghost-white italic bg-space-gray p-4 rounded-xl border border-deep-graphite inline-block text-[14px]">No pilots available at the moment</p>
                    )}
                 </div>
               ) : (
                 <div className="bg-space-gray p-6 md:p-8 rounded-[32px] border-2 border-interactive-blue relative">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <img
                          src={selectedDriver.photo || 'https://i.pravatar.cc/150?u=driver'}
                          alt={selectedDriver.name}
                          className="w-24 h-24 rounded-3xl object-cover shadow-xl border-2 border-white"
                          onError={(e) => { e.target.src = 'https://i.pravatar.cc/150?u=driver'; }}
                        />
                        <div>
                          <h3 className="text-xl font-black text-cloud-white uppercase tracking-tighter">{selectedDriver.name}</h3>
                          <div className="flex items-center gap-2 mb-2">
                             <span className="bg-interactive-blue text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">{selectedDriver.licenceDetails.licenceType}</span>
                             <span className="text-[12px] font-bold text-ghost-white">{selectedDriver.experience} Yrs EXP</span>
                          </div>
                          <p className="text-[18px] font-black text-interactive-blue">
                            ₹{selectedDriver.salary.amount}<span className="text-[12px] font-normal text-ghost-white"> / {selectedDriver.salary.paymentFrequency}</span>
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveDriver}
                        className="w-full md:w-auto bg-white text-red-600 px-6 py-3 rounded-buttons font-black uppercase tracking-widest text-[12px] border border-deep-graphite hover:bg-red-50 transition"
                      >
                        Remove Driver
                      </button>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-deep-graphite grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 text-[14px] text-cloud-white font-bold">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-interactive-blue">
                          <Clock size={16} />
                        </div>
                        {selectedDriver.contactNumber}
                      </div>
                      <div className="flex items-center gap-3 text-[14px] text-cloud-white font-bold">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-interactive-blue">
                          <User size={16} />
                        </div>
                        {selectedDriver.email}
                      </div>
                    </div>
                 </div>
               )}
            </div>
          )}

          {/* Security Deposit Info */}
          {session && car.available && (
            <div className="bg-space-gray p-8 md:p-10 rounded-[40px] border border-deep-graphite">
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-interactive-blue shadow-xl shrink-0">
                   <ShieldCheck size={32} />
                </div>
                <div>
                   <h2 className="text-[20px] font-black text-cloud-white mb-2 uppercase tracking-tighter">Mandatory Security Deposit</h2>
                   <p className="text-ghost-white text-[14px] font-medium leading-relaxed mb-6 max-w-md">
                     A fully refundable security deposit is required for all bookings to ensure the best experience for everyone.
                   </p>
                   
                   <div className="grid grid-cols-2 gap-3 mb-6">
                      {[
                        "100% Refundable", "Damage Protection", "One-time Fee", "Quick Return"
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-[12px] font-bold text-cloud-white">
                           <div className="w-5 h-5 bg-accent-teal/10 rounded-full flex items-center justify-center text-accent-teal">
                              <ChevronRight size={12} />
                           </div>
                           {item}
                        </div>
                      ))}
                   </div>

                   <div className="bg-white p-4 rounded-2xl border border-deep-graphite flex items-start gap-3">
                      <Info size={18} className="text-interactive-blue mt-0.5 shrink-0" />
                      <p className="text-[12px] font-medium text-ghost-white">
                        The deposit is 10% of the total booking value. It will be returned within 7 business days after car inspection.
                      </p>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Booking Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            {session ? (
              car.available ? (
                <BookingForm 
                  car={car} 
                  userId={session.user.id}
                  selectedDriver={selectedDriver}
                />
              ) : (
                <div className="bg-white p-10 rounded-[40px] border border-deep-graphite shadow-2xl text-center space-y-6">
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-600">
                    <X size={40} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-cloud-white uppercase tracking-tighter mb-2">Unavailable</h3>
                    <p className="text-ghost-white text-[14px] font-medium">This machine is currently out on duty. Check back soon or browse other available models.</p>
                  </div>
                  <Link href="/cars" className="block w-full bg-space-gray text-cloud-white py-4 rounded-buttons font-black uppercase tracking-widest text-[13px] hover:bg-deep-graphite transition border border-deep-graphite">
                    Browse Other Cars
                  </Link>
                </div>
              )
            ) : (
              <div className="bg-white p-10 rounded-[40px] border border-deep-graphite shadow-2xl space-y-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-interactive-blue/10 rounded-[20px] flex items-center justify-center mx-auto text-interactive-blue mb-6">
                    <User size={32} />
                  </div>
                  <h3 className="text-xl font-black text-cloud-white uppercase tracking-tighter mb-2">Ready to Drive?</h3>
                  <p className="text-ghost-white text-[14px] font-medium">Please sign in to your Drivenest account to book this vehicle.</p>
                </div>
                
                <Link
                  href="/auth/signin"
                  className="block w-full bg-interactive-blue text-white text-center py-5 rounded-buttons font-black uppercase tracking-widest hover:bg-vivid-blue transition shadow-lg shadow-interactive-blue/20 text-[14px]"
                >
                  Sign In to Book
                </Link>
                
                <div className="pt-6 border-t border-deep-graphite text-center">
                   <p className="text-[12px] font-bold text-ghost-white uppercase tracking-wider">New to Drivenest?</p>
                   <Link href="/auth/signup" className="text-interactive-blue font-black text-[14px] hover:underline">Create Account</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
