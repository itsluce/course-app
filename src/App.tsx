import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { CourseProvider } from './context/CourseContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { CourseScreen } from './screens/CourseScreen';
import '../global.css';

const AppContent = () => {
    const { theme } = useTheme();
    
    return (
        <GluestackUIProvider mode={theme}>
            <CourseScreen />
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        </GluestackUIProvider>
    );
};

export default function App() {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <CourseProvider>
                    <AppContent />
                </CourseProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}
