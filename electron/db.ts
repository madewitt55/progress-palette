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
export type widget = {
    id: number;
    project_id: number;
    name: string;
    layout?: widget_layout;
}
export type widget_layout = {
    widget_id?: number;
    i?: number;
    x: number;
    y: number;
    w: number;
    h: number;
}

// QUERIES
const getAllUsers : string = 'SELECT username, created_at FROM users';
const isValidLogin : string = 'SELECT * FROM users WHERE username = ? AND password = ?';
const getUserProjects : string = 'SELECT * FROM projects WHERE username = ?';
const getProjectWidgets : string = 'SELECT * FROM widgets WHERE project_id = ?';
const getWidgetLayout : string = `SELECT x, y, w, h FROM widget_layouts 
WHERE widget_id = ?`; 
const createWidget : string = 'INSERT INTO widgets(project_id, name) VALUES (?,?)';
const createWidgetLayout : string = `INSERT INTO widget_layouts(widget_id, x, y, w, h) 
VALUES (?,?,?,?,?)`;
const updateWidgetLayout : string = `UPDATE widget_layouts SET x=?, y=?, w=?, h=? 
WHERE widget_id=?`;

// Returns list of all users
export function GetUsers() : Promise<user[]> {
    return new Promise((resolve, reject) => {
        db.all(getAllUsers, [], (err : any, rows : user[]) => {
            if (err) {
                return reject(err.message);
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
        db.all(isValidLogin, [username, password], (err: object, rows : user[]) => {
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
        db.all(getUserProjects, [username], (err : object, rows : project[]) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}
// Returns all widgets belong to given project id
export function GetWidgets(projectId : number) : Promise<widget[]> {
    return new Promise((resolve, reject) => {
        if (isNaN(projectId)) {
            return reject('Invalid projectId');
        }
        // Retrieve widgets
        db.all(getProjectWidgets, [projectId.toString()], (err : object, widgetRows : widget[]) => {
            if (err) {
                return reject(err);
            }
            // Populate widgets with layout data (if found)
            const widgetPromises = widgetRows.map((widget : widget) => {
                return new Promise((resolveWidget) => {
                    db.all(getWidgetLayout, [widget.id], (err : object, layoutRows : widget_layout[]) => {
                        if (layoutRows.length) {
                            widget.layout = layoutRows[0];
                        }
                        resolveWidget(widget);
                    });
                });
            });

            // Await all promises before resolving widgets array
            Promise.all(widgetPromises).then((widgetsWithLayout : any) => {
                resolve(widgetsWithLayout);
            }).catch(reject);
        });
    });
}
// Creates a widget, returns true if successful 
export function CreateWidget(project_id : number, name : string, layout : widget_layout) : Promise<number> {
    return new Promise((resolve, reject) => {
        // Create widget row entry
        db.run(createWidget, [project_id, name], function (this: any, err: any) {
            if (err) {
                return reject(err);
            }

            // Create widget layout row with widget id
            const newWidgetId = this.lastID;
            db.run(createWidgetLayout, [newWidgetId, layout.x, layout.y, layout.w, layout.h], (err: any) => {
                if (err) {
                    return reject(err);
                }
                resolve(newWidgetId); // Resolve new id
            });
        });
    });
}
// Updates the layout of all widgets
export function UpdateAllWidgetLayouts(grid : widget_layout[]) : Promise<void> {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION'); // Start transaction

            const stmt = db.prepare(updateWidgetLayout);

            grid.forEach((layout : widget_layout) => {
                stmt.run(layout.x, layout.y, layout.w, layout.h, layout.i, (err: any) => {
                    if (err) {
                        return reject(err);
                    }
                });
            });

            stmt.finalize((err: any) => {
                if (err) {
                    return reject(err);
                }
                db.run('COMMIT', (commitErr: any) => {
                    if (commitErr) {
                        return reject(commitErr);
                    }
                    resolve();
                });
            });
        });
    });
}

