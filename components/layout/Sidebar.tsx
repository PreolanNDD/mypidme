'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  Home, 
  BookOpen, 
  BarChart3, 
  FlaskConical, 
  Users,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Log', href: '/log', icon: BookOpen },
  { name: 'Data', href: '/data', icon: BarChart3 },
  { name: 'Lab', href: '/lab', icon: FlaskConical },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-50",
      isOpen ? "w-64" : "w-16"
    )}>
      {/* Header with Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
        )}>
          {isOpen && (
            <Image
              src="/images/logo.svg"
              alt="PIDMe Logo"
              width={320}
              height={120}
              className="h-24 w-auto rounded-xl"
            />
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "p-1.5 rounded-lg hover:bg-gray-100 transition-colors",
            !isOpen && "mx-auto"
          )}
        >
          {isOpen ? (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center rounded-lg transition-all duration-200 group',
                  isOpen ? 'px-3 py-2.5' : 'px-2 py-2.5 justify-center',
                  isActive
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                )}
              >
                <Icon className={cn(
                  'flex-shrink-0 transition-all duration-200',
                  isOpen ? 'w-5 h-5' : 'w-6 h-6',
                  isActive ? 'text-white' : 'text-gray-600 group-hover:text-primary'
                )} />
                
                <span className={cn(
                  'font-medium transition-all duration-300 ease-in-out',
                  isOpen ? 'ml-3 opacity-100' : 'ml-0 opacity-0 w-0 overflow-hidden',
                  isActive ? 'text-white' : 'text-gray-700 group-hover:text-primary'
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className={cn(
        "p-4 border-t border-gray-200 transition-all duration-300",
        !isOpen && "text-center"
      )}>
        <div className={cn(
          "text-xs text-gray-500 transition-all duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}>
          {isOpen && "© 2024 PIDMe"}
        </div>
      </div>
    </div>
  );
}