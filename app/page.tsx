'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  BarChart3, 
  ArrowRight, 
  LineChart, 
  FlaskConical, 
  Users, 
  Calendar, 
  ChevronUp, 
  ChevronDown, 
  MessageSquare,
  User
} from 'lucide-react';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Add animation delay for initial load
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Section 1 animation
  const [section1Ref, section1InView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const section1Animation = useAnimation();

  // Section 2 animation
  const [section2Ref, section2InView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const section2Animation = useAnimation();

  // Section 3 animation
  const [section3Ref, section3InView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const section3Animation = useAnimation();

  // Section 4 animation
  const [section4Ref, section4InView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const section4Animation = useAnimation();

  // Section 5 animation
  const [section5Ref, section5InView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const section5Animation = useAnimation();

  // Section 6 animation (CTA)
  const [section6Ref, section6InView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const section6Animation = useAnimation();

  // Trigger animations when sections come into view
  useEffect(() => {
    if (section1InView) {
      section1Animation.start('visible');
    }
    if (section2InView) {
      section2Animation.start('visible');
    }
    if (section3InView) {
      section3Animation.start('visible');
    }
    if (section4InView) {
      section4Animation.start('visible');
    }
    if (section5InView) {
      section5Animation.start('visible');
    }
    if (section6InView) {
      section6Animation.start('visible');
    }
  }, [
    section1InView, section1Animation,
    section2InView, section2Animation,
    section3InView, section3Animation,
    section4InView, section4Animation,
    section5InView, section5Animation,
    section6InView, section6Animation
  ]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.2
      }
    }
  };

  // Sample chart data for visualization
  const chartData = [
    { name: 'Mon', value1: 7, value2: 3 },
    { name: 'Tue', value1: 5, value2: 4 },
    { name: 'Wed', value1: 6, value2: 6 },
    { name: 'Thu', value1: 8, value2: 8 },
    { name: 'Fri', value1: 9, value2: 7 },
    { name: 'Sat', value1: 7, value2: 5 },
    { name: 'Sun', value1: 8, value2: 9 },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      {/* Hero Section */}
      <section className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#9b5de5] to-[#3c1a5b] text-white px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading leading-tight">
                  <span className="block">Tune Your Life</span>
                  <span className="block text-accent-1">Like an Engineer</span>
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-xl md:text-2xl text-gray-100 max-w-xl"
              >
                Track your habits, measure your results, and discover what actually works for you with scientific precision.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link href="/signup" className="group">
                  <div className="relative overflow-hidden px-8 py-4 bg-white text-primary rounded-xl font-medium text-lg shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-white/20 hover:scale-105">
                    {/* Sliding highlight effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                    
                    {/* Content */}
                    <div className="relative flex items-center justify-center space-x-2">
                      <span>Get Started Free</span>
                      <div className="transform group-hover:translate-x-1 transition-transform duration-300">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
                
                <Link href="/login" className="group">
                  <div className="relative overflow-hidden px-8 py-4 bg-transparent border-2 border-white/80 text-white rounded-xl font-medium text-lg transition-all duration-300 hover:bg-white/10 hover:border-white hover:scale-105">
                    {/* Sliding highlight effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                    
                    {/* Content */}
                    <div className="relative flex items-center justify-center">
                      <span>Log In</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Column - Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ 
                opacity: isLoaded ? 1 : 0, 
                scale: isLoaded ? 1 : 0.9, 
                y: isLoaded ? 0 : 30 
              }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="relative group"
            >
              <div className="relative w-full h-[400px] sm:h-[500px] rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-700 group-hover:scale-[1.02] group-hover:rotate-1">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <Image
                  src="/images/home_section_1.webp"
                  alt="PID.me Dashboard"
                  fill
                  className="object-cover object-center transform transition-transform duration-700 group-hover:scale-110"
                  priority
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 z-20">
                  <p className="text-white text-lg font-medium">Your personal optimization dashboard</p>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-accent-1 rounded-full blur-2xl opacity-60 animate-pulse-glow"></div>
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-accent-2 rounded-full blur-2xl opacity-60 animate-pulse-glow"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2: How It Works */}
      <section 
        ref={section2Ref}
        className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={section2Animation}
          className="max-w-7xl mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl font-heading text-primary-text mb-6">How It Works</h2>
            <p className="text-xl text-secondary-text max-w-3xl mx-auto">
              MyPID.me brings the precision of engineering to personal development with a simple three-step process.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-xl p-8 shadow-xl border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-200 transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-heading text-primary-text mb-4">Track Your Inputs</h3>
              <p className="text-secondary-text leading-relaxed">
                Log your daily habits, behaviors, and activities in less than a minute each day. From sleep quality to meditation minutes, track what matters to you.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-xl p-8 shadow-xl border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-200 transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                <LineChart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-heading text-primary-text mb-4">Measure Your Results</h3>
              <p className="text-secondary-text leading-relaxed">
                Track your goals and outcomes like energy levels, productivity, and mood. Our system automatically analyzes connections between your inputs and results.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-xl p-8 shadow-xl border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-200 transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                <FlaskConical className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-heading text-primary-text mb-4">Optimize Your Life</h3>
              <p className="text-secondary-text leading-relaxed">
                Discover what actually works for you through data-driven insights. Run experiments, test hypotheses, and build a lifestyle optimized for your unique biology.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Section 3: Data Analysis */}
      <section 
        ref={section3Ref}
        className="w-full py-24 px-4 sm:px-6 lg:px-8"
        style={{ background: 'linear-gradient(to bottom right, #3C1A5B, #2A1240)' }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={section3Animation}
          className="max-w-7xl mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text Content */}
            <motion.div variants={itemVariants} className="space-y-8">
              <h2 className="text-4xl font-heading text-[#f5f5f5] leading-tight">
                See the Hidden Patterns in Your Life
              </h2>
              <p className="text-xl text-[#e6e0f8] leading-relaxed">
                Our powerful correlation engine reveals the connections between your daily habits and your results. Discover which behaviors are actually moving the needle for your goals, and which ones might be holding you back.
              </p>
              <div className="pt-4">
                <Link href="/signup" className="group">
                  <div className="relative overflow-hidden inline-flex px-8 py-4 bg-white text-primary rounded-xl font-medium text-lg shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-white/20 hover:scale-105">
                    {/* Animated background gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-purple-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Sliding highlight effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                    
                    {/* Content */}
                    <div className="relative flex items-center justify-center space-x-2">
                      <span className="tracking-wide group-hover:tracking-wider transition-all duration-300">Start Analyzing</span>
                      <div className="transform group-hover:translate-x-1 transition-transform duration-300">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                    
                    {/* Pulse ring effect */}
                    <div className="absolute inset-0 rounded-xl border-2 border-white/30 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"></div>
                  </div>
                </Link>
              </div>
            </motion.div>

            {/* Right Column - Chart Visualization */}
            <motion.div 
              variants={itemVariants}
              className="bg-white/95 rounded-2xl p-6 shadow-2xl border border-white/20 transition-all duration-500 hover:shadow-3xl hover:shadow-white/20 group"
            >
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-heading text-2xl text-primary-text bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-500 group-hover:tracking-wider">
                    Correlation Analysis
                  </h3>
                </div>
                
                <div className="h-[300px] w-full">
                  <div className="h-full w-full">
                    {/* Chart visualization */}
                    <div className="relative h-full w-full">
                      <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                        <div className="w-full h-full">
                          {/* Chart goes here */}
                          <div className="w-full h-full flex flex-col">
                            <div className="flex-1 relative">
                              {/* Chart lines */}
                              <div className="absolute inset-0 flex flex-col justify-between p-4">
                                {[0, 1, 2, 3, 4].map((i) => (
                                  <div key={i} className="w-full h-px bg-gray-200"></div>
                                ))}
                              </div>
                              
                              {/* Y-axis labels */}
                              <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray-500 py-4">
                                <div>10</div>
                                <div>8</div>
                                <div>6</div>
                                <div>4</div>
                                <div>2</div>
                                <div>0</div>
                              </div>
                              
                              {/* Chart content */}
                              <div className="absolute left-10 right-0 top-0 bottom-0">
                                {/* Line 1 - Sleep Quality */}
                                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                  <path 
                                    d="M0,40 L14.29,30 L28.57,50 L42.86,20 L57.14,10 L71.43,30 L85.71,20 L100,10" 
                                    fill="none" 
                                    stroke="#7ed984" 
                                    strokeWidth="2"
                                    className="transition-all duration-700 group-hover:stroke-[3]"
                                  />
                                </svg>
                                
                                {/* Line 2 - Meditation */}
                                <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                                  <path 
                                    d="M0,70 L14.29,60 L28.57,80 L42.86,50 L57.14,30 L71.43,40 L85.71,30 L100,20" 
                                    fill="none" 
                                    stroke="#FFA500" 
                                    strokeWidth="2"
                                    strokeDasharray="5,5"
                                    className="transition-all duration-700 group-hover:stroke-[3]"
                                  />
                                </svg>
                                
                                {/* Data points - Line 1 */}
                                {[
                                  { x: 0, y: 40 },
                                  { x: 14.29, y: 30 },
                                  { x: 28.57, y: 50 },
                                  { x: 42.86, y: 20 },
                                  { x: 57.14, y: 10 },
                                  { x: 71.43, y: 30 },
                                  { x: 85.71, y: 20 },
                                  { x: 100, y: 10 }
                                ].map((point, i) => (
                                  <div 
                                    key={`point1-${i}`}
                                    className="absolute w-3 h-3 bg-white border-2 border-[#7ed984] rounded-full transform -translate-x-1.5 -translate-y-1.5 transition-all duration-500 group-hover:scale-125 group-hover:border-[3px]"
                                    style={{ 
                                      left: `${point.x}%`, 
                                      top: `${point.y}%` 
                                    }}
                                  ></div>
                                ))}
                                
                                {/* Data points - Line 2 */}
                                {[
                                  { x: 0, y: 70 },
                                  { x: 14.29, y: 60 },
                                  { x: 28.57, y: 80 },
                                  { x: 42.86, y: 50 },
                                  { x: 57.14, y: 30 },
                                  { x: 71.43, y: 40 },
                                  { x: 85.71, y: 30 },
                                  { x: 100, y: 20 }
                                ].map((point, i) => (
                                  <div 
                                    key={`point2-${i}`}
                                    className="absolute w-3 h-3 bg-white border-2 border-[#FFA500] rounded-full transform -translate-x-1.5 -translate-y-1.5 transition-all duration-500 group-hover:scale-125 group-hover:border-[3px]"
                                    style={{ 
                                      left: `${point.x}%`, 
                                      top: `${point.y}%` 
                                    }}
                                  ></div>
                                ))}
                              </div>
                            </div>
                            
                            {/* X-axis */}
                            <div className="h-8 flex justify-between text-xs text-gray-500 px-10">
                              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                                <div key={day}>{day}</div>
                              ))}
                            </div>
                            
                            {/* Legend */}
                            <div className="flex justify-center items-center space-x-8 mt-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-[#7ed984] rounded-full"></div>
                                <span className="text-sm">Energy Level</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-[#FFA500] rounded-full"></div>
                                <span className="text-sm">Meditation</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Section 4: Lab Features */}
      <section 
        ref={section4Ref}
        className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={section4Animation}
          className="max-w-7xl mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Image */}
            <motion.div 
              variants={imageVariants}
              className="relative group"
            >
              <div className="relative w-full h-[400px] sm:h-[500px] rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-700 group-hover:scale-[1.02] group-hover:rotate-1">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <Image
                  src="/images/home_section_4.webp"
                  alt="PID.me Lab"
                  fill
                  className="object-cover object-center transform transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 z-20">
                  <p className="text-white text-lg font-medium">Run controlled experiments on yourself</p>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-accent-1 rounded-full blur-2xl opacity-60 animate-pulse-glow"></div>
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-accent-2 rounded-full blur-2xl opacity-60 animate-pulse-glow"></div>
            </motion.div>

            {/* Right Column - Text Content */}
            <motion.div variants={itemVariants} className="space-y-8">
              <h2 className="text-4xl font-heading text-primary-text leading-tight">
                Become the Engineer of Your Own Life.
              </h2>
              <p className="text-xl text-secondary-text leading-relaxed">
                Have a theory? Put it to the test. The PIDMe Lab lets you run structured experiments on yourself. Form a hypothesis, like "If I cut out sugar for one week, my energy will improve," then track the results. Stop relying on generic advice and start building a lifestyle based on what is scientifically proven to work for you.
              </p>
              <div className="pt-4">
                <Link href="/signup" className="group">
                  <div className="relative overflow-hidden inline-flex px-8 py-4 bg-primary text-white rounded-xl font-medium text-lg shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:scale-105">
                    {/* Sliding highlight effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                    
                    {/* Content */}
                    <div className="relative flex items-center justify-center space-x-2">
                      <span>Start Experimenting</span>
                      <div className="transform group-hover:translate-x-1 transition-transform duration-300">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Section 5: Community */}
      <section 
        ref={section5Ref}
        className="w-full py-24 px-4 sm:px-6 lg:px-8"
        style={{ background: 'linear-gradient(to bottom right, #3C1A5B, #2A1240)' }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={section5Animation}
          className="max-w-7xl mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text Content */}
            <motion.div variants={itemVariants} className="space-y-8">
              <h2 className="text-4xl font-heading text-[#f5f5f5] leading-tight">
                Learn Together, Improve Together.
              </h2>
              <p className="text-xl text-[#e6e0f8] leading-relaxed">
                Your daily habits create your life's results. MyPID.me is the first app designed to be your personal science lab, helping you discover the hidden connections between what you do and how you feel, so you can build a better you with proof.
              </p>
              <div className="pt-4">
                <Link href="/signup" className="group">
                  <div className="relative overflow-hidden inline-flex px-8 py-4 bg-white text-primary rounded-xl font-medium text-lg shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-white/20 hover:scale-105">
                    {/* Animated background gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-purple-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Sliding highlight effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                    
                    {/* Content */}
                    <div className="relative flex items-center justify-center space-x-2">
                      <span className="tracking-wide group-hover:tracking-wider transition-all duration-300">Join Community</span>
                      <div className="transform group-hover:translate-x-1 transition-transform duration-300">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                    
                    {/* Pulse ring effect */}
                    <div className="absolute inset-0 rounded-xl border-2 border-white/30 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"></div>
                  </div>
                </Link>
              </div>
            </motion.div>

            {/* Right Column - Community Findings */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Finding Card 1 */}
              <div className="group/finding relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl cursor-pointer border border-white/20 transition-all duration-500 hover:transform hover:-translate-y-3 hover:shadow-3xl hover:shadow-white/20 hover:z-10">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-indigo-500/5 opacity-0 group-hover/finding:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                
                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/20 via-blue-400/20 to-indigo-400/20 opacity-0 group-hover/finding:opacity-100 transition-opacity duration-500 blur-sm"></div>
                
                <div className="relative p-6 space-y-5">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading text-xl text-primary-text group-hover/finding:text-purple-700 transition-colors duration-300 leading-tight mb-3">
                        Morning meditation significantly improves my focus and productivity
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full transition-all duration-300 group-hover/finding:bg-purple-50 group-hover/finding:shadow-sm">
                          <User className="w-3 h-3 text-secondary-text group-hover/finding:text-purple-600 transition-colors duration-300" />
                          <span className="text-xs text-secondary-text group-hover/finding:text-purple-700 transition-colors duration-300">
                            Sarah Johnson
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full transition-all duration-300 group-hover/finding:bg-blue-50 group-hover/finding:shadow-sm">
                          <Calendar className="w-3 h-3 text-secondary-text group-hover/finding:text-blue-600 transition-colors duration-300" />
                          <span className="text-xs text-secondary-text group-hover/finding:text-blue-700 transition-colors duration-300">
                            May 15, 2025
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="transform group-hover/finding:translate-x-1 transition-all duration-300 ml-4">
                      <ArrowRight className="w-5 h-5 text-secondary-text group-hover/finding:text-purple-600 transition-colors duration-300" />
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="prose prose-sm max-w-none">
                    <p className="text-primary-text leading-relaxed group-hover/finding:text-gray-700 transition-colors duration-300">
                      After tracking my meditation practice for 30 days, I've found that on days when I meditate for at least 10 minutes in the morning, my focus score increases by an average of 2.7 points. The data clearly shows a strong positive correlation...
                    </p>
                  </div>

                  {/* Vote Summary */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 group-hover/finding:border-purple-100 transition-colors duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-sm text-secondary-text">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center group-hover/finding:bg-green-200 transition-all duration-300">
                          <ChevronUp className="w-3 h-3 text-green-600" />
                        </div>
                        <span>42</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-secondary-text">
                        <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center group-hover/finding:bg-red-200 transition-all duration-300">
                          <ChevronDown className="w-3 h-3 text-red-600" />
                        </div>
                        <span>5</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-sm text-secondary-text">
                        <MessageSquare className="w-4 h-4" />
                        <span>12</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Finding Card 2 */}
              <div className="group/finding relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl cursor-pointer border border-white/20 transition-all duration-500 hover:transform hover:-translate-y-3 hover:shadow-3xl hover:shadow-white/20 hover:z-10">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-indigo-500/5 opacity-0 group-hover/finding:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                
                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/20 via-blue-400/20 to-indigo-400/20 opacity-0 group-hover/finding:opacity-100 transition-opacity duration-500 blur-sm"></div>
                
                <div className="relative p-6 space-y-5">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading text-xl text-primary-text group-hover/finding:text-purple-700 transition-colors duration-300 leading-tight mb-3">
                        Cold showers boost my energy more than caffeine
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full transition-all duration-300 group-hover/finding:bg-purple-50 group-hover/finding:shadow-sm">
                          <User className="w-3 h-3 text-secondary-text group-hover/finding:text-purple-600 transition-colors duration-300" />
                          <span className="text-xs text-secondary-text group-hover/finding:text-purple-700 transition-colors duration-300">
                            Michael Chen
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full transition-all duration-300 group-hover/finding:bg-blue-50 group-hover/finding:shadow-sm">
                          <Calendar className="w-3 h-3 text-secondary-text group-hover/finding:text-blue-600 transition-colors duration-300" />
                          <span className="text-xs text-secondary-text group-hover/finding:text-blue-700 transition-colors duration-300">
                            June 3, 2025
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="transform group-hover/finding:translate-x-1 transition-all duration-300 ml-4">
                      <ArrowRight className="w-5 h-5 text-secondary-text group-hover/finding:text-purple-600 transition-colors duration-300" />
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="prose prose-sm max-w-none">
                    <p className="text-primary-text leading-relaxed group-hover/finding:text-gray-700 transition-colors duration-300">
                      My experiment comparing cold showers to coffee consumption showed surprising results. On days with 3-minute cold showers, my energy levels averaged 8.2/10, while coffee-only days averaged 6.8/10. The data suggests cold exposure might be more effective...
                    </p>
                  </div>

                  {/* Vote Summary */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 group-hover/finding:border-purple-100 transition-colors duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-sm text-secondary-text">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center group-hover/finding:bg-green-200 transition-all duration-300">
                          <ChevronUp className="w-3 h-3 text-green-600" />
                        </div>
                        <span>37</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-secondary-text">
                        <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center group-hover/finding:bg-red-200 transition-all duration-300">
                          <ChevronDown className="w-3 h-3 text-red-600" />
                        </div>
                        <span>8</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-sm text-secondary-text">
                        <MessageSquare className="w-4 h-4" />
                        <span>9</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Section 6: CTA */}
      <section 
        ref={section6Ref}
        className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={section6Animation}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-4xl sm:text-5xl font-heading text-primary-text mb-8"
          >
            Start Optimizing Today
          </motion.h2>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl text-secondary-text mb-12 max-w-3xl mx-auto"
          >
            Join thousands of others who are using data to build better habits, achieve their goals, and optimize their lives with scientific precision.
          </motion.p>
          
          <motion.div variants={itemVariants}>
            <Link href="/signup" className="group">
              <div className="relative overflow-hidden inline-flex px-10 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium text-xl shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-105">
                {/* Animated background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Sliding highlight effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                
                {/* Content */}
                <div className="relative flex items-center justify-center space-x-3">
                  <span className="tracking-wide group-hover:tracking-wider transition-all duration-300">Create Your Free Account</span>
                  <div className="transform group-hover:translate-x-1 transition-transform duration-300">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                </div>
                
                {/* Pulse ring effect */}
                <div className="absolute inset-0 rounded-xl border-2 border-white/30 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></div>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-heading mb-4">MyPID.me</h3>
              <p className="text-gray-400">
                Your personal optimization platform inspired by PID controllers.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-heading mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                    Log In
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="text-gray-400 hover:text-white transition-colors">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-heading mb-4">Contact</h3>
              <p className="text-gray-400">
                support@mypid.me
              </p>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            <p>© 2025 MyPID.me. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}