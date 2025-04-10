import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import FriendsContent from '../components/Content/FriendsContent/FriendsContent';

const FriendsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    // Giả lập thời gian tải dữ liệu
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <FriendsContent userId={user?.id} />
      )}
    </div>
  );
};

export default FriendsPage; 