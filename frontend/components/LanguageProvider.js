"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { translate } from "../lib/translations";

const LanguageContext = createContext({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("en");

  // Load the saved choice once, when the app opens
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "ne" || saved === "en") setLangState(saved);
    } catch (err) {
      // storage not available, stay on English
    }
  }, []);

  // Tell the browser which language the page is in
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next) => {
    setLangState(next);
    try {
      localStorage.setItem("lang", next);
    } catch (err) {
      // ignore
    }
  }, []);

  const t = useCallback((key, params) => translate(lang, key, params), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}