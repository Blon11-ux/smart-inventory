import { translate, getSavedLanguage } from "./translations";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Messages from the backend that we can show in the chosen language
const BACKEND_MESSAGES = {
  "Invalid email or password": "errBadLogin",
  "This email is already registered": "errEmailTaken",
  "Password must be at least 8 characters": "errPasswordShort",
  "Not enough stock for this sale": "errNotEnoughStock",
  "Product not found": "errNotFound",
  "Please log in": "errLoginRequired",
  "Invalid or expired token": "errSessionExpired",
};

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function saveSession(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// Calls the backend. Adds the login token automatically.
// Throws an Error with a readable message if something goes wrong.
export async function apiFetch(path, options = {}) {
  const token = getToken();
  const lang = getSavedLanguage();

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    throw new Error(translate(lang, "errNetwork"));
  }

  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    // the response had no JSON body
  }

  if (!response.ok) {
    const backendMessage = data && data.message;
    const key = BACKEND_MESSAGES[backendMessage];
    const text = key
      ? translate(lang, key)
      : backendMessage || translate(lang, "errGeneric");

    const error = new Error(text);
    error.status = response.status;
    throw error;
  }

  return data;
}