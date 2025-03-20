import { useState, useEffect } from 'react';
import './assets/bootstrap/bootstrap.min.css';
import './assets/bootstrap/bootstrap.bundle.min'
import './index.css';
import './Widget.tsx';
import './Todo.css';

type props = {
    data : widget_data[];
    updateData : (data : widget_data) => void;
    deleteData : (data : widget_data) => void;
    toggleModal : (open : boolean, data? : widget_data) => void;
};
function Todo(props : props) {
    const [widgetData, setWidgetData] = useState<widget_data[]>([]);

    useEffect(() => {
        if (props.data) {
            setWidgetData(SortData(props.data));
        }
    }, [props.data]);

    // Sorts data based on completion
    function SortData(data : widget_data[]) : widget_data[] {
        return data.sort((a, b) => a.is_completed! - b.is_completed!);
    }

    return (
        <div>
            <ul>
                {widgetData.map((data : widget_data) => (
                    <li
                        key={data.id}
                    >
                        <h4
                            className={`todo-item ${data.is_completed ? 'completed' : 'incomplete'}`}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={() => {
                                props.updateData({
                                    ...data,
                                    is_completed: data.is_completed! ^ 1
                                })
                            }}
                        >
                            {data.name}
                        </h4>
                        
                        <button
                            onClick={() => props.deleteData(data)}
                            onMouseDown={(e) => e.stopPropagation()}
                            className='btn btn-danger'
                        >
                            Delete
                        </button>
                        <button
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={() => {
                                props.toggleModal(true, data);
                            }}
                            className='btn btn-warning'
                        >
                            Edit
                        </button>
                    </li>
                ))}
            </ul>
            <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => props.toggleModal(true)}
                className='btn btn-success'
            >
                Add
            </button>
        </div>
    )
}

export default Todo;
