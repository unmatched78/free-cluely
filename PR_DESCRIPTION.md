# Add Fullscreen Toggle Feature

## Description
This PR adds a new feature that allows users to toggle the application window between normal mode and fullscreen mode. When in fullscreen mode, the app will be visible across the entire screen, making it easier to view content and work with complex problems.

## Changes
- Added a `toggleFullscreen` method to the `WindowHelper` class
- Added a corresponding method to the `AppState` class
- Added a keyboard shortcut (`Cmd/Ctrl + F`) to toggle fullscreen mode
- Added an IPC handler to allow the renderer process to toggle fullscreen
- Updated the preload script to expose the new functionality
- Updated the README.md to document the new feature and keyboard shortcut

## Implementation Details
The implementation saves the window's current state (position, size, and alwaysOnTop setting) before entering fullscreen mode. When toggling back to normal mode, it restores these saved values, ensuring a seamless user experience.

The fullscreen mode is implemented by:
1. Getting the primary display's dimensions
2. Setting the window position to (0, 0)
3. Setting the window size to the full screen dimensions
4. Making the window always on top to ensure visibility

When exiting fullscreen mode, the implementation:
1. Restores the previous window position
2. Restores the previous window size
3. Restores the previous alwaysOnTop setting

## How to Test
1. Run the application in development mode
2. Press `Cmd/Ctrl + F` to toggle fullscreen mode
3. Verify that the app expands to fill the entire screen
4. Press `Cmd/Ctrl + F` again to return to normal mode
5. Verify that the app returns to its previous size and position

You can also test this functionality programmatically using the included test script:
```bash
# Run the test script
NODE_ENV=development electron --no-sandbox test-fullscreen.js
```

## Screenshots
N/A (Feature is best demonstrated in actual use)

## Additional Notes
This feature enhances the usability of the application by allowing users to have a better view of the content when needed, especially when working with complex problems or when presenting solutions.

The implementation is designed to work across all platforms (Windows, macOS, and Linux) with special handling for macOS to ensure proper window behavior.