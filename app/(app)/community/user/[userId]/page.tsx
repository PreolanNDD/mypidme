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

  console.log(`🎯 UserProfilePage called with userId: ${userId}`);

  // Check if userId is empty or invalid
  if (!userId || userId.trim() === '') {
    console.log(`🔄 Empty or invalid userId, redirecting to /community`);
    notFound();
  }

  try {
    // Fetch the user profile and their findings
    const [userProfile, userFindings] = await Promise.all([
      getUserProfile(userId),
      getUserFindings(userId)
    ]);

    // If user doesn't exist, show 404
    if (!userProfile) {
      console.log(`❌ User not found for ID: ${userId}`);
      notFound();
    }

    console.log(`✅ User profile found for ID: ${userId}, findings: ${userFindings.length}`);

    // Render the Client Component with the fetched data
    return (
      <UserProfileClient 
        userProfile={userProfile} 
        userFindings={userFindings} 
      />
    );
  } catch (error) {
    console.error(`❌ Error fetching user profile for ID: ${userId}`, error);
    notFound();
  }
}