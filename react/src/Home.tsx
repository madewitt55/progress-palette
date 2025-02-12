import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer, Flip } from 'react-toastify';
import './assets/bootstrap/bootstrap.min.css';
import './assets/bootstrap/bootstrap.bundle.min'
import './Home.css';
import './index.css';

function Home() {
    const [user, setUser] = useState<user | null>(null);
    const [projects, setProjects] = useState<project[]>([]);
    const [selectedProject, setSelectedProject] = useState<project | null>(null);
    const navigate = useNavigate();

    function HandleProjectChange(id : number) : void {
        const proj : project | undefined = projects.find((p : project) => p.id == id);
        if (proj) {
            setSelectedProject(proj);
        }
    }

    useEffect(() => {
        async function GetUser() {
            const res : response = await window.api.GetCurrentUser();
            if (res.success && res.data) {
                setUser(res.data);
            }
            // Database error or no user logged in
            else {
                toast.error("There was an error verifying your credentials. Redirecting to login...");
                setTimeout(() => navigate('/'), 3000); // 3s delay
            }
        }

        GetUser();
    }, []);

    useEffect(() => {
        async function GetProjects(username : string) {
            const res : response = await window.api.GetProjects(username);
            if (res.success) {
                setProjects(res.data);
            }
            else {
                toast.error("Error retrieving projects");
            }
        }
        if (user) {
            GetProjects(user.username);
        }
    }, [user]);

    return (
        <>
        <ToastContainer limit={1} transition={Flip} />
        <div className="home-container">
            <div className="sidebar">
                
            </div>
            <div className="navbar">
                <div className="dropdown">
                    <button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown">
                        {selectedProject ? selectedProject.name : "Select project"}
                    </button>
                    <ul className="dropdown-menu">
                        {projects.map((proj : project, index : number) => (
                            <li key={index}>
                                <a id={proj.id.toString()} className="dropdown-item" href="#" 
                                    onClick={() => HandleProjectChange(proj.id)}>{proj.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="content">

            </div>
        </div>
        </>
    )
}

export default Home;
