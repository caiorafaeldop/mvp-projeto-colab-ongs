import api from './api';

// Description: Login user with email and password
// Endpoint: POST /api/auth/login
// Request: { email: string, password: string }
// Response: { success: boolean, user: { _id: string, name: string, email: string, userType: string }, token: string, message: string }
export const loginUser = (data: { email: string; password: string }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        user: {
          _id: 'user_' + Date.now(),
          name: 'João Silva',
          email: data.email,
          userType: 'buyer'
        },
        token: 'mock_jwt_token_' + Date.now(),
        message: 'Login realizado com sucesso!'
      });
    }, 800);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/auth/login', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
}

// Description: Register new user
// Endpoint: POST /api/auth/register
// Request: { name: string, email: string, password: string, phone: string, userType: string }
// Response: { success: boolean, user: { _id: string, name: string, email: string, userType: string }, token: string, message: string }
export const registerUser = (data: { name: string; email: string; password: string; phone: string; userType: string }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        user: {
          _id: 'user_' + Date.now(),
          name: data.name,
          email: data.email,
          userType: data.userType
        },
        token: 'mock_jwt_token_' + Date.now(),
        message: 'Conta criada com sucesso!'
      });
    }, 1000);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/auth/register', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
}