import { contextBridge, ipcRenderer } from 'electron';
import type { Layout } from 'react-grid-layout';
export type widget_data = {
    id: number;
    widget_id: number;
    name?: string;
};

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
    CreateWidget: (projectId : number, name : string, layout : Layout) => {
        return ipcRenderer.invoke('create-widget', { projectId, name, layout });
    },
    // Updates the layout of all widgets in a project
    UpdateAllWidgetLayouts: (grid : Layout[]) => {
        return ipcRenderer.invoke('update-all-widget-layouts', { grid });
    },
    // Deletes a widget given an id
    DeleteWidget: (widgetId : number) => {
        return ipcRenderer.invoke('delete-widget-by-id', { widgetId });
    },
    // Returns all widget types
    GetWidgetTypes: () => {
        return ipcRenderer.invoke('get-widget-types');
    },
    GetWidgetData: (widget_id : number) => {
        return ipcRenderer.invoke('get-widget-data', { widget_id });
    },
    UpdateWidgetData: (data : widget_data) => {
        return ipcRenderer.invoke('update-widget-data', { data });
    },
    CreateWidgetData: (data : widget_data) => {
        return ipcRenderer.invoke('create-widget-data', { data });
    }
}
contextBridge.exposeInMainWorld('api', api);