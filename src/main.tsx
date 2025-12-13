import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Global error logging (dev only) to surface errors that might otherwise be hidden
if (import.meta.env.DEV) {
	window.addEventListener('error', (event) => {
		try {
			console.error('[global error] ', event.error ?? event.message, event);
		} catch (err) {
			// noop
		}
	});

	window.addEventListener('unhandledrejection', (event) => {
		try {
			console.error('[unhandled rejection] ', event.reason);
		} catch (err) {
			// noop
		}
	});
}

createRoot(document.getElementById("root")!).render(<App />);
