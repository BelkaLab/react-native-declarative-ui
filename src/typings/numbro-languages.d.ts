declare module 'numbro/dist/languages.min.js' {
  export interface LanguageKey {
    [language: string]: NumbroLanguage;
  }

  var Languages: LanguageKey;
  type Languages = LanguageKey;

  export default Languages;
}
