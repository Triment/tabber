import React, { Fragment, useEffect, useState, useRef } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Menu, Transition, Listbox } from '@headlessui/react';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import {
  Bars3Icon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  LanguageIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { themeAtom, Theme, userInfoAtom, identityAtom, getInitialIdentity } from '../../state';

interface NavbarProps {
  setSidebarOpen: (open: boolean) => void;
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
];

const themes: { name: Theme; icon: React.ElementType }[] = [
  { name: 'light', icon: SunIcon },
  { name: 'dark', icon: MoonIcon },
  { name: 'system', icon: ComputerDesktopIcon },
];

const Navbar: React.FC<NavbarProps> = ({ setSidebarOpen }) => {
  const { t, i18n } = useTranslation();
  const [currentTheme, setTheme] = useAtom(themeAtom);
  const [userInfo] = useAtom(userInfoAtom);
  const setIdentity = useSetAtom(identityAtom);
  const [mainWindow, setMainWindow] = useState<WebviewWindow | null>(null);

  useEffect(() => {
    setMainWindow(new WebviewWindow('main'));
  }, []);

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];
  const currentThemeConfig = themes.find((th) => th.name === currentTheme) || themes[2]; // Default to system

  const handleLogout = () => {
    // Clear identity state
    setIdentity(getInitialIdentity());
    // Optional: Clear user info as well
    // setUserInfo(null);
    // No need to explicitly navigate, ProtectedRoute will handle redirect
    console.log('User logged out');
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 dark:bg-gray-900 dark:border-gray-700">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden dark:text-gray-400"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 lg:hidden dark:bg-gray-700" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end">
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Theme Selector */}
          <Listbox value={currentTheme} onChange={setTheme}>
            {({ open }) => (
              <>
                <Listbox.Label className="sr-only">{t('navbar.theme')}</Listbox.Label>
                <div className="relative">
                  <Listbox.Button className="flex items-center gap-x-1 rounded-md p-1 text-sm font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-white">
                    <currentThemeConfig.icon className="h-5 w-5" aria-hidden="true" />
                    <span className="sr-only">{t(`navbar.${currentTheme}`)}</span>
                    <ChevronDownIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                  </Listbox.Button>
                  <Transition
                    show={open}
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700">
                      {themes.map((themeOption) => (
                        <Listbox.Option
                          key={themeOption.name}
                          className={({ active }) =>
                            clsx(
                              'relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 dark:text-white',
                              active ? 'bg-indigo-600 text-white dark:bg-indigo-500' : ''
                            )
                          }
                          value={themeOption.name}
                        >
                          {({ selected, active }) => (
                            <div className="flex items-center">
                              <themeOption.icon
                                className={clsx('h-5 w-5 mr-2', active ? 'text-white' : 'text-gray-600 dark:text-gray-400')}
                                aria-hidden="true"
                              />
                              <span className={clsx(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                                {t(`navbar.${themeOption.name}`)}
                              </span>
                            </div>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </>
            )}
          </Listbox>

          {/* Language Selector */}
          <Listbox value={currentLanguage.code} onChange={(value) => i18n.changeLanguage(value)}>
             {({ open }) => (
              <>
                <Listbox.Label className="sr-only">{t('navbar.language')}</Listbox.Label>
                <div className="relative">
                  <Listbox.Button className="flex items-center gap-x-1 rounded-md p-1 text-sm font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-white">
                    <LanguageIcon className="h-5 w-5" aria-hidden="true" />
                    <span className="hidden sm:inline">{currentLanguage.name}</span>
                    <ChevronDownIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                  </Listbox.Button>
                   <Transition
                    show={open}
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700">
                      {languages.map((lang) => (
                        <Listbox.Option
                          key={lang.code}
                          className={({ active }) =>
                            clsx(
                              'relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 dark:text-white',
                              active ? 'bg-indigo-600 text-white dark:bg-indigo-500' : ''
                            )
                          }
                          value={lang.code}
                        >
                          {({ selected, active }) => (
                             <span className={clsx(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                                {lang.name}
                              </span>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </>
             )}
          </Listbox>

          {/* Profile dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="-m-1.5 flex items-center p-1.5">
              <span className="sr-only">Open user menu</span>
              <img
                className="h-8 w-8 rounded-full bg-gray-50 dark:bg-gray-700"
                src={userInfo?.avatar || `https://ui-avatars.com/api/?name=${userInfo?.username || 'User'}&background=random`}
                alt=""
              />
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-4 text-sm font-semibold leading-6 text-gray-900 dark:text-white" aria-hidden="true">
                  {userInfo?.username || 'User'}
                </span>
                <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700">
                {/* Add profile/settings links here if needed */}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={clsx(
                        'w-full text-left flex items-center px-3 py-1 text-sm leading-6 text-gray-900 dark:text-white',
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      )}
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                      {t('navbar.logout')}
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>

          {/* Window Controls */}
          <div className="flex items-center gap-x-2">
            <button
              className="rounded-md p-1 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-white"
              onClick={() => {
                mainWindow?.minimize();
              }}
            >
              <span className="sr-only">Minimize</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
              </svg>
            </button>
            <button
              className="rounded-md p-1 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-white"
              onClick={async () => {
                console.log(await mainWindow?.isMaximized())
                if (await mainWindow?.isMaximized()) {
                  mainWindow?.unmaximize();
                } else {
                  mainWindow?.maximize();
                }
              }}
            >
              <span className="sr-only">Maximize</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 6V4.5C3 4.22386 3.22386 4 3.5 4H6V6M3 18V19.5C3 19.7761 3.22386 20 3.5 20H6V18M18 6V4.5C18 4.22386 17.7761 4 17.5 4H16V6M18 18V19.5C18 19.7761 17.7761 20 17.5 20H16V18M6 6h12M6 18h12"
                />
              </svg>
            </button>
            <button
              className="rounded-md p-1 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-white"
              onClick={() => {
                mainWindow?.close();
                console.log(mainWindow)
              }}
            >
              <span className="sr-only">Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
