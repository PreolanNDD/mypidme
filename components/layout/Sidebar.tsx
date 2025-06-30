'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { 
  Home, 
  BookOpen, 
  BarChart3, 
  FlaskConical, 
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Menu,
  X
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
  const [loggingOut, setLoggingOut] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  // Add animation delay for initial load
  useEffect(() => {
    setIsLoaded(true);
    
    // Check if we're on mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Enhanced prefetch function for better navigation performance
  const handleLinkHover = (href: string) => {
    setHoveredItem(href);
    try {
      // Prefetch the page for faster navigation
      router.prefetch(href);
    } catch (error) {
      console.warn('Failed to prefetch route:', href, error);
    }
  };

  const handleLinkLeave = () => {
    setHoveredItem(null);
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  // Close mobile menu when navigating
  const handleNavigation = (href: string) => {
    router.push(href);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  // Mobile Donut Menu
  const MobileDonutMenu = () => (
    <div className="fixed bottom-6 right-6 z-50 md:hidden">
      <button
        onClick={toggleMobileMenu}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-110"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Menu className="w-6 h-6 text-white" />
        )}
      </button>
      
      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="absolute bottom-24 right-6 bg-white rounded-2xl shadow-2xl p-4 w-64 transform transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={cn(
                      'flex items-center w-full rounded-xl px-4 py-3 transition-all duration-200 group',
                      isActive
                        ? 'bg-primary text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200",
                      isActive ? 'bg-white/20' : ''
                    )}>
                      <Icon className={cn(
                        'w-5 h-5 transition-all duration-200',
                        isActive ? 'text-white' : 'text-gray-600 group-hover:text-primary'
                      )} />
                    </div>
                    
                    <span className={cn(
                      'ml-3 font-medium',
                      isActive ? 'text-white' : 'text-gray-700 group-hover:text-primary'
                    )}>
                      {item.name}
                    </span>
                    
                    {isActive && (
                      <div className="ml-auto">
                        <Sparkles className="w-4 h-4 text-white/80 animate-pulse" />
                      </div>
                    )}
                  </button>
                );
              })}
              
              {/* Logout Button */}
              {user && (
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center w-full rounded-xl px-4 py-3 transition-all duration-200 text-red-600 hover:bg-red-50 group"
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    <LogOut className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <span className="ml-3 font-medium">
                    {loggingOut ? 'Logging out...' : 'Log Out'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop/Tablet Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-500 ease-in-out z-50 flex flex-col md:flex",
        isOpen ? "w-64" : "w-20",
        isMobile ? "hidden" : "flex"
      )}>
        {/* Header with Logo */}
        <div className="ml-2 flex items-center justify-between p-4 border-b border-gray-200">
          <div className={cn(
            "transition-all duration-500 ease-in-out overflow-hidden",
            isOpen ? "opacity-100 w-40" : "opacity-0 w-0"
          )}>
            {isOpen && (
              <Image
                src="/images/logo.svg"
                alt="PIDMe Logo"
                width={320}
                height={120}
                className="h-[70px] w-auto rounded-xl transition-all duration-500 hover:scale-105"
                priority
              />
            )}
          </div>

          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className={cn(
              "p-2 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-110 hover:rotate-[360deg] bg-white shadow-md border border-gray-100",
              !isOpen && "mx-auto"
            )}
          >
            {isOpen ? (
              <ChevronLeft className="w-5 h-5 text-primary" />
            ) : (
              <ChevronRight className="w-5 h-5 text-primary" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-3">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isHovered = hoveredItem === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onMouseEnter={() => handleLinkHover(item.href)}
                  onMouseLeave={handleLinkLeave}
                  className={cn(
                    'flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden',
                    isOpen ? 'px-4 py-3' : 'px-0 py-3 justify-center',
                  )}
                >
                  {/* Background for active item */}
                  {isActive && (
                    <div className="absolute inset-0 bg-[#9b5de5] rounded-xl"></div>
                  )}
                  
                  {/* Icon container with animations */}
                  <div className={cn(
                    "flex items-center justify-center transition-all duration-300 relative z-10",
                    isOpen ? 'w-10 h-10' : 'w-12 h-12',
                    isActive ? 'bg-white/20 rounded-lg' : ''
                  )}>
                    <Icon className={cn(
                      "transition-all duration-300 relative z-10",
                      isOpen ? 'w-5 h-5' : 'w-6 h-6',
                      isActive ? 'text-white' : 'text-gray-600 group-hover:text-primary'
                    )} />
                    
                    {/* Sparkle effect for active item */}
                    {isActive && isHovered && (
                      <Sparkles className="absolute w-3 h-3 text-white/80 -top-1 -right-1 animate-pulse" />
                    )}
                  </div>
                  
                  {/* Text with slide-in animation */}
                  <span className={cn(
                    "font-medium transition-all duration-500 ease-in-out relative z-10",
                    isOpen ? 'ml-3 opacity-100 translate-x-0' : 'opacity-0 translate-x-10 absolute',
                    isActive ? 'text-white' : 'text-gray-700 group-hover:text-primary'
                  )}>
                    {item.name}
                  </span>
                  
                  {/* Active indicator that flows into main content */}
                  {isActive && (
                    <>
                      {/* Bottom glow effect */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-full"></div>
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className={cn(
          "p-4 border-t border-gray-200 transition-all duration-500",
          !isOpen && "text-center"
        )}>
          {/* Logout Button */}
          {user && (
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className={cn(
                'flex items-center rounded-xl transition-all duration-300 group w-full mb-3 relative overflow-hidden',
                isOpen ? 'px-4 py-3' : 'px-0 py-3 justify-center',
                'hover:bg-red-50 hover:text-red-600',
                loggingOut && 'opacity-50 cursor-not-allowed'
              )}
            >
              {/* Background glow effect on hover */}
              <div className="absolute inset-0 bg-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              
              {/* Icon container with animations */}
              <div className={cn(
                "flex items-center justify-center transition-all duration-300 relative z-10",
                isOpen ? 'w-10 h-10' : 'w-12 h-12'
              )}>
                <LogOut className={cn(
                  "transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-12 relative z-10",
                  isOpen ? 'w-5 h-5' : 'w-6 h-6',
                  'text-gray-600 group-hover:text-red-600'
                )} />
              </div>
              
              <span className={cn(
                "font-medium transition-all duration-500 ease-in-out relative z-10",
                isOpen ? 'ml-3 opacity-100 translate-x-0' : 'opacity-0 translate-x-10 absolute',
                'text-gray-700 group-hover:text-red-600'
              )}>
                {loggingOut ? 'Logging out...' : 'Log Out'}
              </span>
            </button>
          )}

          {/* Copyright */}
          <div className={cn(
            "text-xs text-gray-500 transition-all duration-500",
            isOpen ? "opacity-100" : "opacity-0"
          )}>
            {isOpen && (
              <div className="flex items-center justify-center space-x-1">
                <span>© 2025</span>
                <span className="text-primary font-medium">MyPID.me built with Bolt.new</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Donut Menu */}
      <MobileDonutMenu />
      
      {/* Custom CSS variable to communicate sidebar state */}
      <style jsx global>{`
        :root {
          --sidebar-width: ${isMobile ? '0px' : (isOpen ? '256px' : '80px')};
        }
        
        @media (max-width: 768px) {
          :root {
            --sidebar-width: 0px;
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.7; filter: blur(8px); }
          50% { opacity: 1; filter: blur(12px); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes rotate-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}