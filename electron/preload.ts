import { contextBridge, ipcRenderer } from 'electron';
import { UpdateAllWidgetLayouts } from './db';
import type { Layout } from 'react-grid-layout';

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
    UpdateAllWidgetLayouts: (grid : Layout[]) => {
        return ipcRenderer.invoke('update-all-widget-layouts', { grid });
    }
}
contextBridge.exposeInMainWorld('api', api);