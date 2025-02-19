import { contextBridge, ipcRenderer } from 'electron';
import { UpdateAllWidgetLayouts } from './db';

type widget_layout = {
    widget_id?: number;
    x: number;
    y: number;
    w: number;
    h: number;
}

const api = {
    // Returns all users
    GetUsers: () => ipcRenderer.invoke('get-users'),
    // Checks username against password, returns boolean
    LoginUser: (username : string, password : string) => {
        return ipcRenderer.invoke('login-user', { username, password })
    },
    // Returns currently logged-in user
    GetCurrentUser: () => ipcRenderer.invoke('get-curr-user'),
    // Returns all projects for given username
    GetProjects: (username : string) => ipcRenderer.invoke('get-user-projects', { username }),
    // Returns all widgets for given project id
    GetWidgets: (projectId : number) => ipcRenderer.invoke('get-project-widgets', { projectId }),
    // Creates a widget
    CreateWidget: (projectId : number, name : string, layout : widget_layout) => {
        return ipcRenderer.invoke('create-widget', { projectId, name, layout });
    },
    UpdateAllWidgetLayouts: (grid : widget_layout[]) => {
        return ipcRenderer.invoke('update-all-widget-layouts', { grid });
    }
}
contextBridge.exposeInMainWorld('api', api);