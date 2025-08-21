'use client';

import { NavUser } from '@/components/nav-user';
import Link from 'next/link';
import { useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className='min-h-screen bg-white'>
      <header className='border-b border-gray-200 bg-white'>
        <div className='flex items-center justify-between px-4 sm:px-6 py-4'>
          <div className='flex items-center gap-8'>
            {/* Logo */}
            <Link href='/' className='flex items-center gap-3'>
              <svg width='24' height='24' viewBox='0 0 24 24' className='text-gray-900'>
                <circle cx='12' cy='12' r='11' fill='none' stroke='currentColor' strokeWidth='1' />
                <text x='12' y='16' textAnchor='middle' className='text-xs font-serif font-medium' fill='currentColor'>
                  w.
                </text>
              </svg>
              <span className='text-xl font-serif text-gray-900 hidden sm:inline'>wriders</span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className='hidden md:flex items-center gap-6'>
              <Link href='/' className='text-sm text-gray-600 hover:text-gray-900 transition-colors'>
                Home
              </Link>
              <Link href='/books' className='text-sm text-gray-600 hover:text-gray-900 transition-colors'>
                Books
              </Link>
              <Link href='/series' className='text-sm text-gray-600 hover:text-gray-900 transition-colors'>
                Series
              </Link>
              <Link href='/explore' className='text-sm text-gray-600 hover:text-gray-900 transition-colors'>
                Explore
              </Link>
              <Link href='/writers' className='text-sm text-gray-600 hover:text-gray-900 transition-colors'>
                Writers
              </Link>
            </nav>
          </div>

          <div className='flex items-center gap-4'>
            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='md:hidden flex flex-col gap-1 p-2'
              aria-label='Toggle menu'
            >
              <span
                className={`w-5 h-0.5 bg-gray-600 transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}
              />
              <span className={`w-5 h-0.5 bg-gray-600 transition-all ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
              <span
                className={`w-5 h-0.5 bg-gray-600 transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}
              />
            </button>

            {/* User Navigation */}
            <NavUser />
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className='md:hidden border-t border-gray-200 bg-white'>
            <nav className='flex flex-col py-4 px-6 space-y-3'>
              <Link
                href='/'
                className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href='/books'
                className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Books
              </Link>
              <Link
                href='/series'
                className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Series
              </Link>
              <Link
                href='/explore'
                className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Explore
              </Link>
              <Link
                href='/writers'
                className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Writers
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main>{children}</main>
    </div>
  );
}
