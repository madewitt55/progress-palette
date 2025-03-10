import { useState, useEffect, useRef } from 'react';
import './assets/bootstrap/bootstrap.min.css';
import './assets/bootstrap/bootstrap.bundle.min'
import './index.css';

type props = {
    widget : widget;
    widgetLoadError : () => void;
};
function Widget(props : props) {
    const [widgetData, setWidgetData] = useState<widget_data[]>([]);

    useEffect(() => {
        async function FetchWidgetData(widget_id : number) {
            const res : response = await window.api.GetWidgetData(widget_id);
            if (res.err) {
                props.widgetLoadError();
            }
            else {
                setWidgetData(res.data);
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
        const newData = [...widgetData.filter((d : widget_data) => d.id !== data.id), data];
        setWidgetData(SortData(newData));

        const res : response = await window.api.UpdateWidgetData(data);
        if (res.err) {
            console.log(res);
        }
    }

    async function CreateData(data : widget_data) : Promise<void> {
        const { id, ...filteredData } = data; // Ensure no id field

        const res : response = await window.api.CreateWidgetData(filteredData);
        if (res.err) {
            console.log(res);
        }
        else {
            data.id = res.data; // Append generated id to data
            setWidgetData(SortData([...widgetData, data]));
            console.log([...widgetData, data]);
        }
    }
    
    return (
        <>
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
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => CreateData({
                            widget_id: props.widget.id,
                            name: 'munt',
                            is_completed: 0
                        })}>Add</button>
                    </div>
                ) : null}
        </>
    )
}

export default Widget;
