import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeType = 'dark' | 'light';

export interface Colors {
  // Fondos
  background: string;
  cardBackground: string;
  modalBackground: string;
  inputBackground: string;
  
  // Textos
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  
  // Acentos
  primary: string;
  primaryLight: string;
  success: string;
  error: string;
  warning: string;
  
  // Bordes
  border: string;
  borderLight: string;
  borderDark: string;
  
  // Otros
  overlay: string;
  shadow: string;
  disabled: string;
}

const darkColors: Colors = {
  // Fondos
  background: '#000000',
  cardBackground: '#1a1a1a',
  modalBackground: '#1a1a1a',
  inputBackground: '#2a2a2a',
  
  // Textos
  textPrimary: '#ffffff',
  textSecondary: '#cccccc',
  textTertiary: '#888888',
  
  // Acentos
  primary: '#3fbb34',
  primaryLight: '#0cfc78',
  success: '#3fbb34',
  error: '#ff4444',
  warning: '#ffaa00',
  
  // Bordes
  border: '#2a2a2a',
  borderLight: '#3a3a3a',
  borderDark: '#1a1a1a',
  
  // Otros
  overlay: 'rgba(0, 0, 0, 0.8)',
  shadow: '#000000',
  disabled: '#555555',
};

const lightColors: Colors = {
  // Fondos
  background: '#f5f5f5',
  cardBackground: '#ffffff',
  modalBackground: '#ffffff',
  inputBackground: '#f0f0f0',
  
  // Textos
  textPrimary: '#1a1a1a',
  textSecondary: '#4a4a4a',
  textTertiary: '#888888',
  
  // Acentos
  primary: '#3fbb34',
  primaryLight: '#5cd44f',
  success: '#3fbb34',
  error: '#ff4444',
  warning: '#ffaa00',
  
  // Bordes
  border: '#e0e0e0',
  borderLight: '#f0f0f0',
  borderDark: '#d0d0d0',
  
  // Otros
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: '#000000',
  disabled: '#cccccc',
};

interface ThemeContextType {
  theme: ThemeType;
  colors: Colors;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeType>('dark');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('app_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setTheme = async (newTheme: ThemeType) => {
    try {
      await AsyncStorage.setItem('app_theme', newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
