import { contextBridge, ipcRenderer } from 'electron';

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
    GetProjects: (username : string) => ipcRenderer.invoke('get-user-projects', { username })
}
contextBridge.exposeInMainWorld('api', api);