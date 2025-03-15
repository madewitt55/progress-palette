import React from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';


type props = {
    isOpen : boolean;
    children : React.ReactNode;
    setOpen : (open : boolean) => void;
}
export default function Modal(props : props) {
  return (
    props.isOpen ? createPortal(
        <div
            className='modal-container'
        >
            <div className='modal-body'>
                {props.children}
                <button onClick={() => props.setOpen(false)}>Close</button>
            </div>
        </div>,
        document.body
    ) : null
  );
}
