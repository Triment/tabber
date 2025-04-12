import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { Button } from '@heroui/react'; // Assuming Button is the correct import
// Removed icon import for now
import { getAuthUrl, getPlatform } from '../auth'; // Adjust path if needed
import { onOpenUrl } from '@tauri-apps/plugin-deep-link'
import { openUrl } from '@tauri-apps/plugin-opener';
import {  useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import { languages } from '../i18n';
import { Transition, Listbox } from '@headlessui/react';
import clsx from 'clsx';
import { ChevronDownIcon, LanguageIcon } from '@heroicons/react/24/outline';

const LoginPage: React.FC = () => {
  let navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    onOpenUrl(urls => {
      navigate(urls[0].replace("tabber://localhost/callback", "/login/callback"));
    });
  }, [navigate]);

  const handleLogin = () => {
    const authUrl = getAuthUrl();
    if (getPlatform() === 'desktop') {
      openUrl(authUrl);
    } else {
      window.location.href = authUrl; // Redirect user to the auth provider
    }
  };

  const currentLanguage =useMemo(()=>{ return languages.find((lang) => lang.code === i18n.language) || languages[0]}, [i18n.language])
console.log(currentLanguage)

  return (
    <div data-tauri-drag-region className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-semibold mb-6">{t('login.welcome')}</h1>
        <p className="text-gray-600 mb-8">{t('login.loginDescription')}</p>
        <Button
          color="primary" // Adjust color/variant as per HeroUI docs
          onPress={handleLogin}
          className="inline-flex items-center gap-2" // Keep styling for potential future icon
        >
          {/* Removed icon usage for now */}
          {t('login.loginButton')}
        </Button>
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
                  <Listbox.Options className="absolute left-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700">
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
      </div>
    </div>
  );
};

export default LoginPage;
