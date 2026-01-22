import { UpdateProfileRequest, UserProfileResponse } from '@/components/EditProfile/types';

export const updateUserProfile = async (userId: string, data: UpdateProfileRequest) => {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Ошибка обновления профиля');
  }

  return response.json();
};

export const getUserProfile = async (userId: string): Promise<UserProfileResponse> => {
  const response = await fetch(`/api/users/${userId}`);

  if (!response.ok) {
    throw new Error('Ошибка загрузки профиля');
  }

  return response.json();
};
