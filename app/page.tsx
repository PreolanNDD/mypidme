'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  BarChart3, 
  ChevronUp, 
  ChevronDown, 
  User, 
  Calendar,
  MessageSquare, 
  Sparkles, 
  BarChart2, 
  FlaskConical, 
  Target, 
  TrendingUp 
} from 'lucide-react';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const sectionRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  useEffect(() => {
    setIsLoaded(true);

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      
      sectionRefs.forEach((ref, index) => {
        if (!ref.current) return;
        
        const offsetTop = ref.current.offsetTop;
        const height = ref.current.offsetHeight;
        
        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + height) {
          setActiveSection(index);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        ref={sectionRefs[0]}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#9b5de5] to-[#3c1a5b] px-4 sm:px-6 lg:px-8"
      >
        {/* Background decorative elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-accent-1/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-accent-2/20 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className={`space-y-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              <div className="space-y-4">
                <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-tight">
                  Tune Your Life with Precision
                </h1>
                <p className="text-xl sm:text-2xl text-white/80 max-w-xl">
                  Discover what truly works for you through personal data tracking, analysis, and experimentation.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/signup">
                  <Button className="w-full sm:w-auto text-lg px-8 py-6 bg-white hover:bg-white/90 text-[#4a2a6d] border border-white hover:shadow-lg hover:shadow-white/20 transition-all duration-300 hover:scale-105">
                    Start Optimizing
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 bg-transparent hover:bg-white/10 text-white border border-white hover:shadow-lg hover:shadow-white/20 transition-all duration-300 hover:scale-105">
                    Log In
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center space-x-2 text-white/60">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-300 to-indigo-400 border-2 border-white flex items-center justify-center text-xs font-medium text-white">
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-sm">Join 2,500+ users optimizing their lives</p>
              </div>
            </div>
            
            {/* Right Column - Image */}
            <div className={`relative transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              <div className="relative w-full h-[500px] transform transition-all duration-500 hover:scale-[1.02] hover:rotate-1 group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-80 group-hover:opacity-100"></div>
                <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
                  <Image
                    src="/images/home_section_1.webp"
                    alt="PIDMe Dashboard"
                    fill
                    className="object-cover object-center transition-all duration-700 group-hover:scale-105"
                    priority
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-3 shadow-xl transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Energy Level</p>
                      <p className="text-lg font-bold text-gray-800">+27%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-2 text-white/60 animate-bounce">
          <p className="text-sm">Scroll to explore</p>
          <ChevronDown className="h-5 w-5" />
        </div>
      </section>

      {/* Section 2: Features */}
      <section 
        ref={sectionRefs[1]}
        className="py-24 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="font-heading text-4xl text-primary-text">
                  Track What Matters, <br />See What Works
                </h2>
                <p className="text-xl text-secondary-text max-w-xl">
                  Log your daily habits and outcomes in seconds. Our intelligent dashboard reveals the hidden connections between what you do and how you feel.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-primary-text">Effortless Tracking</h3>
                    <p className="text-secondary-text mt-1">
                      Log your habits, behaviors, and outcomes in less than a minute per day.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent-1/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BarChart2 className="h-6 w-6 text-accent-1" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-primary-text">Personalized Insights</h3>
                    <p className="text-secondary-text mt-1">
                      Discover which habits actually impact your goals with correlation analysis.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent-2/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-accent-2" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-primary-text">Actionable Recommendations</h3>
                    <p className="text-secondary-text mt-1">
                      Get personalized suggestions based on your unique data patterns.
                    </p>
                  </div>
                </div>
              </div>
              
              <Link href="/signup">
                <Button className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-white hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:scale-105">
                  Start Tracking Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            {/* Right Column - Image */}
            <div className="relative">
              <div className="relative w-full h-[500px] transform transition-all duration-500 hover:scale-[1.02] hover:rotate-1 group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-80 group-hover:opacity-100"></div>
                <div className="relative w-full h-full rounded-2xl overflow-hidden border border-gray-200 shadow-xl">
                  <Image
                    src="/images/home_section_2.webp"
                    alt="PIDMe Dashboard"
                    fill
                    className="object-cover object-center transition-all duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-3 shadow-xl transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Insights Found</p>
                      <p className="text-lg font-bold text-gray-800">12 New</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Data Analysis */}
      <section 
        ref={sectionRefs[2]}
        className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#f8f8ff] to-[#f0f0ff]"
      >
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Image */}
            <div className="relative order-2 lg:order-1">
              <div className="relative w-full h-[500px] transform transition-all duration-500 hover:scale-[1.02] hover:rotate-1 group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-80 group-hover:opacity-100"></div>
                <div className="relative w-full h-full rounded-2xl overflow-hidden border border-gray-200 shadow-xl">
                  <Image
                    src="/images/home_section_3.webp"
                    alt="PIDMe Data Analysis"
                    fill
                    className="object-cover object-center transition-all duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-3 shadow-xl transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Correlations</p>
                      <p className="text-lg font-bold text-gray-800">7 Found</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Text Content */}
            <div className="space-y-8 order-1 lg:order-2">
              <div className="space-y-4">
                <h2 className="font-heading text-4xl text-primary-text">
                  Discover Your Personal Cause-and-Effect
                </h2>
                <p className="text-xl text-secondary-text max-w-xl">
                  See exactly how your daily habits impact your goals with beautiful, interactive visualizations and correlation analysis.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-primary-text">Interactive Charts</h3>
                    <p className="text-secondary-text mt-1">
                      Visualize your data with beautiful, interactive charts that reveal patterns over time.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent-1/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Target className="h-6 w-6 text-accent-1" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-primary-text">Correlation Analysis</h3>
                    <p className="text-secondary-text mt-1">
                      Identify which habits have the strongest impact on your goals and outcomes.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent-2/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-accent-2" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-primary-text">Pattern Recognition</h3>
                    <p className="text-secondary-text mt-1">
                      Our AI helps identify hidden patterns in your data that you might miss.
                    </p>
                  </div>
                </div>
              </div>
              
              <Link href="/signup">
                <Button className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-white hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:scale-105">
                  Explore Data Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Experimentation */}
      <section 
        ref={sectionRefs[3]}
        className="py-24 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Image */}
            <div className="relative">
              <div className="relative w-full h-[500px] transform transition-all duration-500 hover:scale-[1.02] hover:rotate-1 group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-80 group-hover:opacity-100"></div>
                <div className="relative w-full h-full rounded-2xl overflow-hidden border border-gray-200 shadow-xl">
                  <Image
                    src="/images/home_section_4.webp"
                    alt="PIDMe Experimentation"
                    fill
                    className="object-cover object-center transition-all duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-3 shadow-xl transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <FlaskConical className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Experiments</p>
                      <p className="text-lg font-bold text-gray-800">3 Active</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Text Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="font-heading text-4xl text-primary-text">
                  Become the Engineer of Your Own Life.
                </h2>
                <p className="text-xl text-secondary-text max-w-xl">
                  Have a theory? Put it to the test. The PIDMe Lab lets you run structured experiments on yourself. Form a hypothesis, like "If I cut out sugar for one week, my energy will improve," then track the results. Stop relying on generic advice and start building a lifestyle based on what is scientifically proven to work for you.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FlaskConical className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-primary-text">Structured Experiments</h3>
                    <p className="text-secondary-text mt-1">
                      Design and run controlled experiments to test your personal hypotheses.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent-1/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BarChart2 className="h-6 w-6 text-accent-1" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-primary-text">Results Analysis</h3>
                    <p className="text-secondary-text mt-1">
                      Get clear, visual results that show the impact of your experimental variables.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent-2/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-accent-2" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-primary-text">Evidence-Based Living</h3>
                    <p className="text-secondary-text mt-1">
                      Build a lifestyle based on what's proven to work for your unique biology.
                    </p>
                  </div>
                </div>
              </div>
              
              <Link href="/signup">
                <Button className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-white hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:scale-105">
                  Start Experimenting
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Community */}
      <section 
        ref={sectionRefs[4]}
        className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#f8f8ff] to-[#f0f0ff]"
      >
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-8 order-2 lg:order-1">
              <div className="space-y-4">
                <h2 className="font-heading text-4xl text-primary-text">
                  Learn Together, Improve Together.
                </h2>
                <p className="text-xl text-secondary-text max-w-xl">
                  Your daily habits create your life's results. MyPID.me is the first app designed to be your personal science lab, helping you discover the hidden connections between what you do and how you feel, so you can build a better you with proof.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-primary-text">Community Insights</h3>
                    <p className="text-secondary-text mt-1">
                      Share your discoveries and learn from others' experiments and findings.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent-1/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-accent-1" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-primary-text">Collective Wisdom</h3>
                    <p className="text-secondary-text mt-1">
                      Benefit from the collective experiments of thousands of self-optimizers.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent-2/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Target className="h-6 w-6 text-accent-2" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-primary-text">Personalized Journey</h3>
                    <p className="text-secondary-text mt-1">
                      Find inspiration while creating your own unique optimization path.
                    </p>
                  </div>
                </div>
              </div>
              
              <Link href="/signup">
                <Button className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-white hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:scale-105">
                  Join Our Community
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            {/* Right Column - Community Findings */}
            <div className="space-y-6 order-1 lg:order-2">
              {/* Finding Card 1 */}
              <Card className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px] group">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-heading text-xl text-primary-text group-hover:text-primary transition-colors duration-300">
                        Morning Meditation Significantly Improves My Focus
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full transition-all duration-300 hover:bg-purple-50 hover:shadow-sm">
                          <User className="w-3 h-3 text-secondary-text hover:text-purple-600 transition-colors duration-300" />
                          <span className="text-xs text-secondary-text hover:text-purple-700 transition-colors duration-300">
                            Sarah Johnson
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full transition-all duration-300 hover:bg-blue-50 hover:shadow-sm">
                          <Calendar className="w-3 h-3 text-secondary-text hover:text-blue-600 transition-colors duration-300" />
                          <span className="text-xs text-secondary-text hover:text-blue-700 transition-colors duration-300">
                            May 15, 2025
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300 group-hover:scale-105 transition-all duration-300">
                          Score: +24
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300 group-hover:scale-105 transition-all duration-300">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          Data Shared
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-secondary-text leading-relaxed">
                      After tracking my morning routine for 30 days, I've found that on days when I meditate for at least 10 minutes before work, my focus score increases by an average of 2.7 points (on a 1-10 scale). The effect is most pronounced when I meditate between 6-7am...
                    </p>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 text-sm text-secondary-text">
                          <ChevronUp className="w-4 h-4 text-green-600" />
                          <span>42</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-secondary-text">
                          <ChevronDown className="w-4 h-4 text-red-600" />
                          <span>18</span>
                        </div>
                      </div>
                      <Link href="/community" className="text-sm text-primary font-medium hover:text-primary/80 transition-colors duration-300 flex items-center">
                        Read more
                        <ArrowRight className="ml-1 w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Finding Card 2 */}
              <Card className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px] group">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-heading text-xl text-primary-text group-hover:text-primary transition-colors duration-300">
                        Cutting Caffeine After 2pm Improved My Sleep Quality by 32%
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full transition-all duration-300 hover:bg-purple-50 hover:shadow-sm">
                          <User className="w-3 h-3 text-secondary-text hover:text-purple-600 transition-colors duration-300" />
                          <span className="text-xs text-secondary-text hover:text-purple-700 transition-colors duration-300">
                            Michael Chen
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full transition-all duration-300 hover:bg-blue-50 hover:shadow-sm">
                          <Calendar className="w-3 h-3 text-secondary-text hover:text-blue-600 transition-colors duration-300" />
                          <span className="text-xs text-secondary-text hover:text-blue-700 transition-colors duration-300">
                            April 28, 2025
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300 group-hover:scale-105 transition-all duration-300">
                          Score: +37
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-300 group-hover:scale-105 transition-all duration-300">
                          <FlaskConical className="w-3 h-3 mr-1" />
                          Experiment Results
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-secondary-text leading-relaxed">
                      I ran a 3-week experiment where I alternated between cutting off caffeine at 2pm vs. drinking coffee until 6pm. The results were striking - my sleep quality score (measured with my Oura ring) improved by 32% on days when I stopped caffeine early. My sleep latency decreased from 35 minutes to just 12 minutes...
                    </p>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 text-sm text-secondary-text">
                          <ChevronUp className="w-4 h-4 text-green-600" />
                          <span>51</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-secondary-text">
                          <ChevronDown className="w-4 h-4 text-red-600" />
                          <span>14</span>
                        </div>
                      </div>
                      <Link href="/community" className="text-sm text-primary font-medium hover:text-primary/80 transition-colors duration-300 flex items-center">
                        Read more
                        <ArrowRight className="ml-1 w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        ref={sectionRefs[5]}
        className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#9b5de5] to-[#3c1a5b] text-white"
      >
        <div className="container mx-auto max-w-4xl text-center">
          <div className="space-y-8">
            <h2 className="font-heading text-4xl sm:text-5xl">
              Start Optimizing Today
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Join thousands of people who are using data to build better habits, improve their health, and optimize their lives.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
              <Link href="/signup">
                <Button className="w-full sm:w-auto text-lg px-8 py-6 bg-white hover:bg-white/90 text-[#4a2a6d] border border-white hover:shadow-lg hover:shadow-white/20 transition-all duration-300 hover:scale-105">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 bg-transparent hover:bg-white/10 text-white border border-white hover:shadow-lg hover:shadow-white/20 transition-all duration-300 hover:scale-105">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}