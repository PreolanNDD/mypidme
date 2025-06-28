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
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md mr-2">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  myPID.me
                </span>
              </Link>
            </div>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary transition-colors duration-300">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-primary transition-colors duration-300">How It Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-primary transition-colors duration-300">Testimonials</a>
              <a href="#pricing" className="text-gray-600 hover:text-primary transition-colors duration-300">Pricing</a>
              <a href="#faq" className="text-gray-600 hover:text-primary transition-colors duration-300">FAQ</a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-700 hover:text-primary transition-colors duration-300 font-medium">
                Log in
              </Link>
              <Link href="/signup">
                <Button className="bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all duration-300">
                  Sign up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Section 1: Hero - Purple Gradient */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24" style={{ background: 'linear-gradient(to bottom right, #9B5DE5, #3C1A5B)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Column: Text Content */}
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Tune Your Life with Precision Engineering
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                myPID.me helps you discover what actually works for you through data-driven personal experiments and feedback loops inspired by engineering principles.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
                <Link href="/signup">
                  <Button className="w-full sm:w-auto bg-white hover:bg-gray-100 text-primary font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-lg">
                    Start Optimizing
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="outline" className="w-full sm:w-auto bg-transparent hover:bg-white/10 text-white border-white border-2 font-bold py-3 px-8 rounded-lg transition-all duration-300 text-lg">
                    Learn More
                  </Button>
                </a>
              </div>
              <div className="flex items-center space-x-2 text-white/80">
                <Check className="w-5 h-5 text-white" />
                <span>No credit card required</span>
              </div>
            </div>

            {/* Right Column: Hero Image */}
            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-indigo-600/20 backdrop-blur-sm z-10 rounded-2xl"></div>
              <Image
                src="https://images.pexels.com/photos/3760323/pexels-photo-3760323.jpeg"
                alt="Person analyzing data on a dashboard"
                fill
                className="object-cover rounded-2xl"
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
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-lg font-bold">
                      Get Started
                    </Button>
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
                  <Button className="bg-white hover:bg-gray-100 text-primary font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-lg">
                    Start Your Journey
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
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
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md mr-2">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  myPID.me
                </span>
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