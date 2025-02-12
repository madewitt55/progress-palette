"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUsers = GetUsers;
exports.ValidateLogin = ValidateLogin;
exports.GetProjects = GetProjects;
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./dist-electron/progress-db.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err)
        return console.error(err.message);
});
// QUERIES
const getAllUsers = 'SELECT username, created_at FROM users';
const isValidLogin = 'SELECT * FROM users WHERE username = ? AND password = ?';
const getUserProjects = 'SELECT * FROM projects WHERE username = ?';
// Returns promise for list of all users
function GetUsers() {
    return new Promise((resolve, reject) => {
        db.all(getAllUsers, [], (err, rows) => {
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
function ValidateLogin(username, password) {
    return new Promise((resolve, reject) => {
        db.all(isValidLogin, [username, password], (err, rows) => {
            if (err) {
                return reject(err);
            }
            else if (rows.length) {
                const { password, ...user } = rows[0]; // Omit password
                resolve(user);
            }
            else {
                resolve(null);
            }
        });
    });
}
// Returns all projects owned by given username
function GetProjects(username) {
    return new Promise((resolve, reject) => {
        db.all(getUserProjects, [username], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}
//# sourceMappingURL=db.js.map