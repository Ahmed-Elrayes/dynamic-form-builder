/**
 * Theme Manager for handling theme registration and retrieval
 */
import Bootstrap5Theme from './Bootstrap5Theme.js';
import TailwindTheme from './TailwindTheme.js';
import Theme from './Theme.js';

export default class ThemeManager {
    private static themes: Record<string, Theme> = {};
    private static defaultTheme: string = 'bootstrap5';

    /**
     * Initialize the theme manager with default themes
     */
    static init(): void {
        // Register default themes
        ThemeManager.register('bootstrap5', new Bootstrap5Theme());
        ThemeManager.register('tailwind', new TailwindTheme());
    }

    /**
     * Register a theme
     * @param {string} name - Theme name
     * @param {Theme} theme - Theme instance
     */
    static register(name: string, theme: Theme): void {
        ThemeManager.themes[name] = theme;
    }

    /**
     * Get a theme by name
     * @param {string} name - Theme name
     * @returns {Theme} - Theme instance
     */
    static get(name: string): Theme {
        if (!name || !ThemeManager.themes[name]) {
            console.warn(`Theme "${name}" not found, using default theme "${ThemeManager.defaultTheme}"`);
            return ThemeManager.themes[ThemeManager.defaultTheme];
        }
        return ThemeManager.themes[name];
    }

    /**
     * Set the default theme
     * @param {string} name - Theme name
     */
    static setDefaultTheme(name: string): void {
        if (!ThemeManager.themes[name]) {
            console.warn(`Cannot set default theme to "${name}" as it doesn't exist`);
            return;
        }
        ThemeManager.defaultTheme = name;
    }

    /**
     * Get the default theme
     * @returns {Theme} - Default theme instance
     */
    static getDefaultTheme(): Theme {
        return ThemeManager.themes[ThemeManager.defaultTheme];
    }

    /**
     * Get all registered theme names
     * @returns {string[]} - Array of theme names
     */
    static getThemeNames(): string[] {
        return Object.keys(ThemeManager.themes);
    }
}

// Initialize the theme manager
ThemeManager.init();
