import React, { useState, useEffect } from 'react';
import { getProfile } from '../../../services/profileService';
import images from '../../../assets/images';

const ProfileInfo = ({ userId }) => {
  const [profile, setProfile] = useState({
    work: '',
    education: '',
    location: '',
    hometown: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Nếu không có userId, không gọi API
        if (!userId) {
          setLoading(false);
          return;
        }
        
        const data = await getProfile(userId);
        if (data) {
          setProfile({
            work: data.work || '',
            education: data.education || '',
            location: data.location || '',
            hometown: data.hometown || ''
          });
        }
      } catch (err) {
        console.error('Failed to load profile in ProfileInfo:', err);
        setError('Không thể tải thông tin. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [userId]);

  // Phân tích thông tin công việc (nếu có định dạng)
  const currentWork = profile.work ? { company: profile.work } : null;
  // Phân tích thông tin học vấn (nếu có định dạng)
  const currentEducation = profile.education ? { school: profile.education } : null;
  // Sử dụng thông tin vị trí hiện tại
  const currentCity = profile.location || '';
  // Sử dụng thông tin quê quán
  const hometown = profile.hometown || '';

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">Tổng quan</h2>
        <p className="text-gray-500">Đang tải thông tin...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">Tổng quan</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Tổng quan</h2>
      {currentWork && (
        <div className="flex items-center mb-2">
          <i className="bi bi-briefcase text-gray-500 mr-2"></i>
          <span>Làm việc tại <span className="font-medium">{currentWork.company}</span></span>
        </div>
      )}
      {currentEducation && (
        <div className="flex items-center mb-2">
          <i className="bi bi-mortarboard text-gray-500 mr-2"></i>
          <span>Từng học tại <span className="font-medium">{currentEducation.school}</span></span>
        </div>
      )}
      {currentCity && (
        <div className="flex items-center mb-2">
          <i className="bi bi-geo-alt text-gray-500 mr-2"></i>
          <span>Sống tại {currentCity}</span>
        </div>
      )}
      {hometown && (
        <div className="flex items-center mb-2">
          <i className="bi bi-house text-gray-500 mr-2"></i>
          <span>Đến từ {hometown}</span>
        </div>
      )}
      {!currentWork && !currentEducation && !currentCity && !hometown && (
        <p className="text-gray-500">Chưa có thông tin tổng quan</p>
      )}
    </div>
  );
};

export default ProfileInfo;