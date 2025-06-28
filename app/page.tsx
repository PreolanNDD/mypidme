'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';
import Image from 'next/image';
import { BarChart3, Eye, Settings, ArrowRight, Check, ChevronRight, Star, Users, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const redirectingRef = useRef(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const image4Ref = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [mousePosition4, setMousePosition4] = useState({ x: 0.5, y: 0.5 });
  const [isHovering, setIsHovering] = useState(false);
  const [isHovering4, setIsHovering4] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!loading && user && !redirectingRef.current) {
      redirectingRef.current = true;
      router.replace('/dashboard');
    }
    
    if (!user && redirectingRef.current) {
      redirectingRef.current = false;
    }
    
    // Set isLoaded to true after a small delay to trigger the entrance animation
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [user, loading, router]);

  // Handle image dip effect based on cursor position for section 1
  const handleImageMouseMove = (e: React.MouseEvent) => {
    if (!imageRef.current) return;
    
    // Get the dimensions and position of the image container
    const rect = imageRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to the image container
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate position as percentage of container width/height
    const xPercent = x / rect.width;
    const yPercent = y / rect.height;
    
    setMousePosition({ x: xPercent, y: yPercent });
  };
  
  const handleImageMouseEnter = () => {
    setIsHovering(true);
  };
  
  const handleImageMouseLeave = () => {
    setIsHovering(false);
    setMousePosition({ x: 0.5, y: 0.5 }); // Reset to center
  };

  // Handle image dip effect based on cursor position for section 4
  const handleImage4MouseMove = (e: React.MouseEvent) => {
    if (!image4Ref.current) return;
    
    // Get the dimensions and position of the image container
    const rect = image4Ref.current.getBoundingClientRect();
    
    // Calculate mouse position relative to the image container
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate position as percentage of container width/height
    const xPercent = x / rect.width;
    const yPercent = y / rect.height;
    
    setMousePosition4({ x: xPercent, y: yPercent });
  };
  
  const handleImage4MouseEnter = () => {
    setIsHovering4(true);
  };
  
  const handleImage4MouseLeave = () => {
    setIsHovering4(false);
    setMousePosition4({ x: 0.5, y: 0.5 }); // Reset to center
  };

  // Calculate the tilt based on mouse position for section 1
  const getTiltStyle = () => {
    if (!isHovering) {
      return {
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
        transition: 'transform 0.5s ease-out'
      };
    }
    
    // Enhanced dipping effect with both X and Y axis rotation
    // Amplified the effect by increasing the multiplier (from 20 to 40)
    const tiltX = (mousePosition.y - 0.5) * 40; // Vertical mouse position affects X rotation (deeper dip)
    const tiltY = (mousePosition.x - 0.5) * -40; // Horizontal mouse position affects Y rotation (deeper dip)
    
    return {
      transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
      transition: 'transform 0.1s ease-out'
    };
  };

  // Calculate the tilt based on mouse position for section 4
  const getTiltStyle4 = () => {
    if (!isHovering4) {
      return {
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
        transition: 'transform 0.5s ease-out'
      };
    }
    
    // Enhanced dipping effect with both X and Y axis rotation
    // Amplified the effect by increasing the multiplier (from 20 to 40)
    const tiltX = (mousePosition4.y - 0.5) * 40; // Vertical mouse position affects X rotation (deeper dip)
    const tiltY = (mousePosition4.x - 0.5) * -40; // Horizontal mouse position affects Y rotation (deeper dip)
    
    return {
      transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
      transition: 'transform 0.1s ease-out'
    };
  };

  if (loading || user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar - ENHANCED: Increased height and spacing */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo - ENHANCED: Larger size and moved to the left with padding reduction */}
            <div className="flex items-center pl-0">
              <Link href="/" className="flex items-center group">
                <Image
                  src="/images/logo.svg"
                  alt="myPID.me Logo"
                  width={180}
                  height={60}
                  className="h-16 w-auto transition-transform duration-300 group-hover:scale-105 rounded-xl"
                />
              </Link>
            </div>

            {/* Navigation Links - Desktop - ENHANCED: Larger text and spacing */}
            <div className="hidden md:flex items-center space-x-10">
              {['features', 'how-it-works', 'testimonials', 'pricing', 'faq'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item}`} 
                  className="relative text-gray-600 font-medium text-lg hover:text-primary transition-colors duration-300 group py-2"
                >
                  <span className="capitalize">{item.replace(/-/g, ' ')}</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
            </div>

            {/* Auth Buttons - ENHANCED: Larger buttons */}
            <div className="flex items-center space-x-6">
              <Link href="/login">
                <div className="relative overflow-hidden group">
                  <span className="relative z-10 px-6 py-3 inline-block font-medium text-lg text-gray-700 group-hover:text-primary transition-colors duration-300">
                    Log in
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </div>
              </Link>
              <Link href="/signup">
                <div className="relative overflow-hidden group">
                  <Button className="relative z-10 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 text-lg px-8 py-6 rounded-none group-hover:rounded-xl">
                    <span className="relative z-10">Sign up</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:rounded-xl"></span>
                    <span className="absolute inset-0 w-0 h-full bg-white/20 transition-all duration-500 group-hover:w-full group-hover:rounded-xl"></span>
                  </Button>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Section 1: Hero - Purple Gradient */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24" style={{ background: 'linear-gradient(to bottom right, #9B5DE5, #3C1A5B)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Column: Text Content - UPDATED: Split heading, added animations */}
            <div className="space-y-8 animate-fadeIn">
              <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');
                
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(20px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes slideIn {
                  from { opacity: 0; transform: translateX(-20px); }
                  to { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes buttonPulse {
                  0% { transform: scale(1); box-shadow: 0 5px 15px rgba(255, 165, 0, 0.2); }
                  50% { transform: scale(1.05); box-shadow: 0 10px 20px rgba(255, 165, 0, 0.4); }
                  100% { transform: scale(1); box-shadow: 0 5px 15px rgba(255, 165, 0, 0.2); }
                }
                
                @keyframes buttonGlow {
                  0% { box-shadow: 0 0 5px rgba(255, 165, 0, 0.5); }
                  50% { box-shadow: 0 0 20px rgba(255, 165, 0, 0.8); }
                  100% { box-shadow: 0 0 5px rgba(255, 165, 0, 0.5); }
                }
                
                @keyframes arrowBounce {
                  0%, 100% { transform: translateX(0); }
                  50% { transform: translateX(5px); }
                }
                
                @keyframes hover {
                  0% { transform: translateY(0px); }
                  50% { transform: translateY(-15px); }
                  100% { transform: translateY(0px); }
                }
                
                @keyframes image3DEntrance {
                  0% { 
                    opacity: 0; 
                    transform: perspective(1000px) rotateX(30deg) rotateY(-20deg) translateZ(-100px); 
                  }
                  100% { 
                    opacity: 1; 
                    transform: perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0); 
                  }
                }
                
                @keyframes glowPulse {
                  0%, 100% { filter: drop-shadow(0 0 5px rgba(155, 93, 229, 0.6)) drop-shadow(0 0 15px rgba(155, 93, 229, 0.4)); }
                  50% { filter: drop-shadow(0 0 10px rgba(155, 93, 229, 0.8)) drop-shadow(0 0 25px rgba(155, 93, 229, 0.6)); }
                }
                
                @keyframes floatButton {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-5px); }
                }
                
                @keyframes shimmer {
                  0% { background-position: -200% 0; }
                  100% { background-position: 200% 0; }
                }
                
                .animate-fadeIn {
                  animation: fadeIn 1s ease-out forwards;
                }
                
                .animate-slideIn {
                  animation: slideIn 0.8s ease-out forwards;
                }
                
                .animate-hover {
                  animation: hover 4s ease-in-out infinite;
                }
                
                .animate-3d-entrance {
                  animation: image3DEntrance 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards;
                }
                
                .animate-glow-pulse {
                  animation: glowPulse 3s ease-in-out infinite;
                }
                
                .animate-float-button {
                  animation: floatButton 3s ease-in-out infinite;
                }
                
                .animate-shimmer {
                  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
                  background-size: 200% 100%;
                  animation: shimmer 2s infinite;
                }
                
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                .delay-400 { animation-delay: 0.4s; }
                .delay-500 { animation-delay: 0.5s; }
              `}</style>
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <div className="animate-slideIn delay-100">Stop Guessing.</div>
                  <div className="animate-slideIn delay-300">Start Knowing.</div>
                </h1>
              </div>
              <p className="text-xl text-white/90 leading-relaxed animate-fadeIn delay-400" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Your daily habits create your life's results. MyPID.me is the first app designed to be your personal science lab, helping you discover the hidden connections between what you do and how you feel, so you can build a better you with proof.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-4 animate-fadeIn delay-500">
                <Link href="/signup">
                  <button 
                    className="group w-full sm:w-auto bg-[#ffa500] text-[#330c0c] font-bold py-3 px-8 rounded-lg shadow-lg text-lg relative overflow-hidden"
                    style={{ 
                      fontFamily: 'Montserrat, sans-serif',
                      animation: 'buttonGlow 3s infinite'
                    }}
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      Start Optimizing
                      <ArrowRight className="ml-2 w-5 h-5 inline-block group-hover:animate-arrowBounce" 
                        style={{ animation: 'arrowBounce 1s infinite' }}
                      />
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-[#ffa500] to-[#ff8c00] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="absolute top-0 left-0 w-full h-full bg-white/30 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                    <span className="absolute -inset-px border-2 border-white/0 rounded-lg group-hover:border-white/20 transition-all duration-300"></span>
                  </button>
                </Link>
                <a href="#how-it-works">
                  <button 
                    className="group w-full sm:w-auto bg-transparent text-white border-white border-2 font-bold py-3 px-8 rounded-lg transition-all duration-300 text-lg relative overflow-hidden"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    <span className="relative z-10">Learn More</span>
                    <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="absolute -inset-px border-2 border-white/50 rounded-lg group-hover:border-white/90 transition-all duration-300"></span>
                  </button>
                </a>
              </div>
              <div className="flex items-center space-x-2 text-white/80 animate-fadeIn delay-500" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <Check className="w-5 h-5 text-white" />
                <span>No credit card required</span>
              </div>
            </div>

            {/* Right Column: Hero Image - UPDATED: Added 3D entrance animation */}
            <div 
              ref={imageRef}
              className={`relative w-full h-[400px] md:h-[550px] lg:h-[700px] perspective-[2000px] transform-gpu ${isLoaded ? 'animate-3d-entrance' : 'opacity-0'}`}
              onMouseMove={handleImageMouseMove}
              onMouseEnter={handleImageMouseEnter}
              onMouseLeave={handleImageMouseLeave}
            >
              <div 
                className="absolute inset-0 flex items-center justify-center transition-transform duration-300 will-change-transform"
                style={getTiltStyle()}
              >
                <Image
                  src="/images/home_section_1.webp"
                  alt="Person analyzing data on a dashboard"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Features - Light Background - UPDATED: Removed image and moved content to right */}
      <section id="features" className="py-20 bg-[#F8F7FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Column: Empty space for balance */}
            <div className="hidden md:block"></div>
            
            {/* Right Column: Content */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color: '#3c1a5b', fontFamily: 'Playfair Display, serif' }}>
                Your Life, Logged in 60 Seconds.
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: '#000000', fontFamily: 'Montserrat, sans-serif' }}>
                Effortlessly track the metrics that matter most to you. Whether it's your mood on a 1-10 scale, your daily workout with a simple "Yes/No," or the hours you sleep, logging your day is fast, simple, and intuitive. Consistency is the key, and we make it easy.
              </p>
              <div className="pt-4">
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 text-lg px-8 py-3">
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Data Analysis - Dark Purple Background - UPDATED: Moved content to left, added animated chart */}
      <section id="data-analysis" className="py-20" style={{ background: 'linear-gradient(to bottom right, #3C1A5B, #2A1240)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Column: Content - UPDATED: Moved to left side */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color: '#f5f5f5', fontFamily: 'Playfair Display, serif' }}>
                Discover the "Why" Behind Your Days.
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: '#e6e0f8', fontFamily: 'Montserrat, sans-serif' }}>
                MyPID.me automatically analyzes your data and reveals the patterns hiding in your routine. Our smart-scaling charts and relationship breakdowns help you answer your biggest questions. Does more sleep really improve your focus? Does caffeine affect your stress levels? Go beyond simple tracking and find real answers.
              </p>
              <div className="pt-6">
                <Link href="/signup">
                  <button className="group relative overflow-hidden rounded-xl bg-white px-8 py-4 text-[#3C1A5B] font-bold text-lg shadow-lg transition-all duration-500 hover:shadow-xl hover:shadow-white/20 animate-float-button">
                    {/* Animated background gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-purple-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 w-full h-full animate-shimmer"></div>
                    
                    {/* Content */}
                    <div className="relative flex items-center justify-center space-x-3">
                      <span className="tracking-wide group-hover:tracking-wider transition-all duration-300">
                        Start Analyzing
                      </span>
                      <ArrowRight className="w-5 h-5 transition-all duration-300 group-hover:translate-x-2 group-hover:scale-110" />
                    </div>
                    
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        boxShadow: '0 0 20px 5px rgba(255, 255, 255, 0.3)',
                        transition: 'all 0.3s ease'
                      }}
                    ></div>
                  </button>
                </Link>
              </div>
            </div>
            
            {/* Right Column: Animated Chart Graphic - FIXED: Container issues */}
            <div className="w-full h-[500px] flex items-center justify-center">
              {/* Glowing chart container */}
              <div className="w-full h-full bg-[#2A1240]/80 rounded-2xl animate-glow-pulse p-6">
                {/* Chart visualization */}
                <div className="relative h-full w-full">
                  {/* Chart title and legend */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-3 sm:space-y-0">
                    <div className="text-white font-bold text-lg">Sleep vs. Energy Levels</div>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-[#9B5DE5] mr-2"></div>
                        <span className="text-white text-sm">Sleep Hours</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-[#FFA500] mr-2"></div>
                        <span className="text-white text-sm">Energy Level</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chart grid lines */}
                  <div className="absolute inset-0 mt-16">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i} 
                        className="absolute w-full h-px bg-white/10"
                        style={{ top: `${20 * i}%` }}
                      ></div>
                    ))}
                    {[...Array(7)].map((_, i) => (
                      <div 
                        key={i} 
                        className="absolute h-full w-px bg-white/10"
                        style={{ left: `${100 / 6 * i}%` }}
                      ></div>
                    ))}
                  </div>
                  
                  {/* Animated chart lines */}
                  <div className="relative h-[calc(100%-6rem)] mt-16">
                    {/* Purple line (Sleep) */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path 
                        d="M0,70 C10,65 20,40 30,35 C40,30 50,50 60,45 C70,40 80,20 90,15 L100,10" 
                        fill="none" 
                        stroke="#9B5DE5" 
                        strokeWidth="3"
                        strokeLinecap="round"
                        style={{
                          filter: 'drop-shadow(0 0 8px rgba(155, 93, 229, 0.8))',
                          animation: 'dashoffset 15s linear infinite'
                        }}
                      />
                      {/* Data points */}
                      {[
                        { x: 0, y: 70 },
                        { x: 30, y: 35 },
                        { x: 60, y: 45 },
                        { x: 90, y: 15 }
                      ].map((point, i) => (
                        <circle 
                          key={i}
                          cx={point.x} 
                          cy={point.y} 
                          r="2"
                          fill="#9B5DE5"
                          style={{
                            filter: 'drop-shadow(0 0 5px rgba(155, 93, 229, 0.8))'
                          }}
                        />
                      ))}
                    </svg>
                    
                    {/* Orange line (Energy) */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path 
                        d="M0,80 C10,75 20,60 30,50 C40,40 50,30 60,25 C70,20 80,30 90,20 L100,15" 
                        fill="none" 
                        stroke="#FFA500" 
                        strokeWidth="3"
                        strokeLinecap="round"
                        style={{
                          filter: 'drop-shadow(0 0 8px rgba(255, 165, 0, 0.8))',
                          animation: 'dashoffset 15s linear infinite'
                        }}
                      />
                      {/* Data points */}
                      {[
                        { x: 0, y: 80 },
                        { x: 30, y: 50 },
                        { x: 60, y: 25 },
                        { x: 90, y: 20 }
                      ].map((point, i) => (
                        <circle 
                          key={i}
                          cx={point.x} 
                          cy={point.y} 
                          r="2"
                          fill="#FFA500"
                          style={{
                            filter: 'drop-shadow(0 0 5px rgba(255, 165, 0, 0.8))'
                          }}
                        />
                      ))}
                    </svg>
                  </div>
                  
                  {/* X-axis labels */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between text-white/60 text-xs">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Lab Features - Light Background - UPDATED: Added image on left, moved content to right */}
      <section id="how-it-works" className="py-20 bg-[#F8F7FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Column: Image with 3D hover effect */}
            <div 
              ref={image4Ref}
              className={`relative w-full h-[400px] md:h-[550px] perspective-[2000px] transform-gpu ${isLoaded ? 'animate-3d-entrance' : 'opacity-0'}`}
              onMouseMove={handleImage4MouseMove}
              onMouseEnter={handleImage4MouseEnter}
              onMouseLeave={handleImage4MouseLeave}
            >
              <div 
                className="absolute inset-0 flex items-center justify-center transition-transform duration-300 will-change-transform"
                style={getTiltStyle4()}
              >
                <Image
                  src="/images/home_section_4.webp"
                  alt="Person conducting a self-experiment"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            
            {/* Right Column: Content */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color: '#3c1a5b', fontFamily: 'Playfair Display, serif' }}>
                Become the Engineer of Your Own Life.
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: '#000000', fontFamily: 'Montserrat, sans-serif' }}>
                Have a theory? Put it to the test. The PIDMe Lab lets you run structured experiments on yourself. Form a hypothesis, like "If I cut out sugar for one week, my energy will improve," then track the results. Stop relying on generic advice and start building a lifestyle based on what is scientifically proven to work for you.
              </p>
              <div className="pt-4">
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 text-lg px-8 py-3">
                    Start Experimenting
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Community Insights - Dark Purple Background */}
      <section id="community-insights" className="py-20" style={{ background: 'linear-gradient(to bottom right, #3C1A5B, #2A1240)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Column: Content */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color: '#f5f5f5', fontFamily: 'Playfair Display, serif' }}>
                Learn Together, Improve Together.
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: '#e6e0f8', fontFamily: 'Montserrat, sans-serif' }}>
                Your daily habits create your life's results. MyPID.me is the first app designed to be your personal science lab, helping you discover the hidden connections between what you do and how you feel, so you can build a better you with proof.
              </p>
              <div className="pt-6">
                <Link href="/signup">
                  <button className="group relative overflow-hidden rounded-xl bg-white px-8 py-4 text-[#3C1A5B] font-bold text-lg shadow-lg transition-all duration-500 hover:shadow-xl hover:shadow-white/20 animate-float-button">
                    {/* Animated background gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-purple-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 w-full h-full animate-shimmer"></div>
                    
                    {/* Content */}
                    <div className="relative flex items-center justify-center space-x-3">
                      <span className="tracking-wide group-hover:tracking-wider transition-all duration-300">
                        Start Analyzing
                      </span>
                      <ArrowRight className="w-5 h-5 transition-all duration-300 group-hover:translate-x-2 group-hover:scale-110" />
                    </div>
                    
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        boxShadow: '0 0 20px 5px rgba(255, 255, 255, 0.3)',
                        transition: 'all 0.3s ease'
                      }}
                    ></div>
                  </button>
                </Link>
              </div>
            </div>
            
            {/* Right Column: Community Findings Cards */}
            <div className="w-full space-y-6">
              {/* Finding Card 1 */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl cursor-pointer border border-white/20 transition-all duration-500 hover:transform hover:-translate-y-3 hover:shadow-3xl hover:shadow-white/20 hover:z-10 p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-xl text-primary-text group-hover:text-purple-700 transition-colors duration-300 leading-tight mb-3">
                      Morning meditation significantly improves my focus
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full transition-all duration-300 hover:bg-purple-50 hover:shadow-sm">
                        <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
                          <Users className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs font-medium text-secondary-text hover:text-purple-700 transition-colors duration-300">
                          Sarah Johnson
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full transition-all duration-300 hover:bg-blue-50 hover:shadow-sm">
                        <Calendar className="w-3 h-3 text-secondary-text hover:text-blue-600 transition-colors duration-300" />
                        <span className="text-xs text-secondary-text hover:text-blue-700 transition-colors duration-300">
                          May 15, 2025
                        </span>
                      </div>
                      <div className="text-xs bg-green-50 text-green-700 border-green-300 px-3 py-1 rounded-full">
                        Score: +24
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Preview */}
                <div className="prose prose-sm max-w-none">
                  <p className="text-primary-text leading-relaxed">
                    After tracking my meditation practice for 30 days, I've found that on days when I meditate for at least 10 minutes in the morning, my focus score increases by an average of 2.7 points (on a 1-10 scale). The effect is most noticeable on high-stress days...
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 text-sm text-secondary-text">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <ArrowRight className="w-3 h-3 text-green-600" />
                      </div>
                      <span>Read more</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-xs bg-blue-50 text-blue-700 border-blue-300 px-3 py-1 rounded-full flex items-center">
                      <BarChart3 className="w-3 h-3 mr-1" />
                      <span>Data Shared</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Finding Card 2 */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl cursor-pointer border border-white/20 transition-all duration-500 hover:transform hover:-translate-y-3 hover:shadow-3xl hover:shadow-white/20 hover:z-10 p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-xl text-primary-text group-hover:text-purple-700 transition-colors duration-300 leading-tight mb-3">
                      Cutting caffeine after 2pm doubled my sleep quality
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full transition-all duration-300 hover:bg-purple-50 hover:shadow-sm">
                        <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
                          <Users className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs font-medium text-secondary-text hover:text-purple-700 transition-colors duration-300">
                          Michael Chen
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full transition-all duration-300 hover:bg-blue-50 hover:shadow-sm">
                        <Calendar className="w-3 h-3 text-secondary-text hover:text-blue-600 transition-colors duration-300" />
                        <span className="text-xs text-secondary-text hover:text-blue-700 transition-colors duration-300">
                          June 2, 2025
                        </span>
                      </div>
                      <div className="text-xs bg-green-50 text-green-700 border-green-300 px-3 py-1 rounded-full">
                        Score: +37
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Preview */}
                <div className="prose prose-sm max-w-none">
                  <p className="text-primary-text leading-relaxed">
                    I ran a 3-week experiment where I alternated between stopping caffeine at 2pm vs. drinking it until evening. The results were shocking - my sleep quality score jumped from an average of 4.2 to 8.7 when I cut off caffeine early. My morning energy levels also improved significantly...
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 text-sm text-secondary-text">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <ArrowRight className="w-3 h-3 text-green-600" />
                      </div>
                      <span>Read more</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-xs bg-purple-50 text-purple-700 border-purple-300 px-3 py-1 rounded-full flex items-center">
                      <FlaskConical className="w-3 h-3 mr-1" />
                      <span>Experiment Results</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Pricing & CTA - Purple Gradient */}
      <section id="pricing" className="py-20" style={{ background: 'linear-gradient(to bottom right, #9B5DE5, #3C1A5B)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Start Optimizing Today
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Join thousands of others who are discovering what truly works for them
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Column: Pricing Card */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105">
              <div className="p-8 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Forever Plan</h3>
                <div className="flex items-end mb-4">
                  <span className="text-5xl font-bold text-primary">$0</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                <p className="text-gray-600">
                  Everything you need to start optimizing your life with data
                </p>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Unlimited habit & goal tracking</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Data visualization & analysis</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Personal experiments</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Community insights</span>
                </div>
                <div className="pt-4">
                  <Link href="/signup" className="block w-full">
                    <div className="group relative overflow-hidden w-full">
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 text-lg font-bold transition-all duration-300">
                        Get Started
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        <span className="absolute inset-0 w-0 h-full bg-white/20 transition-all duration-500 group-hover:w-full"></span>
                      </Button>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Benefits */}
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Personalized Insights</h3>
                  <p className="text-white/80">
                    Discover what specifically works for you, not generic advice that might work for others.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Privacy First</h3>
                  <p className="text-white/80">
                    Your data belongs to you. We never sell your information or share it without your explicit permission.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">See What Works</h3>
                  <p className="text-white/80">
                    Stop guessing and start knowing what habits and routines actually improve your life.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Link href="/signup">
                  <div className="group relative overflow-hidden">
                    <Button className="bg-white hover:bg-gray-100 text-primary font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 text-lg">
                      Start Your Journey
                      <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                      <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></span>
                    </Button>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to know about myPID.me
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "What does PID stand for?",
                answer: "PID stands for Proportional-Integral-Derivative, a control loop mechanism used in engineering systems. We've applied these principles to personal development, helping you make precise adjustments to your habits based on feedback from your results."
              },
              {
                question: "How much time does it take to use myPID.me?",
                answer: "Most users spend less than 2 minutes per day logging their data. The insights you gain from this small investment of time can transform how you approach your habits and goals."
              },
              {
                question: "Is my data private?",
                answer: "Absolutely. Your personal data is private by default. You can optionally share specific insights with the community, but you control exactly what is shared and what remains private."
              },
              {
                question: "Do I need to be tech-savvy to use myPID.me?",
                answer: "Not at all! We've designed the platform to be intuitive and user-friendly. If you can use a smartphone app, you can use myPID.me."
              },
              {
                question: "Can I export my data?",
                answer: "Yes, you can export your data at any time in common formats like CSV for use in other tools or for your personal records."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                  <ChevronRight className="w-5 h-5 text-primary mr-2 flex-shrink-0" />
                  {faq.question}
                </h3>
                <p className="text-gray-600 pl-7">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Image
                  src="/images/logo.svg"
                  alt="myPID.me Logo"
                  width={150}
                  height={50}
                  className="h-12 w-auto rounded-xl"
                />
              </div>
              <p className="text-gray-400 mb-4">
                Engineering your personal optimization journey with precision and data.
              </p>
              <p className="text-gray-500 text-sm">
                © 2025 myPID.me. All rights reserved.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors duration-300">Features</a></li>
                <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors duration-300">How It Works</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors duration-300">Pricing</a></li>
                <li><a href="#faq" className="text-gray-400 hover:text-white transition-colors duration-300">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Cookie Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">GDPR</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}