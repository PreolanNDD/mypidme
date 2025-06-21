'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function AuthDebug() {
  const { user, userProfile } = useAuth();
  const [debugResults, setDebugResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runDebugTests = async () => {
    setLoading(true);
    const results: any = {};

    try {
      // Create a fresh Supabase client
      const supabase = createClient();

      // Test 1: Check current session
      console.log('🔍 Testing current session...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      results.session = {
        hasSession: !!sessionData.session,
        hasUser: !!sessionData.session?.user,
        userId: sessionData.session?.user?.id,
        userEmail: sessionData.session?.user?.email,
        error: sessionError
      };
      console.log('Session result:', results.session);

      // Test 2: Check auth.uid() function
      console.log('🔍 Testing auth.uid()...');
      const { data: authUid, error: authError } = await supabase
        .rpc('debug_auth_uid');
      
      results.authUid = { data: authUid, error: authError };
      console.log('Auth UID result:', results.authUid);

      // Test 3: Try to fetch trackable items
      console.log('🔍 Testing trackable_items access...');
      const { data: trackableItems, error: trackableError } = await supabase
        .from('trackable_items')
        .select('*')
        .limit(5);
      
      results.trackableItems = { 
        data: trackableItems, 
        error: trackableError,
        count: trackableItems?.length || 0
      };
      console.log('Trackable items result:', results.trackableItems);

      // Test 4: Try to fetch logged entries
      console.log('🔍 Testing logged_entries access...');
      const { data: loggedEntries, error: entriesError } = await supabase
        .from('logged_entries')
        .select('*')
        .limit(5);
      
      results.loggedEntries = { 
        data: loggedEntries, 
        error: entriesError,
        count: loggedEntries?.length || 0
      };
      console.log('Logged entries result:', results.loggedEntries);

      // Test 5: Try to fetch experiments
      console.log('🔍 Testing experiments access...');
      const { data: experiments, error: experimentsError } = await supabase
        .from('experiments')
        .select('*')
        .limit(5);
      
      results.experiments = { 
        data: experiments, 
        error: experimentsError,
        count: experiments?.length || 0
      };
      console.log('Experiments result:', results.experiments);

      // Test 6: Try to fetch community findings
      console.log('🔍 Testing community_findings access...');
      const { data: findings, error: findingsError } = await supabase
        .from('community_findings')
        .select('*')
        .limit(5);
      
      results.communityFindings = { 
        data: findings, 
        error: findingsError,
        count: findings?.length || 0
      };
      console.log('Community findings result:', results.communityFindings);

      // Test 7: Try to create a test trackable item
      console.log('🔍 Testing trackable_items creation...');
      const { data: createResult, error: createError } = await supabase
        .from('trackable_items')
        .insert({
          name: 'Debug Test Item',
          category: 'INPUT',
          type: 'SCALE_1_10',
          is_active: true
        })
        .select()
        .single();
      
      results.createTest = { 
        data: createResult, 
        error: createError,
        success: !createError
      };
      console.log('Create test result:', results.createTest);

      // Clean up test item if created successfully
      if (createResult?.id) {
        await supabase
          .from('trackable_items')
          .delete()
          .eq('id', createResult.id);
      }

    } catch (error) {
      console.error('Debug test error:', error);
      results.error = error;
    }

    setDebugResults(results);
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <h2 className="text-xl font-bold">Authentication Debug Panel</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Current User Info:</h3>
          <div className="text-sm space-y-1">
            <p><strong>User ID:</strong> {user?.id || 'None'}</p>
            <p><strong>Email:</strong> {user?.email || 'None'}</p>
            <p><strong>Profile:</strong> {userProfile ? 'Loaded' : 'Not loaded'}</p>
            <p><strong>First Name:</strong> {userProfile?.first_name || 'None'}</p>
            <p><strong>Last Name:</strong> {userProfile?.last_name || 'None'}</p>
          </div>
        </div>

        {/* Debug Button */}
        <Button 
          onClick={runDebugTests} 
          loading={loading}
          className="w-full"
        >
          Run Database Access Tests
        </Button>

        {/* Debug Results */}
        {Object.keys(debugResults).length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Debug Results:</h3>
            
            {Object.entries(debugResults).map(([key, value]: [string, any]) => (
              <div key={key} className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium capitalize mb-2">{key.replace(/([A-Z])/g, ' $1')}</h4>
                <pre className="text-xs overflow-auto bg-white p-2 rounded border">
                  {JSON.stringify(value, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}