const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./dist-electron/progress-db.db', sqlite3.OPEN_READWRITE, (err : any) => {
    if (err) return console.error(err.message);
});

// TYPES
export type user = {
    username: string;
    password?: string;
    f_name: string;
    l_name: string;
    created_at: string;
};
export type project = {
    id: number;
    username: string;
    name: string;
};

// QUERIES
const getAllUsers : string = 'SELECT username, created_at FROM users';
const isValidLogin : string = 'SELECT * FROM users WHERE username = ? AND password = ?';
const getUserProjects : string = 'SELECT * FROM projects WHERE username = ?';

// Returns promise for list of all users
export function GetUsers() : Promise<user[]> {
    return new Promise((resolve, reject) => {
        db.all(getAllUsers, [], (err : any, rows : user[]) => {
            if (err) {
                return reject(err.message);
            }
            rows.map((user) => {
                const { password, ...sanitizedUser } = user;
                return sanitizedUser;
            });
            resolve(rows);
        });
    });
}
// Returns whether login is valid given username and password
export function ValidateLogin(username : string, password : string) : Promise<user | null> {
    return new Promise((resolve, reject) => {
        db.all(isValidLogin, [username, password], (err: object, rows : user[]) => {
            if (err) {
                return reject(err);
            }
            else if (rows.length) {
                const {password, ...user} = rows[0]; // Omit password
                resolve(user);
            }
            else {
                resolve(null);
            }
        });
    });
}
// Returns all projects owned by given username
export function GetProjects(username : string) : Promise<project[]> {
    return new Promise((resolve, reject) => {
        db.all(getUserProjects, [username], (err : object, rows : project[]) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}