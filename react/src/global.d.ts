// Global declarations of ipcRenderer functions to avoid errors
export {};

declare global {
    // Standard format for data returned from main process
    type response = {
        data : any;
        err : any;
    };
    // Holds all fields of user table in database
    type user = {
        username: string;
        f_name: string;
        l_name: string;
        password?: string;
        created_at: string;
        updated_at: string;
    };
    type project = {
        id: number;
        username: string;
        name: string;
    };
    type widget = {
        id: number;
        project_id: number;
        name: string;
    }
    // See preload.ts for function definitions and documentation
    interface Window {
    api: {
        GetUsers: () => Promise<response>;
        LoginUser: (username : string, password : string) => Promise<response>;
        GetCurrentUser: () => Promise<response>;
        GetProjects: (username : string) => Promise<response>;
        GetWidgets: (projectId : number) => Promise<response>;
        CreateWidget: (projectId : number, name : string, layout : widget_layout) => Promise<response>;
        UpdateAllWidgetLayouts: (grid : widget_layout[]) => Promise<response>;
        DeleteWidget: (widgetId : number) => Promise<response>;
    };
    };
}
