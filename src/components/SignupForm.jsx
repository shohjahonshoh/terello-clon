import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignupForm = () => {
  const navigate = useNavigate(); 
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [otpCode, setOtpCode] = useState(''); // OTP kod uchun holat
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password === formData.confirmPassword) {
      try {
        const response = await axios.post('http://95.130.227.110:8000/api/auth/signup/', { 
          username: formData.username, 
          password: formData.password,
          email: formData.email
        });

        if (response.status !== 201) {
          throw new Error('API xatolik: ' + response.statusText);
        }

        console.log('Forma yuborildi:', response.data);

        // API dan olingan OTP kodini saqlash
        setOtpCode(response.data.otpCode);

        // Modal oynasini ochish
        setIsModalOpen(true);

        // API dan login orqali token olish
        const tokenResponse = await axios.post('http://95.130.227.110:8000/api/auth/login/', {
          username: formData.username,
          password: formData.password,
        });

        // Tokenni localStorage'ga saqlash
        localStorage.setItem('access_token', tokenResponse.data.access);
        console.log('Token saqlandi:', tokenResponse.data.access);

      } catch (error) {
        setError(error.message);
      }
    } else {
      alert('Parollar mos kelmadi!');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    navigate('/login'); 
  };

  const isFormValid = formData.email && formData.password && formData.password === formData.confirmPassword;

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg max-w-sm w-full">
        <h2 className="text-2xl font-semibold text-center mb-6">Ro'yxatdan o'tish</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form className='drop-shadow-xl' onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Foydalanuvchi nomi:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Foydalanuvchi nomini kiriting"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Emailni kiriting"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Parol:</label>
            <input
              type="password"
              name="password"
              placeholder="Parolni kiriting"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700">Parolni tasdiqlash:</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Parolni qayta kiriting"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 rounded-md font-semibold ${isFormValid ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
            disabled={!isFormValid}
          >
            Ro'yxatdan o'tish
          </button>
          <div className="text-center mt-4">
            <Link to="/login" className="text-blue-500 hover:underline">
              Allaqachon akkountingiz bormi?
            </Link>
          </div>
        </form>
      </div>

      {/* Modal oynasi */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white text-center p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg text-green-500 font-semibold mb-4"><i className="fa fa-check-circle" aria-hidden="true"></i>Successfull </h3>
            <p>Regestrasiyadan muvofaqiyatli o'tdingiz!</p>
            <div className="mt-4">
              <button onClick={handleCloseModal} className="bg-blue-500 text-white py-2 px-4 rounded-md">
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupForm;
