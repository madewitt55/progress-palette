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
exports.InitProjectController = InitProjectController;
const electron_1 = require("electron");
const db = __importStar(require("./db.js"));
// Returns all widgets for given project id
// Layout is included if record is found
function InitProjectController() {
    electron_1.ipcMain.handle('get-project-widgets', async (event, args) => {
        try {
            const widgetData = await db.GetWidgets(args.projectId);
            return { data: widgetData, err: null };
        }
        catch (err) {
            return { data: null, err: err };
        }
    });
}
// Returns all projects for given username
electron_1.ipcMain.handle('get-user-projects', async (event, args) => {
    try {
        const projects = await db.GetProjects(args.username);
        return { data: projects, err: null };
    }
    catch (err) {
        return { data: null, err: err };
    }
});
// Creates a widget
electron_1.ipcMain.handle('create-widget', async (event, args) => {
    try {
        const id = await db.CreateWidget(args.projectId, args.name, args.layout);
        return { data: id, err: null };
    }
    catch (err) {
        return { data: null, err: err };
    }
});
// Updates the position of the entire grid
electron_1.ipcMain.handle('update-all-widget-layouts', async (event, args) => {
    try {
        await db.UpdateAllWidgetLayouts(args.grid);
        return { data: null, err: null };
    }
    catch (err) {
        return { data: null, err: err };
    }
});
// Deletes a widget given id
electron_1.ipcMain.handle('delete-widget-by-id', async (event, args) => {
    try {
        await db.DeleteWidget(args.widgetId);
        return { data: null, err: null };
    }
    catch (err) {
        return { data: null, err: err };
    }
});
// Gets all widget types
electron_1.ipcMain.handle('get-widget-types', async (event, args) => {
    try {
        const types = await db.GetWidgetTypes();
        return { data: types, err: null };
    }
    catch (err) {
        return { data: null, err: err };
    }
});
// Gets all widget data given id
electron_1.ipcMain.handle('get-widget-data', async (event, args) => {
    try {
        const widgetData = await db.GetWidgetData(args.widget_id);
        return { data: widgetData, err: null };
    }
    catch (err) {
        return { data: null, err };
    }
});
// Updates a widget data entry
electron_1.ipcMain.handle('update-widget-data', async (event, args) => {
    try {
        await db.UpdateWidgetData(args.data);
        return { data: null, err: null };
    }
    catch (err) {
        return { data: null, err };
    }
});
// Creates a widget data entry
electron_1.ipcMain.handle('create-widget-data', async (event, args) => {
    try {
        const newDataId = await db.CreateWidgetData(args.data);
        return { data: newDataId, err: null };
    }
    catch (err) {
        return { data: null, err };
    }
});
// Deletes a widget data entry
electron_1.ipcMain.handle('delete-widget-data', async (event, args) => {
    try {
        await db.DeleteWidgetData(args.data_id, args.widget_id);
        return { data: null, err: null };
    }
    catch (err) {
        return { data: null, err };
    }
});
//# sourceMappingURL=project_controller.js.map