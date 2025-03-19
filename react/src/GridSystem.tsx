import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import GridLayout from "react-grid-layout";
import Widget from './Widget.tsx';
import './assets/bootstrap/bootstrap.min.css';
import './assets/bootstrap/bootstrap.bundle.min'
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import './GridSystem.css';

type props = {
    project : project | null;
    setIsWidgetStaged: (bool : boolean) => void;
    callToast: (type : string, message : string) => void;
}

function GridSystem(props : props, ref : any) {
    // Generic database error message
    const DB_ERROR_MESSAGE : string = `Database error has occured. 
    Contact support or try again later.`
    const NUM_COLS : number = 8;
    const NUM_ROWS : number = 8;
    const NEW_WIDGET_SIZE : number = 1;
    const STAGING : GridLayout.Layout = {
        i: 'staging',
        x: 0,
        y: 0,
        w: NEW_WIDGET_SIZE,
        h: NEW_WIDGET_SIZE,
        static: true // Staging area does not move
    }
    const STAGED : GridLayout.Layout = {
        i: 'staged',
        x: 0,
        y: 0,
        w: NEW_WIDGET_SIZE,
        h: NEW_WIDGET_SIZE,
        isResizable: false,
        isDraggable: false // Undraggable until inputted name meets restraints
    }
    const [newWidgetName, setNewWidgetName] = useState<string>('');
    const [newWidgetType, setNewWidgetType] = useState<string>('todo');
    const [grid, setGrid] = useState<GridLayout.Layout[]>([]);
    const [widgets, setWidgets] = useState<widget[]>([]);
    const [widgetTypes, setWidgetTypes] = useState<widget_type[]>([]);
    // Differentiates user grid interactions from grid state changes
    const userInteracting = useRef(false);

    // Dynamically store window size
    type window = {
        width : number;
        height : number;
    }
    const [windowSize, setWindowSize] = useState<window>({
        width: window.innerWidth,
        height: window.innerHeight
    });
    useEffect(() => {
        function HandleWindowResize() : void {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        }
        window.addEventListener('resize', HandleWindowResize);
    }, []);

    // Retrieves all widgets from database
    async function FetchWidgets(projectId : number) : Promise<void> {
        const res : response = await window.api.GetWidgets(projectId);
        if (res.err) {
            props.callToast('error', DB_ERROR_MESSAGE);
        }
        else {
            setWidgets(res.data.widgets);
            const stagedLayout = grid.find((l : GridLayout.Layout) => {
                return l.i === 'staged'
            }); 
            // If widget is staged from previous state, keep it
            if (stagedLayout) {
               UpdateGrid([...res.data.layouts, stagedLayout]) 
            }
            else {
                UpdateGrid([...res.data.layouts, STAGING]);
            }
        }
    }
    // Fetch widgets on project change
    useEffect(() => {
        async function FetchWidgetTypes() {
            const res : response = await window.api.GetWidgetTypes();
            if (res.err) {
                props.callToast('error', 'Error retrieving widget types');
            }
            else {
                setWidgetTypes(res.data);
            }
        }
        if (props.project) {
            FetchWidgets(props.project.id);
            FetchWidgetTypes();
        }
    }, [props.project]);

    function UpdateGrid(newGrid : GridLayout.Layout[]) : void {
        if (!props.project) {
            return;
        }
        const projectId : number = props.project.id;

        const isOutOfBounds : boolean = newGrid.some((l : GridLayout.Layout) => {
            return !isNaN(+l.i) && (l.y + l.h > NUM_ROWS || l.x < NEW_WIDGET_SIZE);
        });
        // Invalid widget placement
        if (isOutOfBounds) {
            props.callToast('warn', 'Invalid widget placement. All widgets must remain inside the grid.');
            // Reset grid to only include staged widget
            setGrid([...grid.filter((l : GridLayout.Layout) => l.i === 'staged')]); 
            FetchWidgets(projectId);
            return;
        }
        
        // If widget is staged or was previously staged
        const stagedLayout : GridLayout.Layout | undefined = newGrid.find((l : GridLayout.Layout) => l.i === 'staged');
        if (stagedLayout) {
            // Widget moved completely out of staging area
            if (stagedLayout.x >= NEW_WIDGET_SIZE) {
                // If widget of same name and type already exists in project
                const isWidgetDuplicate : boolean = widgets.some((w : widget) => {
                    return w.name === newWidgetName && w.widget_type === newWidgetType
                });
                if (isWidgetDuplicate) {
                    props.callToast('warn', 'Two widgets must not have the same name and type.');
                    // Reset grid to only include staged widget
                    setGrid([...grid.filter((l : GridLayout.Layout) => l.i === 'staged')]); 
                    FetchWidgets(projectId);
                    return;
                }  
                // Create widget in database
                if (props.project) {
                    SaveWidget(props.project.id, newWidgetName, stagedLayout).then((newWidgetId : number) => {
                        if (newWidgetId != -1 && props.project) {
                            stagedLayout.i = newWidgetId.toString(); // Update layout id
                            stagedLayout.isResizable = true;
                            stagedLayout.isDraggable = true;
                            // Add new widget
                            setWidgets([...widgets, {
                                id: newWidgetId,
                                project_id: props.project.id,
                                name: newWidgetName, // Value of form on staged widget
                                widget_type: newWidgetType
                            }]);
                            setNewWidgetName(''); // Reset name input
                            setNewWidgetType('todo');
                            props.setIsWidgetStaged(false);
                            newGrid.push(STAGING); // Show staging area

                            // Save new grid
                            setGrid(newGrid);
                            SaveGrid(newGrid);
                            return;
                        }
                        else {
                            return; // Prevent grid state update on error
                        }
                    });
                }
            }
            // Widget moved paritally out of staging area
            else if (stagedLayout.x > 0 || stagedLayout.w > NEW_WIDGET_SIZE || stagedLayout.h > NEW_WIDGET_SIZE) {
                // Move back to staging
                stagedLayout.x = 0;
                stagedLayout.y = 0;
            }
        }

        if (props.project) {
            // If new widget was added, saving is handled after completion of async call
            if (!(stagedLayout && stagedLayout.x >= NEW_WIDGET_SIZE)) {
                setGrid(newGrid);
                SaveGrid(newGrid);
            }
        }
        // Project not selected
        else {
            props.callToast('error', 'Selected project not found. Please try again.');
            setGrid([]);
            setWidgets([]);
        }
    }

    // Places new widget in staging area
    function StageWidget() {
        const isStaged : boolean = grid.findIndex((l : GridLayout.Layout) => {
            return l.i === 'staged';
        }) !== -1;
        if (!isStaged) {
            setGrid([...grid.filter((l : GridLayout.Layout) => l.i !== 'staging'), STAGED]);
            props.setIsWidgetStaged(true);
        }
    }
    // Removes widget from staging area
    function UnstageWidget() {
        const isStaged : boolean = grid.findIndex((l : GridLayout.Layout) => {
            return l.i === 'staged';
        }) !== -1;
        if (isStaged) {
            setGrid([...grid.filter((l : GridLayout.Layout) => l.i !== 'staged'), STAGING]);
            setNewWidgetName('');
            props.setIsWidgetStaged(false);
        }
    }

    // Creates new widget in database, returns widget id
    async function SaveWidget(projectId : number, name : string, layout: GridLayout.Layout) : Promise<number> {
        const res : response = await window.api.CreateWidget(projectId, name, layout);
        if (res.err) {
            props.callToast('error', DB_ERROR_MESSAGE);
            return -1;
        }
        else {
            return res.data; // New widget id
        }
    }

    // Updates all widget positions in database
    async function SaveGrid(newGrid : GridLayout.Layout[]) : Promise<void> {
        window.api.UpdateAllWidgetLayouts(newGrid);
    }

    // Deletes a widget and its layout from database, then refreshes grid
    async function DeleteWidget(widgetId : number) {
        const res : response = await window.api.DeleteWidget(widgetId);
        if (res.err) {
            props.callToast('error', DB_ERROR_MESSAGE);
        }
        else if (props.project){
            FetchWidgets(props.project.id);
        }
    }

    // Handles the editing of new widget names
    function HandleWidgetNameChange(e : React.ChangeEvent<HTMLInputElement>) {
        const newName = e.target.value;
        if (newName.length < 20) {
            setNewWidgetName(newName);
        }
        const newGrid : GridLayout.Layout[] = [...grid];
        let stagedIndex : number = newGrid.findIndex((l : GridLayout.Layout) => l.i === 'staged');
        if (stagedIndex != -1) {
            // Enable dragging only if name meets constraints
            newGrid[stagedIndex] = {
                ...newGrid[stagedIndex],
                isDraggable: newName.length >= 3 && newName.length <= 20
            }
            setGrid(newGrid);
        }
    }

    function HandleWidgetTypeChange(type : string) {
        if (props.project) {
            setNewWidgetType(type);
        }
    }

    function HandleWidgetLoadError() : void {

    }
    
  // Expose to parent component (Home.tsx)
  useImperativeHandle(ref, () => ({
    StageWidget,
    UnstageWidget,
    grid
  }));
  
  return (
    <>
    <div className="modal" id="myModal">
        <div className="modal-dialog">
            <div className="modal-content">

            <div className="modal-header">
                <h4 className="modal-title">Modal Heading</h4>
                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
                Modal body..
            </div>

            <div className="modal-footer">
                <button type="button" className="btn btn-danger" data-bs-dismiss="modal">Close</button>
            </div>

            </div>
        </div>
    </div>
    <GridLayout
      className="layout"
      layout={grid}
      cols={NUM_COLS}
      maxRows={NUM_ROWS}
      rowHeight={windowSize.height * 0.89 / NUM_ROWS} // Height of each row
      width={windowSize.width * 0.87} // Total grid width

      // UpdateGrid only runs when user interacts with grid
      onDragStart={() => {
        //e.preventDefault();
        userInteracting.current = true;
      }}
      onResizeStart={() => userInteracting.current = true}
      onLayoutChange={(newGrid : GridLayout.Layout[]) => {
        if (userInteracting.current) {
            UpdateGrid(newGrid);
        }
        userInteracting.current = false;
      }}
    >
        {grid.map((l : GridLayout.Layout) => {
            const widget = widgets.find((w : widget) => w.id.toString() === l.i);
            return (
                <div
                    key={l.i}
                    className={
                        `card ${l.i === 'staging' || l.i === 'staged' ? l.i : 'card widget'}`
                    }
                >

                    {widget ? (
                        // Existing widgets
                        <>
                        <div className='card-header'>
                            <h3>{widget.name}</h3>
                        </div>
                        <div className='card-body'>
                            <Widget
                                widget={widget}
                            />
                        </div>
                        <div className='card-footer'>
                            <button
                                onClick={() => DeleteWidget(widget.id)}
                                onMouseDown={(e) => e.stopPropagation()}
                                className='btn btn-danger'
                            >
                                Delete
                            </button>
                        </div>
                        </>
                    ) : (
                        // New staged widgets
                        l.i === 'staged' ? (
                            <>
                            {/* Name input */}
                            <input
                                type='text'
                                placeholder='Enter widget name'
                                value={newWidgetName}
                                maxLength={20}
                                onChange={HandleWidgetNameChange}
                                // Prevents dragging when clicking text input
                                onMouseDown={(e) => e.stopPropagation()}
                            />
                    
                            {/* Widget type dropdown */}
                            <div className="dropdown mt-3">
                                <button 
                                    type="button" 
                                    className="btn btn-primary dropdown-toggle dropdown-btn" 
                                    data-bs-toggle="dropdown"
                                    onMouseDown={(e) => e.stopPropagation()}
                                >
                                </button>
                                <ul className="dropdown-menu">
                                    {widgetTypes.map((type: widget_type) => (
                                        <li key={type.name}>
                                            <a className="dropdown-item" href="#" onClick={
                                                () => HandleWidgetTypeChange(type.name)
                                            }>
                                                {type.name}
                                            </a>
                                            <p>{type.description}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            </>
                            
                        ) : (
                            // Staging area
                            ''
                        ))
                    }
                </div>
            );
        })}
    </GridLayout>
    </>
  );
}

export default forwardRef(GridSystem);
