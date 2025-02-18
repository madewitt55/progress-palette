import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import './GridView.css'

function GridSystem(props : any, ref : any) {
    // Default widget layout
    const NUM_COLS : number = 12;
    const NUM_ROWS : number = 10;
    const NEW_WIDGET_SIZE : number = 2;
    const [isWidgetStaged, setIsWidgetStaged] = useState<boolean>(false);
    const stagingPlaceholder : GridLayout.Layout = {
        i: 'staging', x: 0, y: 0, w: NEW_WIDGET_SIZE, h: NEW_WIDGET_SIZE
    }
    const [layout, setLayout] = useState<GridLayout.Layout[]>([stagingPlaceholder]);

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

    function AddWidget() {
        if (!isWidgetStaged) {
            const newWidget : GridLayout.Layout = {
                i: '-1', // -1 means staged
                x: 0,
                y: 0,
                w: NEW_WIDGET_SIZE,
                h: NEW_WIDGET_SIZE
            }
            // Replace staging placeholder with new widget
            // Gives the appearance of the new widget being placed on top of it
            const newLayout = [...layout.filter((widget : GridLayout.Layout) => {
                return widget.i !== 'staging';
            }), newWidget];
            setIsWidgetStaged(true);
            setLayout(newLayout);
        }
    }

    useEffect(() => {
        if (isWidgetStaged) {
            const stagedIndex = layout.findIndex((widget : GridLayout.Layout) => {
                return widget.i === '-1';
            });
            // If staged widget moves partially out of staging zone
            if (layout[stagedIndex]?.x == 1) {
                const newLayout = [...layout];
                newLayout[stagedIndex] = { ...newLayout[stagedIndex], x: 0 }
                setLayout(newLayout);
            }
            // If staged widget moved out of staging zone
            else if (layout[stagedIndex]?.x > 1) {
                const newLayout = [...layout, stagingPlaceholder]; // Add back staging placeholder
                newLayout[stagedIndex] = { ...newLayout[stagedIndex], i: Date.now().toString() }
                setLayout(newLayout);
                setIsWidgetStaged(false);
            }
        }
    }, [layout]);

  // Expose to parent component (Home.tsx)
  useImperativeHandle(ref, () => ({
    AddWidget,
  }));
  
  return (
    <>
    <GridLayout

      className="layout"
      layout={layout}
      cols={NUM_COLS} // Number of columns in the grid
      maxRows={NUM_ROWS}
      rowHeight={windowSize.height * 0.89 / 12} // Height of each row
      width={windowSize.width * 0.87} // Total grid width
      onLayoutChange={(newLayout) => {
        setLayout(newLayout);
      }}
    >
      {layout.map((widget) => (
        <div
            key={widget.i}
            className={widget.i === 'staging' ? 'staging' : 'widget'}
            data-grid={{
                ...widget,
                static: widget.i === "staging", // This makes it non-resizable and non-draggable
              }}
        >
          Widget {widget.i}
        </div>
      ))}
    </GridLayout>
    </>
  );
}

export default forwardRef(GridSystem);
