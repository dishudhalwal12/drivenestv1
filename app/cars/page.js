'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import CarCard from '@/components/CarCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown, SlidersHorizontal } from 'lucide-react';

export default function CarsPage() {
  const searchParams = useSearchParams();
  const initialLocation = searchParams.get('location') || '';
  
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    transmission: '',
    minPrice: '',
    maxPrice: '',
    location: initialLocation,
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync filters if URL changes (e.g. from hero search)
  useEffect(() => {
    const location = searchParams.get('location');
    if (location && location !== filters.location) {
      setFilters(prev => ({ ...prev, location }));
    }
  }, [searchParams]);

  useEffect(() => {
    fetchCars();
  }, [filters]);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.transmission) queryParams.append('transmission', filters.transmission);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.location) queryParams.append('location', filters.location);
      queryParams.append('available', 'true');

      const response = await fetch(`/api/cars?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setCars(data.cars);
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      transmission: '',
      minPrice: '',
      maxPrice: '',
      location: '',
    });
  };

  return (
    <div className="bg-pitch-black min-h-screen pt-12 pb-24">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-4">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[32px] md:text-[44px] font-bold tracking-tight text-cloud-white"
          >
            Browse Cars
          </motion.h1>

          <button 
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden flex items-center justify-center gap-2 bg-white border border-deep-graphite px-6 py-3 rounded-buttons font-bold text-cloud-white hover:bg-space-gray transition shadow-sm"
          >
            <Filter size={18} />
            {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Filters Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className={`lg:col-span-1 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}
          >
            <div className="bg-white p-6 md:p-8 rounded-[24px] border border-deep-graphite sticky top-24 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-interactive-blue" />
                  <h2 className="text-[18px] md:text-[20px] font-bold text-cloud-white">Filters</h2>
                </div>
                <button
                  onClick={resetFilters}
                  className="text-interactive-blue text-[13px] font-bold hover:underline"
                >
                  Reset All
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[13px] font-bold text-ghost-white mb-2 uppercase tracking-wider">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={filters.category}
                      onChange={handleFilterChange}
                      className="w-full px-5 py-3.5 bg-space-gray text-cloud-white border border-deep-graphite rounded-xl focus:ring-2 focus:ring-interactive-blue outline-none appearance-none cursor-pointer font-medium text-[14px]"
                    >
                      <option value="">All Categories</option>
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                      <option value="hatchback">Hatchback</option>
                      <option value="luxury">Luxury</option>
                      <option value="sports">Sports</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-cool-gray pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-ghost-white mb-2 uppercase tracking-wider">
                    Transmission
                  </label>
                  <div className="relative">
                    <select
                      name="transmission"
                      value={filters.transmission}
                      onChange={handleFilterChange}
                      className="w-full px-5 py-3.5 bg-space-gray text-cloud-white border border-deep-graphite rounded-xl focus:ring-2 focus:ring-interactive-blue outline-none appearance-none cursor-pointer font-medium text-[14px]"
                    >
                      <option value="">All Types</option>
                      <option value="manual">Manual</option>
                      <option value="automatic">Automatic</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-cool-gray pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-ghost-white mb-2 uppercase tracking-wider">
                    Price Range (₹)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      name="minPrice"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                      className="w-full px-5 py-3.5 bg-space-gray text-cloud-white border border-deep-graphite rounded-xl focus:ring-2 focus:ring-interactive-blue outline-none placeholder-cool-gray text-[14px] font-medium"
                    />
                    <input
                      type="number"
                      name="maxPrice"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                      className="w-full px-5 py-3.5 bg-space-gray text-cloud-white border border-deep-graphite rounded-xl focus:ring-2 focus:ring-interactive-blue outline-none placeholder-cool-gray text-[14px] font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-ghost-white mb-2 uppercase tracking-wider">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    placeholder="Enter city"
                    value={filters.location}
                    onChange={handleFilterChange}
                    className="w-full px-5 py-3.5 bg-space-gray text-cloud-white border border-deep-graphite rounded-xl focus:ring-2 focus:ring-interactive-blue outline-none placeholder-cool-gray text-[14px] font-medium"
                  />
                </div>

                {showMobileFilters && (
                  <button 
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full lg:hidden bg-interactive-blue text-white py-4 rounded-buttons font-bold shadow-lg shadow-interactive-blue/20"
                  >
                    Apply Filters
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Cars Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-highlight-blue"></div>
                <p className="mt-4 text-cool-gray">Loading cars...</p>
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-20 bg-space-gray rounded-cards border border-deep-graphite">
                <p className="text-[20px] text-cloud-white mb-2">No cars found</p>
                <p className="text-[14px] text-cool-gray">Try adjusting your filters to see more results.</p>
              </div>
            ) : (
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <AnimatePresence mode="popLayout">
                  {cars.map((car, idx) => (
                    <motion.div
                      key={car._id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                    >
                      <CarCard car={car} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}