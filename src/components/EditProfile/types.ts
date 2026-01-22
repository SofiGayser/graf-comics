export type BackendData = {
  username: string;
  about: string;
  gender: string;
  birthDate: string;
  residenceName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  newPasswordRepeat: string;
};
export type LocalStorageData = {
  hideSubscribes: boolean;
  privateProfile: boolean;
  hideMatureContent: boolean;
  darkMode: boolean;
  hideNotificationsSubscribes: boolean;
  hideNotificationsComments: boolean;
  hideNotificationsPaidContent: boolean;
  hideNotificationsLikes: boolean;
  hideNotificationsGifts: boolean;
  hideNotificationsNewPosts: boolean;
  showNotificationsListsReading: boolean;
  showNotificationsListsRead: boolean;
  showNotificationsListsPlanned: boolean;
  showNotificationsListsLiked: boolean;
  showNotificationsListsDropped: boolean;
  emailNotificationsUpdates: boolean;
  emailNotificationsSurveys: boolean;
  emailNotificationsReports: boolean;
};

export type EditProfileFormSchema = BackendData & LocalStorageData;

// Добавляем новые типы, не изменяя существующие
export type GenderType = 'male' | 'female' | 'not_stated';

export type UserProfileResponse = {
  id: string;
  name: string;
  email: string;
  about: string;
  gender: string;
  birthDate: string | null;
  residenceName: string | null;
  avatar: string | null;
  showMatureContent: boolean;
  closedProfile: boolean;
  closedSubscribers: boolean;
  showNotificationsSubscribes: boolean;
  showNotificationsComments: boolean;
  showNotificationsPaidContent: boolean;
  showNotificationsLikes: boolean;
  showNotificationsGifts: boolean;
  showNotificationsNewPosts: boolean;
  showNotificationsListsReading: boolean;
  showNotificationsListsRead: boolean;
  showNotificationsListsPlanned: boolean;
  showNotificationsListsLiked: boolean;
  showNotificationsListsDropped: boolean;
  emailNotificationsUpdates: boolean;
  emailNotificationsSurveys: boolean;
  emailNotificationsReports: boolean;
};

export type UpdateProfileRequest = {
  name?: string;
  email?: string;
  about?: string;
  gender?: string;
  birthDate?: string | null;
  residenceName?: string | null;
  password?: string;
  currentPassword?: string;
  showMatureContent?: boolean;
  closedProfile?: boolean;
  closedSubscribers?: boolean;
  showNotificationsSubscribes?: boolean;
  showNotificationsComments?: boolean;
  showNotificationsPaidContent?: boolean;
  showNotificationsLikes?: boolean;
  showNotificationsGifts?: boolean;
  showNotificationsNewPosts?: boolean;
  showNotificationsListsReading?: boolean;
  showNotificationsListsRead?: boolean;
  showNotificationsListsPlanned?: boolean;
  showNotificationsListsLiked?: boolean;
  showNotificationsListsDropped?: boolean;
  emailNotificationsUpdates?: boolean;
  emailNotificationsSurveys?: boolean;
  emailNotificationsReports?: boolean;
};
