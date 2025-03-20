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
    const [formData, setFormData] = useState<widget_data>(DEFAULT_DATA);

    useEffect(() => {
        if (props.data) {
            setFormData(props.data);
        }
        else {
            setFormData(DEFAULT_DATA);
        }
    }, [props.data]);

    function HandleFormChange(e : React.ChangeEvent<any>) : void {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }
    function SubmitForm(e: React.FormEvent<HTMLFormElement>) : void {
        e.preventDefault();
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
            <div className='card'>
                <div className='card-header'>
                    <h4 className='modal-title'>Create Task</h4>
                </div>
                <div className='card-body'>
                    <form
                        className={(formData?.name ?? '').length > 3 ? 'was-validated' : 'needs-validation'}
                        noValidate
                        onSubmit={(e) => {SubmitForm(e)}}
                    >
                            <div className='name-input'>
                                <label className='form-label mb-0'>Task name</label>
                                <input
                                    className={`form-control mb-1  
                                        ${(formData?.name ?? '').length < 3 ?
                                            'is-invalid' : 'is-valid'
                                        }`
                                    }
                                    type="text"
                                    name="name"
                                    value={formData?.name}
                                    minLength={3}
                                    maxLength={20}
                                    onChange={(e) => HandleFormChange(e)}
                                    placeholder="Task name"
                                    required
                                />
                                <div className='invalid-feedback'>Name must be between 3 and 20 characters</div>
                            </div>
                        <div className='card-footer mt-4'>
                            <div className='btn-group mx-auto'>
                                <button
                                    className='btn btn-primary'
                                    type='submit' 
                                    disabled={(formData?.name ?? '').length < 3}
                                >
                                    Create
                                </button>
                                <button 
                                    onClick={() => {
                                        props.closeModal();
                                        setFormData(DEFAULT_DATA);
                                    }}
                                    className='btn btn-danger'
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
    const EDIT_TODO : React.ReactNode = (
        <>
        <label>Task name</label>
        <input
            type="text"
            name="name"
            value={formData.name}
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
                <div className='modal-view'>
                    {LoadForm()}
                </div>
            </div>,
            document.body
        ) : null
    );
}
