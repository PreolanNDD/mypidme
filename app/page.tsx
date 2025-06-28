'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  BarChart2, 
  Calendar,
  ChevronRight, 
  FlaskConical, 
  LineChart, 
  MessageSquare, 
  Settings, 
  Sparkles, 
  Target, 
  TrendingUp, 
  User,
  Users 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [hoveredFinding, setHoveredFinding] = useState<number | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Sample findings data
  const sampleFindings = [
    {
      id: 1,
      title: "Morning meditation significantly improves my focus",
      content: "After tracking my meditation habits for 30 days, I've discovered that on days when I meditate for at least 10 minutes in the morning, my focus score increases by an average of 2.3 points (on a scale of 1-10). This effect is most noticeable on high-stress workdays.",
      author: "Emma Johnson",
      date: "May 15, 2025",
      upvotes: 42,
      downvotes: 3,
      shareData: true
    },
    {
      id: 2,
      title: "Cutting caffeine after 2pm improved my sleep quality by 35%",
      content: "I ran a 3-week experiment where I tracked my caffeine intake timing and sleep quality. When I stopped consuming caffeine after 2pm, my average sleep quality rating increased from 5.8 to 7.9. My sleep tracker also showed 22% more deep sleep on these nights.",
      author: "Michael Chen",
      date: "June 2, 2025",
      upvotes: 78,
      downvotes: 5,
      shareData: true
    }
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-[#9b5de5] to-[#3c1a5b] text-white">
        <div className="container mx-auto px-4 py-20 md:py-32 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading mb-6 leading-tight">
              Tune Your Life with Precision
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-lg">
              Track what matters, discover what works, and optimize your life with data-driven insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button className="bg-white hover:bg-gray-100 text-[#9b5de5] border border-white hover:text-[#7b45b5] transition-colors duration-200 text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl">
                  Get Started
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="border-white text-white hover:bg-white/10 transition-colors duration-200 text-lg px-8 py-3 rounded-xl">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
          <div className={`md:w-1/2 transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="relative w-full max-w-lg mx-auto group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-500 rounded-3xl blur-lg opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse-glow"></div>
              <div className="relative">
                <Image
                  src="/images/home_section_1.webp"
                  alt="PID Controller Dashboard"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-2xl transform transition-all duration-500 group-hover:scale-[1.02] group-hover:-rotate-1"
                />
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full p-2 shadow-lg transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: How It Works */}
      <section className="w-full py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading text-primary-text mb-4">How PIDMe Works</h2>
            <p className="text-xl text-secondary-text max-w-3xl mx-auto">
              Inspired by PID controllers in engineering, we've created a system to help you optimize your life with precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-heading text-primary-text mb-3">Track Your Inputs</h3>
              <p className="text-secondary-text">
                Log your daily habits, behaviors, and activities that might impact your goals. From sleep and exercise to caffeine and screen time.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <BarChart2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-heading text-primary-text mb-3">Measure Your Outputs</h3>
              <p className="text-secondary-text">
                Track the outcomes you care about - energy levels, productivity, mood, focus, or any personal metric that matters to your wellbeing.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Settings className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-heading text-primary-text mb-3">Optimize Your Life</h3>
              <p className="text-secondary-text">
                Discover the connections between your actions and results. Use data-driven insights to fine-tune your habits for maximum impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Feature Highlight - Data Analysis */}
      <section className="w-full py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-lg mx-auto">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <LineChart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-heading text-primary-text ml-4">Data Analysis</h3>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium">Energy Level</span>
                    </div>
                    <span className="text-sm text-gray-500">Last 30 days</span>
                  </div>
                  <div className="h-40 w-full bg-gradient-to-r from-green-100 to-green-50 rounded-lg flex items-end p-2">
                    {[3, 5, 4, 7, 6, 8, 7, 9, 8, 7, 6, 8, 9, 8, 7, 6, 5, 7, 8, 9, 8, 7, 6, 5, 4, 6, 7, 8, 9, 8].map((value, index) => (
                      <div 
                        key={index} 
                        className="w-full bg-green-500 rounded-t-sm mx-0.5 transition-all duration-300 hover:bg-green-600"
                        style={{ height: `${value * 10}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-500 mr-3" />
                    <div>
                      <h4 className="font-medium text-primary-text">Correlation Detected</h4>
                      <p className="text-sm text-secondary-text">Morning exercise strongly correlates with higher energy</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                    <Target className="w-5 h-5 text-purple-500 mr-3" />
                    <div>
                      <h4 className="font-medium text-primary-text">Suggested Optimization</h4>
                      <p className="text-sm text-secondary-text">Try exercising before 9am for optimal energy levels</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 md:pl-12">
              <h2 className="text-3xl md:text-4xl font-heading text-primary-text mb-6">See the Hidden Patterns in Your Life</h2>
              <p className="text-xl text-secondary-text mb-6">
                Our powerful analytics engine reveals the connections between your daily habits and your well-being metrics, showing you exactly what works for your unique biology and lifestyle.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <ChevronRight className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="ml-3 text-secondary-text">Discover which habits actually impact your energy, focus, and mood</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <ChevronRight className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="ml-3 text-secondary-text">Visualize trends and correlations with beautiful, intuitive charts</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <ChevronRight className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="ml-3 text-secondary-text">Get personalized insights based on your unique data patterns</p>
                </li>
              </ul>
              <Link href="/signup">
                <Button className="bg-primary hover:bg-white hover:text-[#4a2a6d] border border-primary transition-colors duration-200 text-white">
                  Start Analyzing
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Feature Highlight - Experimentation */}
      <section className="w-full py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row-reverse items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <div className={`relative w-full max-w-lg mx-auto group transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-500 rounded-3xl blur-lg opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse-glow"></div>
                <div className="relative">
                  <Image
                    src="/images/home_section_4.webp"
                    alt="PID Controller Dashboard"
                    width={600}
                    height={400}
                    className="rounded-2xl shadow-2xl transform transition-all duration-500 group-hover:scale-[1.02] group-hover:-rotate-1"
                  />
                  <div className="absolute -top-4 -right-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full p-2 shadow-lg transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 md:pr-12">
              <h2 className="text-3xl md:text-4xl font-heading text-primary-text mb-6">Become the Engineer of Your Own Life.</h2>
              <p className="text-xl text-secondary-text mb-6">
                Have a theory? Put it to the test. The PIDMe Lab lets you run structured experiments on yourself. Form a hypothesis, like "If I cut out sugar for one week, my energy will improve," then track the results. Stop relying on generic advice and start building a lifestyle based on what is scientifically proven to work for you.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                    <ChevronRight className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="ml-3 text-secondary-text">Design controlled experiments to test your theories</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                    <ChevronRight className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="ml-3 text-secondary-text">Measure the real impact of lifestyle changes</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                    <ChevronRight className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="ml-3 text-secondary-text">Build a personalized optimization playbook</p>
                </li>
              </ul>
              <Link href="/signup">
                <Button className="bg-primary hover:bg-white hover:text-[#4a2a6d] border border-primary transition-colors duration-200 text-white">
                  Start Experimenting
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Feature Highlight - Community */}
      <section className="w-full py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <div className="space-y-6 max-w-lg mx-auto">
                {sampleFindings.map((finding, index) => (
                  <div 
                    key={finding.id}
                    className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer relative overflow-hidden group"
                    onMouseEnter={() => setHoveredFinding(finding.id)}
                    onMouseLeave={() => setHoveredFinding(null)}
                  >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                    
                    {/* Animated border glow */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/20 via-blue-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                    
                    <div className="relative">
                      {/* Header */}
                      <h3 className="font-heading text-xl text-primary-text group-hover:text-purple-700 transition-colors duration-300 leading-tight mb-3">
                        {finding.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full transition-all duration-300 group-hover:bg-purple-50 group-hover:shadow-sm">
                          <User className="w-3 h-3 text-secondary-text group-hover:text-purple-600 transition-colors duration-300" />
                          <span className="text-xs text-secondary-text group-hover:text-purple-700 transition-colors duration-300">
                            {finding.author}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full transition-all duration-300 group-hover:bg-blue-50 group-hover:shadow-sm">
                          <Calendar className="w-3 h-3 text-secondary-text group-hover:text-blue-600 transition-colors duration-300" />
                          <span className="text-xs text-secondary-text group-hover:text-blue-700 transition-colors duration-300">
                            {finding.date}
                          </span>
                        </div>
                        <div className={`text-xs px-3 py-1 rounded-full ${
                          finding.upvotes > finding.downvotes 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-red-50 text-red-700 border border-red-200'
                        } group-hover:scale-105 transition-all duration-300`}>
                          Score: {finding.upvotes - finding.downvotes > 0 ? '+' : ''}{finding.upvotes - finding.downvotes}
                        </div>
                        {finding.shareData && (
                          <div className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full group-hover:scale-105 transition-all duration-300">
                            <BarChart2 className="w-3 h-3 inline-block mr-1" />
                            Data Shared
                          </div>
                        )}
                      </div>

                      {/* Content Preview */}
                      <p className="text-primary-text leading-relaxed group-hover:text-gray-700 transition-colors duration-300 line-clamp-3 text-sm">
                        {finding.content}
                      </p>

                      {/* Vote Summary */}
                      <div className="flex items-center space-x-4 pt-3 border-t border-gray-100 group-hover:border-purple-100 transition-colors duration-300 mt-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1 text-sm text-secondary-text">
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-all duration-300">
                              <ChevronRight className="w-3 h-3 text-green-600 rotate-90" />
                            </div>
                            <span>{finding.upvotes}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-secondary-text">
                            <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-all duration-300">
                              <ChevronRight className="w-3 h-3 text-red-600 rotate-[270deg]" />
                            </div>
                            <span>{finding.downvotes}</span>
                          </div>
                        </div>
                        <div className="ml-auto">
                          <ArrowRight className="w-5 h-5 text-secondary-text group-hover:text-purple-600 transition-colors duration-300" />
                        </div>
                      </div>
                      
                      {/* Sparkle effect on hover */}
                      {hoveredFinding === finding.id && (
                        <div className="absolute top-3 right-3">
                          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div className="text-center pt-4">
                  <Link href="/signup">
                    <Button className="bg-primary hover:bg-white hover:text-[#4a2a6d] border border-primary transition-colors duration-200 text-white">
                      View More Community Findings
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 md:pl-12">
              <h2 className="text-3xl md:text-4xl font-heading text-primary-text mb-6">Learn Together, Improve Together.</h2>
              <p className="text-xl text-secondary-text mb-6">
                Your daily habits create your life's results. MyPID.me is the first app designed to be your personal science lab, helping you discover the hidden connections between what you do and how you feel, so you can build a better you with proof.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="ml-3 text-secondary-text">Share your discoveries with a community of self-optimizers</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="ml-3 text-secondary-text">Learn from others' experiments and findings</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="ml-3 text-secondary-text">Build on collective wisdom while maintaining privacy</p>
                </li>
              </ul>
              <Link href="/signup">
                <Button className="bg-primary hover:bg-white hover:text-[#4a2a6d] border border-primary transition-colors duration-200 text-white">
                  Join Community
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 bg-gradient-to-r from-[#9b5de5] to-[#3c1a5b] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading mb-6">Start Optimizing Today</h2>
          <p className="text-xl text-gray-100 max-w-2xl mx-auto mb-10">
            Join thousands of people who are using data to build better habits, improve their wellbeing, and reach their full potential.
          </p>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 transition-all duration-300 hover:bg-white/20 hover:border-white/40 hover:transform hover:-translate-y-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-heading mb-2">Track</h3>
                <p className="text-gray-100 text-sm">
                  Log your daily habits and metrics in less than a minute a day
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 transition-all duration-300 hover:bg-white/20 hover:border-white/40 hover:transform hover:-translate-y-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <FlaskConical className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-heading mb-2">Experiment</h3>
                <p className="text-gray-100 text-sm">
                  Test theories about what works for your unique biology
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 transition-all duration-300 hover:bg-white/20 hover:border-white/40 hover:transform hover:-translate-y-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-heading mb-2">Improve</h3>
                <p className="text-gray-100 text-sm">
                  Use data-driven insights to optimize your daily routine
                </p>
              </div>
            </div>
            
            {/* Get Started Journey */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-8">
              <div className="flex-1 max-w-xs">
                <div className="group relative overflow-hidden">
                  <Link href="/signup" className="block w-full">
                    <div className="bg-white text-[#9b5de5] rounded-xl px-6 py-4 text-center font-medium text-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-white group-hover:text-[#7b45b5] border border-white group-hover:border-white">
                      <span className="relative z-10">Create Account</span>
                    </div>
                  </Link>
                </div>
              </div>
              
              <div className="hidden md:block">
                <ArrowRight className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1 max-w-xs">
                <div className="group relative overflow-hidden">
                  <Link href="/signup" className="block w-full">
                    <div className="bg-white/20 backdrop-blur-sm text-white rounded-xl px-6 py-4 text-center font-medium text-lg border border-white/40 transition-all duration-300 hover:bg-white/30 hover:border-white/60 group-hover:text-white">
                      <span className="relative z-10">Set Up Metrics</span>
                    </div>
                  </Link>
                </div>
              </div>
              
              <div className="hidden md:block">
                <ArrowRight className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1 max-w-xs">
                <div className="group relative overflow-hidden">
                  <Link href="/signup" className="block w-full">
                    <div className="bg-white/20 backdrop-blur-sm text-white rounded-xl px-6 py-4 text-center font-medium text-lg border border-white/40 transition-all duration-300 hover:bg-white/30 hover:border-white/60 group-hover:text-white">
                      <span className="relative z-10">Start Optimizing</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
            
            <Link href="/signup">
              <Button className="bg-white hover:bg-gray-100 text-[#9b5de5] border border-white hover:text-[#7b45b5] transition-colors duration-200 text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl">
                Get Started Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-heading">PIDMe</h2>
              <p className="text-gray-400">Tune Your Life with Precision</p>
            </div>
            
            <div className="flex flex-wrap gap-8">
              <div>
                <h3 className="text-lg font-medium mb-3">Product</h3>
                <ul className="space-y-2">
                  <li><Link href="/signup" className="text-gray-400 hover:text-white transition-colors">Get Started</Link></li>
                  <li><Link href="/login" className="text-gray-400 hover:text-white transition-colors">Log In</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Features</h3>
                <ul className="space-y-2">
                  <li><Link href="/signup" className="text-gray-400 hover:text-white transition-colors">Tracking</Link></li>
                  <li><Link href="/signup" className="text-gray-400 hover:text-white transition-colors">Analysis</Link></li>
                  <li><Link href="/signup" className="text-gray-400 hover:text-white transition-colors">Experiments</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Company</h3>
                <ul className="space-y-2">
                  <li><Link href="/signup" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                  <li><Link href="/signup" className="text-gray-400 hover:text-white transition-colors">Privacy</Link></li>
                  <li><Link href="/signup" className="text-gray-400 hover:text-white transition-colors">Terms</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-500">&copy; 2025 PIDMe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}