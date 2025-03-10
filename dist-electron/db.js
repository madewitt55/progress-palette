"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUsers = GetUsers;
exports.ValidateLogin = ValidateLogin;
exports.GetProjects = GetProjects;
exports.GetWidgets = GetWidgets;
exports.CreateWidget = CreateWidget;
exports.UpdateAllWidgetLayouts = UpdateAllWidgetLayouts;
exports.DeleteWidget = DeleteWidget;
exports.GetWidgetTypes = GetWidgetTypes;
exports.GetWidget = GetWidget;
exports.GetWidgetData = GetWidgetData;
exports.UpdateWidgetData = UpdateWidgetData;
exports.CreateWidgetData = CreateWidgetData;
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./dist-electron/progress-db.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err)
        return console.error(err);
});
// QUERIES
const getAllUsers = 'SELECT username, created_at FROM users';
const isValidLogin = 'SELECT * FROM users WHERE username = ? AND password = ?';
const getUserProjects = 'SELECT * FROM projects WHERE username = ?';
const getProjectWidgets = 'SELECT * FROM widgets WHERE project_id = ?';
const getWidgetLayout = 'SELECT * FROM widget_layouts WHERE i = ?';
const createWidget = 'INSERT INTO widgets(project_id, name) VALUES (?,?)';
const createWidgetLayout = `INSERT INTO widget_layouts(i, x, y, w, h) 
VALUES (?,?,?,?,?)`;
const updateWidgetLayout = `UPDATE widget_layouts SET x=?, y=?, w=?, h=? 
WHERE i=?`;
const deleteWidget = 'DELETE FROM widgets WHERE id=?';
const deleteWidgetLayout = 'DELETE FROM widget_layouts WHERE i=?';
const getWidgetTypes = 'SELECT * FROM widget_types';
const getWidgetData = (widgetType) => `SELECT * FROM ${widgetType}_data WHERE widget_id = ?`;
const getWidgetById = 'SELECT * FROM widgets WHERE id = ?';
const updateWidgetData = (widgetType) => {
    switch (widgetType) {
        case 'todo':
            return `UPDATE todo_data SET name=?, is_completed=? WHERE id=?`;
        default:
            return '';
    }
};
const createWidgetData = (widgetType) => {
    switch (widgetType) {
        case 'todo':
            return `INSERT INTO todo_data(widget_id, name, is_completed) VALUES
            (?, ?, ?)`;
        default:
            return '';
    }
};
// Returns list of all users
function GetUsers() {
    return new Promise((resolve, reject) => {
        db.all(getAllUsers, [], (err, rows) => {
            if (err) {
                return reject(err);
            }
            rows.map((user) => {
                const { password, ...sanitizedUser } = user; // Omit password
                return sanitizedUser;
            });
            resolve(rows);
        });
    });
}
// Returns user given username and password; returns null if invalid combo
function ValidateLogin(username, password) {
    return new Promise((resolve, reject) => {
        db.all(isValidLogin, [username, password], (err, rows) => {
            if (err) {
                return reject(err);
            }
            else if (rows.length) {
                const { password, ...sanitizedUser } = rows[0]; // Omit password
                resolve(sanitizedUser);
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
// Returns an array of an array of widget and an array of layouts
function GetWidgets(projectId) {
    return new Promise((resolve, reject) => {
        if (isNaN(projectId)) {
            return reject('Invalid projectId');
        }
        // Retrieve widgets
        db.all(getProjectWidgets, [projectId], (err, widgetRows) => {
            if (err) {
                return reject(err);
            }
            // If no widgets found, resolve empty
            if (!widgetRows.length) {
                return resolve({ widgets: [], layouts: [] });
            }
            const layouts = [];
            // Fetch layouts for each widget
            const widgetPromises = widgetRows.map((widget) => {
                return new Promise((resolveLayout) => {
                    db.all(getWidgetLayout, [widget.id], (err, layoutRows) => {
                        if (layoutRows.length) {
                            layouts.push(layoutRows[0]); // Fill array
                        }
                        resolveLayout(widget);
                    });
                });
            });
            // Await all promises before resolving with both arrays
            Promise.all(widgetPromises).then((widgetsWithLayout) => {
                resolve({ widgets: widgetsWithLayout, layouts });
            }).catch(reject);
        });
    });
}
// Creates a widget, returns true if successful 
function CreateWidget(project_id, name, layout) {
    return new Promise((resolve, reject) => {
        // Create widget row entry
        db.run(createWidget, [project_id, name], function (err) {
            if (err) {
                return reject(err);
            }
            // Create widget layout row with widget id
            const newWidgetId = this.lastID;
            db.run(createWidgetLayout, [newWidgetId, layout.x, layout.y, layout.w, layout.h], (err) => {
                if (err) {
                    return reject(err);
                }
                resolve(newWidgetId); // Resolve new id
            });
        });
    });
}
// Updates the layout of all widgets
function UpdateAllWidgetLayouts(grid) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION'); // Start transaction
            const stmt = db.prepare(updateWidgetLayout);
            grid.forEach((layout) => {
                stmt.run(layout.x, layout.y, layout.w, layout.h, layout.i, (err) => {
                    if (err) {
                        return reject(err);
                    }
                });
            });
            stmt.finalize((err) => {
                if (err) {
                    return reject(err);
                }
                db.run('COMMIT', (commitErr) => {
                    if (commitErr) {
                        return reject(commitErr);
                    }
                    resolve();
                });
            });
        });
    });
}
// Deletes a widget given its id
function DeleteWidget(widgetId) {
    return new Promise((resolve, reject) => {
        db.run(deleteWidgetLayout, [widgetId], (err) => {
            if (err) {
                return reject(err);
            }
        });
        db.run(deleteWidget, [widgetId], (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}
// Returns an array of all possible widget types
function GetWidgetTypes() {
    return new Promise((resolve, reject) => {
        db.all(getWidgetTypes, [], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}
function GetWidget(widget_id) {
    return new Promise((resolve, reject) => {
        db.get(getWidgetById, [widget_id], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row);
        });
    });
}
//Returns all data of a widget given widget_id
function GetWidgetData(widget_id) {
    return new Promise(async (resolve, reject) => {
        try {
            let widget = await GetWidget(widget_id);
            if (!widget) {
                return reject('Widget not found');
            }
            // Append _data to widget_type to get table name
            db.all(getWidgetData(widget.widget_type), [widget_id], (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
            // Error thrown by GetWidget
        }
        catch (err) {
            reject(err);
        }
    });
}
// Updates a widget data entry given all of its data
function UpdateWidgetData(data) {
    return new Promise(async (resolve, reject) => {
        try {
            const widget = await GetWidget(data.widget_id);
            if (!widget) {
                return reject('Widget not found');
            }
            // Filter widget id and shift id to end
            let { widget_id, id, ...filteredData } = data;
            const values = Object.values(filteredData);
            values.push(id);
            db.run(updateWidgetData(widget.widget_type), values, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        }
        catch (err) {
            reject(err);
        }
    });
}
// Creates a widget data entry and returns the new id
function CreateWidgetData(data) {
    return new Promise(async (resolve, reject) => {
        try {
            const widget = await GetWidget(data.widget_id);
            if (!widget) {
                return reject('Widget not found');
            }
            const values = Object.values(data);
            db.run(createWidgetData(widget.widget_type), values, function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(this.lastID);
            });
        }
        catch (err) {
            reject(err);
        }
    });
}
;
//# sourceMappingURL=db.js.map