import { ipcMain } from 'electron';
import * as db from './db.js';

type response = {
    success: boolean;
    data: any;
};

export function InitUserController() : void {
    let currUser : db.user | null = null;

    // Returns array of all users
    ipcMain.handle('get-users', async (event, args) : Promise<response> => {
        try {
            const users : db.user[] = await db.GetUsers();
            const sanitizedUsers : db.user[] = users.map(({ password, ...other}) => other); // Omit all passwords
            return { success: true, data: users };
        } catch (err: any) {
            return { success: false, data: err};
        }
    });
    // Checks username and password combo, returns boolean
    ipcMain.handle('login-user', async (event, args : any) : Promise<response> => {
        try {
            const user : db.user = await db.ValidateLogin(args.username, args.password);
            currUser = user; // Set currUser, exclude password
            return { success: true, data: user ? true : false };
        } catch (err: any) {
            return { success: false, data: err };
        }
    });
    // Returns currently logged-in user
    ipcMain.handle('get-curr-user', async (event, args : any) : Promise<response> => {
        return { success: true, data: currUser }; // currUser is null if not logged in
    });
}
