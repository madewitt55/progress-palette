"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const api = {
    // Returns all users
    GetUsers: () => electron_1.ipcRenderer.invoke('get-users'),
    // Checks username against password, returns boolean
    LoginUser: (username, password) => {
        return electron_1.ipcRenderer.invoke('login-user', { username, password });
    },
    // Returns currently logged-in user
    GetCurrentUser: () => electron_1.ipcRenderer.invoke('get-curr-user'),
    // Returns all projects for given username
    GetProjects: (username) => electron_1.ipcRenderer.invoke('get-user-projects', { username }),
    // Returns all widgets for given project id
    GetWidgets: (projectId) => electron_1.ipcRenderer.invoke('get-project-widgets', { projectId }),
    // Creates a widget
    CreateWidget: (projectId, name, layout) => {
        return electron_1.ipcRenderer.invoke('create-widget', { projectId, name, layout });
    },
    // Updates the layout of all widgets in a project
    UpdateAllWidgetLayouts: (grid) => {
        return electron_1.ipcRenderer.invoke('update-all-widget-layouts', { grid });
    },
    // Deletes a widget given an id
    DeleteWidget: (widgetId) => {
        return electron_1.ipcRenderer.invoke('delete-widget-by-id', { widgetId });
    },
    // Returns all widget types
    GetWidgetTypes: () => {
        return electron_1.ipcRenderer.invoke('get-widget-types');
    },
    GetWidgetData: (widget_id) => {
        return electron_1.ipcRenderer.invoke('get-widget-data', { widget_id });
    },
    UpdateWidgetData: (data) => {
        return electron_1.ipcRenderer.invoke('update-widget-data', { data });
    },
    CreateWidgetData: (data) => {
        return electron_1.ipcRenderer.invoke('create-widget-data', { data });
    },
    DeleteWidgetData: (data_id, widget_id) => {
        return electron_1.ipcRenderer.invoke('delete-widget-data', { data_id, widget_id });
    }
};
electron_1.contextBridge.exposeInMainWorld('api', api);
//# sourceMappingURL=preload.js.map