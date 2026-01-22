'use client';
import { FC, useContext, useEffect, useState } from 'react';
import { ctx } from '../../../context/contextProvider';

import { Avatar, BurgerMenu, Logo, ModalAuth, Switch } from '@UI/index';

import { routes, sideMenuRoutes } from '@/config/routing';
import cn from 'classnames';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './index.module.scss';

import { useModal } from '@/context/modalProvider';
import { useTheme } from '@/context/themeProvider';
import { useWindowSize } from '@/hooks/useWindowSize';
import { signOut, useSession } from 'next-auth/react';

const Header: FC = () => {
  const { status, data } = useSession();
  const router = useRouter();

  const [dropDownVisible, setDropDownVisible] = useState(false);

  const { setActiveBurger, activeBurger, setActiveAvatar, activeAvatar, visibleMenu } = useContext(ctx);

  const { openModal } = useModal();
  const [search, setSearch] = useState('');
  const { theme, setTheme } = useTheme();

  const { size } = useWindowSize();

  const path = usePathname();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.replace('/');
  };

  const handleBurgerClick = () => {
    setActiveBurger(!activeBurger);
    setActiveAvatar(false);
    setDropDownVisible(false);
  };

  const handleAvatarClick = () => {
    if (size === 'mobile') {
      setActiveAvatar(!activeAvatar);
      setActiveBurger(false);
    } else {
      setDropDownVisible(!dropDownVisible);
    }
  };

  const handleProfileClick = () => {
    router.push('/profile');
    // Закрываем все меню сразу
    setActiveAvatar(false);
    setActiveBurger(false);
    setDropDownVisible(false);
  };

  const handleLinkClick = () => {
    setActiveBurger(false);
    setActiveAvatar(false);
    setDropDownVisible(false);
  };

  const handleOpenModal = () => {
    openModal(<ModalAuth />, { bg: true });
  };

  const withoutMobile = (callBack: () => void) => {
    if (size !== 'mobile') {
      callBack();
    }
  };

  useEffect(() => {
    if (theme == 'light') {
      setSearch('/search.svg');
    } else {
      setSearch('/searchWhite.svg');
    }
  }, [theme]);

  // Закрываем дропдаун при клике вне области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(`.${styles['right-menu-btn']}`) && !target.closest(`.${styles['dropDownWrapper']}`)) {
        setDropDownVisible(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    visibleMenu && (
      <header className={styles['header']}>
        <div className={styles['header-container']}>
          {/* Основное меню (бургер) */}
          <nav
            className={cn(styles['nav'], {
              [styles['nav--active']]: activeBurger,
            })}
          >
            <Logo isHeader={true} mixClass={[styles['logo-header']]} />
            <button className={styles['close-sidebar']} onClick={handleBurgerClick}>
              <svg
                className={styles['arrow']}
                width="7"
                height="8"
                viewBox="0 0 7 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_684_5154)">
                  <path
                    d="M1 4C0.999379 4.42907 1.22093 4.84342 1.62275 5.16468C1.86374 5.35635 2.0981 5.53805 2.26621 5.65704L4.60484 7.34105C4.7607 7.44468 4.96715 7.50163 5.18098 7.49996C5.39481 7.4983 5.59944 7.43815 5.75203 7.33212C5.90463 7.22608 5.99336 7.08237 5.99964 6.93108C6.00593 6.77979 5.92928 6.63264 5.78576 6.52044L3.44298 4.83233C3.28812 4.72214 3.07778 4.55801 2.86329 4.38744C2.72985 4.28036 2.65621 4.14249 2.65621 3.99971C2.65621 3.85692 2.72985 3.71905 2.86329 3.61197C3.07695 3.44199 3.28729 3.27786 3.43718 3.17119L5.78576 1.47956C5.92928 1.36736 6.00593 1.22021 5.99964 1.06892C5.99336 0.917627 5.90463 0.77392 5.75203 0.667883C5.59944 0.561846 5.39481 0.5017 5.18098 0.500035C4.96715 0.498371 4.7607 0.555316 4.60484 0.658952L2.26207 2.34589C2.09644 2.46312 1.86457 2.64307 1.62524 2.83415C1.22194 3.15537 0.999427 3.57027 1 4Z"
                    fill="#7A5AF8"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_684_5154">
                    <rect width="7" height="7" fill="white" transform="translate(7 0.5) rotate(90)" />
                  </clipPath>
                </defs>
              </svg>
              Закрыть
            </button>

            {Object.entries(routes).map(([text, url], i) => (
              <>
                <Link
                  className={`${
                    path === url ? cn(styles['menu-link'], styles['menu-link--active']) : styles['menu-link']
                  }`}
                  key={i}
                  href={url}
                  onClick={handleLinkClick}
                >
                  {text}
                </Link>
                <span className={styles['line']}></span>
              </>
            ))}

            <Switch
              mixClass={[styles['theme-switch-mobile']]}
              onChange={() => {
                setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
              }}
              value={theme === 'light'}
              checked={
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 14 14" fill="none">
                  <g clipPath="url(#clip0_989_1122)">
                    <path
                      d="M7.22299 9.53058C5.69153 9.53058 4.4486 8.28765 4.4486 6.75619C4.4486 5.22473 5.69153 3.9818 7.22299 3.9818C8.75445 3.9818 9.99738 5.22473 9.99738 6.75619C9.99738 8.28765 8.75445 9.53058 7.22299 9.53058ZM7.22299 5.09156C6.30744 5.09156 5.55836 5.84064 5.55836 6.75619C5.55836 7.67174 6.30744 8.42083 7.22299 8.42083C8.13854 8.42083 8.88763 7.67174 8.88763 6.75619C8.88763 5.84064 8.13854 5.09156 7.22299 5.09156ZM7.77787 2.31717V0.652534C7.77787 0.347351 7.52817 0.0976562 7.22299 0.0976562C6.91781 0.0976562 6.66811 0.347351 6.66811 0.652534V2.31717C6.66811 2.62235 6.91781 2.87205 7.22299 2.87205C7.52817 2.87205 7.77787 2.62235 7.77787 2.31717ZM7.77787 12.8598V11.1952C7.77787 10.89 7.52817 10.6403 7.22299 10.6403C6.91781 10.6403 6.66811 10.89 6.66811 11.1952V12.8598C6.66811 13.165 6.91781 13.4147 7.22299 13.4147C7.52817 13.4147 7.77787 13.165 7.77787 12.8598ZM3.33884 6.75619C3.33884 6.45101 3.08915 6.20131 2.78397 6.20131H1.11933C0.814148 6.20131 0.564453 6.45101 0.564453 6.75619C0.564453 7.06137 0.814148 7.31107 1.11933 7.31107H2.78397C3.08915 7.31107 3.33884 7.06137 3.33884 6.75619ZM13.8815 6.75619C13.8815 6.45101 13.6318 6.20131 13.3267 6.20131H11.662C11.3568 6.20131 11.1071 6.45101 11.1071 6.75619C11.1071 7.06137 11.3568 7.31107 11.662 7.31107H13.3267C13.6318 7.31107 13.8815 7.06137 13.8815 6.75619ZM4.28769 3.82089C4.50409 3.60448 4.50409 3.25491 4.28769 3.03851L3.17793 1.92875C2.96153 1.71235 2.61195 1.71235 2.39555 1.92875C2.17915 2.14516 2.17915 2.49473 2.39555 2.71113L3.50531 3.82089C3.61628 3.93186 3.755 3.9818 3.89927 3.9818C4.04354 3.9818 4.18226 3.92631 4.29323 3.82089H4.28769ZM12.056 11.5892C12.2724 11.3728 12.2724 11.0232 12.056 10.8068L10.9462 9.69704C10.7298 9.48064 10.3802 9.48064 10.1638 9.69704C9.94744 9.91345 9.94744 10.263 10.1638 10.4794L11.2736 11.5892C11.3846 11.7002 11.5233 11.7501 11.6676 11.7501C11.8118 11.7501 11.9506 11.6946 12.0615 11.5892H12.056ZM3.17793 11.5892L4.28769 10.4794C4.50409 10.263 4.50409 9.91345 4.28769 9.69704C4.07128 9.48064 3.72171 9.48064 3.50531 9.69704L2.39555 10.8068C2.17915 11.0232 2.17915 11.3728 2.39555 11.5892C2.50653 11.7002 2.64525 11.7501 2.78951 11.7501C2.93378 11.7501 3.0725 11.6946 3.18348 11.5892H3.17793ZM10.9462 3.82089L12.056 2.71113C12.2724 2.49473 12.2724 2.14516 12.056 1.92875C11.8396 1.71235 11.49 1.71235 11.2736 1.92875L10.1638 3.03851C9.94744 3.25491 9.94744 3.60448 10.1638 3.82089C10.2748 3.93186 10.4135 3.9818 10.5578 3.9818C10.7021 3.9818 10.8408 3.92631 10.9518 3.82089H10.9462Z"
                      fill="white"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_989_1122">
                      <rect width="13.3171" height="13.3171" fill="white" transform="translate(0.564453 0.0976562)" />
                    </clipPath>
                  </defs>
                </svg>
              }
              unchecked={
                <svg xmlns="http://www.w3.org/2000/svg" fill="white" height="18" viewBox="0 -960 960 960" width="18">
                  <path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Zm0-80q88 0 158-48.5T740-375q-20 5-40 8t-40 3q-123 0-209.5-86.5T364-660q0-20 3-40t8-40q-78 32-126.5 102T200-480q0 116 82 198t198 82Zm-10-270Z" />
                </svg>
              }
            />
          </nav>

          {/* Мобильное меню профиля */}
          <nav
            className={cn(styles['right-nav'], {
              [styles['right-nav--active']]: activeAvatar && status === 'authenticated',
            })}
          >
            <figure className={styles['avatar']}>
              <figcaption onClick={handleProfileClick} className={styles['avatar__name']}>
                {data?.user.name}
              </figcaption>
              <Avatar />
            </figure>
            <span className={styles['line']}></span>
            {Object.entries(sideMenuRoutes).map(([text, url], i) => (
              <>
                <Link
                  className={`${
                    path === url ? cn(styles['menu-link'], styles['menu-link--active']) : styles['menu-link']
                  }`}
                  key={i + 1}
                  href={url}
                  onClick={handleLinkClick}
                >
                  {text}
                </Link>
                <span className={styles['line']}></span>
              </>
            ))}

            <button className={styles['auth-btn']} onClick={handleSignOut}>
              Выйти
            </button>
          </nav>

          {/* Мобильная верхняя панель */}
          <div className={styles['search__mobile--view']}>
            <BurgerMenu isActive={activeBurger} onClick={handleBurgerClick} />
            <div className={styles['search__mobile']} onClick={() => {}}>
              <img src={search} alt="" className={styles['search__mobile']} />
            </div>
          </div>

          <Link href={'/'}>
            <picture className={styles['logo-mobile']}>
              <source type="image/webp" srcSet="/logo-mobile.webp 1x, /logo-mobile2x.webp 2x, /logo-mobile3x.webp 3x" />
              <img
                srcSet="
                     /logo-mobile.png 1x,
                     /logo-mobile2x.png 2x,
                     /logo-mobile3x.png 3x"
                src="/logo.png"
                alt="логотип"
              />
            </picture>
          </Link>

          {/* Десктопная правая панель */}
          <div className={styles['btn-container']}>
            <div className={styles['search']} onClick={() => {}}>
              <img src={search} alt="" className={styles['search']} />
            </div>
            {status === 'authenticated' || status === 'loading' ? (
              <button
                onPointerOver={() => withoutMobile(() => setDropDownVisible(true))}
                onPointerLeave={() => withoutMobile(() => setDropDownVisible(false))}
                className={styles['right-menu-btn']}
                onClick={handleAvatarClick}
              >
                <Avatar />
                {dropDownVisible && status === 'authenticated' && (
                  <div
                    className={styles['dropDownWrapper']}
                    onMouseEnter={() => setDropDownVisible(true)}
                    onMouseLeave={() => setDropDownVisible(false)}
                  >
                    <nav className={cn(styles['dropDown'])}>
                      <figure onClick={handleProfileClick} className={styles['avatar']}>
                        <figcaption className={styles['avatar__name']}>{data?.user.name}</figcaption>
                        <Avatar />
                      </figure>
                      <span className={styles['line']}></span>
                      {Object.entries(sideMenuRoutes).map(([text, url], i) => (
                        <>
                          <Link
                            className={`${
                              path === url ? cn(styles['menu-link'], styles['menu-link--active']) : styles['menu-link']
                            }`}
                            key={i + 1}
                            href={url}
                            onClick={handleLinkClick}
                          >
                            {text}
                          </Link>
                          <span className={styles['line']}></span>
                        </>
                      ))}

                      <button className={styles['auth-btn']} onClick={handleSignOut}>
                        Выйти
                      </button>
                    </nav>
                  </div>
                )}
              </button>
            ) : (
              <>
                <Link className={styles['signin-link']} href={'/auth/signin'}>
                  Войти
                </Link>
                <button onClick={handleOpenModal} className={styles['signin-btn']}>
                  Войти
                </button>
              </>
            )}
            <Switch
              mixClass={[styles['theme-switch']]}
              onChange={() => {
                setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
              }}
              value={theme === 'light'}
              checked={
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 14 14" fill="none">
                  <g clipPath="url(#clip0_989_1122)">
                    <path
                      d="M7.22299 9.53058C5.69153 9.53058 4.4486 8.28765 4.4486 6.75619C4.4486 5.22473 5.69153 3.9818 7.22299 3.9818C8.75445 3.9818 9.99738 5.22473 9.99738 6.75619C9.99738 8.28765 8.75445 9.53058 7.22299 9.53058ZM7.22299 5.09156C6.30744 5.09156 5.55836 5.84064 5.55836 6.75619C5.55836 7.67174 6.30744 8.42083 7.22299 8.42083C8.13854 8.42083 8.88763 7.67174 8.88763 6.75619C8.88763 5.84064 8.13854 5.09156 7.22299 5.09156ZM7.77787 2.31717V0.652534C7.77787 0.347351 7.52817 0.0976562 7.22299 0.0976562C6.91781 0.0976562 6.66811 0.347351 6.66811 0.652534V2.31717C6.66811 2.62235 6.91781 2.87205 7.22299 2.87205C7.52817 2.87205 7.77787 2.62235 7.77787 2.31717ZM7.77787 12.8598V11.1952C7.77787 10.89 7.52817 10.6403 7.22299 10.6403C6.91781 10.6403 6.66811 10.89 6.66811 11.1952V12.8598C6.66811 13.165 6.91781 13.4147 7.22299 13.4147C7.52817 13.4147 7.77787 13.165 7.77787 12.8598ZM3.33884 6.75619C3.33884 6.45101 3.08915 6.20131 2.78397 6.20131H1.11933C0.814148 6.20131 0.564453 6.45101 0.564453 6.75619C0.564453 7.06137 0.814148 7.31107 1.11933 7.31107H2.78397C3.08915 7.31107 3.33884 7.06137 3.33884 6.75619ZM13.8815 6.75619C13.8815 6.45101 13.6318 6.20131 13.3267 6.20131H11.662C11.3568 6.20131 11.1071 6.45101 11.1071 6.75619C11.1071 7.06137 11.3568 7.31107 11.662 7.31107H13.3267C13.6318 7.31107 13.8815 7.06137 13.8815 6.75619ZM4.28769 3.82089C4.50409 3.60448 4.50409 3.25491 4.28769 3.03851L3.17793 1.92875C2.96153 1.71235 2.61195 1.71235 2.39555 1.92875C2.17915 2.14516 2.17915 2.49473 2.39555 2.71113L3.50531 3.82089C3.61628 3.93186 3.755 3.9818 3.89927 3.9818C4.04354 3.9818 4.18226 3.92631 4.29323 3.82089H4.28769ZM12.056 11.5892C12.2724 11.3728 12.2724 11.0232 12.056 10.8068L10.9462 9.69704C10.7298 9.48064 10.3802 9.48064 10.1638 9.69704C9.94744 9.91345 9.94744 10.263 10.1638 10.4794L11.2736 11.5892C11.3846 11.7002 11.5233 11.7501 11.6676 11.7501C11.8118 11.7501 11.9506 11.6946 12.0615 11.5892H12.056ZM3.17793 11.5892L4.28769 10.4794C4.50409 10.263 4.50409 9.91345 4.28769 9.69704C4.07128 9.48064 3.72171 9.48064 3.50531 9.69704L2.39555 10.8068C2.17915 11.0232 2.17915 11.3728 2.39555 11.5892C2.50653 11.7002 2.64525 11.7501 2.78951 11.7501C2.93378 11.7501 3.0725 11.6946 3.18348 11.5892H3.17793ZM10.9462 3.82089L12.056 2.71113C12.2724 2.49473 12.2724 2.14516 12.056 1.92875C11.8396 1.71235 11.49 1.71235 11.2736 1.92875L10.1638 3.03851C9.94744 3.25491 9.94744 3.60448 10.1638 3.82089C10.2748 3.93186 10.4135 3.9818 10.5578 3.9818C10.7021 3.9818 10.8408 3.92631 10.9518 3.82089H10.9462Z"
                      fill="white"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_989_1122">
                      <rect width="13.3171" height="13.3171" fill="white" transform="translate(0.564453 0.0976562)" />
                    </clipPath>
                  </defs>
                </svg>
              }
              unchecked={
                <svg xmlns="http://www.w3.org/2000/svg" fill="white" height="18" viewBox="0 -960 960 960" width="18">
                  <path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Zm0-80q88 0 158-48.5T740-375q-20 5-40 8t-40 3q-123 0-209.5-86.5T364-660q0-20 3-40t8-40q-78 32-126.5 102T200-480q0 116 82 198t198 82Zm-10-270Z" />
                </svg>
              }
            />
          </div>
        </div>
      </header>
    )
  );
};

export default Header;
