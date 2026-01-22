'use client';
import { useTheme } from '@/context/themeProvider';
import cn from 'classnames';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC, useEffect, useState } from 'react';
import styles from './index.module.scss';

const Footer: FC = () => {
  const linkCreateArticle = 'https://fasie.ru/?ysclid=mkpcq3ozt7319895918';
  const path = usePathname();
  if (path.includes('comics')) {
    return;
  }
  const { theme, setTheme } = useTheme();
  const [logo, setLogo] = useState<string>();
  const [logoSrc, setLogoSrc] = useState<string>();
  useEffect(() => {
    if (theme === 'light') {
      setLogo('logo-light-fix.png');
      setLogoSrc('fond.png');
    } else {
      setLogo('logo-black-fix.png');
      setLogoSrc('fond_dark.png');
    }
  }, [theme]);

  return (
    <footer className={styles['footer']}>
      <header className={styles['blog__header']}>
        <p className={styles['blog__header-text']}>
          Проект создан при поддержке Федерального государственного бюджетного учреждения
          <br className={styles['blog__header-br']} /> <br />
          <span>Фонд содействия развитию малых форм предприятий в научно-технической сфере</span>
          <br />в рамках программы <span>Студенческий стартап</span>
          <br />
          федерального проекта <span>Платформа университетского технологического предпринимательства</span>
        </p>
        <Link className={styles['blog__header-link']} href={linkCreateArticle}>
          Узнать подробнее
        </Link>
      </header>
      <div className={cn(styles['footer-container'], 'container')}>
        <div className={styles['icons']}>
          <Link href="">
            <svg
              className={styles['footer-icon']}
              width="29"
              height="30"
              viewBox="0 0 29 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_543_985)">
                <path
                  d="M28.0116 7.69569C27.6826 6.40313 26.7134 5.38425 25.482 5.03841C23.2516 4.41141 14.305 4.41141 14.305 4.41141C14.305 4.41141 5.35842 4.41141 3.12684 5.03841C1.89661 5.38425 0.927442 6.40188 0.598427 7.69569C0 10.0395 0 14.9286 0 14.9286C0 14.9286 0 19.8177 0.598427 22.1615C0.927442 23.454 1.89661 24.4729 3.12803 24.8188C5.35842 25.4458 14.305 25.4458 14.305 25.4458C14.305 25.4458 23.2516 25.4458 25.4832 24.8188C26.7134 24.4729 27.6826 23.4553 28.0128 22.1615C28.61 19.8177 28.61 14.9286 28.61 14.9286C28.61 14.9286 28.61 10.0395 28.0116 7.69569ZM11.3796 19.3686V10.4886L18.8564 14.9286L11.3796 19.3686Z"
                  fill="#2D283E"
                />
              </g>
              <defs>
                <clipPath id="clip0_543_985">
                  <rect width="28.61" height="29.8571" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </Link>
          <Link href="https://vk.com/graffcomix">
            <svg
              className={styles['footer-icon']}
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_543_988)">
                <path
                  d="M27.5176 2.09498C25.5101 0 22.2784 0 15.8161 0H14.624C8.16172 0 4.92998 0 2.92251 2.09498C0.915039 4.18995 0.915039 7.56256 0.915039 14.3065V15.5506C0.915039 22.2946 0.915039 25.6659 2.92251 27.7622C4.92998 29.8584 8.16172 29.8571 14.624 29.8571H15.8161C22.2784 29.8571 25.5089 29.8571 27.5176 27.7622C29.5251 25.6672 29.5251 22.2946 29.5251 15.5506V14.3065C29.5251 7.56256 29.5251 4.18995 27.5176 2.09498ZM24.1643 21.1488H22.0781C21.283 21.1488 21.0494 20.487 19.6343 19.0103C18.3958 17.765 17.8653 17.6033 17.5565 17.6033C17.1357 17.6033 17.0106 17.7277 17.0106 18.3497V20.3016C17.0106 20.8366 16.8473 21.1488 15.5205 21.1488C13.3103 21.1488 10.8809 19.748 9.15592 17.1654C6.5691 13.3822 5.86219 10.5222 5.86219 9.94616C5.86219 9.62271 5.9814 9.33036 6.57744 9.33036H8.66478C9.19765 9.33036 9.39791 9.57419 9.59819 10.1763C10.6186 13.2777 12.34 15.9885 13.0469 15.9885C13.3115 15.9885 13.4331 15.8604 13.4331 15.1587V11.9528C13.3556 10.4774 12.6034 10.3555 12.6034 9.83046C12.6034 9.58787 12.8025 9.33036 13.1339 9.33036H16.4133C16.8556 9.33036 17.0094 9.57668 17.0094 10.1303V14.4434C17.0094 14.9037 17.2013 15.0654 17.3336 15.0654C17.5995 15.0654 17.82 14.9037 18.3064 14.3961C19.8096 12.6433 20.8705 9.94492 20.8705 9.94492C21.0041 9.62146 21.2472 9.32911 21.7789 9.32911H23.8651C24.4957 9.32911 24.6292 9.66749 24.4957 10.129C24.2298 11.398 21.6883 15.1338 21.6883 15.1338C21.4666 15.5033 21.3784 15.6874 21.6883 16.103C21.91 16.4264 22.6384 17.0721 23.1248 17.6717C24.0212 18.7242 24.6971 19.6112 24.8855 20.2232C25.0595 20.8378 24.7603 21.1488 24.1643 21.1488Z"
                  fill="#2D283E"
                />
              </g>
              <defs>
                <clipPath id="clip0_543_988">
                  <rect width="28.61" height="29.8571" fill="white" transform="translate(0.915039)" />
                </clipPath>
              </defs>
            </svg>
          </Link>
          <Link href="https://www.tiktok.com/@grafcomix?_t=ZM-8uktZlBWpbp&_r=1">
            <svg
              className={styles['footer-icon']}
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_543_991)">
                <path
                  d="M27.6101 12.2738C25.0602 12.2738 22.6963 11.4228 20.7675 9.97726V20.4086C20.7675 25.6187 16.7061 29.8559 11.7148 29.8559C9.78601 29.8559 7.99669 29.2214 6.52685 28.1441C4.19275 26.4335 2.66211 23.6046 2.66211 20.4086C2.66211 15.1985 6.72354 10.9601 11.716 10.9601C12.1308 10.9601 12.5361 10.9961 12.9355 11.0521V12.2676V16.292C12.5493 16.1664 12.1416 16.093 11.716 16.093C9.43673 16.093 7.58184 18.0287 7.58184 20.4086C7.58184 22.0657 8.48306 23.505 9.79912 24.2278C10.3725 24.5426 11.0246 24.723 11.7172 24.723C13.944 24.723 15.7607 22.8743 15.8442 20.5703L15.8478 0H20.7663C20.7663 0.445369 20.808 0.879542 20.8819 1.30252C21.2288 3.25816 22.341 4.93638 23.8824 5.98511C24.9553 6.71537 26.2356 7.14208 27.6089 7.14208L27.6101 12.2738Z"
                  fill="#2D283E"
                />
              </g>
              <defs>
                <clipPath id="clip0_543_991">
                  <rect width="28.61" height="29.8571" fill="white" transform="translate(0.830078)" />
                </clipPath>
              </defs>
            </svg>
          </Link>
          <Link href="https://t.me/graffcomix">
            <svg
              className={styles['footer-icon']}
              width="29"
              height="30"
              viewBox="0 0 29 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.5479 0C6.81635 0 0.547852 6.71625 0.547852 15C0.547852 23.2837 6.81635 30 14.5479 30C22.2794 30 28.5479 23.2837 28.5479 15C28.5479 6.71625 22.2794 0 14.5479 0ZM21.0369 10.2013C20.8269 12.5725 19.9145 18.3288 19.4513 20.985C19.2554 22.11 18.868 22.4862 18.4947 22.5225C17.6815 22.6025 17.0644 21.9462 16.2769 21.3937C15.0449 20.5287 14.3484 19.99 13.1525 19.145C11.77 18.1688 12.666 17.6325 13.4535 16.7562C13.66 16.5262 17.2417 13.035 17.3117 12.7188C17.3199 12.6788 17.3292 12.5312 17.2464 12.4537C17.1635 12.3762 17.0434 12.4025 16.957 12.4237C16.8334 12.4538 14.8652 13.8475 11.0514 16.605C10.4925 17.0162 9.98619 17.2163 9.53235 17.2063C9.03302 17.195 8.07168 16.9037 7.35652 16.6537C6.48035 16.3487 5.78268 16.1863 5.84335 15.6687C5.87485 15.3987 6.22135 15.1225 6.88402 14.84C10.965 12.935 13.6869 11.6788 15.0484 11.0713C18.9369 9.33875 19.7442 9.0375 20.2715 9.0275C20.9319 9.0175 21.0905 9.60125 21.0369 10.2013Z"
                fill="#2D283E"
              />
            </svg>
          </Link>
        </div>
        <div className={styles['links']}>
          <div className={styles['links__group']}>
            <Link className={styles['links__item']} href="/about">
              О нас <span className={styles['dot']}></span>
            </Link>
            <Link className={styles['links__item']} href="/help">
              Помощь <span className={styles['dot']}></span>
            </Link>
            <Link className={styles['links__item']} href="/author-rights">
              Авторское право
            </Link>
          </div>
          <div className={styles['links__group']}>
            <Link className={styles['links__item']} href="/user-agreement">
              Пользовательское соглашение <span className={styles['dot']}></span>
            </Link>
            <Link className={styles['links__item']} href="/policy">
              Политика
            </Link>
          </div>
          <div className={styles['links__group']}>
            <Link className={styles['links__item']} href="/contacts">
              Контакты <span className={styles['dot']}></span>
            </Link>

            <Link className={styles['links__item']} href="/contract">
              Агентский договор
            </Link>
          </div>
        </div>
        <div className={styles['footerlogo']}>
          <img src={logo} alt="logo" className={styles['footer-logo']} />
          <img src={logoSrc} alt="logoSrc" className={styles['footer-logo']} />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
