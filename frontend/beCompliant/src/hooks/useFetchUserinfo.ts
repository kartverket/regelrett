import { useEffect, useState } from 'react';
import { axiosFetch } from '../api/Fetch';
import { API_URL_USERINFO } from '../api/apiConfig';

type UserInfo = {
  groups: string[];
};

export const useFetchUserinfo = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);
      try {
        const response = await axiosFetch<UserInfo>({
          url: API_URL_USERINFO,
        });
        setUserInfo(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch user info');
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  return { userInfo, loading, error };
};
