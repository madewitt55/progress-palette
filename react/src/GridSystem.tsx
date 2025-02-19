import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
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
    const [isWidgetStaged, setIsWidgetStaged] = useState<boolean>(false);
    const STAGING_PLACEHOLDER : GridLayout.Layout = {
        i: 'staging', x: 0, y: 0, w: NEW_WIDGET_SIZE, h: NEW_WIDGET_SIZE
    }
    const [grid, setGrid] = useState<GridLayout.Layout[]>([STAGING_PLACEHOLDER]);
    const [widgets, setWidgets] = useState<widget[]>([]);

    function ResetGrid() {
        setGrid([STAGING_PLACEHOLDER]);
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

    async function FetchWidgets(projectId : number) {
        ResetGrid();
        const res : response = await window.api.GetWidgets(projectId);
        if (res.success) {
            setWidgets(res.data);
        }
        else {
            alert(res.data);
        }
    }

    useEffect(() => {
        if (props.project) {
            FetchWidgets(props.project.id);
        }
    }, [props.project]);

    useEffect(() => {
        function LoadWidgets() {
            const newGrid = [...grid];
            widgets.forEach((widget : widget) => {
                if (widget.layout) {
                    const widgetLayout : GridLayout.Layout = { ...widget.layout, i: widget.id.toString() };
                    newGrid.push(widgetLayout);
                }
            });
            setGrid(newGrid);
        }
        if (widgets.length) {
            LoadWidgets();
        }
    }, [widgets]);

    function AddWidget() {
        if (props.project && !isWidgetStaged) {
            const newWidget : GridLayout.Layout = {
                i: 'staged',
                x: 0,
                y: 0,
                w: NEW_WIDGET_SIZE,
                h: NEW_WIDGET_SIZE
            }
            // Replace staging placeholder with new widget
            // Gives the appearance of the new widget being placed on top of it
            const newLayout = [...grid.filter((widget : GridLayout.Layout) => {
                return widget.i !== 'staging';
            }), newWidget];
            setIsWidgetStaged(true);
            setGrid(newLayout);
        }
    }

    // Runs on grid update
    useEffect(() => {
        async function CreateWidget(projectId : number, name : string, layout : widget_layout) : Promise<number> {
            const res : response = await window.api.CreateWidget(projectId, name, layout);
            if (res.success) {
                return res.data; // New widget id
            }
            return -1;
        }
        if (props.project) {
            if (isWidgetStaged) {
                const stagedIndex = grid.findIndex((widget : GridLayout.Layout) => {
                    return widget.i === 'staged';
                });
                // If staged widget moves partially out of staging zone
                if (grid[stagedIndex]?.x == 1) {
                    const newGrid = [...grid];
                    newGrid[stagedIndex] = { ...newGrid[stagedIndex], x: 0 }
                    setGrid(newGrid);
                }
                // If staged widget moved out of staging zone
                else if (grid[stagedIndex]?.x > 1) {
                    const newWidgetLayout : widget_layout = grid[stagedIndex];
                    CreateWidget(props.project.id, 'test', newWidgetLayout).then((newWidgetId : number) => {
                        if (newWidgetId != -1) {
                            const newGrid = [...grid, STAGING_PLACEHOLDER]; // Add back staging placeholder
                            newGrid[stagedIndex] = { ...newGrid[stagedIndex], i: newWidgetId.toString() }
                            setGrid(newGrid);
                            setIsWidgetStaged(false);
                        }
                    });
                    FetchWidgets(props.project.id);
                }
            }

            window.api.UpdateAllWidgetLayouts(grid).then((res : response) => {
                console.log(res);
            });
        }
    }, [grid]);

  // Expose to parent component (Home.tsx)
  useImperativeHandle(ref, () => ({
    AddWidget,
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
      onLayoutChange={(newLayout) => {
        setGrid(newLayout);
      }}
    >
      {grid.map((widget : GridLayout.Layout) => (
        <div
            key={widget.i}
            className={widget.i === 'staging' ? 'staging' : 
                (widget.i === 'staged') ? 'staged' : 'widget'}
            data-grid={{
                ...widget,
                static: widget.i === "staging", // Makes staging area non resizable or draggable
            }}
        >
            <h4>
                {/* Displays name of widget, 'New Widget' if staged, and blank for staging area */}
                {!isNaN(+widget.i) ? widgets.find((w : widget) => w.id.toString() == widget.i)?.name :
                (widget.i === 'staged' ? 'New Widget' : '')} 
            </h4>
            {/* WIDGET COMPONENT HERE */}
        </div>
      ))}
    </GridLayout>
    </>
  );
}

export default forwardRef(GridSystem);
