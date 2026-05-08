'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Calendar, Search, ShieldCheck, Map, Clock, ArrowRight, Star } from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState({
    location: '',
    pickupDate: '',
    returnDate: ''
  });
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locations, setLocations] = useState(['Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Chennai', 'Kolkata', 'Hyderabad']);
  const [filteredLocations, setFilteredLocations] = useState([]);

  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [dbCars, setDbCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await fetch('/api/cars');
        const data = await res.json();
        if (data.success) {
          setDbCars(data.cars);
          // Extract unique locations from cars
          const uniqueLocations = [...new Set(data.cars.map(car => car.location))];
          if (uniqueLocations.length > 0) setLocations(uniqueLocations);
        }
      } catch (err) {
        console.error("Error fetching cars:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const filteredCars = dbCars.filter(car => {
    if (selectedBrand === 'All Brands') return car.rating >= 4;
    return car.brand.toLowerCase() === selectedBrand.toLowerCase();
  });

  useEffect(() => {
    if (!loading && filteredCars.length > 0) {
      controls.start({
        x: ["0%", "-33.33%"],
        transition: { duration: 40, repeat: Infinity, ease: "linear" }
      });
    }
  }, [loading, filteredCars, controls]);

  const handleSearch = () => {
    const query = new URLSearchParams({
      location: searchParams.location,
      pickup: searchParams.pickupDate,
      return: searchParams.returnDate
    }).toString();
    router.push(`/cars?${query}`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: value
    });

    if (name === 'location') {
      if (value.length > 0) {
        const filtered = locations.filter(loc => 
          loc.toLowerCase().startsWith(value.toLowerCase())
        );
        setFilteredLocations(filtered);
        setShowLocationDropdown(true);
      } else {
        setShowLocationDropdown(false);
      }
    }
  };

  const selectLocation = (loc) => {
    setSearchParams({ ...searchParams, location: loc });
    setShowLocationDropdown(false);
  };

  return (
    <div className="bg-white min-h-screen text-cloud-white">
      {/* Hero Section */}
      <section className="relative pt-12 pb-24 overflow-hidden flex items-center">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-accent-teal z-0 hidden lg:block rounded-bl-[100px]"></div>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col lg:flex-row items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2 pr-0 lg:pr-12 text-left"
          >
            <h1 className="text-[32px] md:text-[44px] lg:text-[56px] font-bold mb-4 md:mb-6 text-cloud-white leading-[1.1] tracking-tight">
              DriveNest: Fast <br className="hidden md:block"/> & Easy Car Rental
            </h1>
            <p className="text-[14px] md:text-[16px] text-ghost-white mb-8 md:mb-10 max-w-md leading-relaxed">
              We offer a wide range of vehicles for your needs. Experience a seamless and fast car rental process.
            </p>
            
            {/* Search Form */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white p-5 md:p-6 rounded-[20px] shadow-xl inline-block w-full max-w-lg border border-deep-graphite"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 relative">
                <div className="relative">
                  <label className="block text-[11px] font-bold text-ghost-white mb-1 uppercase tracking-wider">Choose Location</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="location"
                      autoComplete="off"
                      value={searchParams.location}
                      onChange={handleChange}
                      onFocus={() => searchParams.location && setShowLocationDropdown(true)}
                      placeholder="Select Location" 
                      className="w-full text-[14px] outline-none text-cloud-white font-medium bg-transparent border-b border-deep-graphite pb-2 placeholder:font-normal placeholder:text-cool-gray focus:border-highlight-blue transition-colors" 
                    />
                    <MapPin size={16} className="absolute right-0 top-1 text-cool-gray" />
                  </div>
                  
                  {/* Autocomplete Dropdown */}
                  <AnimatePresence>
                    {showLocationDropdown && filteredLocations.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 left-0 right-0 mt-1 bg-white border border-deep-graphite rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto"
                      >
                        {filteredLocations.map((loc, i) => (
                          <div 
                            key={i}
                            onClick={() => selectLocation(loc)}
                            className="px-4 py-3 hover:bg-space-gray cursor-pointer text-cloud-white text-[14px] font-medium border-b border-deep-graphite last:border-0 flex items-center gap-2"
                          >
                            <MapPin size={14} className="text-interactive-blue" />
                            {loc}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-ghost-white mb-1 uppercase tracking-wider">Pick-Up Date</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      name="pickupDate"
                      value={searchParams.pickupDate}
                      onChange={handleChange}
                      className="w-full text-[14px] outline-none text-cloud-white font-medium bg-transparent border-b border-deep-graphite pb-2 focus:border-highlight-blue transition-colors appearance-none" 
                    />
                    <Calendar size={16} className="absolute right-0 top-1 text-cool-gray pointer-events-none" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-ghost-white mb-1 uppercase tracking-wider">Return Date</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      name="returnDate"
                      value={searchParams.returnDate}
                      onChange={handleChange}
                      className="w-full text-[14px] outline-none text-cloud-white font-medium bg-transparent border-b border-deep-graphite pb-2 focus:border-highlight-blue transition-colors appearance-none" 
                    />
                    <Calendar size={16} className="absolute right-0 top-1 text-cool-gray pointer-events-none" />
                  </div>
                </div>
              </div>
              <button 
                onClick={handleSearch}
                className="w-full bg-interactive-blue text-white py-3.5 rounded-buttons font-bold hover:bg-vivid-blue transition shadow-md shadow-interactive-blue/20"
              >
                Search
              </button>
            </motion.div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="lg:w-1/2 mt-16 lg:mt-0 relative"
          >
            <img 
              src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              alt="Luxury SUV" 
              className="w-full h-auto object-cover rounded-2xl shadow-2xl z-10 relative"
            />
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-white text-center">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8"
        >
          <h2 className="text-[28px] md:text-[36px] font-bold text-cloud-white mb-4">How it Work</h2>
          <p className="text-ghost-white mb-12 md:mb-16 max-w-2xl mx-auto text-[14px] md:text-[16px]">
            Renting a car has never been easier. Follow these simple steps to get on the road quickly.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 relative">
            {[
              { icon: <MapPin size={24} />, title: "Choose Location", text: "Find the nearest branch and select your pick-up point.", color: "bg-interactive-blue" },
              { icon: <Calendar size={24} />, title: "Pick-Up Date", text: "Select the dates you need the vehicle for.", color: "bg-interactive-blue" },
              { icon: <ShieldCheck size={24} />, title: "Book Your Car", text: "Confirm your booking and enjoy your ride securely.", color: "bg-accent-teal" }
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className="flex flex-col items-center z-10 w-64"
              >
                <div className="w-20 h-20 bg-interactive-blue/10 rounded-full flex items-center justify-center mb-6">
                  <div className={`w-14 h-14 ${step.color} rounded-full flex items-center justify-center shadow-lg text-white`}>
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-[18px] font-bold text-cloud-white mb-2">{step.title}</h3>
                <p className="text-[14px] text-ghost-white">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Top Rated Rented Cars */}
      <section className="py-24 bg-space-gray">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-[28px] md:text-[36px] font-bold text-cloud-white mb-4">Top Rated Rented Cars</h2>
            <p className="text-ghost-white mb-12 max-w-2xl mx-auto text-[14px] md:text-[16px]">
              Explore our most popular vehicles, chosen by customers for their reliability and comfort.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {['All Brands', 'Toyota', 'Nissan', 'Ford', 'Peugeot'].map((brand, idx) => (
              <button 
                key={idx} 
                onClick={() => setSelectedBrand(brand)}
                className={`px-6 py-2 rounded-buttons text-[14px] font-semibold transition ${
                  selectedBrand === brand 
                    ? 'bg-interactive-blue text-white shadow-md' 
                    : 'bg-white text-ghost-white border border-deep-graphite hover:border-interactive-blue hover:text-interactive-blue'
                }`}
              >
                {brand}
              </button>
            ))}
          </motion.div>

          <div 
            className="relative overflow-hidden py-4"
            onMouseEnter={() => controls.stop()}
            onMouseLeave={() => controls.start({
              x: ["0%", "-33.33%"],
              transition: { duration: 40, repeat: Infinity, ease: "linear" }
            })}
          >
            <motion.div 
              className="flex gap-8"
              animate={controls}
              style={{ width: "fit-content" }}
            >
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="min-w-[350px] h-[400px] bg-space-gray animate-pulse rounded-[20px]" />
                ))
              ) : filteredCars.length === 0 ? (
                <div className="w-full py-20 text-center text-ghost-white">No cars found for this selection.</div>
              ) : (
                // Duplicate the list 3 times to ensure smooth infinite loop
                [...filteredCars, ...filteredCars, ...filteredCars].map((car, idx) => (
                  <div 
                    key={`${car._id}-${idx}`}
                    className="min-w-[280px] md:min-w-[350px] bg-white rounded-[20px] p-5 md:p-6 shadow-sm border border-deep-graphite text-left hover:shadow-xl transition group/card"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-accent-teal/10 text-accent-teal text-[12px] font-bold px-3 py-1 rounded-full uppercase">{car.category}</span>
                      <div className="flex items-center gap-1 text-interactive-blue font-bold">
                        <Star size={14} fill="currentColor" /> {car.rating}
                      </div>
                    </div>
                    <div className="h-40 flex items-center justify-center mb-6 overflow-hidden">
                      <img 
                        src={car.images[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800'} 
                        alt={car.name} 
                        className="w-full h-full object-contain group-hover/card:scale-110 transition-transform duration-500" 
                      />
                    </div>
                    <h3 className="text-[20px] font-bold text-cloud-white text-center mb-4">{car.name}</h3>
                    <div className="flex justify-center items-center gap-4 text-[12px] text-ghost-white mb-6">
                      <span className="flex items-center gap-1"><MapPin size={14}/> {car.seats} Seats</span>
                      <span className="flex items-center gap-1"><ShieldCheck size={14}/> {car.transmission}</span>
                    </div>
                    <div className="text-center font-bold text-[18px] text-cloud-white mb-6">
                      Starting at ₹{car.pricePerDay}<span className="text-[14px] font-normal text-ghost-white">/Day</span>
                    </div>
                    <div className="flex gap-3">
                      <Link href={`/cars/${car._id}`} className="flex-1">
                        <button className="w-full bg-interactive-blue text-white py-2.5 rounded-buttons font-bold hover:bg-vivid-blue transition">Rent</button>
                      </Link>
                      <button className="flex-1 bg-white text-cloud-white py-2.5 rounded-buttons border border-deep-graphite font-bold hover:bg-space-gray transition">Details</button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Best Services and Luxuries Cars */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-[28px] md:text-[36px] font-bold text-cloud-white mb-4">Best Services and Luxuries Cars</h2>
            <p className="text-ghost-white max-w-2xl mx-auto text-[14px] md:text-[16px]">
              We provide exceptional service along with our premium vehicles to ensure your journey is comfortable and hassle-free.
            </p>
          </motion.div>
          
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="lg:w-3/5"
            >
              <img 
                src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Luxury Car" 
                className="w-full rounded-2xl shadow-xl"
              />
            </motion.div>
            
            <div className="lg:w-2/5 space-y-8">
              {[
                { icon: <ShieldCheck className="text-accent-teal" size={20} />, title: "Connect Support", text: "24/7 dedicated support to assist you anytime, anywhere during your rental period." },
                { icon: <Map className="text-accent-teal" size={20} />, title: "City Locations", text: "Multiple convenient pick-up and drop-off points located throughout the city." },
                { icon: <Clock className="text-accent-teal" size={20} />, title: "Free Cancellation", text: "Flexible booking with free cancellation up to 24 hours before your pick-up time." }
              ].map((service, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.2 }}
                  className="flex gap-4 items-start"
                >
                  <div className="w-12 h-12 bg-space-gray rounded-full flex items-center justify-center shrink-0 border border-deep-graphite">
                    {service.icon}
                  </div>
                  <div>
                    <h4 className="text-[18px] font-bold text-cloud-white mb-1">{service.title}</h4>
                    <p className="text-[14px] text-ghost-white leading-relaxed">{service.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-24 bg-space-gray text-center">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8"
        >
          <h2 className="text-[28px] md:text-[36px] font-bold text-cloud-white mb-4">Find DriveNest Branches all Over The World</h2>
          <p className="text-ghost-white mb-10 max-w-2xl mx-auto text-[14px] md:text-[16px]">
            With locations globally, we make it easy to rent a car wherever you travel.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center max-w-md mx-auto mb-10 gap-3 sm:gap-0">
            <input type="text" placeholder="Search branch location..." className="flex-1 px-6 py-3 rounded-buttons sm:rounded-r-none border border-deep-graphite outline-none text-[14px]" />
            <button className="bg-interactive-blue text-white px-8 py-3 rounded-buttons sm:rounded-l-none font-bold hover:bg-vivid-blue transition">Search</button>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative w-full h-[400px] bg-accent-teal/10 rounded-2xl overflow-hidden border border-accent-teal/20"
          >
            {/* Map Placeholder Image */}
            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="World Map" className="w-full h-full object-cover opacity-60 mix-blend-multiply" />
            
            {/* Pin Overlays */}
            {[
              { top: "30%", left: "20%" },
              { top: "40%", left: "50%" },
              { top: "60%", left: "70%" },
              { top: "20%", left: "80%" },
              { top: "70%", left: "30%" }
            ].map((pin, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 1 + (i * 0.1) }}
                className="absolute text-interactive-blue"
                style={{ top: pin.top, left: pin.left }}
              >
                <MapPin fill="currentColor" size={32} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-[28px] md:text-[36px] font-bold text-cloud-white mb-4">What People Say About Us?</h2>
            <p className="text-ghost-white max-w-2xl mx-auto text-[14px] md:text-[16px]">
              Read reviews from our satisfied customers and discover why they choose us for their car rental needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Arjun Sharma", img: "https://i.pravatar.cc/150?img=11" },
              { name: "Priyanka Nair", img: "https://i.pravatar.cc/150?img=32" },
              { name: "Rahul Deshmukh", img: "https://i.pravatar.cc/150?img=53" }
            ].map((customer, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="bg-white p-8 rounded-[20px] shadow-lg border border-deep-graphite relative"
              >
                <div className="text-accent-teal/20 absolute right-8 top-8">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z" />
                  </svg>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <img src={customer.img} alt={customer.name} className="w-14 h-14 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-cloud-white">{customer.name}</h4>
                    <div className="flex text-interactive-blue">
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                    </div>
                  </div>
                </div>
                <p className="text-ghost-white text-[14px] leading-relaxed relative z-10">
                  "Absolutely brilliant service! The car was in perfect condition and the process was incredibly smooth. I will definitely be renting from here again on my next trip."
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Off Road Cars */}
      <section className="py-24 bg-space-gray text-center overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-[28px] md:text-[36px] font-bold text-cloud-white mb-4">We Rent a Powerful Machines too</h2>
            <p className="text-ghost-white mb-12 max-w-2xl mx-auto relative z-10 text-[14px] md:text-[16px]">
              For those who crave adventure, we offer a range of powerful off-road vehicles ready to tackle any terrain.
            </p>
          </motion.div>
          
          <div className="relative h-[300px] md:h-[400px] flex items-center justify-center">
            <motion.h1 
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 0.8, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute text-[80px] md:text-[140px] font-black text-cloud-white/5 whitespace-nowrap z-0 select-none" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>
              OFF ROAD CARS
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative z-10 flex justify-center w-full max-w-4xl"
            >
               <img src="https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Jeep Fleet" className="w-full h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Know More To Choose */}
      <section className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-[28px] md:text-[36px] font-bold text-cloud-white mb-4">Know More to Choose</h2>
            <p className="text-ghost-white mb-12 md:mb-16 max-w-2xl mx-auto text-[14px] md:text-[16px]">
              Read our guides and articles to help you make the best decision for your next rental.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Best Road Trip Destinations in 2024", img: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
              { title: "How to Choose the Right SUV for Family", img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
              { title: "Essential Tips for Renting a Car Abroad", img: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" }
            ].map((article, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="text-left group cursor-pointer"
              >
                <div className="overflow-hidden rounded-2xl mb-4">
                  <img src={article.img} alt={article.title} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex items-center gap-2 text-[12px] text-ghost-white mb-2">
                  <span><Calendar size={14} className="inline mr-1" /> Mar 10, 2024</span>
                </div>
                <h3 className="text-[18px] font-bold text-cloud-white mb-3 group-hover:text-interactive-blue transition">{article.title}</h3>
                <Link href="#" className="text-interactive-blue text-[14px] font-bold inline-flex items-center">
                  Read More <ArrowRight size={16} className="ml-1" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Logos */}
      <section className="py-12 bg-space-gray border-t border-deep-graphite">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition duration-500"
          >
            {['Audi', 'Mercedes', 'Honda', 'Jeep', 'Volvo', 'Nissan', 'VW', 'Hyundai'].map((brand, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-xl font-black tracking-widest text-cloud-white uppercase"
              >
                {brand}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

    </div>
  );
}