import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  default: {
    name: 'Default',
    description: 'Elegant dark theme with glassmorphic effects',
    file: null
  },
  'anime-blue': {
    name: 'Blue Exorcist',
    description: 'Mystical blue energy with glowing effects',
    file: 'theme-anime-blue.css'
  },
  'anime-red': {
    name: 'Dark Dramatic',
    description: 'Intense red & black with power surge effects',
    file: 'theme-anime-red.css'
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('selectedTheme') || 'default';
  });

  useEffect(() => {
    // Remove all theme stylesheets
    document.querySelectorAll('link[data-theme]').forEach(link => {
      link.remove();
    });

    // Apply selected theme
    if (currentTheme !== 'default' && themes[currentTheme]?.file) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${process.env.PUBLIC_URL}/styles/${themes[currentTheme].file}`;
      link.setAttribute('data-theme', currentTheme);
      document.head.appendChild(link);
    }

    // Set theme attribute on root
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Save to localStorage
    localStorage.setItem('selectedTheme', currentTheme);
  }, [currentTheme]);

  const value = {
    currentTheme,
    setTheme: setCurrentTheme,
    themes
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};