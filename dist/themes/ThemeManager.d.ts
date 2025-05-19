import Theme from './Theme.js';
export default class ThemeManager {
    private static themes;
    private static defaultTheme;
    /**
     * Initialize the theme manager with default themes
     */
    static init(): void;
    /**
     * Register a theme
     * @param {string} name - Theme name
     * @param {Theme} theme - Theme instance
     */
    static register(name: string, theme: Theme): void;
    /**
     * Get a theme by name
     * @param {string} name - Theme name
     * @returns {Theme} - Theme instance
     */
    static get(name: string): Theme;
    /**
     * Set the default theme
     * @param {string} name - Theme name
     */
    static setDefaultTheme(name: string): void;
    /**
     * Get the default theme
     * @returns {Theme} - Default theme instance
     */
    static getDefaultTheme(): Theme;
    /**
     * Get all registered theme names
     * @returns {string[]} - Array of theme names
     */
    static getThemeNames(): string[];
}
