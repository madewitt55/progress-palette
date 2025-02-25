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
    const [grid, setGrid] = useState<GridLayout.Layout[]>([]);
    const [widgets, setWidgets] = useState<widget[]>([]);
    // Differentiates user grid interactions from grid state changes
    const userInteracting = useRef(false);
    const STAGING = {
        widget: {
            id: -1,
            project_id: 0,
            name: ''
        },
        layout: {
            i: 'staging',
            x: 0,
            y: 0,
            w: NEW_WIDGET_SIZE,
            h: NEW_WIDGET_SIZE
        }
    }
    const STAGED = {
        widget: {
            id: 0,
            project_id: 0,
            name: ''
        },
        layout: {
            i: 'staged',
            x: 0,
            y: 0,
            w: NEW_WIDGET_SIZE,
            h: NEW_WIDGET_SIZE
        }
    }

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
        else if (res.data.widgets.length) {
            console.log(res.data);
            setWidgets([...res.data.widgets]);
            UpdateGrid([...res.data.layouts, STAGING.layout]);
        }
    }
    // Fetch widgets on project change
    useEffect(() => {
        if (props.project) {
            FetchWidgets(props.project.id);
        }
    }, [props.project]);

    function UpdateGrid(newGrid : GridLayout.Layout[]) : void {
        // If project selected
        if (props.project) {
            const stagedLayout = newGrid.find((l : GridLayout.Layout) => l.i === 'staged');
            if (stagedLayout) {
                // Widget moved completely out of staging area
                if (stagedLayout.x >= NEW_WIDGET_SIZE) {
                    // Show staging area
                    newGrid.push(STAGING.layout);
                    
                    // Create widget in database
                    SaveWidget(props.project.id, 'new', stagedLayout).then((newWidgetId : number) => {
                        if (newWidgetId && props.project) {
                            stagedLayout.i = newWidgetId.toString(); // Update layout id
                            // Add new widget
                            setWidgets([...widgets, {
                                id: newWidgetId,
                                project_id: props.project.id,
                                name: 'new'
                            }]);
                        }
                        else {
                            return; // Prevent grid state update on error
                        }
                    });
                }
                // Widget moved paritally out of staging area
                else if (stagedLayout.x > 0) {
                    stagedLayout.x = 0; // Move back to staging
                }
            }

            setGrid(newGrid);
            SaveGrid(newGrid);
        }
    }

    // Places new widget in staging area
    function StageWidget() {
        setWidgets(widgets.filter((w : widget) => w.id !== -1));
        setGrid([...grid.filter((l : GridLayout.Layout) => l.i !== 'staging'), STAGED.layout]);
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
    
  // Expose to parent component (Home.tsx)
  useImperativeHandle(ref, () => ({
    StageWidget,
  }));
  
  return (
    <>
    <GridLayout
      className="layout"
      layout={grid}
      cols={NUM_COLS} // Number of columns in the grid
      maxRows={NUM_ROWS}
      rowHeight={windowSize.height * 0.89 / 12} // Height of each row
      width={windowSize.width * 0.87} // Total grid width
      onDragStart={() => userInteracting.current = true}
      onResizeStart={() => userInteracting.current = true}
      onLayoutChange={(newGrid : GridLayout.Layout[]) => {
        if (userInteracting.current) {
            UpdateGrid(newGrid);
        }
        userInteracting.current = false;
      }}
    >
        {grid.map((layout : GridLayout.Layout) => (
            <div
                key={layout.i}
                data-grid={{
                    ...layout,
                    static: layout.i === "staging", // Makes staging area non resizable or draggable
                }}
                className={
                    layout.i === 'staging' || layout.i === 'staged' ? layout.i : 'widget'
                }
            >
                {layout.i}
            </div>
        ))}
    </GridLayout>
    </>
  );
}

export default forwardRef(GridSystem);
