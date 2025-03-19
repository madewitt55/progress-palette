import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

type props = {
    widget : widget;
    data : widget_data | null;
    createData : (data : widget_data) => void;
    updateData : (data : widget_data) => void;
    isOpen : boolean;
    closeModal : () => void;
}
export default function Modal(props : props) {
    // Holds default values for all possible fields a widget data entry could have
    const DEFAULT_DATA : widget_data = {
        widget_id: props.widget.id,
        name: '',
        is_completed: 0
    }
    console.log(props.data);
    const [formData, setFormData] = useState<widget_data>(DEFAULT_DATA);

    useEffect(() => {
        if (props.data) {
            setFormData(props.data);
        }
    }, [props.data])

    function HandleFormChange(e : React.ChangeEvent<any>) : void {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }
    function SubmitForm() : void {
        // If data is passed to props, data is being edited
        if (props.data) {
            props.updateData(formData);
        }
        // Else, data is being created
        else {
            props.createData(formData);
        }
        setFormData(DEFAULT_DATA);
        props.closeModal();
    }
    const CREATE_TODO : React.ReactNode = (
        <>
        <label>Task name</label>
        <input
            type="text"
            name="name"
            value={formData?.name}
            onChange={(e) => HandleFormChange(e)}
            placeholder="Enter task name"
        />
        <br/>
        <button
            onClick={() => {SubmitForm()}}
        >
            Create
        </button>
        <br/>
        </>
    );
    const EDIT_TODO : React.ReactNode = (
        <>
        <label>Task name</label>
        <input
            type="text"
            name="name"
            value={props.data?.name}
            onChange={(e) => HandleFormChange(e)}
            placeholder="Edit task name"
        />
        <br/>
        <button
            onClick={() => {SubmitForm()}}
        >
            Edit
        </button>
        <br/>
        </>
    );
    
    function LoadForm() : React.ReactNode {
        // Editing
        if (props.data) {
            switch(props.widget.widget_type) {
                case 'todo':
                    return EDIT_TODO;
                default:
                    return <p>Loading form...</p>;
            }
        }
        // Creating
        else {
            switch(props.widget.widget_type) {
                case 'todo':
                    return CREATE_TODO;
                default:
                    return <p>Loading form...</p>;
            }
        }
    }

    return (
        props.isOpen ? createPortal(
            <div
            className='modal-container'
            >
                <div className='modal-body'>
                    {LoadForm()}
                    <button onClick={() => {
                        setFormData(DEFAULT_DATA);
                        props.closeModal();
                    }}>Close</button>
                </div>
            </div>,
            document.body
        ) : null
    );
}
