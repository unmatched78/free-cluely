# Testing the Fullscreen Toggle Feature

This document provides instructions for testing the fullscreen toggle feature in both browser and Electron environments.

## Browser Testing

1. Open the `test.html` file in your browser:
   ```bash
   # From the project root
   open test.html
   ```

2. Test the fullscreen toggle functionality:
   - Click the "Toggle Fullscreen" button in the header
   - Press `Cmd/Ctrl + F` on your keyboard
   - Verify that the app enters fullscreen mode
   - Press the same shortcut again to exit fullscreen mode

## Docker Testing

1. Build and run the Docker containers:
   ```bash
   # From the project root
   docker-compose build
   docker-compose up
   ```

2. Access the React app in your browser:
   ```
   http://localhost:5180
   ```

3. The Electron app will run in the Docker container with Xvfb for headless testing.

## Local Development Testing

1. Use the mock ProcessingHelper for testing without a real API key:
   ```bash
   # From the project root
   ./use-mock-helper.sh
   ```

2. Start the development environment:
   ```bash
   # From the project root
   ./start-dev.sh
   ```

3. Test the fullscreen toggle functionality:
   - Press `Cmd/Ctrl + F` to toggle fullscreen mode
   - Verify that the app expands to fill the entire screen
   - Press `Cmd/Ctrl + F` again to return to normal mode
   - Verify that the app returns to its previous size and position

4. Restore the original ProcessingHelper when done:
   ```bash
   # From the project root
   ./restore-original-helper.sh
   ```

## React Component Testing

The `FullscreenToggle.tsx` component can be imported and used in any React component:

```tsx
import FullscreenToggle from './components/FullscreenToggle';

function MyComponent() {
  return (
    <div>
      <FullscreenToggle className="my-button-class" />
    </div>
  );
}
```

The component handles both Electron and browser environments, falling back to the browser's fullscreen API when Electron is not available.