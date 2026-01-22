import AuthorshipComponent from '@/components/Authorship';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { NextPage } from 'next';

const AuthorshipPage: NextPage = () => {
  return (
    <SubscriptionGuard>
      <AuthorshipComponent />
    </SubscriptionGuard>
  );
};

export default AuthorshipPage;
