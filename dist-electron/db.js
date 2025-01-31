"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUsers = GetUsers;
exports.ValidateLogin = ValidateLogin;
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./dist-electron/progress-db.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err)
        return console.error(err.message);
});
// QUERIES
const getAllUsers = 'SELECT username, created_at FROM users';
const isValidLogin = 'SELECT username, created_at FROM users WHERE username = ? AND password = ?';
// Returns promise for list of all users
function GetUsers() {
    return new Promise((resolve, reject) => {
        db.all(getAllUsers, [], (err, rows) => {
            if (err) {
                return reject(err.message);
            }
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
            resolve(rows[0]);
        });
    });
}
//# sourceMappingURL=db.js.map