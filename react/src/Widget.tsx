import { useState, useEffect } from 'react';
import './assets/bootstrap/bootstrap.min.css';
import './assets/bootstrap/bootstrap.bundle.min'
import './index.css';
import Modal from './Modal.tsx';

type props = {
    widget : widget;
    widgetLoadError : () => void;
};
function Widget(props : props) {
    const EmptyData = (widget : widget) : widget_data => {
        const EMPTY : widget_data = {
            widget_id: props.widget.id,
            name: undefined,
            is_completed: undefined
        };
        switch (widget.widget_type) {
            case 'todo':
                EMPTY.name = '';
                EMPTY.is_completed = 0;
                break;     
        }
        return EMPTY;
    };

    const [widgetData, setWidgetData] = useState<widget_data[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [newWidgetData, setNewWidgetData] = useState<widget_data>(EmptyData(props.widget));
    const [isEditing, setIsEditing] = useState<boolean>(false);

    function HandleCreateFormChange(e : React.ChangeEvent<any>) {
        setNewWidgetData({
            ...newWidgetData,
            [e.target.name]: e.target.value
        });
    }

    const TODO_CREATE_FORM : React.ReactNode = (
        <>
        <label>Task name</label>
        <input
            type="text"
            name="name"
            value={newWidgetData?.name}
            onChange={(e) => HandleCreateFormChange(e)}
            placeholder="Enter task name"
        />
        <button
            onClick={() => CreateData(newWidgetData)}
        >
            Create
        </button>
        </>
    );
    const TODO_EDIT_FORM : React.ReactNode = (
        <>
        <label>Task name</label>
        <input
            type="text"
            name="name"
            value={newWidgetData?.name}
            onChange={(e) => HandleCreateFormChange(e)}
            placeholder="Edit task name"
        />
        <button
            onClick={() => UpdateData(newWidgetData)}
        >
            Edit
        </button>
        </>
    );
    const ERROR_CREATE_FORM : React.ReactNode = (
        <h1>Error loading update form</h1>
    );
    const ERROR_EDIT_FORM : React.ReactNode = (
        <h1>Error loading edit form</h1>
    );

    function LoadCreateForm(widget_type : string) : React.ReactNode {
        switch (widget_type) {
            case 'todo':
                return TODO_CREATE_FORM;
            default:
                return ERROR_CREATE_FORM;

        }
    }
    function LoadEditForm(widget_type : string) : React.ReactNode {
        switch (widget_type) {
            case 'todo':
                return TODO_EDIT_FORM;
            default:
                return ERROR_EDIT_FORM;
        }
    }

    useEffect(() => {
        async function FetchWidgetData(widget_id : number) {
            const res : response = await window.api.GetWidgetData(widget_id);
            if (res.err) {
                props.widgetLoadError();
            }
            else {
                setWidgetData(SortData(res.data));
            }
        }
        if (props.widget) {
            FetchWidgetData(props.widget.id);
        }
    }, []);

    // Sorts a widget data array based on the type of widget
    function SortData(data : widget_data[]) : widget_data[] {
        switch(props.widget.widget_type) {
            // Place completed tasks at bottom
            case 'todo':
                return data.sort((a, b) => a.is_completed! - b.is_completed!);
            default:
                return data;
        };
    }

    async function UpdateData(data : widget_data) : Promise<void> {
        // Replace old data entry with updated data
        const newData = [...widgetData.filter((d : widget_data) => d.id !== data.id), data];
        setWidgetData(SortData(newData));

        const res : response = await window.api.UpdateWidgetData(data);
        if (res.err) {
            console.log(res);
        }
    }

    async function CreateData(data : widget_data) : Promise<void> {
        //console.log("running");
        const { id, ...filteredData } = data; // Ensure no id field

        const res : response = await window.api.CreateWidgetData(filteredData);
        if (res.err) {
            console.log(res);
        }
        else {
            data.id = res.data; // Append generated id to data
            setWidgetData(SortData([...widgetData, data]));
        }
    }

    async function DeleteData(data : widget_data) : Promise<void> {
        if (data.id) {
            const res : response = await window.api.DeleteWidgetData(data.id, data.widget_id);
            if (res.err) {
                console.log(res);
            }
            else {
                setWidgetData([...widgetData.filter((d : widget_data) => d.id != data.id)]);
            }
        }
    }
     
    return (
        <>
        <Modal
            isOpen={isModalOpen}
            setOpen={(open : boolean) => {
                setIsModalOpen(open);
                if (!open) {
                    setNewWidgetData(EmptyData(props.widget)); // Clear form data on modal close
                    setIsEditing(false);
                }
            }}
        >
            {isEditing ? LoadEditForm(props.widget.widget_type) :
            LoadCreateForm(props.widget.widget_type)}
        </Modal>
            {props.widget.widget_type === 'todo' ? (
                <div>
                    <ul>
                        {widgetData.map((data : widget_data) => (
                            <li
                                key={data.id}
                            >
                                <label>{data.name}</label>
                                <input 
                                    type="checkbox" 
                                    checked={Boolean(data.is_completed)} 
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onChange={(e) => UpdateData({
                                        ...data,
                                        is_completed: Number(e.target.checked)
                                    })}
                                />
                                <button
                                    onClick={() => DeleteData(data)}
                                    onMouseDown={(e) => e.stopPropagation()}
                                >
                                    Delete
                                </button>
                                <button
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={() => {
                                        setNewWidgetData(data);
                                        setIsModalOpen(true);
                                        setIsEditing(true);
                                    }}
                                >
                                    Edit
                                </button>
                            </li>
                        ))}
                    </ul>
                    <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={() => setIsModalOpen(true)}
                    >
                        Add
                    </button>
                </div>
            ) : null}
        </>
    )
}

export default Widget;
