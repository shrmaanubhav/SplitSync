import { storageService } from './storage.service';

// Mock localization service
const translations: any = {
  en: {
    welcome: 'Welcome',
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    logout: 'Logout',
  },
  es: {
    welcome: 'Bienvenido',
    login: 'Iniciar sesión',
    register: 'Registrarse',
    email: 'Correo electrónico',
    password: 'Contraseña',
    name: 'Nombre',
    logout: 'Cerrar sesión',
  },
};

export const localizationService = {
  // Get current language
  async getCurrentLanguage(): Promise<string> {
    const language = await storageService.getItem('language');
    return language || 'en';
  },

  // Set language
  async setLanguage(language: string): Promise<void> {
    await storageService.setItem('language', language);
  },

  // Get translation
  translate(key: string, language?: string): string {
    const lang = language || 'en';
    return translations[lang]?.[key] || key;
  },

  // Get all translations for a language
  getTranslations(language: string): any {
    return translations[language] || translations.en;
  },
};
