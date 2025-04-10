import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/authService';
import images from '../assets/images';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [step, setStep] = useState(1); // Step 1: Thông tin cơ bản, Step 2: Thông tin thêm
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    currentCity: '',
    hometown: '',
    work: '',
    education: '',
    bio: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateStepOne = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Vui lòng nhập tên';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Vui lòng nhập họ';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Vui lòng chọn ngày sinh';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 13) {
        newErrors.dateOfBirth = 'Bạn phải ít nhất 13 tuổi để đăng ký';
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'Vui lòng chọn giới tính';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStepTwo = () => {
    // No required fields in step 2, all are optional
    return true;
  };

  const handleNextStep = () => {
    if (validateStepOne()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    
    if (step === 1) {
      handleNextStep();
      return;
    }
    
    if (!validateStepTwo()) return;
    
    setLoading(true);
    
    // Generate username from email (before @ symbol) for backend compatibility
    const username = formData.email.split('@')[0];
    
    // Tạo dữ liệu đăng ký (loại bỏ trường confirmPassword)
    const { confirmPassword, ...registerData } = formData;
    
    try {
      // Gọi API đăng ký
      await register({...registerData, username});
      
      // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
      navigate('/login', { state: { successMessage: 'Đăng ký thành công! Vui lòng đăng nhập.' } });
    } catch (error) {
      console.error('Register error:', error);
      setRegisterError(error.message || 'Đăng ký thất bại. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img className="mx-auto h-20 w-auto" src={images.logo || '/logo.svg'} alt="Facebook" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {step === 1 ? 'Tạo tài khoản mới' : 'Thông tin bổ sung'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 1 ? (
              <>
                Đã có tài khoản?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Đăng nhập
                </Link>
              </>
            ) : (
              <>Bước 2/2: Thông tin bổ sung (không bắt buộc)</>
            )}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {step === 1 ? (
            // Bước 1: Thông tin cơ bản
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    Tên
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className={`mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="Tên"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Họ
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className={`mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border ${
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="Họ"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={`mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className={`mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="Mật khẩu"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 mt-1"
                    onClick={togglePasswordVisibility}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} text-gray-500`}></i>
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className={`mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="Xác nhận mật khẩu"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 mt-1"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'} text-gray-500`}></i>
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                  Ngày sinh
                </label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  required
                  className={`mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border ${
                    errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                  } text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
                )}
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Giới tính
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  className={`mt-1 block w-full py-2 px-3 border ${
                    errors.gender ? 'border-red-300' : 'border-gray-300'
                  } bg-white rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                )}
              </div>
            </div>
          ) : (
            // Bước 2: Thông tin bổ sung
            <div className="space-y-4">
              <div>
                <label htmlFor="work" className="block text-sm font-medium text-gray-700">
                  Công việc hiện tại
                </label>
                <input
                  id="work"
                  name="work"
                  type="text"
                  className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Công việc hiện tại"
                  value={formData.work}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="education" className="block text-sm font-medium text-gray-700">
                  Học vấn
                </label>
                <input
                  id="education"
                  name="education"
                  type="text"
                  className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Học vấn"
                  value={formData.education}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="currentCity" className="block text-sm font-medium text-gray-700">
                  Nơi ở hiện tại
                </label>
                <input
                  id="currentCity"
                  name="currentCity"
                  type="text"
                  className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Nơi ở hiện tại"
                  value={formData.currentCity}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="hometown" className="block text-sm font-medium text-gray-700">
                  Quê quán
                </label>
                <input
                  id="hometown"
                  name="hometown"
                  type="text"
                  className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Quê quán"
                  value={formData.hometown}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Giới thiệu bản thân
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Giới thiệu ngắn về bản thân"
                  value={formData.bio}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {registerError && (
            <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-lg">
              {registerError}
            </div>
          )}

          <div className="flex justify-between space-x-4">
            {step === 2 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Quay lại
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </div>
              ) : step === 1 ? (
                'Tiếp theo'
              ) : (
                'Hoàn thành đăng ký'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage; 