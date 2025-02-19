import { ipcMain } from 'electron';
import * as db from './db.js';

type response = {
    success: boolean;
    data: any;
};
// Returns all widgets for given project id
// Layout is included if record is found
export function InitProjectController() : void {
    ipcMain.handle('get-project-widgets', async (event, args : any) : Promise<response> => {
        try {
            const widgets : db.widget[] = await db.GetWidgets(args.projectId);
            return { success: true, data: widgets }
        } catch (err) {
            return { success: false, data: err }
        }
    });
}
// Returns all projects for given username
ipcMain.handle('get-user-projects', async (event, args : any) : Promise<response> => {
    try {
        const projects : db.project[] = await db.GetProjects(args.username);
        return { success: true, data: projects };
    } catch (err : any) {
        return { success: false, data: err };
    }
});

ipcMain.handle('create-widget', async (event, args : any) : Promise<response> => {
    try {
        const id : number = await db.CreateWidget(args.projectId, args.name, args.layout);
        return { success: true, data: id };
    } catch (err : any) {
        return { success: false, data: err };
    }
});

ipcMain.handle('update-all-widget-layouts', async (event, args : any) : Promise<response> => {
    try {
        db.UpdateAllWidgetLayouts(args.grid);
        return { success: true, data: null };
    } catch (err : any) {
        return {success: false, data: err };
    }
});