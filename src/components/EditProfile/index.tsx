'use client';

import { getUserProfile, updateUserProfile } from '@/services/userApi';
import cn from 'classnames';
import { useSession } from 'next-auth/react';
import { FC, useEffect, useState } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Tabs } from '../UI';
import ProfileSettings from './components/ProfileSettings';
import SecuritySettings from './components/SecuritySettings';
import SiteSettings from './components/SiteSettings';
import styles from './index.module.scss';
import { BackendData, EditProfileFormSchema, LocalStorageData, UserProfileResponse } from './types';

const EditProfile: FC = () => {
  const { data: session, update: updateSession } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  const mapBackendToFormData = (backendData: UserProfileResponse): BackendData => {
    return {
      username: backendData.name || '',
      about: backendData.about || '',
      gender: (backendData.gender?.toLowerCase() as 'male' | 'female' | 'not_stated') || 'not_stated',
      birthDate: backendData.birthDate ? new Date(backendData.birthDate).toLocaleDateString('ru-RU') : '',
      residenceName: backendData.residenceName || '',
      email: backendData.email || '',
      currentPassword: '',
      newPassword: '',
      newPasswordRepeat: '',
    };
  };

  const mapBackendToLocalStorageData = (backendData: UserProfileResponse): LocalStorageData => {
    return {
      hideSubscribes: backendData.closedSubscribers,
      privateProfile: backendData.closedProfile,
      hideMatureContent: !backendData.showMatureContent,
      darkMode: JSON.parse(localStorage.getItem('darkMode') || 'false'),
      hideNotificationsSubscribes: !backendData.showNotificationsSubscribes,
      hideNotificationsComments: !backendData.showNotificationsComments,
      hideNotificationsPaidContent: !backendData.showNotificationsPaidContent,
      hideNotificationsLikes: !backendData.showNotificationsLikes,
      hideNotificationsGifts: !backendData.showNotificationsGifts,
      hideNotificationsNewPosts: !backendData.showNotificationsNewPosts,
      showNotificationsListsReading: backendData.showNotificationsListsReading,
      showNotificationsListsRead: backendData.showNotificationsListsRead,
      showNotificationsListsPlanned: backendData.showNotificationsListsPlanned,
      showNotificationsListsLiked: backendData.showNotificationsListsLiked,
      showNotificationsListsDropped: backendData.showNotificationsListsDropped,
      emailNotificationsUpdates: backendData.emailNotificationsUpdates,
      emailNotificationsSurveys: backendData.emailNotificationsSurveys,
      emailNotificationsReports: backendData.emailNotificationsReports,
    };
  };

  const getDefaultValues = async (): Promise<EditProfileFormSchema> => {
    try {
      const backendData = await getUserProfile(session.user.id);
      const backendValues = mapBackendToFormData(backendData);
      const localStorageValues = mapBackendToLocalStorageData(backendData);
      return { ...backendValues, ...localStorageValues };
    } catch (error) {
      console.error('Error loading default values:', error);
      toast.error('Ошибка загрузки данных профиля');

      return {
        username: '',
        about: '',
        gender: 'not_stated',
        birthDate: '',
        residenceName: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        newPasswordRepeat: '',
        hideSubscribes: false,
        privateProfile: false,
        hideMatureContent: false,
        darkMode: false,
        hideNotificationsSubscribes: false,
        hideNotificationsComments: false,
        hideNotificationsPaidContent: false,
        hideNotificationsLikes: false,
        hideNotificationsGifts: false,
        hideNotificationsNewPosts: false,
        showNotificationsListsReading: false,
        showNotificationsListsRead: false,
        showNotificationsListsPlanned: false,
        showNotificationsListsLiked: false,
        showNotificationsListsDropped: false,
        emailNotificationsUpdates: false,
        emailNotificationsSurveys: false,
        emailNotificationsReports: false,
      };
    }
  };

  const methods = useForm<EditProfileFormSchema>({
    mode: 'onChange',
  });
  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    const loadDefaultValues = async () => {
      if (session?.user?.id) {
        try {
          setIsLoading(true);
          const defaultValues = await getDefaultValues();
          reset(defaultValues);
        } catch (error) {
          toast.error('Ошибка загрузки данных профиля');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadDefaultValues();
  }, [session, reset]);

  const onSubmit: SubmitHandler<EditProfileFormSchema> = async (data) => {
    try {
      const updateData: any = {
        name: data.username,
        about: data.about,
        gender: data.gender.toUpperCase(),
        residenceName: data.residenceName,
        email: data.email,
        showMatureContent: !data.hideMatureContent,
        closedProfile: data.privateProfile,
        closedSubscribers: data.hideSubscribes,
        showNotificationsSubscribes: !data.hideNotificationsSubscribes,
        showNotificationsComments: !data.hideNotificationsComments,
        showNotificationsPaidContent: !data.hideNotificationsPaidContent,
        showNotificationsLikes: !data.hideNotificationsLikes,
        showNotificationsGifts: !data.hideNotificationsGifts,
        showNotificationsNewPosts: !data.hideNotificationsNewPosts,
        showNotificationsListsReading: data.showNotificationsListsReading,
        showNotificationsListsRead: data.showNotificationsListsRead,
        showNotificationsListsPlanned: data.showNotificationsListsPlanned,
        showNotificationsListsLiked: data.showNotificationsListsLiked,
        showNotificationsListsDropped: data.showNotificationsListsDropped,
        emailNotificationsUpdates: data.emailNotificationsUpdates,
        emailNotificationsSurveys: data.emailNotificationsSurveys,
        emailNotificationsReports: data.emailNotificationsReports,
      };

      if (data.birthDate) {
        const [day, month, year] = data.birthDate.split('.');
        if (day && month && year) {
          updateData.birthDate = new Date(`${year}-${month}-${day}`).toISOString();
        }
      }

      if (data.newPassword) {
        updateData.password = data.newPassword;
        updateData.currentPassword = data.currentPassword;
      }

      // Отправка на бэкенд
      await updateUserProfile(session.user.id, updateData);

      // Обновление сессии
      await updateSession({
        ...session,
        user: {
          ...session.user,
          name: data.username,
          email: data.email,
        },
      });

      // Сохранение в localStorage
      const localStorageKeys: (keyof LocalStorageData)[] = [
        'hideSubscribes',
        'privateProfile',
        'hideMatureContent',
        'darkMode',
        'hideNotificationsSubscribes',
        'hideNotificationsComments',
        'hideNotificationsPaidContent',
        'hideNotificationsLikes',
        'hideNotificationsGifts',
        'hideNotificationsNewPosts',
        'showNotificationsListsReading',
        'showNotificationsListsRead',
        'showNotificationsListsPlanned',
        'showNotificationsListsLiked',
        'showNotificationsListsDropped',
        'emailNotificationsUpdates',
        'emailNotificationsSurveys',
        'emailNotificationsReports',
      ];

      localStorageKeys.forEach((key) => {
        localStorage.setItem(key, JSON.stringify(data[key]));
      });

      await updateUserProfile(session.user.id, updateData);

      await updateSession({
        ...session,
        user: {
          ...session.user,
          name: data.username,
          email: data.email,
        },
      });

      toast.success('Данные успешно сохранены');

      setTimeout(() => {
        window.location.href = '/profile';
      }, 500);
    } catch (error: any) {
      toast.error(error.message || 'Ошибка сохранения данных');
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <section className={cn(styles['tabs'], styles['container'], 'container')}>
      <FormProvider {...methods}>
        <form className={styles['profile-settings-form']} onSubmit={handleSubmit(onSubmit)}>
          <Tabs mixClass={[styles['tabs__items']]} tabs={['Профиль', 'Безопасность', 'Настройки сайта']}>
            <ProfileSettings />
            <SecuritySettings />
            <SiteSettings />
          </Tabs>
        </form>
      </FormProvider>
    </section>
  );
};

export default EditProfile;
