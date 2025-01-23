"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { en } from '../translations/en';

type Language = 'en' | 'es' | 'fr' | 'de' | 'ja';
type Translations = typeof en;

interface LanguageContextType {
  language: Language;
  translations: Translations;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const isValidLanguage = (lang: string | null): lang is Language => {
  return !!lang && ['en', 'es', 'fr', 'de', 'ja'].includes(lang);
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [language, setLanguageState] = useState<Language>(() => {
    // Initialize with URL param or localStorage value or default to 'en'
    const urlLang = searchParams.get('lang');
    if (isValidLanguage(urlLang)) return urlLang;
    
    const savedLang = typeof window !== 'undefined' ? localStorage.getItem('language') : null;
    return isValidLanguage(savedLang) ? savedLang : 'en';
  });
  const [translations, setTranslations] = useState<Translations>(en);

  // Handle URL parameter changes
  useEffect(() => {
    const urlLang = searchParams.get('lang');
    if (isValidLanguage(urlLang) && urlLang !== language) {
      setLanguageState(urlLang);
      localStorage.setItem('language', urlLang);
    }
  }, [searchParams, language]);

  const setLanguage = (newLang: Language) => {
    if (newLang === language) return; // Don't update if language hasn't changed

    // Update URL while preserving current path and other params
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('lang', newLang);
    router.push(`${pathname}?${newParams.toString()}`);
    
    // Update state and localStorage
    setLanguageState(newLang);
    localStorage.setItem('language', newLang);
  };

  // Load translations when language changes
  useEffect(() => {
    async function loadTranslations() {
      if (language === 'en') {
        setTranslations(en);
        return;
      }

      try {
        const module = await import(`../translations/${language}`);
        setTranslations(module[language]);
      } catch (error) {
        console.error(`Failed to load translations for ${language}`, error);
        setTranslations(en); // Fallback to English
      }
    }

    loadTranslations();
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, translations, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 