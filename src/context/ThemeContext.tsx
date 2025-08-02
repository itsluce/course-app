import React, {createContext, useContext, useState, useEffect} from 'react';
import {useColorScheme} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({children}) => {
    const systemColorScheme = useColorScheme();
    const [theme, setThemeState] = useState<Theme>(systemColorScheme || 'light');

    const THEME_STORAGE_KEY = '@course_app_theme';

    useEffect(() => {
        loadThemeFromStorage();
    }, []);

    const loadThemeFromStorage = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
                setThemeState(savedTheme as Theme);
            } else {
                setThemeState(systemColorScheme || 'light');
            }
        } catch (error) {
            setThemeState(systemColorScheme || 'light');
        }
    };

    const saveThemeToStorage = async (newTheme: Theme) => {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setThemeState(newTheme);
        saveThemeToStorage(newTheme);
    };

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        saveThemeToStorage(newTheme);
    };

    const isDark = theme === 'dark';

    return (
        <ThemeContext.Provider value={{
            theme,
            isDark,
            toggleTheme,
            setTheme,
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const getThemeColors = (isDark: boolean) => ({
    background: isDark ? 'bg-gray-900' : 'bg-white',
    backgroundSecondary: isDark ? 'bg-gray-800' : 'bg-gray-50',
    backgroundTertiary: isDark ? 'bg-gray-700' : 'bg-gray-100',

    text: isDark ? 'text-white' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-300' : 'text-gray-600',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-500',

    border: isDark ? 'border-gray-700' : 'border-gray-200',
    borderSecondary: isDark ? 'border-gray-600' : 'border-gray-300',

    card: isDark ? 'bg-gray-800' : 'bg-white',
    cardSecondary: isDark ? 'bg-gray-700' : 'bg-gray-50',

    buttonPrimary: 'bg-blue-600',
    buttonSecondary: isDark ? 'bg-gray-700' : 'bg-gray-200',
    buttonText: 'text-white',
    buttonTextSecondary: isDark ? 'text-white' : 'text-gray-700',

    success: 'bg-green-500',
    successText: isDark ? 'text-white' : 'text-green-700',
    successBg: isDark ? 'bg-green-900' : 'bg-green-50',
    successBorder: isDark ? 'border-green-700' : 'border-green-200',

    error: 'bg-red-500',
    errorText: 'text-red-700',
    errorBg: isDark ? 'bg-red-900' : 'bg-red-50',
    errorBorder: isDark ? 'border-red-700' : 'border-red-200',

    warning: 'bg-yellow-500',
    warningText: 'text-yellow-700',
    warningBg: isDark ? 'bg-yellow-900' : 'bg-yellow-50',
    warningBorder: isDark ? 'border-yellow-700' : 'border-yellow-200',
});