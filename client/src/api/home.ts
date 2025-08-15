import api from './api';

// Description: Handle button click interaction
// Endpoint: POST /api/home/button-click
// Request: { action: string }
// Response: { success: boolean, message: string, timestamp: string }
export const handleButtonClick = (data: { action: string }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Button click handled successfully!',
        timestamp: new Date().toISOString()
      });
    }, 800);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/home/button-click', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
}