"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

i18n
  .use(HttpBackend) // carga JSON desde locales/
  .use(LanguageDetector) // detecta idioma navegador/localStorage
  .use(initReactI18next) // integración con React
  .init({
    fallbackLng: "es", // español por defecto
    supportedLngs: ["es", "en"], // idiomas soportados
    ns: ["translation", "profile"], // Namespaces disponibles
    defaultNS: "translation", // Namespace por defecto
    interpolation: { escapeValue: false },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json" // dónde están los JSON por namespace
    },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"]
    }
  });

export default i18n;
