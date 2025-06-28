import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, BarChart3, FlaskConical, Target, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#9b5de5] to-[#3c1a5b] py-20 px-6 sm:px-12 md:px-24 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl text-white leading-tight">
                Tune Your Life with <span className="text-accent-1">Precision</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/80 max-w-xl">
                PIDMe helps you optimize your daily habits and routines using the same control theory principles that power rockets and robots.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
                <Link href="/signup">
                  <Button className="w-full sm:w-auto bg-white hover:bg-accent-1 text-primary hover:text-white border border-white transition-colors duration-300 text-lg px-8 py-3">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10 transition-colors duration-300 text-lg px-8 py-3">
                    Log In
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative group">
              <div className="relative z-10 transform transition-transform duration-500 group-hover:scale-105 group-hover:rotate-2">
                <Image
                  src="/images/home_section_1.webp"
                  alt="PID Controller Dashboard"
                  width={600}
                  height={400}
                  className="rounded-xl shadow-2xl"
                  priority
                />
              </div>
              <div className="absolute inset-0 bg-accent-1 rounded-xl blur-2xl opacity-30 -z-10 transition-all duration-500 group-hover:opacity-50 group-hover:blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 sm:px-12 md:px-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl text-primary-text mb-4">How PIDMe Works</h2>
            <p className="text-lg text-secondary-text max-w-2xl mx-auto">
              Our platform applies control theory to your personal development, helping you make data-driven decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-background rounded-xl p-6 shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-heading text-xl text-primary-text mb-3">Track Inputs</h3>
              <p className="text-secondary-text">
                Log your daily habits, activities, and behaviors that you want to optimize.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-background rounded-xl p-6 shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-14 h-14 bg-accent-1/10 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="h-7 w-7 text-accent-1" />
              </div>
              <h3 className="font-heading text-xl text-primary-text mb-3">Monitor Outputs</h3>
              <p className="text-secondary-text">
                Record the outcomes and results you care about improving in your life.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-background rounded-xl p-6 shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-14 h-14 bg-accent-2/10 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="h-7 w-7 text-accent-2" />
              </div>
              <h3 className="font-heading text-xl text-primary-text mb-3">Analyze Patterns</h3>
              <p className="text-secondary-text">
                Discover correlations between your actions and results with powerful analytics.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-background rounded-xl p-6 shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <FlaskConical className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-heading text-xl text-primary-text mb-3">Run Experiments</h3>
              <p className="text-secondary-text">
                Test hypotheses about what works for you with structured experiments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 sm:px-12 md:px-24 bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl text-primary-text mb-4">The Science Behind PIDMe</h2>
            <p className="text-lg text-secondary-text max-w-2xl mx-auto">
              PID controllers are used in everything from rockets to robots. Now, apply the same principles to your life.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <Image
                src="/images/home_section_4.webp"
                alt="PID Controller Diagram"
                width={600}
                height={400}
                className="rounded-xl shadow-xl"
              />
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <h3 className="font-heading text-2xl text-primary-text mb-3">Proportional</h3>
                <p className="text-secondary-text">
                  Respond to the current gap between where you are and where you want to be.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <h3 className="font-heading text-2xl text-primary-text mb-3">Integral</h3>
                <p className="text-secondary-text">
                  Account for your history and accumulated progress over time.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <h3 className="font-heading text-2xl text-primary-text mb-3">Derivative</h3>
                <p className="text-secondary-text">
                  Anticipate future trends based on your rate of change.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 sm:px-12 md:px-24 bg-gradient-to-r from-[#9b5de5] to-[#3c1a5b] text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="font-heading text-4xl text-white">Ready to Optimize Your Life?</h2>
          <p className="text-lg text-white/80">
            Join thousands of others who are using data-driven methods to improve their health, productivity, and well-being.
          </p>
          <div className="pt-4">
            <Link href="/signup">
              <Button className="bg-white hover:bg-accent-1 text-primary hover:text-white border border-white transition-colors duration-300 text-lg px-8 py-3">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 px-6 sm:px-12 md:px-24 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="font-heading text-2xl text-primary-text mb-4">PIDMe</h3>
              <p className="text-secondary-text mb-6 max-w-md">
                The personal optimization platform inspired by control theory.
              </p>
              <p className="text-sm text-secondary-text">
                &copy; {new Date().getFullYear()} PIDMe. All rights reserved.
              </p>
            </div>
            <div>
              <h4 className="font-heading text-lg text-primary-text mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-secondary-text hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="#" className="text-secondary-text hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="#" className="text-secondary-text hover:text-primary transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-lg text-primary-text mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-secondary-text hover:text-primary transition-colors">About</Link></li>
                <li><Link href="#" className="text-secondary-text hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="#" className="text-secondary-text hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}