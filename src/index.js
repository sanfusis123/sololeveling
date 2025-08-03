import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Temporarily disable service worker to fix the reload issue
// serviceWorkerRegistration.register({
//   onUpdate: registration => {
//     // Show a notification when a new version is available
//     const confirmed = window.confirm(
//       'A new version is available! Would you like to update?'
//     );
//     if (confirmed && registration.waiting) {
//       registration.waiting.postMessage({ type: 'SKIP_WAITING' });
//       window.location.reload();
//     }
//   },
//   onSuccess: registration => {
//     console.log('App is ready to work offline!');
//   }
// });

// Unregister any existing service workers to fix the issue
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}