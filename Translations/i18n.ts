// i18n.ts
import * as Localization from 'expo-localization';
import { Language, translations } from './translations';

export const getTranslation = (key: string): string => {
  // Obtenemos el idioma principal del dispositivo
  const locales = Localization.getLocales();
  const languageCode = locales[0]?.languageCode as Language;

  // Validamos que exista en nuestro diccionario, sino usamos 'en' por defecto
  const selectedLang: Language = translations[languageCode] ? languageCode : 'en';

  return translations[selectedLang][key] || key+ "No se encontro";
};
