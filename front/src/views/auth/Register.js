import axios from 'axios';
import '../../css/auth/Register.css'
import { useState } from 'react';
import { useNavigate } from "react-router";
import { login} from '../../utils/authService';
import { ReactComponent as CompanyLogo } from '../../assets/img/companyLogo.svg';

function Register() {
    let [errorlist, setErrorList] = useState([])
    let navigate = useNavigate();
    function submitRegister(formData){
        let data = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            passwordRepeat: formData.get('password-repeat')
        }
        let isDataValid = true
        if(data.password !== data.passwordRepeat){
            setErrorList(['Passwords do not match!'])
            isDataValid = false;
        }
        if(isDataValid){
            axios.post(process.env.REACT_APP_API_URL + '/users/new', data
                ).then(async (res)=>{
                if(res.status === 200){
                    const success = await login(res.data.data.email, formData.get('password'));
                    if(!success){
                        setErrorList('Server error, try again later')
                    }else{
                        navigate('/dashboard')
                    }
                }else{
                    setErrorList([
                        res.data
                    ])
                }
            }).catch(err=>{
                if(err.response){
                    setErrorList([
                            err.response.data.error
                        ])
                }
            })
        }
    }
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
                <form action={submitRegister} className='register-inner d-flex flex-column gap-3'>
                    <div className="form-group d-flex flex-column gap-1">
                        <label htmlFor="nameInput d-f">Username <span className='red-asterisk'>*</span></label>
                        <input required name="name" type="text" className="form-control" id="name" placeholder="Username"/>
                    </div>
                    <div className="form-group d-flex flex-column gap-1">
                        <label htmlFor="email">Email address <span className='red-asterisk'>*</span></label>
                        <input required name="email" type="email" className="form-control" id="email" aria-describedby="emailHelp" placeholder="Enter email"/>
                    </div>
                    <div className="form-group d-flex flex-column gap-1">
                        <label htmlFor="password">Password <span className='red-asterisk'>*</span></label>
                        <input required name="password" type="password" className="form-control" id="password" placeholder="Password"/>
                    </div>
                    <div className="form-group d-flex flex-column gap-1">
                        <label htmlFor="password">Repeat password <span className='red-asterisk'>*</span></label>
                        <input required name="password-repeat" type="password" className="form-control" id="password-repeat" placeholder="Repeat password"/>
                    </div>
                    <button type="submit" className="btn btn-primary">Register</button>
                    </form>
                <p onClick={(e)=>{navigate('/')}} className='custom-link'>Back to login</p>
            </div>
        </div>
    </div>
  );
}

export default Register;
