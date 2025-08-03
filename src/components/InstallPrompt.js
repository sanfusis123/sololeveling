import React, { useState, useEffect } from 'react';
import './InstallPrompt.css';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
      setIsInstalled(true);
      console.log('App is already installed');
      return;
    }

    console.log('Setting up install prompt listener...');

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      console.log('PWA was installed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Store dismissal in localStorage to not show again for some time
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Check if we should show the prompt based on previous dismissal
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      // Don't show if dismissed less than 7 days ago
      if (daysSinceDismissed < 7) {
        setShowInstallPrompt(false);
      }
    }
  }, []);

  // Add a manual trigger button for testing
  const [showManualButton, setShowManualButton] = useState(false);

  useEffect(() => {
    // Show manual button after 3 seconds if no prompt
    const timer = setTimeout(() => {
      if (!showInstallPrompt && !isInstalled) {
        setShowManualButton(true);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [showInstallPrompt, isInstalled]);

  if (!showInstallPrompt && !showManualButton && !isInstalled) {
    return null;
  }

  if (isInstalled) {
    return null;
  }

  // If we only have manual button, show a smaller prompt
  if (showManualButton && !showInstallPrompt) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <button
          onClick={() => {
            console.log('Manual install button clicked');
            // Try to trigger install even without prompt
            if (deferredPrompt) {
              handleInstallClick();
            } else {
              alert('PWA install is not available. Make sure:\n1. You are using HTTPS or localhost\n2. The app meets PWA criteria\n3. You haven\'t already installed it\n4. Your browser supports PWA');
            }
          }}
          style={{
            padding: '12px 24px',
            background: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          📱 Install App
        </button>
      </div>
    );
  }

  return (
    <div className="install-prompt">
      <div className="install-prompt-content">
        <div className="install-prompt-icon">📱</div>
        <div className="install-prompt-text">
          <h3>Install Dev Tracker</h3>
          <p>Install our app for a better experience with offline access!</p>
        </div>
        <div className="install-prompt-actions">
          <button 
            className="install-prompt-button install" 
            onClick={handleInstallClick}
          >
            Install
          </button>
          <button 
            className="install-prompt-button dismiss" 
            onClick={handleDismiss}
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;