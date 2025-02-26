import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import './GridSystem.css'

type props = {
    project : project | null;
}

function GridSystem(props : props, ref : any) {
    const NUM_COLS : number = 12;
    const NUM_ROWS : number = 10;
    const NEW_WIDGET_SIZE : number = 2;
    const STAGING : GridLayout.Layout = {
        i: 'staging',
        x: 0,
        y: 0,
        w: NEW_WIDGET_SIZE,
        h: NEW_WIDGET_SIZE,
        isResizable: false,
        isDraggable: false
    }
    const STAGED : GridLayout.Layout = {
        i: 'staged',
        x: 0,
        y: 0,
        w: NEW_WIDGET_SIZE,
        h: NEW_WIDGET_SIZE,
        isResizable: false,
        isDraggable: false
    }
    const [newWidgetName, setNewWidgetName] = useState<string>('');
    const [grid, setGrid] = useState<GridLayout.Layout[]>([]);
    const [widgets, setWidgets] = useState<widget[]>([]);
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
            alert(res.err);
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
        if (props.project) {
            FetchWidgets(props.project.id);
        }
    }, [props.project]);

    function UpdateGrid(newGrid : GridLayout.Layout[]) : void {
        // If any widget is vertically overflowing or placed in staging column
        const isOutOfBounds : boolean = newGrid.findIndex((l : GridLayout.Layout) => {
            return !isNaN(+l.i) && (l.y + l.h > NUM_ROWS || l.x < NEW_WIDGET_SIZE);
        }) !== -1;
        if (isOutOfBounds && props.project) {
            setGrid([...grid.filter((l : GridLayout.Layout) => l.i === 'staged')]); // Force FetchWidgets to update grid state
            console.log(grid);
            FetchWidgets(props.project.id);
            return;
        }
        // If widget is staged or was previously staged
        const stagedLayout = newGrid.find((l : GridLayout.Layout) => l.i === 'staged');
        if (stagedLayout) {
            // Widget moved completely out of staging area
            if (stagedLayout.x >= NEW_WIDGET_SIZE) {   
                // Create widget in database
                if (props.project) {
                    SaveWidget(props.project.id, newWidgetName, stagedLayout).then((newWidgetId : number) => {
                        if (newWidgetId != -1 && props.project) {
                            stagedLayout.i = newWidgetId.toString(); // Update layout id
                            stagedLayout.isResizable = true;
                            // Add new widget
                            setWidgets([...widgets, {
                                id: newWidgetId,
                                project_id: props.project.id,
                                name: newWidgetName // Value of form on staged widget
                            }]);
                            newGrid.push(STAGING); // Show staging area
                        }
                        else {
                            return; // Prevent grid state update on error
                        }
                        setNewWidgetName(''); // Reset name input
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
            setGrid(newGrid);
            SaveGrid(newGrid);
        }
        // Project not selected
        else {
            alert("Error: cannot find selected project.");
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
            setWidgets(widgets.filter((w : widget) => w.id !== -1));
            setGrid([...grid.filter((l : GridLayout.Layout) => l.i !== 'staging'), STAGED]);
        }
        
    }

    // Creates new widget in database, returns widget id
    async function SaveWidget(projectId : number, name : string, layout: GridLayout.Layout) : Promise<number> {
        const res : response = await window.api.CreateWidget(projectId, name, layout);
        if (res.err) {
            alert(res.err);
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

    function HandleWidgetNameChange(e : React.ChangeEvent<HTMLInputElement>) {
        setNewWidgetName(e.target.value);
    }
    
  // Expose to parent component (Home.tsx)
  useImperativeHandle(ref, () => ({
    StageWidget,
  }));
  
  return (
    <>
    <GridLayout
      className="layout"
      layout={grid}
      cols={NUM_COLS}
      maxRows={NUM_ROWS}
      rowHeight={windowSize.height * 0.89 / NUM_ROWS} // Height of each row
      width={windowSize.width * 0.87} // Total grid width

      // UpdateGrid only runs when user interacts with grid
      onDragStart={() => {
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
            if (l.i === 'staged') {
                // Allow dragging if name meets constraints
                if (newWidgetName.length >= 3 && newWidgetName.length <= 20) {
                    l.isDraggable = true;
                }
                else {
                    // SHOW POPUP
                    l.isDraggable = false;
                }
            }
            return (
                <div
                    key={l.i}
                    data-grid={{
                        ...l,
                        static: l.i === 'staging',
                    }}
                    className={
                        l.i === 'staging' || l.i === 'staged' ? l.i : 'widget'
                    }
                >
                    {widget ? (<h3>{widget.name}</h3>) : (
                        l.i === 'staged' ? (
                            <input
                                type='text'
                                placeholder='Enter widget name'
                                value={newWidgetName}
                                onChange={HandleWidgetNameChange}
                                onMouseDown={(e) => e.stopPropagation()} // Prevents dragging when clicking the input
                            />
                        ) : ''
                    )}
                </div>
            );
        })}
    </GridLayout>
    </>
  );
}

export default forwardRef(GridSystem);
