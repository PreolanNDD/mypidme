'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/error/LoadingState';
import { PageErrorBoundary } from '@/components/error/PageErrorBoundary';
import { Settings, User, Mail } from 'lucide-react';

function SettingsContent() {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [firstName, setFirstName] = useState(userProfile?.first_name || '');
  const [lastName, setLastName] = useState(userProfile?.last_name || '');
  const [message, setMessage] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setUpdating(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          first_name: firstName,
          last_name: lastName 
        })
        .eq('id', user.id);

      if (error) {
        setMessage('Error updating profile');
        return;
      }

      await refreshUserProfile();
      setMessage('Profile updated successfully');
    } catch (error) {
      setMessage('Error updating profile');
    } finally {
      setUpdating(false);
    }
  };

  const hasChanges = firstName !== userProfile?.first_name || lastName !== userProfile?.last_name;

  if (!user || !userProfile) {
    return <LoadingState fullScreen message="Loading your settings..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#9b5de5] to-[#3c1a5b]">
      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-screen-sm mx-auto space-y-8">
          {/* Main Page Header */}
          <div className="mb-8">
            <h1 className="font-heading text-3xl text-white mb-2">Settings</h1>
            <p style={{ color: '#e6e2eb' }}>
              Manage your account and preferences
            </p>
          </div>

          {/* Profile Section */}
          <Card className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-primary" />
                <h2 className="font-heading text-xl text-primary-text">
                  Profile Information
                </h2>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {message && (
                  <div className={`p-3 rounded-lg ${
                    message.includes('successfully') 
                      ? 'bg-green-50 border border-green-200 text-green-600' 
                      : 'bg-red-50 border border-red-200 text-red-600'
                  }`}>
                    <p className="text-sm">{message}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                  />

                  <Input
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>

                <Button
                  type="submit"
                  loading={updating}
                  disabled={!firstName || !lastName || !hasChanges}
                  className="w-full bg-primary hover:bg-white hover:text-[#4a2a6d] border border-primary transition-colors duration-200 text-white"
                >
                  Update Profile
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary" />
                <h2 className="font-heading text-xl text-primary-text">
                  Account Information
                </h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-1">
                    Email Address
                  </label>
                  <p className="text-secondary-text bg-gray-50 px-3 py-2 rounded-lg">
                    {user?.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-1">
                    Member Since
                  </label>
                  <p className="text-secondary-text bg-gray-50 px-3 py-2 rounded-lg">
                    {userProfile?.created_at 
                      ? new Date(userProfile.created_at).toLocaleDateString()
                      : 'Unknown'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <PageErrorBoundary pageName="Settings">
      <SettingsContent />
    </PageErrorBoundary>
  );
}