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
    const [isWidgetStaged, setIsWidgetStaged] = useState<boolean>(false);
    const navigate = useNavigate();
    const gridRef = useRef<any>(null);

    // Handles selecting project from dropdown
    function HandleProjectChange(id : number) : void {
        const proj : project | undefined = projects.find((p : project) => p.id == id);
        if (proj) {
            setSelectedProject(proj);
        }
    }

    // Stages a widget in GridSystem component
    function StageWidget() : void {
        if (gridRef.current && !isWidgetStaged) {
            gridRef.current.StageWidget();
        }
    }
    // Cancels the staged widget in GridSystem component
    function UnstageWidget() : void {
        if (gridRef.current && isWidgetStaged) {
            gridRef.current.UnstageWidget();
        }
    }

    // Allows GridSystem to create toasts
    function CallToast(type : string, message : string) : void {
        switch (type) {
            case 'success':
                toast.success(message);
                break;
            case 'error':
                toast.error(message);
                break;
            case 'info':
                toast.info(message);
                break;
            case 'warn':
                toast.warn(message);
                break;
            default:
                toast(message);
        }
    }

    // Initial mount
    useEffect(() => {
        // Fetches the currently logged in user
        async function FetchUser() : Promise<void> {
            const res : response = await window.api.GetCurrentUser();
            if (res.data) {
                setUser(res.data);
            }
            // No user logged in
            else {
                toast.error("No user logged in");
                setTimeout(() => navigate('/'), 3000); // 3s delay
            }
        }

        FetchUser();
    }, []);

    useEffect(() => {
        // Fetches the user's projects
        async function FetchProjects(username : string) : Promise<void> {
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
                {/* User settings button */}
                <button className="user-info d-flex align-items-center">
                    <img className="mt-2 ms-2" src="/default_pfp.png"/>
                    {user ? <h5 className="ms-2">{user.f_name} {user.l_name}</h5> : 
                    <h5>Loading...</h5>}
                </button>
            </div>
            <div className="navbar">
                {/* Select project dropdown */}
                <div className="dropdown">
                    <button 
                        type="button" 
                        className="btn btn-primary dropdown-toggle" 
                        data-bs-toggle="dropdown"
                    >
                        {selectedProject ? selectedProject.name : "Select Palette"}
                    </button>
                    <ul className="dropdown-menu">
                        {projects.length ? (projects.map((proj : project) => (
                            <li key={proj.id}>
                                <a className="dropdown-item" href="#" onClick={
                                    () => HandleProjectChange(proj.id)
                                }>
                                    {proj.name}
                                </a>
                            </li>
                        ))) : (<li>
                                <h6 className="dropdown-item">
                                    No projects found. Create one below
                                </h6>
                              </li>)}
                    </ul>
                    {/* Create widget or cancel staged widget */}
                    {selectedProject && gridRef.current ? (
                        <button onClick={
                            () => isWidgetStaged ? UnstageWidget() : StageWidget()
                        }>{isWidgetStaged ? 'Cancel' : 'New widget'}</button>
                    ) : (
                        ''
                    )}
                </div>
            </div>
            <div className="content">
                {/* Grid displaying all project widgets */}
                <GridSystem 
                    project={selectedProject} 
                    setIsWidgetStaged={setIsWidgetStaged}
                    callToast={CallToast}
                    ref={gridRef} 
                />
            </div>
        </div>
        </>
    )
}

export default Home;
