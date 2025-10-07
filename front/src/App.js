import './App.css';
import Login from './views/auth/Login';
import 'bootstrap/dist/css/bootstrap.min.css';
import {BrowserRouter, Routes, Route} from "react-router";
import Register from './views/auth/Register';
import Dashboard from './views/main/dashboard';

function App() {
  
  return (
    <div className="App">
        <BrowserRouter>
          <Routes >
            <Route path="/dashboard" element={<Dashboard/>} />
            <Route path="/register" element={<Register/>} />
            <Route path="/" element={<Login/>}/>
          </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App;
