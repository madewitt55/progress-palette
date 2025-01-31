const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./dist-electron/progress-db.db', sqlite3.OPEN_READWRITE, (err : any) => {
    if (err) return console.error(err.message);
});

// TYPES
export type user = {
    username: string;
    password?: string; // Optional if omitting before sending data to renderer process
    created_at: string;
};

// QUERIES
const getAllUsers : string = 'SELECT username, created_at FROM users';
const isValidLogin : string = 'SELECT username, created_at FROM users WHERE username = ? AND password = ?';

// Returns promise for list of all users
export function GetUsers() : Promise<user[]> {
    return new Promise((resolve, reject) => {
        db.all(getAllUsers, [], (err : any, rows : user[]) => {
            if (err) {
                return reject(err.message);
            }
            resolve(rows);
        });
    });
}
// Returns whether login is valid given username and password
export function ValidateLogin(username : string, password : string) : Promise<user> {
    return new Promise((resolve, reject) => {
        db.all(isValidLogin, [username, password], (err: object, rows : user[]) => {
            if (err) {
                return reject(err);
            }
            resolve(rows[0]);
        });
    });
}