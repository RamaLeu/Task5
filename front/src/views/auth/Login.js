/* eslint-disable react-hooks/exhaustive-deps */
import { usePulsy } from 'pulsy';
import { useNavigate } from "react-router";
import { useEffect, useState } from 'react';
import { login, validateToken } from '../../utils/authService';
import { ReactComponent as CompanyLogo } from '../../assets/img/companyLogo.svg';
function Login() {
  let [errorlist, setErrorList] = useState([])
  const [auth] = usePulsy('auth');
  let navigate = useNavigate();
  
  async function submitLogin(formData){

    const success = await login(formData.get('email'), formData.get('password'));
    if(!success){
      setErrorList(['Invalid credentials or the user is blocked. Try again.'])
    }else{
      navigate('/dashboard')
    }
  }

  useEffect(()=>{
    if(auth.authToken){
          validateToken(auth.authToken).then((isValid)=>{
            if(!isValid){
              navigate('/');
            }else{
              navigate('/dashboard')
            }
        })
    }
    }, []);

  return (
    <div className="register-window container-fluid w-100 h-100">
        <div className='col-md-6 h-100 register-half p-5'>
          <div className='company-logo-container w-100 h-25'>
            <CompanyLogo className="w-100 h-100"/>
          </div>
          {errorlist.length > 0 && 
            <div className='error-box d-flex flex-column p-2'>
                {errorlist.map((err, idx)=>{
                    return <span className='error' key={`error-${idx}`}>{err}</span>
                })}
            </div>}
            <div className='register-inner'>
                <form action={submitLogin} className='register-inner d-flex flex-column gap-3'>
                    <div className="form-group">
                        <label htmlFor="email">Email address</label>
                        <input required name="email" type="email" className="form-control" id="email" aria-describedby="emailHelp" placeholder="Enter email"/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input required name="password" type="password" className="form-control" id="password" placeholder="Password"/>
                    </div>
                    <button type="submit" className="btn btn-primary">Login</button>
                    <p className="custom-link" onClick={()=>navigate('/register')}>register</p>
                    </form>
            </div>
        </div>
    </div>
  );
}

export default Login;
