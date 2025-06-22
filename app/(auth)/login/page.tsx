'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Settings2 } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      
      console.log('🔐 [Login] Attempting sign in for:', formData.email);
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        console.error('❌ [Login] Sign in error:', signInError);
        setError(signInError.message);
        return;
      }

      console.log('✅ [Login] Sign in successful:', {
        userId: data.user?.id,
        email: data.user?.email,
        hasSession: !!data.session
      });

      // Don't force redirect here - let the AuthProvider handle it
      // The auth state change will trigger the redirect automatically
      console.log('🔄 [Login] Authentication successful, waiting for redirect...');
      
    } catch (err) {
      console.error('💥 [Login] Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Left Side - Login Form with Background (5/13 of screen) */}
      <div 
        className="w-5/13 h-full relative flex items-center justify-center"
        style={{
          backgroundImage: 'url(/images/login_form_background.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Login Form Container - Positioned below center for logo */}
        <div className="relative z-10 w-full max-w-sm px-8 mt-16">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                  <Settings2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <h1 className="font-heading text-2xl text-primary-text mb-2">
                Welcome Back
              </h1>
              <p className="text-secondary-text text-sm">
                Continue optimizing your life
              </p>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  required
                  className="bg-white/80 border-gray-200 focus:border-primary focus:ring-primary/20"
                />

                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                  className="bg-white/80 border-gray-200 focus:border-primary focus:ring-primary/20"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                loading={loading}
                disabled={!formData.email || !formData.password}
              >
                Log In
              </Button>
            </form>

            {/* Footer Links */}
            <div className="mt-8 space-y-4 text-center">
              <Link 
                href="/forgot-password" 
                className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Forgot your password?
              </Link>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-secondary-text">
                  Don't have an account?{' '}
                  <Link 
                    href="/signup" 
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Background Image (8/13 of screen) */}
      <div 
        className="w-8/13 h-full relative"
        style={{
          backgroundImage: 'url(/images/login_background.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Subtle gradient overlay for visual enhancement */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/5"></div>
      </div>
    </div>
  );
}