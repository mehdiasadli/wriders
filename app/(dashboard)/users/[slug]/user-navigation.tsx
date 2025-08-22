'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface NavigationItem {
  href: string;
  label: string;
  count: number | null;
}

interface UserNavigationProps {
  navigationItems: NavigationItem[];
}

export function UserNavigation({ navigationItems }: UserNavigationProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeItem = navigationItems.find((item) => pathname === item.href);

  return (
    <div className='border-b border-gray-200 bg-white'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6'>
        {/* Desktop Navigation */}
        <nav className='hidden md:flex space-x-8'>
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {item.label}
                {item.count !== null && <span className='ml-2 text-gray-400'>({item.count})</span>}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Navigation */}
        <div className='md:hidden'>
          <div className='relative'>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='flex items-center justify-between w-full py-4 text-sm font-medium text-gray-900'
            >
              <span>
                {activeItem?.label || 'Navigation'}
                {activeItem?.count !== null && activeItem?.count !== undefined && (
                  <span className='ml-2 text-gray-400'>({activeItem.count})</span>
                )}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Mobile Dropdown */}
            {isMobileMenuOpen && (
              <>
                {/* Backdrop */}
                <div className='fixed inset-0 z-10' onClick={() => setIsMobileMenuOpen(false)} />

                {/* Dropdown Menu */}
                <div className='absolute left-0 right-0 top-full bg-white border border-gray-200 shadow-lg z-20'>
                  {navigationItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`block px-4 py-3 text-sm border-b border-gray-100 last:border-b-0 transition-colors ${
                          isActive
                            ? 'bg-gray-50 text-gray-900 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        {item.label}
                        {item.count !== null && <span className='ml-2 text-gray-400'>({item.count})</span>}
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
