export interface SubscriptionProps {
  plans?: SubscriptionCardProps[];
}

export interface SubscriptionPlan {
  id: string;
  price: number;
  duration: string;
  description: string;
  benefits: string;
  durationMonths?: number;
}

export interface SubscriptionCardProps {
  id: string;
  price: number;
  duration: string;
  durationMonths: number;
  description: string;
  benefits: string;
  userBalance: number;
  hasActiveSubscription: boolean;
}
