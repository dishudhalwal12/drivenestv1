'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Menu, X, User, LogOut, ChevronRight } from 'lucide-react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignIn = () => {
    setIsMenuOpen(false);
    router.push('/auth/signin');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-pitch-black/80 backdrop-blur-md sticky top-0 z-50 border-b border-deep-graphite">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-interactive-blue tracking-tighter uppercase">
              <div className="bg-interactive-blue text-white p-1.5 rounded-lg shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-car-front"><path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.64 5H8.4a2 2 0 0 0-1.9 1.3L5 10 3 8"/><path d="M7 14h.01"/><path d="M17 14h.01"/><rect width="18" height="8" x="3" y="10" rx="2"/><path d="M5 18v2"/><path d="M19 18v2"/></svg>
              </div>
              <span className="text-cloud-white">DriveNest</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8 text-[14px]">
            <Link
              href="/cars"
              className="text-ghost-white font-semibold hover:text-interactive-blue transition"
            >
              Browse Cars
            </Link>
            <Link
              href="/drivers"
              className="text-ghost-white font-semibold hover:text-interactive-blue transition"
            >
              Drivers
            </Link>
            <Link
              href="/admin/dashboard"
              className="text-ghost-white font-semibold hover:text-interactive-blue transition"
            >
              Dashboard
            </Link>
            {status === 'authenticated' ? (
              <>
                <Link
                  href="/bookings"
                  className="text-ghost-white font-semibold hover:text-interactive-blue transition"
                >
                  My Bookings
                </Link>

                <div className="flex items-center space-x-4 pl-6 border-l border-deep-graphite">
                  <div className="flex items-center space-x-3 bg-space-gray py-1.5 px-3 rounded-full border border-deep-graphite">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name}
                        className="w-7 h-7 rounded-full shadow-sm"
                      />
                    ) : (
                      <div className="w-7 h-7 bg-interactive-blue/10 flex items-center justify-center rounded-full">
                        <User size={14} className="text-interactive-blue" />
                      </div>
                    )}
                    <span className="text-cloud-white font-bold text-[13px]">
                      {session.user.name.split(' ')[0]}
                    </span>
                  </div>

                  <button
                    onClick={() => signOut()}
                    className="text-ghost-white hover:text-cloud-white transition bg-space-gray p-2 rounded-full border border-deep-graphite"
                    title="Sign Out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSignIn}
                  className="text-[14px] font-bold text-ghost-white hover:text-interactive-blue transition"
                >
                  Log In
                </button>
                <button
                  onClick={handleSignIn}
                  className="bg-interactive-blue text-white px-7 py-2.5 rounded-buttons text-[14px] font-bold hover:bg-vivid-blue transition shadow-md shadow-interactive-blue/20"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-cloud-white p-2 focus:outline-none"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pt-2 pb-6 space-y-2 bg-white border-t border-deep-graphite shadow-xl">
          <Link
            href="/cars"
            className="flex justify-between items-center px-4 py-3 text-[16px] font-semibold text-cloud-white hover:bg-space-gray rounded-xl transition"
            onClick={() => setIsMenuOpen(false)}
          >
            Browse Cars
            <ChevronRight size={18} className="text-cool-gray" />
          </Link>
          <Link
            href="/drivers"
            className="flex justify-between items-center px-4 py-3 text-[16px] font-semibold text-cloud-white hover:bg-space-gray rounded-xl transition"
            onClick={() => setIsMenuOpen(false)}
          >
            Drivers
            <ChevronRight size={18} className="text-cool-gray" />
          </Link>
          <Link
            href="/admin/dashboard"
            className="flex justify-between items-center px-4 py-3 text-[16px] font-semibold text-cloud-white hover:bg-space-gray rounded-xl transition"
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
            <ChevronRight size={18} className="text-cool-gray" />
          </Link>
          
          {status === 'authenticated' ? (
            <>
              <Link
                href="/bookings"
                className="flex justify-between items-center px-4 py-3 text-[16px] font-semibold text-cloud-white hover:bg-space-gray rounded-xl transition"
                onClick={() => setIsMenuOpen(false)}
              >
                My Bookings
                <ChevronRight size={18} className="text-cool-gray" />
              </Link>
              <div className="pt-4 mt-4 border-t border-deep-graphite flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-interactive-blue/10 flex items-center justify-center rounded-full">
                      <User size={20} className="text-interactive-blue" />
                    </div>
                  )}
                  <span className="font-bold text-cloud-white">{session.user.name}</span>
                </div>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    signOut();
                  }}
                  className="p-2 text-cool-gray hover:text-interactive-blue"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="pt-4 mt-4 border-t border-deep-graphite grid grid-cols-2 gap-4 px-2">
              <button
                onClick={handleSignIn}
                className="w-full py-3 text-[15px] font-bold text-cloud-white border border-deep-graphite rounded-buttons hover:bg-space-gray transition"
              >
                Log In
              </button>
              <button
                onClick={handleSignIn}
                className="w-full py-3 text-[15px] font-bold text-white bg-interactive-blue rounded-buttons hover:bg-vivid-blue transition shadow-md"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}