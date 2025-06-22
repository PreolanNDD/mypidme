'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckCircle, Lock } from 'lucide-react';
import Image from 'next/image';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess(true);
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      if (!success) {
        setLoading(false);
      }
    }
  };

  if (success) {
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
            Password Updated Successfully
          </h1>
          <p className="text-secondary-text text-sm">
            Your password has been updated. You will be redirected to your dashboard shortly.
          </p>
        </div>

        {/* Loading Indicator */}
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
          Update Your Password
        </h1>
        <p className="text-secondary-text text-sm">
          Enter your new password below
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
            label="New Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your new password"
            required
            className="bg-white/80 border-gray-200 focus:border-primary focus:ring-primary/20"
          />

          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
            required
            className="bg-white/80 border-gray-200 focus:border-primary focus:ring-primary/20"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          loading={loading}
          disabled={!password || !confirmPassword}
        >
          <Lock className="w-4 h-4 mr-2" />
          Update Password
        </Button>
      </form>
    </>
  );
}