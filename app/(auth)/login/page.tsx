'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Image from 'next/image';

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
    <>
      {/* Header with Logo */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Image
            src="/images/logo.svg"
            alt="PIDMe Logo"
            width={0}
            height={0}
            className="w-auto h-auto rounded-xl"
          />
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
    </>
  );
}