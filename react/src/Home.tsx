import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer, Flip } from 'react-toastify';
import './assets/bootstrap/bootstrap.min.css';
import './Home.css';
import './index.css';

function Home() {
    const [user, setUser] = useState<user | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function GetUser() {
            const res : response = await window.api.GetCurrentUser();
            console.log(res);
            if (res.success && res.data) {
                setUser(res.data);
            }
            else {
                toast.error("There was an error verifying your credentials. Redirecting to login...");
                setTimeout(() => navigate('/'), 3000); // 3s delay
            }
        };

        GetUser();
    }, []);

    return (
        <>
        <ToastContainer limit={1} transition={Flip} />
        <div>
            
        </div>
        </>
    )
}

export default Home;
