'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import Image from 'next/image';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSent(true);
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <>
        {/* Success Header with Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/logo.svg"
              alt="PIDMe Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </div>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-accent-2 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="font-heading text-2xl text-primary-text mb-2">
            Check Your Email
          </h1>
          <p className="text-secondary-text text-sm">
            We've sent password reset instructions to{' '}
            <span className="font-medium text-primary-text">{email}</span>
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg">
            <Link href="/login">
              Back to Log In
            </Link>
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => setSent(false)}
            className="w-full text-primary hover:text-primary/80"
          >
            Try a different email
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header with Logo */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Image
            src="/images/logo.svg"
            alt="PIDMe Logo"
            width={120}
            height={40}
            className="h-10 w-auto"
          />
        </div>
        <h1 className="font-heading text-2xl text-primary-text mb-2">
          Reset Your Password
        </h1>
        <p className="text-secondary-text text-sm">
          Enter your email address and we'll send you instructions to reset your password
        </p>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Input
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          required
          className="bg-white/80 border-gray-200 focus:border-primary focus:ring-primary/20"
        />

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          disabled={!email || loading}
          loading={loading}
        >
          <Mail className="w-4 h-4 mr-2" />
          Send Reset Instructions
        </Button>
      </form>

      {/* Footer Link */}
      <div className="mt-8 text-center">
        <Link 
          href="/login" 
          className="text-sm text-primary hover:text-primary/80 transition-colors font-medium inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Log In
        </Link>
      </div>
    </>
  );
}