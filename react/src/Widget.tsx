import { useState, useEffect } from 'react';
import './assets/bootstrap/bootstrap.min.css';
import './assets/bootstrap/bootstrap.bundle.min'
import './index.css';
import './Widget.css';
import Modal from './Modal.tsx';
import Todo from './Todo.tsx';

type props = {
    widget : widget;
};
function Widget (props : props) {
    const [widgetData, setWidgetData] = useState<widget_data[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingData, setEditingData] = useState<widget_data | null>(null);

    const WIDGET_PROPS = {
        updateData: UpdateData,
        deleteData: DeleteData,
        toggleModal: (open : boolean, data? : widget_data) => {
            setIsModalOpen(open);
            setEditingData(data ? data : null);
        }
    };

    const MODAL_PROPS = {
        widget: props.widget,
        createData: CreateData,
        updateData: UpdateData,
        isOpen: isModalOpen,
        closeModal: () => {
            setIsModalOpen(false);
        }
    };

    useEffect(() => {
        async function FetchWidgetData(widget_id : number) {
            const res : response = await window.api.GetWidgetData(widget_id);
            if (res.err) {
                console.log(res);
            }
            else {
                console.log(res);
                setWidgetData(res.data);
            }
        }
        if (props.widget) {
            FetchWidgetData(props.widget.id);
        }
    }, []);

    async function UpdateData(data : widget_data) : Promise<void> {
        // Replace old data entry with updated data
        const newData = [...widgetData.filter((d : widget_data) => d.id !== data.id), data];
        setWidgetData(newData);

        const res : response = await window.api.UpdateWidgetData(data);
        if (res.err) {
            console.log(res);
        }
    }

    async function CreateData(data : widget_data) : Promise<void> {
        const { id, ...filteredData } = data; // Ensure no id property
        data.widget_id = props.widget.id;

        const res : response = await window.api.CreateWidgetData(filteredData);
        if (res.err) {
            console.log(res);
        }
        else {
            data.id = res.data; // Append generated id to data
            setWidgetData([...widgetData, data]);
        }
    }

    async function DeleteData(data : widget_data) : Promise<void> {
        if (data.id) {
            const res : response = await window.api.DeleteWidgetData(data.id, props.widget.id);
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
        <Modal {...MODAL_PROPS} data={editingData}/>
        
        {(() => {
            switch (props.widget.widget_type) {
                case 'todo':
                    return <Todo {...WIDGET_PROPS} data={widgetData} />;
                default:
                    return <p>Loading widget...</p>;
            }
        })()
        }
        </>
    )
}

export default Widget;
