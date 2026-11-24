"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, saveSession } from "../../lib/api";
import { useLanguage } from "../../components/LanguageProvider";
import LanguageSwitch from "../../components/LanguageSwitch";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault(); // stop the browser from reloading the page
    setError("");
    setLoading(true);

    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { email, password }
          : { shopName, email, password };

      const data = await apiFetch(path, {
        method: "POST",
        body: JSON.stringify(body),
      });

      saveSession(data.token, data.user);
      router.replace("/dashboard");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-wrap">
        <div className="login-lang">
          <LanguageSwitch />
        </div>

        <form className="login-card" onSubmit={handleSubmit}>
          <h1 className="login-title">{t("appName")}</h1>
          <p className="login-sub">
            {mode === "login" ? t("loginSub") : t("registerSub")}
          </p>

          {mode === "register" && (
            <div className="field">
              <label htmlFor="shopName">{t("shopName")}</label>
              <input
                id="shopName"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="email">{t("email")}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">{t("password")}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary login-submit"
            disabled={loading}
          >
            {loading
              ? t("pleaseWait")
              : mode === "login"
              ? t("loginButton")
              : t("registerButton")}
          </button>

          <p className="login-switch">
            {mode === "login" ? t("newShop") : t("alreadyRegistered")}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
            >
              {mode === "login" ? t("createAccount") : t("loginLink")}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}