import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer, Flip } from 'react-toastify';
import './assets/bootstrap/bootstrap.min.css';
import './assets/bootstrap/bootstrap.bundle.min'
import './Home.css';
import './index.css';

import GridSystem from './GridSystem.tsx';

function Home() {
    const [user, setUser] = useState<user | null>(null);
    const [projects, setProjects] = useState<project[]>([]);
    const [selectedProject, setSelectedProject] = useState<project | null>(null);
    const navigate = useNavigate();
    const gridRef = useRef<any>(null);

    function HandleProjectChange(id : number) : void {
        const proj : project | undefined = projects.find((p : project) => p.id == id);
        if (proj) {
            setSelectedProject(proj);
        }
    }

    // Calls AddWidget in GridSystem component
    function StageWidget() : void {
        if (gridRef.current) {
            gridRef.current.StageWidget();
        }
    }

    useEffect(() => {
        // Fetches the currently logged in user
        async function FetchUser() {
            const res : response = await window.api.GetCurrentUser();
            if (res.data) {
                setUser(res.data);
            }
            // No user logged in
            else {
                toast.error("Whoops! Looks like your login has expired");
                setTimeout(() => navigate('/'), 3000); // 3s delay
            }
        }

        FetchUser();
    }, []);

    useEffect(() => {
        // Fetches the user's projects
        async function FetchProjects(username : string) {
            const res : response = await window.api.GetProjects(username);
            if (res.err) {
                toast.error("Error retrieving projects");
            }
            else {
                setProjects(res.data);
            }
        }
        if (user) {
            FetchProjects(user.username);
        }
    }, [user]);

    return (
        <>
        <ToastContainer limit={1} transition={Flip} />
        <div className="home-container">
            <div className="sidebar">
                <button className="user-info d-flex align-items-center">
                    <img className="mt-2 ms-2" src="/default_pfp.png"></img>
                    {user ? <h5 className="ms-2">{user.f_name} {user.l_name}</h5> : <h5>Loading...</h5>}
                </button>
            </div>
            <div className="navbar">
                <div className="dropdown">
                    <button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown">
                        {selectedProject ? selectedProject.name : "Select Palette"}
                    </button>
                    <ul className="dropdown-menu">
                        {projects.length ? (projects.map((proj : project, index : number) => (
                            <li key={proj.id}>
                                <a className="dropdown-item" href="#" onClick={() => HandleProjectChange(proj.id)}>
                                    {proj.name}
                                </a>
                            </li>
                        ))) : (<li>
                                <h6 className="dropdown-item">
                                    No projects found. Create one below
                                </h6>
                              </li>)}
                    </ul>
                    <button onClick={()=>StageWidget()}>New widget</button>
                </div>
            </div>
            <div className="content">
                <GridSystem project={selectedProject} ref={gridRef} />
            </div>
        </div>
        </>
    )
}

export default Home;
