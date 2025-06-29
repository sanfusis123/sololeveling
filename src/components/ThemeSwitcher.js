import React, { useState } from 'react';
import { useTheme } from './ThemeProvider';
import './ThemeSwitcher.css';

const ThemeSwitcher = () => {
  const { currentTheme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  console.log('ThemeSwitcher rendering, current theme:', currentTheme);

  const handleThemeChange = (themeKey) => {
    setTheme(themeKey);
    setIsOpen(false);
  };

  return (
    <div className="theme-switcher">
      <button 
        className="theme-switcher-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Change Theme"
      >
        🎨
      </button>

      {isOpen && (
        <>
          <div className="theme-switcher-backdrop" onClick={() => setIsOpen(false)} />
          <div className="theme-switcher-menu">
            <h3>Select Theme</h3>
            <div className="theme-options">
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  className={`theme-option ${currentTheme === key ? 'active' : ''}`}
                  onClick={() => handleThemeChange(key)}
                >
                  <div className="theme-preview" data-theme-preview={key}>
                    <div className="preview-colors">
                      <span className="color-1"></span>
                      <span className="color-2"></span>
                      <span className="color-3"></span>
                    </div>
                  </div>
                  <div className="theme-info">
                    <h4>{theme.name}</h4>
                    <p>{theme.description}</p>
                  </div>
                  {currentTheme === key && <span className="theme-active-badge">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeSwitcher;