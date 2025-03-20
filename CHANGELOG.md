# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

# UNRELEASED

## [0.1.0] - 2025-01-31

### Added
- Database functions to get all users and check username against password
- IPC handling for both above functions as well as to retrieve current user
- Functional login page

## [0.1.1] - 2025-02-12

### Added
- Bootstrap 5 CSS + JavaScript
- Three fonts
- Simple database table for projects (aka palettes)
- Database function and IPC handling to retrieve all a user's projects
- Bootstrap dropdown to display and select projects

### Changed
- IPC handlers previously omitted passwords before returning user data to renderer;
this omission now takes place in the root database functions

### Removed
- Untracked database file

## [0.2.0] - 2025-02-18

### Added
- GridView component using react-grid-layout
- Button to create new widgets (in Home) that display placeholder text 
- Widget staging area where new, unsaved widgets are placed before user chooses their position
- User's name and default profile picture appear in top left of Home

### Changed
- Content window in Home to now display new GridView component
- 'Select Project' button to say 'Select Palette'

## [0.2.1] - 2025-02-19

### Added 
- Simple database table for widgets
- Simple database table for widget position and size
- Database function and IPC handling to get all widgets from a project, layout included
- Database functions and IPC handling to create a widget with layout included, and update a list of widget layouts
- GridSystem now saves new widgets and saves moved widgets positions

### Changed
- Renamed list of GridLayouts from 'layout' to 'grid' for simplicity
- Renamed GridView.tsx and GridView.css to GridSystem
- Added projects_controller and moved IPC handling for anything project related there

## [0.2.2] - 2025-02-24

### Changed
- Database functions now use the Layout type imported from react-grid-layout rather
than their own custom type
- Response type now has just the two properties data and err. Success field removed
for simplicity
- Completely rewrote overly complex GridSystem component
- GridSystem saves new widgets and saves updated positions and sizes
- Widget_layouts table now uses field i instead of widget_id to match imported
Layout type

## [0.2.3] - 2025-02-26

### Added
- Ability to set name of new widgets
- Staged widget cannot be moved if name doesn't meet constraints
- New widgets placed that push other widgets vertically out of bounds are snapped
back to staging area

### Fixed
- Widgets being able to be placed vertically out of bounds

### Changed
- Widgets now display their name instead of their id
- Widgets are no longer able to be placed below staging area; this fixes the 
issue of widgets floating above the staging area

### Removed
- Unused useEffect import from Login

## [0.2.4] - 2025-02-27

### Added
- Ability to delete widgets

### Fixed
- A few small bugs in the grid

### Changed
- New widget name constraint check now occurs in HandleWidgetNameChange rather
than the map function inside GridLayout component

## [0.2.5] - 2025-03-06

### Added
- New widget name input maxLength constraint
- Ability to unstage a new widget before creation
- Duplicate widgets with same name and type cannot be added

### Changed
- New widget button in Home toggles from 'new widget' to 'cancel'
- Delete widget functionality now deletes layout row before widget row
- Changed standard alerts to use react toastify

## [0.3.0] - 2025-03-10

### Added
- Props function to GridSystem to be able to call toasts in Home
- Todo_data table in database
- Database and IPC functionality to get all data in a widget, create a data entry,
and update a data entry
- Widget component with basic todo functionality

### Fixed
- Issue of stacking toasts

## [0.3.1] - 2025-03-14

### Added
- Basic modal used to add widget data entries
- Basic modal to edit widget data entries
- Delete widget data entry functionality

### Changed
- IPC delete widget functionality to delete any widget data entries along with
the widget and its layout

## [0.4.0] - 2025-03-19

### Added
- Minor bootstrap styling to GridSystem widgets as well as the buttons within the
widgets

### Changed
- Major restructure to the frontend
- Moved todo list rendering outside of Widget, instead making Widget its parent.
Widget handles API logic and the create and edit modal. Todo is passed only the 
data it needs to display and functions from Widget to call
- Changed the parameters of create and edit widget data in the main process

### NOTE
- As of now, editing widget data through the modal creates a new widget entry. The 
data to be edited is not being passed correctly

## [0.4.1] - 2025-03-19

### Added
- Todo list task name length constraints and is_completed binary check in main
process
- Styling to create todo item modal

### Changed
- Removed todo item checkboxes, now clicking on text toggles strikethrough

### Fixed
- Bug that did not allow data editing
- Small bug that did not reset form text after closing modal