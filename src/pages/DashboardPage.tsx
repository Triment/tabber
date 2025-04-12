import { useAtom } from 'jotai';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { userInfoAtom } from '../state'; // identityAtom no longer needed directly here
import apiClient from '../lib/axios'; // Import the new apiClient

const DashboardPage: React.FC = () => {
  const { t } = useTranslation(); // Get translation function
  let [userinfo, setUserinfo] = useAtom(userInfoAtom);

  useEffect(() => {
    // Use apiClient - it automatically adds the Authorization header
    apiClient.get("https://openid.reqack.com/api/userinfo")
      .then(res => {
      if (res.status === 200) {
        setUserinfo({
          username: res.data.name,
          avatar: res.data.avatar_url,
          email: res.data.email
        })
      }
    })
    .catch(err => {
      // Optional: Add error handling for the userinfo request
      console.error("Failed to fetch user info:", err);
      // Maybe clear userinfo or show an error message
      // setUserinfo(null); 
    });
    // Remove identity from dependency array as apiClient handles token internally
  }, [setUserinfo]);

  // The outer div with padding is removed as DashboardLayout handles it.
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard.title')}</h1>
      <p className="mt-2 text-gray-700 dark:text-gray-300">
        {userinfo ? t('dashboard.welcome', { username: userinfo.username }) : t('dashboard.description')}
      </p>
      {/* Add other dashboard-specific content here */}
      {/* Example: You might put the SteamTable component here later */}
      {/* <div className="mt-8"> */}
      {/*   <SteamTable /> */}
      {/* </div> */}
    </>
  );
};

export default DashboardPage;
