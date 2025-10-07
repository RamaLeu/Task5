import React from 'react' 
import ReactDOM from 'react-dom/client';
import './index.scss';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import { createStore, addMiddleware } from 'pulsy';
import axios from 'axios';
import App from './App';

createStore('auth', {
  user: null,
  authToken: null,
}, { persist: true, });

addMiddleware('auth', (nextValue, prevValue, storeName) => {
  if (nextValue.authToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${nextValue.authToken}`;
  }
  return nextValue;
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
