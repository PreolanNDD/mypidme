import { notFound } from 'next/navigation';
import { UserProfileClient } from './user-profile-client';
import { getUserProfile, getUserFindings } from '@/lib/community';

// Force this page to always fetch fresh data
export const revalidate = 0;
export const dynamic = 'force-dynamic';

interface UserProfilePageProps {
  params: {
    userId: string;
  };
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { userId } = params;

  console.log(`🎯 [UserProfilePage] === PAGE COMPONENT STARTED ===`);
  console.log(`🎯 [UserProfilePage] Input params:`, { userId });
  console.log(`🎯 [UserProfilePage] Timestamp:`, new Date().toISOString());

  // Check if userId is empty or invalid
  if (!userId || userId.trim() === '') {
    console.log(`❌ [UserProfilePage] Empty or invalid userId, showing not found`);
    notFound();
  }

  const trimmedUserId = userId.trim();
  console.log(`🎯 [UserProfilePage] Processing userId:`, trimmedUserId);

  try {
    console.log(`📊 [UserProfilePage] Step 1: Starting parallel data fetch...`);
    console.log(`📊 [UserProfilePage] Fetching user profile and findings for:`, trimmedUserId);

    // Fetch the user profile and their findings in parallel
    const [userProfile, userFindings] = await Promise.all([
      getUserProfile(trimmedUserId),
      getUserFindings(trimmedUserId)
    ]);

    console.log(`📊 [UserProfilePage] Step 2: Parallel fetch completed`);
    console.log(`📊 [UserProfilePage] Results:`, {
      userProfileExists: !!userProfile,
      userProfileData: userProfile ? {
        id: userProfile.id,
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        created_at: userProfile.created_at
      } : null,
      userFindingsCount: userFindings.length,
      userFindingsIds: userFindings.map(f => f.id),
      userFindingsTitles: userFindings.map(f => f.title)
    });

    // If user doesn't exist, show 404
    if (!userProfile) {
      console.log(`❌ [UserProfilePage] User profile not found for ID: ${trimmedUserId}`);
      console.log(`❌ [UserProfilePage] This means the user does not exist in the system`);
      notFound();
    }

    console.log(`✅ [UserProfilePage] Step 3: User profile found, proceeding to render`);
    console.log(`✅ [UserProfilePage] Profile summary:`, {
      userId: userProfile.id,
      displayName: `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Anonymous',
      findingsCount: userFindings.length,
      joinDate: userProfile.created_at
    });

    console.log(`🎉 [UserProfilePage] === RENDERING CLIENT COMPONENT ===`);

    // Render the Client Component with the fetched data
    return (
      <UserProfileClient 
        userProfile={userProfile} 
        userFindings={userFindings} 
      />
    );
    
  } catch (error) {
    console.error(`💥 [UserProfilePage] === CRITICAL ERROR OCCURRED ===`);
    console.error(`💥 [UserProfilePage] Error details:`, {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : 'No stack trace',
      userId: trimmedUserId,
      timestamp: new Date().toISOString()
    });
    
    // Log the specific error type to help with debugging
    if (error instanceof Error) {
      console.error(`💥 [UserProfilePage] Error type:`, error.constructor.name);
      if (error.message.includes('NEXT_NOT_FOUND')) {
        console.error(`💥 [UserProfilePage] This is a Next.js notFound() error - likely from getUserProfile or getUserFindings`);
      }
    }
    
    notFound();
  }
}