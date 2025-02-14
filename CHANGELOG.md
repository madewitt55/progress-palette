# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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