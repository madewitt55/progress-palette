import { ipcMain } from 'electron';
import * as db from './db.js';
import type { Layout } from 'react-grid-layout';

type response = {
    data: any;
    err: any;
};
// Returns all widgets for given project id
// Layout is included if record is found
export function InitProjectController() : void {
    ipcMain.handle('get-project-widgets', async (event, args : {projectId : number}) : Promise<response> => {
        try {
            const widgetData = await db.GetWidgets(args.projectId);
            return { data: widgetData, err: null }
        } catch (err) {
            return { data: null, err: err }
        }
    });
}
// Returns all projects for given username
ipcMain.handle('get-user-projects', async (event, args : {
    username : string
}) : Promise<response> => {
    try {
        const projects : db.project[] = await db.GetProjects(args.username);
        return { data: projects, err: null };
    } catch (err : any) {
        return { data: null, err: err };
    }
});
// Creates a widget
ipcMain.handle('create-widget', async (event, args : {
    projectId : number,
    name : string,
    layout : Layout
}) : Promise<response> => {
    try {
        const id : number = await db.CreateWidget(args.projectId, args.name, args.layout);
        return { data: id, err: null };
    } catch (err : any) {
        return { data: null, err: err };
    }
});
// Updates the position of the entire grid
ipcMain.handle('update-all-widget-layouts', async (event, args : {
    grid : Layout[]
}) : Promise<response> => {
    try {
        await db.UpdateAllWidgetLayouts(args.grid);
        return { data: null, err: null };
    } catch (err : any) {
        return { data: null, err: err };
    }
});

ipcMain.handle('delete-widget-by-id', async (event, args : {
    widgetId : number 
}) : Promise<response> => {
    try {
        await db.DeleteWidget(args.widgetId);
        return { data: null, err: null };
    }
    catch (err : any) {
        return { data: null, err: err };
    }
});