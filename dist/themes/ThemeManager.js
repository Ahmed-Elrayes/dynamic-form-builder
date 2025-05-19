/**
 * Theme Manager for handling theme registration and retrieval
 */
import Bootstrap5Theme from './Bootstrap5Theme.js';
import TailwindTheme from './TailwindTheme.js';
class ThemeManager {
    /**
     * Initialize the theme manager with default themes
     */
    static init() {
        // Register default themes
        ThemeManager.register('bootstrap5', new Bootstrap5Theme());
        ThemeManager.register('tailwind', new TailwindTheme());
    }
    /**
     * Register a theme
     * @param {string} name - Theme name
     * @param {Theme} theme - Theme instance
     */
    static register(name, theme) {
        ThemeManager.themes[name] = theme;
    }
    /**
     * Get a theme by name
     * @param {string} name - Theme name
     * @returns {Theme} - Theme instance
     */
    static get(name) {
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
    static setDefaultTheme(name) {
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
    static getDefaultTheme() {
        return ThemeManager.themes[ThemeManager.defaultTheme];
    }
    /**
     * Get all registered theme names
     * @returns {string[]} - Array of theme names
     */
    static getThemeNames() {
        return Object.keys(ThemeManager.themes);
    }
}
ThemeManager.themes = {};
ThemeManager.defaultTheme = 'bootstrap5';
export default ThemeManager;
// Initialize the theme manager
ThemeManager.init();
//# sourceMappingURL=ThemeManager.js.map