import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer, Flip } from 'react-toastify';
import './assets/bootstrap/bootstrap.min.css';
import './Login.css';
import './index.css';

function Login() {
    const [form, setForm] = useState({username:"", password:""});
    const navigate = useNavigate();

    function HandleChange(e: React.ChangeEvent<HTMLInputElement>) : void {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

    async function LoginUser() {
        toast.dismiss();
        if (form.username.length && form.password.length) {
            const res : response = await window.api.LoginUser(form.username, form.password);
            if (res.err) {
                toast.error("An internal error has occured. Please try again later.");
            }
            // Successful login
            else if (res.data) {
                navigate('/home');
            }
            else {
                toast.warning("Invalid login credentials.");
            }
        }
        else {
            toast.error("Please enter a username and password.");
        }
    }

    return (
        <>
        <ToastContainer limit={1} transition={Flip} />
        <div className="shadow-lg container-fluid login-container center-container">
            <div className="about">
                <div className="about-container">
                    <h1>About</h1>
                </div>
            </div>
            <div className="login">
                <div className="login-form">
                    <h1>Login</h1>
                    <label className="form-label mt-3">Username</label>
                    <input 
                        value={form.username} onChange={HandleChange} 
                        className="form-control mb-3" 
                        name="username" type="text" 
                        placeholder="Enter username"/>

                    <label className="form-label">Password</label>
                    <input 
                        value={form.password} onChange={HandleChange} 
                        className="form-control mb-4" 
                        name="password" 
                        type="password" 
                        placeholder="Enter password"/>
                    <div className="d-grid gap-1">
                        <button onClick={LoginUser} className="btn btn-primary btn-block login-btn">Login</button> 
                        <button className="btn btn-link create-acc-btn">Create new account</button>
                    </div>
                </div>
            </div>
            <div className="info">
            </div>
        </div>
        </>
    );
}

export default Login;
