"use client";

import { useLanguage } from "./LanguageProvider";
import "./LanguageSwitch.css";

export default function LanguageSwitch() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="lang-switch">
      <button
        type="button"
        className={"lang-btn" + (lang === "en" ? " is-active" : "")}
        onClick={() => setLang("en")}
      >
        English
      </button>
      <button
        type="button"
        className={"lang-btn" + (lang === "ne" ? " is-active" : "")}
        onClick={() => setLang("ne")}
      >
        नेपाली
      </button>
    </div>
  );
}