import { passwordRegexp } from '@/constants';
import cn from 'classnames';
import { FC, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import styles from '../../index.module.scss';
import { SecuritySettingsFormSchema } from './types';

const SecuritySettings: FC = () => {
  const [visible, setVisible] = useState<boolean>(false);
  /*   const {
    register,
    formState: { errors, dirtyFields },
    getValues,
    setError,
    reset,
    handleSubmit,
    control,
  } = useForm<SecuritySettingsFormSchema>({
    mode: 'onChange',
  });
 */
  const {
    control,
    register,
    formState: { errors, dirtyFields },
    getValues,
    setError,
  } = useFormContext<SecuritySettingsFormSchema>();

  const currentPassword = useWatch({
    control,
    name: 'currentPassword',
  });
  return (
    <div className={cn('container', styles['settings-container'])}>
      <fieldset className={styles['fieldset-container--without-pt']}>
        <legend className="visuallyhidden">Настройки безопасности профиля</legend>
        <p className={styles['profile-settings-form__text-change-password']}>Изменить пароль</p>
        <label htmlFor="current_password" className={styles['profile-settings-form__label']}>
          Текущий пароль
          <div className={styles['profile-settings-form__password-container']}>
            <input
              {...register('currentPassword', {
                required: 'Обязательное поле!',
              })}
              className={cn(styles['label__input'], {
                [styles['label__input--error']]: errors?.currentPassword,
                [styles['label__input--success']]: dirtyFields?.currentPassword && !errors?.currentPassword,
              })}
              id="current_password"
              type={visible ? 'text' : 'password'}
              placeholder="Введите текущий пароль"
              autoComplete="off"
            />
            {Boolean(errors?.currentPassword) && (
              <p className={styles['profile-settings-form__error-text']}>{errors?.currentPassword?.message}</p>
            )}
            <button
              type="button"
              onPointerDown={() => setVisible(!visible)}
              className={styles['profile-settings-form__visibility']}
            ></button>
          </div>
        </label>
        <label
          htmlFor="new_password"
          className={cn(styles['profile-settings-form__label'], styles['profile-settings-form__new-password'])}
        >
          Новый пароль
          <div className={styles['profile-settings-form__password-container']}>
            <input
              {...register('newPassword', {
                required: 'Обязательное поле!',
                pattern: {
                  value: passwordRegexp,
                  message: 'Пароль должен содержать 8 символов или более, включая 1 цифру.',
                },
                validate: {
                  notIsCurrent: (value) => value !== currentPassword || 'Вы ввели текущий пароль',
                  minLength: (value) => value.length >= 6 || 'Минимум 6 символов!',
                  maxLength: (value) => value.length <= 12 || 'Максимум 12 символов!',
                },
              })}
              className={cn(styles['label__input'], {
                [styles['label__input--error']]: errors?.newPassword,
                [styles['label__input--success']]: dirtyFields?.newPassword && !errors?.newPassword,
              })}
              id="new_password"
              type={visible ? 'text' : 'password'}
              placeholder="Введите новый пароль"
              autoComplete="off"
            />
            {Boolean(errors?.newPassword) && (
              <p className={styles['profile-settings-form__error-text']}>{errors?.newPassword?.message}</p>
            )}
            <button
              type="button"
              onPointerDown={() => setVisible(!visible)}
              className={styles['profile-settings-form__visibility']}
            ></button>
          </div>
          <div className={cn(styles['profile-settings-form__password-container'])}>
            <input
              {...register('newPasswordRepeat', {
                onBlur(event) {
                  return getValues('newPassword') !== getValues('newPasswordRepeat')
                    ? setError('newPasswordRepeat', {
                        type: 'Custom',
                        message: 'Пароли должны совпадать!',
                      })
                    : false;
                },
                required: 'Обязательное поле!',
                minLength: {
                  value: 6,
                  message: 'Минимум 6 символов!',
                },
                maxLength: {
                  value: 12,
                  message: 'Максимум 12 символов!',
                },
              })}
              className={cn(styles['label__input'], {
                [styles['label__input--error']]: errors?.newPasswordRepeat,
                [styles['label__input--success']]: dirtyFields?.newPasswordRepeat && !errors?.newPasswordRepeat,
              })}
              id="newPasswordRepeat"
              type={visible ? 'text' : 'password'}
              placeholder="Подтвердите новый пароль"
              autoComplete="off"
            />
            {Boolean(errors?.newPasswordRepeat) && (
              <p className={styles['profile-settings-form__error-text']}>{errors?.newPasswordRepeat?.message}</p>
            )}
            <button
              type="button"
              onPointerDown={() => setVisible(!visible)}
              className={styles['profile-settings-form__visibility']}
            ></button>
          </div>
        </label>
      </fieldset>
    </div>
  );
};

export default SecuritySettings;
