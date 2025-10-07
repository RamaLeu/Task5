import { setStoreValue} from 'pulsy';
import axios from 'axios';


export const login = async (email, password) => {
  try {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/login`, { email, password });
    const { token, user } = response.data;
    
    setStoreValue('auth', { authToken: token, user: user });
    return true;
  } catch (error) {
    console.error('Login failed', error);
    delete axios.defaults.headers.common['Authorization']
    return false;
  }
};

export const validateToken = async (token) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/validate`, {
      headers:{
        'Authorization': token ? token : axios.defaults.headers.common['Authorization']
      }
    });
    const user = response.data.user;

    // Update the store with the user info
    setStoreValue('auth', { user, authToken: token });
    return true;
  } catch (error) {
    console.error('Token validation failed', error);
    // setStoreValue('auth', { user: null, token: null });
    // delete axios.defaults.headers.common['Authorization']
    return false;
  }
};

export const logout = () => {
  setStoreValue('auth', { user: null, authToken: null });
  localStorage.removeItem('pulsy_auth');
};

export const checkForBadSession = (error, logout, navigate) =>{
  logout();
  navigate('/');
}