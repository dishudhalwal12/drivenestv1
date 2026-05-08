import Link from 'next/link';
import { Users, Star } from 'lucide-react';

export default function CarCard({ car }) {
  return (
    <div className="bg-white rounded-[24px] overflow-hidden transition-all duration-300 hover:shadow-xl border border-deep-graphite group flex flex-col h-full">
      <div className="relative h-48 md:h-56 overflow-hidden bg-space-gray">
        <img
          src={car.images?.[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800'}
          alt={car.name}
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-105"
        />
        {!car.available && (
          <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase">
            Unavailable
          </div>
        )}
        <div className="absolute bottom-4 left-4">
           <span className="bg-white/80 backdrop-blur-md text-cloud-white px-3 py-1 rounded-full text-[11px] font-bold uppercase border border-white/20">
             {car.category || 'Luxury'}
           </span>
        </div>
        {car.rating && (
          <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md text-interactive-blue px-2 py-1 rounded-lg text-[12px] font-bold flex items-center gap-1 shadow-sm">
            <Star size={12} fill="currentColor" /> {car.rating}
          </div>
        )}
      </div>

      <div className="p-5 md:p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-[18px] md:text-[20px] font-bold text-cloud-white leading-tight group-hover:text-interactive-blue transition-colors">{car.name}</h3>
        </div>
        <p className="text-cool-gray text-[13px] mb-4 font-medium">
          {car.brand} <span className="mx-1">•</span> {car.year}
        </p>

        <div className="flex items-center gap-4 mb-6">
          <span className="flex items-center text-[13px] text-ghost-white font-medium">
            <Users className="w-4 h-4 mr-1.5 text-interactive-blue" />
            {car.seats} Seats
          </span>
          <span className="text-[11px] text-ghost-white font-bold uppercase tracking-wider bg-space-gray px-2.5 py-1 rounded-lg border border-deep-graphite">
            {car.transmission}
          </span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-deep-graphite/50">
          <div>
            <span className="text-[20px] md:text-[24px] font-black text-cloud-white">
              ₹{car.pricePerDay}
            </span>
            <span className="text-cool-gray text-[12px] font-medium ml-1">/day</span>
          </div>

          <Link
            href={`/cars/${car._id}`}
            className={`px-6 py-2.5 rounded-buttons text-[13px] font-bold transition shadow-sm ${
              car.available
                ? 'bg-interactive-blue text-white hover:bg-vivid-blue shadow-interactive-blue/10'
                : 'bg-space-gray text-cool-gray cursor-not-allowed border border-deep-graphite'
            }`}
          >
            {car.available ? 'Rent Now' : 'Unavailable'}
          </Link>
        </div>
      </div>
    </div>
  );
}