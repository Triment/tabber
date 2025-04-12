import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HomeIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'; // Example icons
import clsx from 'clsx';

const Sidebar: React.FC = () => {
  const { t } = useTranslation();

  const navigation = [
    { name: t('sidebar.dashboard'), href: '/dashboard', icon: HomeIcon },
    // Add more navigation items here if needed
    // { name: t('sidebar.settings'), href: '/settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 dark:bg-gray-900 dark:border-gray-700">
      <div className="flex h-16 shrink-0 items-center">
        {/* Replace with your logo or app name */}
        <img
          className="h-8 w-auto"
          src="/vite.svg" // Example logo
          alt="Your Company"
        />
        <span className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">Tabber</span>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    end // Use 'end' for exact matching of the root dashboard route
                    className={({ isActive }) =>
                      clsx(
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold',
                        isActive
                          ? 'bg-gray-50 text-indigo-600 dark:bg-gray-800 dark:text-white'
                          : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
                      )
                    }
                  >
                    <item.icon
                      className={clsx(
                        'h-6 w-6 shrink-0',
                        // Active state styling handled by parent className
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </li>
          {/* Optional: Add other sections like Teams, Projects etc. */}
          {/* Optional: User profile section at the bottom */}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
