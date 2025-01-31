// Global declarations of ipcRenderer functions to avoid errors
export {};

declare global {
    // Standard format for data returned from main process
    type response = {
        success : boolean;
        data : any;
    };
    // Holds all fields of user table in database
    type user = {
        username: string;
        password?: string;
        created_at: string;
    };
    // See preload.ts for function definitions and documentation
    interface Window {
    api: {
        GetUsers: () => Promise<response>;
        LoginUser: (username : string, password : string) => Promise<response>;
        GetCurrentUser: () => Promise<response>;
    };
    };
}
