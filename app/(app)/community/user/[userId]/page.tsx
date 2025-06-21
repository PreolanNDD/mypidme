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

  // Check if userId is empty or invalid
  if (!userId || userId.trim() === '') {
    notFound();
  }

  const trimmedUserId = userId.trim();

  try {
    // Fetch the user profile and their findings in parallel
    const [userProfile, userFindings] = await Promise.all([
      getUserProfile(trimmedUserId),
      getUserFindings(trimmedUserId)
    ]);

    // If user doesn't exist, show 404
    if (!userProfile) {
      notFound();
    }

    // Render the Client Component with the fetched data
    return (
      <UserProfileClient 
        userProfile={userProfile} 
        userFindings={userFindings} 
      />
    );
    
  } catch (error) {
    notFound();
  }
}