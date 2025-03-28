import { ipcMain } from 'electron';
import * as db from './db.js';

type response = {
    data: any;
    err: any;
};

export function InitUserController() : void {
    let currUser : db.user | null = null;
    
    // Used for development to skip login screen
    db.ValidateLogin('madewitt', '123').then((user : db.user | null) => {
        currUser = user;
    });

    // Returns array of all users
    ipcMain.handle('get-users', async (event, args) : Promise<response> => {
        try {
            const users : db.user[] = await db.GetUsers();
            return { data: users, err: null };
        } catch (err: any) {
            return { data: null, err: err };
        }
    });
    // Checks username and password combo, returns boolean
    ipcMain.handle('login-user', async (event, args : any) : Promise<response> => {
        try {
            const user : db.user | null = await db.ValidateLogin(args.username, args.password);
            currUser = user;
            return { data: user, err: null };
        } catch (err : any) {
            return { data: null, err: err };
        }
    });
    // Returns currently logged-in user
    ipcMain.handle('get-curr-user', async (event, args : any) : Promise<response> => {
        return { data: currUser, err: null }; // currUser is null if not logged in
    });
}
