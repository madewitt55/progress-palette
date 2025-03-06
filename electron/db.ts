import type { Layout } from 'react-grid-layout';

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./dist-electron/progress-db.db', sqlite3.OPEN_READWRITE, (err : Error) => {
    if (err) return console.error(err);
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
export type widget = {
    id: number;
    project_id: number;
    name: string;
    widget_type: string;
}
export type widget_type = {
    name: string;
    description: string;
}

// QUERIES
const getAllUsers : string = 'SELECT username, created_at FROM users';
const isValidLogin : string = 'SELECT * FROM users WHERE username = ? AND password = ?';
const getUserProjects : string = 'SELECT * FROM projects WHERE username = ?';
const getProjectWidgets : string = 'SELECT * FROM widgets WHERE project_id = ?';
const getWidgetLayout : string = 'SELECT * FROM widget_layouts WHERE i = ?'; 
const createWidget : string = 'INSERT INTO widgets(project_id, name) VALUES (?,?)';
const createWidgetLayout : string = `INSERT INTO widget_layouts(i, x, y, w, h) 
VALUES (?,?,?,?,?)`;
const updateWidgetLayout : string = `UPDATE widget_layouts SET x=?, y=?, w=?, h=? 
WHERE i=?`;
const deleteWidget : string = 'DELETE FROM widgets WHERE id=?';
const deleteWidgetLayout : string = 'DELETE FROM widget_layouts WHERE i=?';
const getWidgetTypes : string = 'SELECT * FROM widget_types';

// Returns list of all users
export function GetUsers() : Promise<user[]> {
    return new Promise((resolve, reject) => {
        db.all(getAllUsers, [], (err : Error, rows : user[]) => {
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
export function ValidateLogin(username : string, password : string) : Promise<user | null> {
    return new Promise((resolve, reject) => {
        db.all(isValidLogin, [username, password], (err : Error, rows : user[]) => {
            if (err) {
                return reject(err);
            }
            else if (rows.length) {
                const {password, ...sanitizedUser} = rows[0]; // Omit password
                resolve(sanitizedUser);
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
        db.all(getUserProjects, [username], (err : Error, rows : project[]) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}
// Returns an array of an array of widget and an array of layouts
export function GetWidgets(projectId: number): Promise<{widgets : widget[], layouts : Layout[]}> {
    return new Promise((resolve, reject) => {
        if (isNaN(projectId)) {
            return reject('Invalid projectId');
        }

        // Retrieve widgets
        db.all(getProjectWidgets, [projectId], (err: Error, widgetRows: widget[]) => {
            if (err) {
                return reject(err);
            }
            
            // If no widgets found, resolve empty
            if (!widgetRows.length) {
                return resolve({widgets: [], layouts: []});
            }

            const layouts: Layout[] = [];

            // Fetch layouts for each widget
            const widgetPromises : Promise<widget>[] = widgetRows.map((widget: widget) => {
                return new Promise((resolveLayout) => {
                    db.all(getWidgetLayout, [widget.id], (err: Error, layoutRows: Layout[]) => {
                        if (layoutRows.length) {
                            layouts.push(layoutRows[0]); // Fill array
                        }
                        resolveLayout(widget);
                    });
                });
            });

            // Await all promises before resolving with both arrays
            Promise.all(widgetPromises).then((widgetsWithLayout : widget[]) => {
                    resolve({widgets: widgetsWithLayout, layouts});
            }).catch(reject);
        });
    });
}
// Creates a widget, returns true if successful 
export function CreateWidget(project_id : number, name : string, layout : Layout) : Promise<number> {
    return new Promise((resolve, reject) => {
        // Create widget row entry
        db.run(createWidget, [project_id, name], function (this: any, err : Error) {
            if (err) {
                return reject(err);
            }

            // Create widget layout row with widget id
            const newWidgetId = this.lastID;
            db.run(createWidgetLayout, [newWidgetId, layout.x, layout.y, layout.w, layout.h], (err : Error) => {
                if (err) {
                    return reject(err);
                }
                resolve(newWidgetId); // Resolve new id
            });
        });
    });
}
// Updates the layout of all widgets
export function UpdateAllWidgetLayouts(grid : Layout[]) : Promise<void> {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION'); // Start transaction

            const stmt = db.prepare(updateWidgetLayout);

            grid.forEach((layout : Layout) => {
                stmt.run(layout.x, layout.y, layout.w, layout.h, layout.i, (err : Error) => {
                    if (err) {
                        return reject(err);
                    }
                });
            });

            stmt.finalize((err : Error) => {
                if (err) {
                    return reject(err);
                }
                db.run('COMMIT', (commitErr : Error) => {
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
export function DeleteWidget(widgetId : number) : Promise<void> {
    return new Promise((resolve, reject) => {
        db.run(deleteWidgetLayout, [widgetId], (err : Error) => {
            if (err) {
                reject(err);
            }
        });
        db.run(deleteWidget, [widgetId], (err : Error) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}
// Returns an array of all possible widget types
export function GetWidgetTypes() : Promise<widget_type[]> {
    return new Promise((resolve, reject) => {
        db.all(getWidgetTypes, [], (rows : widget_type[], err : Error) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
}
