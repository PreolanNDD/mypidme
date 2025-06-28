import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, BarChart3, Eye, Settings, ChevronUp, ChevronDown, User, Calendar, MessageSquare, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [hoveredSection1Image, setHoveredSection1Image] = useState(false);
  const [hoveredSection4Image, setHoveredSection4Image] = useState(false);

  // Sample findings data for section 5
  const sampleFindings = [
    {
      id: 1,
      title: "Morning meditation significantly improves my focus",
      content: "After tracking my daily meditation practice for 30 days, I've discovered that on days when I meditate for at least 10 minutes in the morning, my focus score increases by an average of 2.3 points (on a scale of 1-10). This effect is most noticeable on high-stress workdays.",
      author: "Emma Johnson",
      date: "May 12, 2025",
      upvotes: 24,
      downvotes: 3,
      shareData: true
    },
    {
      id: 2,
      title: "Cutting caffeine after 2pm doubled my deep sleep",
      content: "I ran a 14-day experiment where I alternated between having my last coffee at 2pm vs. 5pm. The results were shocking - my sleep tracker showed that my deep sleep duration increased by 103% on days when I stopped caffeine earlier. My subjective energy ratings the following day were also consistently higher.",
      author: "Michael Chen",
      date: "May 8, 2025",
      upvotes: 42,
      downvotes: 5,
      shareData: true
    }
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-[#9b5de5] to-[#3c1a5b] text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2 space-y-6 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold leading-tight">
                Tune Your Life with Precision
              </h1>
              <p className="text-xl sm:text-2xl opacity-90 max-w-xl mx-auto lg:mx-0">
                Track what matters, discover what works, and optimize your life with data-driven insights.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/signup">
                  <Button className="w-full sm:w-auto bg-white hover:bg-[#cdc1db] border border-[#4a2a6d] transition-colors duration-200" style={{ color: '#4a2a6d' }}>
                    Start Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="w-full sm:w-auto bg-transparent hover:bg-white/10 text-white border-white">
                    Log In
                  </Button>
                </Link>
              </div>
            </div>
            <div 
              className="lg:w-1/2 relative transition-all duration-700 transform"
              onMouseEnter={() => setHoveredSection1Image(true)}
              onMouseLeave={() => setHoveredSection1Image(false)}
              style={{
                transform: hoveredSection1Image ? 'perspective(1000px) rotateY(-5deg) rotateX(5deg)' : 'perspective(1000px) rotateY(0) rotateX(0)'
              }}
            >
              <div className="relative w-full max-w-lg mx-auto">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-30 animate-pulse"></div>
                <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
                  <Image
                    src="/images/home_section_1.webp"
                    alt="PIDMe Dashboard"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Features */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2 order-2 lg:order-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-primary-text">Track Your Life</h3>
                  <p className="text-secondary-text">Log your key inputs and outputs in less than a minute a day.</p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="w-12 h-12 bg-accent-2 rounded-lg flex items-center justify-center mb-4">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-primary-text">See What's Working</h3>
                  <p className="text-secondary-text">Instantly visualize the connections between your habits and your ambitions.</p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="w-12 h-12 bg-accent-1 rounded-lg flex items-center justify-center mb-4">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-primary-text">Master Your Routine</h3>
                  <p className="text-secondary-text">Use your data to adapt, improve, and build a lifestyle that's precisely tuned to your goals.</p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="w-12 h-12 bg-soft-accent rounded-lg flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-primary-text">Share Discoveries</h3>
                  <p className="text-secondary-text">Join a community of self-optimizers and learn from each other's insights.</p>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 space-y-6 text-center lg:text-left order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-primary-text">
                Your Personal Insight Dashboard
              </h2>
              <p className="text-xl text-secondary-text max-w-xl mx-auto lg:mx-0">
                PIDMe helps you discover the hidden connections between what you do and how you feel, so you can build a better you with proof.
              </p>
              <div className="pt-4">
                <Link href="/signup">
                  <Button className="bg-primary hover:bg-white hover:text-[#4a2a6d] border border-primary transition-colors duration-200 text-white">
                    Start Tracking
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Data Analysis */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#9b5de5] to-[#3c1a5b] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2 space-y-6 text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold">
                Discover What Really Works For You
              </h2>
              <p className="text-xl opacity-90 max-w-xl mx-auto lg:mx-0">
                Stop guessing what makes you feel better. PIDMe's correlation analysis reveals the true impact of your daily habits on your goals and wellbeing.
              </p>
              <div className="pt-4">
                <Link href="/signup">
                  <Button className="bg-white hover:bg-[#cdc1db] border border-[#4a2a6d] transition-colors duration-200" style={{ color: '#4a2a6d' }}>
                    Start Analyzing
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="lg:w-1/2 bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-heading text-xl text-primary-text">
                      Data Analysis
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium text-primary-text">Energy Level</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="text-sm font-medium text-primary-text">Morning Workout</span>
                      </div>
                    </div>
                    
                    <div className="h-64 bg-gray-50 rounded-lg p-4">
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BarChart3 className="w-8 h-8 text-purple-400" />
                          </div>
                          <p className="text-secondary-text">
                            Interactive chart visualization
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">
                            Strong Positive Correlation
                          </h4>
                          <p className="text-sm text-blue-700">
                            Your data shows that morning workouts are strongly associated with higher energy levels throughout the day.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Experimentation */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div 
              className="lg:w-1/2 relative transition-all duration-700 transform order-2 lg:order-1"
              onMouseEnter={() => setHoveredSection4Image(true)}
              onMouseLeave={() => setHoveredSection4Image(false)}
              style={{
                transform: hoveredSection4Image ? 'perspective(1000px) rotateY(-5deg) rotateX(5deg)' : 'perspective(1000px) rotateY(0) rotateX(0)'
              }}
            >
              <div className="relative w-full max-w-lg mx-auto">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-30 animate-pulse"></div>
                <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
                  <Image
                    src="/images/home_section_4.webp"
                    alt="PIDMe Experimentation"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 space-y-6 text-center lg:text-left order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-primary-text">
                Become the Engineer of Your Own Life.
              </h2>
              <p className="text-xl text-secondary-text max-w-xl mx-auto lg:mx-0">
                Have a theory? Put it to the test. The PIDMe Lab lets you run structured experiments on yourself. Form a hypothesis, like "If I cut out sugar for one week, my energy will improve," then track the results. Stop relying on generic advice and start building a lifestyle based on what is scientifically proven to work for you.
              </p>
              <div className="pt-4">
                <Link href="/signup">
                  <Button className="bg-primary hover:bg-white hover:text-[#4a2a6d] border border-primary transition-colors duration-200 text-white">
                    Start Experimenting
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Community */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#9b5de5] to-[#3c1a5b] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2 space-y-6 text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold">
                Learn Together, Improve Together.
              </h2>
              <p className="text-xl opacity-90 max-w-xl mx-auto lg:mx-0">
                Your daily habits create your life's results. MyPID.me is the first app designed to be your personal science lab, helping you discover the hidden connections between what you do and how you feel, so you can build a better you with proof.
              </p>
              <div className="pt-4">
                <Link href="/signup">
                  <Button className="bg-white hover:bg-[#cdc1db] border border-[#4a2a6d] transition-colors duration-200" style={{ color: '#4a2a6d' }}>
                    Join Community
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="lg:w-1/2 space-y-6">
              {/* Findings Cards */}
              {sampleFindings.map((finding, index) => {
                const score = finding.upvotes - finding.downvotes;
                const isHovered = hoveredCard === finding.id;
                
                return (
                  <div 
                    key={finding.id} 
                    className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl cursor-pointer border border-white/20 transition-all duration-500 hover:transform hover:-translate-y-3 hover:shadow-3xl hover:shadow-white/20 hover:z-10"
                    onMouseEnter={() => setHoveredCard(finding.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                    
                    {/* Animated border glow */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/20 via-blue-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                    
                    <div className="relative p-6 space-y-5">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-heading text-xl text-primary-text group-hover:text-purple-700 transition-colors duration-300 leading-tight mb-3">
                            {finding.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full transition-all duration-300 group-hover:bg-purple-50 group-hover:shadow-sm">
                              <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
                                <User className="w-3 h-3 text-white" />
                              </div>
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
                              score > 0 ? 'bg-green-100 text-green-700 border border-green-300' : 
                              score < 0 ? 'bg-red-100 text-red-700 border border-red-300' : 
                              'bg-gray-100 text-gray-700 border border-gray-300'
                            } group-hover:scale-105 transition-all duration-300`}>
                              Score: {score > 0 ? '+' : ''}{score}
                            </div>
                            {finding.shareData && (
                              <div className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-300 group-hover:scale-105 transition-all duration-300">
                                <BarChart3 className="w-3 h-3 inline-block mr-1" />
                                Data Shared
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="transform group-hover:translate-x-1 transition-all duration-300 ml-4">
                          <ArrowRight className="w-5 h-5 text-secondary-text group-hover:text-purple-600 transition-colors duration-300" />
                        </div>
                      </div>

                      {/* Content Preview */}
                      <div className="prose prose-sm max-w-none">
                        <p className="text-primary-text leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                          {finding.content.length > 150 
                            ? `${finding.content.substring(0, 150).trim()}...` 
                            : finding.content}
                        </p>
                      </div>

                      {/* Vote Summary */}
                      <div className="flex items-center space-x-4 pt-3 border-t border-gray-100 group-hover:border-purple-100 transition-colors duration-300">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1 text-sm text-secondary-text">
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-all duration-300">
                              <ChevronUp className="w-3 h-3 text-green-600" />
                            </div>
                            <span>{finding.upvotes}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-secondary-text">
                            <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-all duration-300">
                              <ChevronDown className="w-3 h-3 text-red-600" />
                            </div>
                            <span>{finding.downvotes}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Sparkle effect on hover */}
                      {isHovered && (
                        <div className="absolute top-3 right-3">
                          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-white text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-primary-text">
            Start Optimizing Today
          </h2>
          <p className="text-xl text-secondary-text">
            Join thousands of people who are using data to build better habits and achieve their goals.
          </p>
          <div className="pt-4">
            <Link href="/signup">
              <Button className="bg-primary hover:bg-white hover:text-[#4a2a6d] border border-primary transition-colors duration-200 text-white px-8 py-6 text-lg">
                Create Your Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-secondary-text">
              © 2025 PIDMe. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}