'use client';

import Login from '@/components/Login';
import ProfileAuthor from '@/components/ProfileAuthor';
import ProfileReader from '@/components/ProfileReader';
import { RouterLoader } from '@/components/UI';
import { useSession } from 'next-auth/react';

const ProfilePage = () => {
  const { status, data } = useSession();

  if (status === 'loading') {
    return <RouterLoader />;
  }

  if (!data) {
    return <Login />;
  }

  return data.user.role === 'AUTHOR' ? <ProfileAuthor /> : <ProfileReader />;
};

export default ProfilePage;
