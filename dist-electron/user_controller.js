"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitUserController = InitUserController;
const electron_1 = require("electron");
const db = __importStar(require("./db.js"));
function InitUserController() {
    let currUser = null;
    // Used for development to skip login screen
    db.ValidateLogin('madewitt', '123').then((user) => {
        currUser = user;
    });
    // Returns array of all users
    electron_1.ipcMain.handle('get-users', async (event, args) => {
        try {
            const users = await db.GetUsers();
            return { data: users, err: null };
        }
        catch (err) {
            return { data: null, err: err };
        }
    });
    // Checks username and password combo, returns boolean
    electron_1.ipcMain.handle('login-user', async (event, args) => {
        try {
            const user = await db.ValidateLogin(args.username, args.password);
            currUser = user;
            return { data: user, err: null };
        }
        catch (err) {
            return { data: null, err: err };
        }
    });
    // Returns currently logged-in user
    electron_1.ipcMain.handle('get-curr-user', async (event, args) => {
        return { data: currUser, err: null }; // currUser is null if not logged in
    });
}
//# sourceMappingURL=user_controller.js.map