"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession } from "../lib/api";
import { useLanguage } from "./LanguageProvider";
import LanguageSwitch from "./LanguageSwitch";
import "./AppHeader.css";

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname(); // the current address, e.g. "/dashboard"
  const { t } = useLanguage();
  const [shopName, setShopName] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("user");
      if (saved) {
        const user = JSON.parse(saved);
        setShopName(user.shopName || "");
      }
    } catch (err) {
      // ignore a broken saved user
    }
  }, []);

  function logout() {
    clearSession();
    router.replace("/login");
  }

  return (
    <header className="app-header">
      <div className="app-header-top">
        <h1 className="app-header-title">{shopName || t("myShop")}</h1>
        <div className="app-header-right">
          <LanguageSwitch />
          <button type="button" className="btn" onClick={logout}>
            {t("logout")}
          </button>
        </div>
      </div>

      <nav className="app-nav">
        <Link
          href="/dashboard"
          className={
            "app-nav-link" + (pathname === "/dashboard" ? " is-active" : "")
          }
        >
          {t("navShop")}
        </Link>
        <Link
          href="/reorder"
          className={
            "app-nav-link" + (pathname === "/reorder" ? " is-active" : "")
          }
        >
          {t("navReorder")}
        </Link>
      </nav>
    </header>
  );
}