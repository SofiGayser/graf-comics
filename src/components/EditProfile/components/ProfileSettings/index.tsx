import cn from 'classnames';
import { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import styles from '../../index.module.scss';
import { ProfileSettingsFormSchema } from './types';

const ProfileSettings: FC = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<ProfileSettingsFormSchema>();

  return (
    <>
      <fieldset className={styles['profile-header']}>
        <legend className="visuallyhidden">Аватар профиля</legend>
        <div className={styles['profile__wallpaper']}>
          <div className={styles['profile__avatar-container']}>
            <img src="../profile-skeleton.svg" alt="avatar" className={styles['profile__img']} />
            <p className={styles['profile__change']}>Изменить</p>
          </div>
        </div>
      </fieldset>
      <div className={cn('container', styles['settings-container'])}>
        <fieldset className={styles['fieldset-container']}>
          <legend className="visuallyhidden">Настройки профиля</legend>
          <label
            htmlFor="username"
            className={cn(styles['profile-settings-form__username'], styles['profile-settings-form__label'])}
          >
            Никнейм
            <input
              {...register('username', {
                minLength: {
                  value: 7,
                  message: 'Минимальная длина 7 символов',
                },
              })}
              className={cn(styles['username__input'], styles['label__input'], {
                [styles['label__input--error']]: errors?.username,
              })}
              type="text"
              id="username"
              placeholder="Введите никнейм"
            />
            {Boolean(errors?.username) && (
              <p className={styles['profile-settings-form__error-text']}>{errors?.username?.message}</p>
            )}
          </label>
          <label htmlFor="userAbout" className={styles['profile-settings-form__label']}>
            О себе
            <textarea
              {...register('about')}
              className={styles['label__textarea']}
              id="userAbout"
              name="about"
              placeholder="Предумайте описание"
            />
          </label>

          <p className={styles['profile-settings-form__text-label']}> Пол</p>
          <div className={styles['profile-settings-form__radio-btn-container']}>
            <label htmlFor="female" className={styles['radio-btn__label']}>
              <input
                {...register('gender')}
                className={styles['radio-btn__input']}
                type="radio"
                id="female"
                name="gender"
                value="female"
              />
              <span className={styles['radio-btn__circle']}></span>
              Женский
            </label>
            <label htmlFor="male" className={styles['radio-btn__label']}>
              <input
                {...register('gender')}
                className={styles['radio-btn__input']}
                type="radio"
                id="male"
                name="gender"
                value="male"
              />
              <span className={styles['radio-btn__circle']}></span>
              Мужской
            </label>
            <label htmlFor="notStated" className={styles['radio-btn__label']}>
              <input
                {...register('gender')}
                className={styles['radio-btn__input']}
                type="radio"
                id="notStated"
                value="not_stated"
              />
              <span className={styles['radio-btn__circle']}></span>
              Не указан
            </label>
          </div>
          <label htmlFor="birthDate" className={cn(styles['profile-settings-form__label'], styles['birth-date'])}>
            Дата рождения
            <input
              {...register('birthDate', {
                pattern: {
                  value: /^([0-2][0-9]|3[01])\.(0[1-9]|1[0-2])\.\d{2}$/,
                  message: 'Введите правильную дату рождения',
                },
              })}
              className={cn(styles['birth-date__input'], styles['label__input'], {
                [styles['label__input--error']]: errors?.birthDate,
              })}
              type="text"
              id="birthDate"
              placeholder="ДД.ММ.ГГ"
              autoComplete="off"
            />
            {Boolean(errors?.birthDate) && (
              <p className={styles['profile-settings-form__error-text']}>{errors?.birthDate?.message}</p>
            )}
          </label>
          <label htmlFor="residenceName" className={styles['profile-settings-form__label']}>
            Ваш город
            <input
              {...register('residenceName', {})}
              className={cn(styles['label__input'], {
                [styles['label__input--error']]: errors?.residenceName,
              })}
              type="text"
              id="residenceName"
              placeholder="Введите название города"
              autoComplete="off"
            />
          </label>
          <label htmlFor="email" className={styles['profile-settings-form__label']}>
            E-mail
            <input
              {...register('email', {
                pattern: {
                  value: /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/,
                  message: 'Введите правильный email',
                },
              })}
              className={cn(styles['label__input'], {
                [styles['label__input--error']]: errors?.email,
              })}
              type="email"
              id="email"
              placeholder="Введите e-mail"
            />
            {Boolean(errors?.email) && (
              <p className={styles['profile-settings-form__error-text']}>{errors?.email?.message}</p>
            )}
          </label>

          <p className={styles['profile-settings-form__text-label']}> Скрыть подписки</p>
          <label
            htmlFor="hideSubscribes"
            className={cn(styles['radio-btn__label'], styles['radio-btn__hide-subscribes'])}
          >
            <input
              {...register('hideSubscribes')}
              className={styles['radio-btn__switch']}
              type="checkbox"
              id="hideSubscribes"
              value="true"
            />
            <span className={styles['radio-btn__switch-move']}></span>
            Скрыть
          </label>
          <p className={styles['profile-settings-form__text-label']}> Закрытый профиль</p>
          <label
            htmlFor="privateProfile"
            className={cn(styles['radio-btn__label'], styles['radio-btn__private-profile'])}
          >
            <input
              {...register('privateProfile')}
              className={styles['radio-btn__switch']}
              type="checkbox"
              id="privateProfile"
              value="true"
            />
            <span className={styles['radio-btn__switch-move']}></span>
            Закрыть
          </label>
          <p className={styles['profile-settings-form__text-label']}> Ссылка</p>
          <span className={styles['profile-settings-form__add-link']}>
            <svg width="10" height="10" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_1324_9631)">
                <path d="M1 13H25" stroke="#7A5AF8" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M13 25L13 0.999999" stroke="#7A5AF8" strokeWidth="1.8" strokeLinecap="round" />
              </g>
              <defs>
                <clipPath id="clip0_1324_9631">
                  <rect width="26" height="26" fill="white" />
                </clipPath>
              </defs>
            </svg>
            Добавить
          </span>
          <button type="submit" className={styles['save-btn']}>
            Сохранить
          </button>
        </fieldset>
      </div>
    </>
  );
};

export default ProfileSettings;
