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
    GetProjects: (username) => electron_1.ipcRenderer.invoke('get-user-projects', { username })
};
electron_1.contextBridge.exposeInMainWorld('api', api);
//# sourceMappingURL=preload.js.map