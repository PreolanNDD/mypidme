'use client';

import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (!loading && user && !redirectingRef.current) {
      redirectingRef.current = true;
      router.replace('/dashboard');
    }
    
    if (!user && redirectingRef.current) {
      redirectingRef.current = false;
    }
  }, [user, loading, router]);

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
                
                .animate-fadeIn {
                  animation: fadeIn 1s ease-out forwards;
                }
                
                .animate-slideIn {
                  animation: slideIn 0.8s ease-out forwards;
                }
                
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                .delay-400 { animation-delay: 0.4s; }
                .delay-500 { animation-delay: 0.5s; }
                
                .seesaw-container {
                  perspective: 1000px;
                  transform-style: preserve-3d;
                  transition: transform 0.3s ease-out;
                }
                
                .seesaw-container:hover {
                  transform: rotate3d(1, 0, 0, 5deg);
                }
                
                .seesaw-container.hover-left:hover {
                  transform: rotate3d(0, 1, 0, -5deg);
                }
                
                .seesaw-container.hover-right:hover {
                  transform: rotate3d(0, 1, 0, 5deg);
                }
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

            {/* Right Column: Hero Image - UPDATED: Removed all effects, added seesaw hover */}
            <div 
              className="seesaw-container relative w-full h-[350px] md:h-[450px] animate-fadeIn delay-200"
              onMouseMove={(e) => {
                const el = e.currentTarget;
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left; // x position within the element
                
                if (x < rect.width / 2) {
                  el.classList.add('hover-left');
                  el.classList.remove('hover-right');
                } else {
                  el.classList.add('hover-right');
                  el.classList.remove('hover-left');
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.classList.remove('hover-left', 'hover-right');
              }}
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
      </section>

      {/* Section 2: Features - Light Background */}
      <section id="features" className="py-20 bg-[#F8F7FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features to Optimize Your Life
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover what truly works for you with our comprehensive toolkit for personal optimization
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Column: Feature List */}
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Data-Driven Insights</h3>
                  <p className="text-gray-600">
                    Track your habits and outcomes to discover meaningful patterns and correlations that reveal what actually works for you.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Settings className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Personal Experiments</h3>
                  <p className="text-gray-600">
                    Design and run controlled experiments to test hypotheses about what improves your well-being, productivity, and more.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Community Insights</h3>
                  <p className="text-gray-600">
                    Share and discover findings from others on their optimization journeys, expanding your knowledge beyond personal experience.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Feature Image */}
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.pexels.com/photos/7947541/pexels-photo-7947541.jpeg"
                alt="Dashboard with analytics"
                fill
                className="object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: How It Works - Dark Purple Background */}
      <section id="how-it-works" className="py-20 bg-[#3C1A5B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How myPID.me Works
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Inspired by PID controllers in engineering, we help you tune your life with precision
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Column: Process Image */}
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-indigo-600/20 backdrop-blur-sm z-10 rounded-2xl"></div>
              <Image
                src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg"
                alt="Engineering process diagram"
                fill
                className="object-cover rounded-2xl"
              />
            </div>

            {/* Right Column: Process Steps */}
            <div className="space-y-8">
              <div className="relative pl-12">
                <div className="absolute left-0 top-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Track Your Inputs & Outputs</h3>
                <p className="text-white/80">
                  Log your daily habits (inputs) and outcomes (outputs) in less than a minute per day.
                </p>
              </div>

              <div className="relative pl-12">
                <div className="absolute left-0 top-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Analyze Relationships</h3>
                <p className="text-white/80">
                  Our algorithms identify correlations between your habits and goals, revealing what's working and what isn't.
                </p>
              </div>

              <div className="relative pl-12">
                <div className="absolute left-0 top-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Run Experiments</h3>
                <p className="text-white/80">
                  Test hypotheses with controlled experiments to verify causation and fine-tune your approach.
                </p>
              </div>

              <div className="relative pl-12">
                <div className="absolute left-0 top-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">4</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Adjust & Optimize</h3>
                <p className="text-white/80">
                  Use data-driven insights to continuously refine your habits and build your optimal lifestyle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Testimonials - Light Background */}
      <section id="testimonials" className="py-20 bg-[#F8F7FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands who have transformed their lives through data-driven optimization
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Column: Testimonials */}
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-bold">JD</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">James Davis</h4>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "After years of trying different productivity systems, myPID.me finally helped me understand what actually works for me. I discovered that morning meditation has a strong positive impact on my focus, while late-night screen time destroys my sleep quality."
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-600 font-bold">SL</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Sarah Lee</h4>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "The experiment feature is a game-changer. I tested whether cold showers actually improved my energy levels, and the data showed a clear positive correlation. Now I have proof of what works specifically for me, not just generic advice."
                </p>
              </div>
            </div>

            {/* Right Column: Testimonial Image */}
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg"
                alt="Happy users collaborating"
                fill
                className="object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Pricing & CTA - Purple Gradient */}
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