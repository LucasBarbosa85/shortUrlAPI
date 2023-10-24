import axios from 'axios';

const API_URL = 'http://localhost:3000'; 
const TOKEN_KEY = 'user_token';

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/login`, { username, password });
    if (response.data.token) {
      
      localStorage.setItem(TOKEN_KEY, response.data.token);
      return true;
    }
    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const logout = () => {
 
  localStorage.removeItem(TOKEN_KEY);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const isAuthenticated = () => {
  
  const token = getToken();
  if (token) {
    
    const decoded = parseJwt(token);
    if (decoded && decoded.exp > Math.floor(Date.now() / 1000)) {
      return true;
    }
  }
  return false;
};

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};