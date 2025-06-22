'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Image from 'next/image';

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setSuccess('');

  try {
    const supabase = createClient();
    
    console.log('🔐 [SignUp] Attempting sign up for:', formData.email);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
        },
      },
    });

    if (signUpError) {
      console.error('❌ [SignUp] Sign up error:', signUpError);
      setError(signUpError.message);
      return; 
    }
    
    console.log('📊 [SignUp] Sign up response:', {
      hasUser: !!data.user,
      hasSession: !!data.session,
      identitiesCount: data.user?.identities?.length || 0
    });

    // Case 1: User already exists.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      console.log('⚠️ [SignUp] User already exists');
      setError('This email is already registered. Please log in instead.');
      return;
    }

    // Case 2: Successful sign-up with immediate login (email confirmation is OFF)
    if (data.user && data.session) {
      console.log('✅ [SignUp] Sign up successful with immediate login');
      // Force a page refresh to ensure the auth state is properly updated
      window.location.href = '/dashboard';
      return;
    }
    
    // Case 3: Successful sign-up, but email confirmation is required
    if (data.user) {
      console.log('📧 [SignUp] Sign up successful, email confirmation required');
      setSuccess('Account created! Please check your email to confirm your account.');
    }

  } catch (err: any) {
    console.error('💥 [SignUp] Unexpected error:', err);
    setError('An unexpected error occurred. Please try again.');
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
          Create Your Account
        </h1>
        <p className="text-secondary-text text-sm">
          Start optimizing your life with precision
        </p>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="First name"
              required
              className="bg-white/80 border-gray-200 focus:border-primary focus:ring-primary/20"
            />

            <Input
              label="Last Name"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Last name"
              required
              className="bg-white/80 border-gray-200 focus:border-primary focus:ring-primary/20"
            />
          </div>

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
            placeholder="Choose a secure password (min 6 characters)"
            required
            minLength={6}
            className="bg-white/80 border-gray-200 focus:border-primary focus:ring-primary/20"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          loading={loading}
          disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.password}
        >
          Create Account
        </Button>
      </form>

      {/* Footer Links */}
      <div className="mt-8 text-center">
        <p className="text-sm text-secondary-text">
          Already have an account?{' '}
          <Link 
            href="/login" 
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Log in
          </Link>
        </p>
      </div>
    </>
  );
}