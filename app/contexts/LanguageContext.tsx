"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { en } from '../translations/en';

type Language = 'en' | 'es' | 'fr' | 'de' | 'ja';
type Translations = typeof en;

interface LanguageContextType {
  language: Language;
  translations: Translations;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [language, setLanguageState] = useState<Language>('en');
  const [translations, setTranslations] = useState<Translations>(en);

  useEffect(() => {
    // Check URL parameter first, then localStorage
    const urlLang = searchParams.get('lang') as Language;
    const savedLang = localStorage.getItem('language') as Language;
    
    if (urlLang && ['en', 'es', 'fr', 'de', 'ja'].includes(urlLang)) {
      setLanguageState(urlLang);
    } else if (savedLang && ['en', 'es', 'fr', 'de', 'ja'].includes(savedLang)) {
      // If no URL parameter but we have a saved preference, update URL
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('lang', savedLang);
      router.push(`?${newParams.toString()}`);
      setLanguageState(savedLang);
    }
  }, [searchParams, router]);

  const setLanguage = (newLang: Language) => {
    // Update URL
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('lang', newLang);
    router.push(`?${newParams.toString()}`);
    
    // Update state and localStorage
    setLanguageState(newLang);
    localStorage.setItem('language', newLang);
  };

  useEffect(() => {
    // Load language file dynamically
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