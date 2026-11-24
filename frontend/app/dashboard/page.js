"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getToken, clearSession } from "../../lib/api";
import { resizeImage } from "../../lib/image";
import AppHeader from "../../components/AppHeader";
import { useLanguage } from "../../components/LanguageProvider";
import "./dashboard.css";

// Rounds away tiny decimal errors, e.g. 0.1 + 0.2
function round(n) {
  return Math.round(n * 1000) / 1000;
}

// Adds a "+" in front of positive numbers
function signed(n) {
  return n > 0 ? `+${n}` : String(n);
}

// ---------- The photo, or the first letter if there is no photo ----------
function ProductPicture({ product, big }) {
  if (product.photo) {
    return (
      <img
        className={"product-photo" + (big ? " is-big" : "")}
        src={product.photo}
        alt={product.name}
      />
    );
  }
  return (
    <div className={"product-initial" + (big ? " is-big" : "")}>
      {product.name.charAt(0).toUpperCase()}
    </div>
  );
}

// ---------- One product button in the grid ----------
function ProductCard({ product, onClick }) {
  const { t } = useLanguage();
  const isOut = product.stock === 0;
  const isLow = !isOut && product.stock <= product.minStock;
  const className =
    "product-card" + (isOut ? " is-out" : isLow ? " is-low" : "");

  return (
    <button type="button" className={className} onClick={onClick}>
      <ProductPicture product={product} />
      <div className="product-name">{product.name}</div>
      <div className="product-price">
        {t("currency")} {product.price}
      </div>
      <div className="product-stock">
        {isOut
          ? t("outOfStock")
          : t("leftLabel", { n: product.stock, unit: product.unit })}
      </div>
    </button>
  );
}

// ---------- Popup with three tabs: Sell, Restock, Count ----------
const MODES = [
  { id: "sale", labelKey: "modeSell" },
  { id: "restock", labelKey: "modeRestock" },
  { id: "count", labelKey: "modeCount" },
];

function StockModal({
  product,
  onClose,
  onDone,
  onPhotoChange,
  onUnauthorized,
}) {
  const { t } = useLanguage();
  const outOfStock = product.stock === 0;
  const [mode, setMode] = useState(outOfStock ? "restock" : "sale");
  const [amount, setAmount] = useState("1"); // kept as text while typing
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState("");

  const qty = Number(amount);
  const hasNumber = amount !== "" && Number.isFinite(qty);

  // Is the typed number acceptable for the chosen tab?
  let valid = false;
  if (hasNumber) {
    if (mode === "sale") valid = qty > 0 && qty <= product.stock;
    if (mode === "restock") valid = qty > 0;
    if (mode === "count") valid = qty >= 0;
  }

  function switchMode(newMode) {
    setMode(newMode);
    setError("");
    // For a count, start from what the system thinks is on the shelf
    setAmount(newMode === "count" ? String(product.stock) : "1");
  }

  // The + and - buttons
  function step(delta) {
    const current = hasNumber ? qty : 0;
    let next = round(current + delta);
    if (mode === "sale") next = Math.min(product.stock, Math.max(1, next));
    if (mode === "restock") next = Math.max(1, next);
    if (mode === "count") next = Math.max(0, next);
    setAmount(String(next));
  }

  // Saves a new photo (or "" to remove the photo) for this product
  async function savePhoto(photo, messageKey) {
    setPhotoError("");
    setPhotoBusy(true);
    try {
      const updated = await apiFetch(`/api/products/${product._id}`, {
        method: "PUT",
        body: JSON.stringify({ photo }),
      });
      onPhotoChange(updated, t(messageKey));
    } catch (err) {
      if (err.status === 401) {
        onUnauthorized();
        return;
      }
      setPhotoError(err.message);
    } finally {
      setPhotoBusy(false);
    }
  }

  async function handleChoosePhoto(event) {
    const file = event.target.files && event.target.files[0];
    event.target.value = ""; // lets the user pick the same file again later
    if (!file) return;

    setPhotoError("");
    setPhotoBusy(true);
    try {
      const photo = await resizeImage(file);
      await savePhoto(photo, "photoSaved");
    } catch (err) {
      setPhotoError(err.message);
      setPhotoBusy(false);
    }
  }

  async function handleSubmit() {
    if (!valid) return;
    setError("");
    setBusy(true);

    try {
      let updated;
      let message;

      if (mode === "sale") {
        const data = await apiFetch("/api/stock/sale", {
          method: "POST",
          body: JSON.stringify({ productId: product._id, quantity: qty }),
        });
        updated = data.product;
        message = t("toastSold", { qty, name: product.name });
      } else if (mode === "restock") {
        const data = await apiFetch("/api/stock/restock", {
          method: "POST",
          body: JSON.stringify({
            productId: product._id,
            quantity: qty,
            note: note.trim(),
          }),
        });
        updated = data.product;
        message = t("toastRestocked", {
          qty,
          unit: product.unit,
          name: product.name,
        });
      } else {
        const data = await apiFetch("/api/stock/count", {
          method: "POST",
          body: JSON.stringify({
            productId: product._id,
            counted: qty,
            note: note.trim(),
          }),
        });
        // The count route returns the new number, not the whole product
        updated = { ...product, stock: data.newStock };
        const diff = round(data.change);
        message =
          diff === 0
            ? t("toastCountMatch", { name: product.name, stock: data.newStock })
            : t("toastCounted", {
                name: product.name,
                stock: data.newStock,
                diff: signed(diff),
              });
      }

      onDone(updated, message);
    } catch (err) {
      if (err.status === 401) {
        onUnauthorized();
        return;
      }
      setError(err.message);
      setBusy(false);
    }
  }

  // The line of information under the number
  let info = "";
  let infoBad = false;
  if (hasNumber) {
    if (mode === "sale") {
      if (qty > product.stock) {
        info = t("notEnough");
        infoBad = true;
      } else if (qty > 0) {
        info = t("totalLine", {
          cur: t("currency"),
          n: round(qty * product.price),
        });
      }
    } else if (mode === "restock") {
      if (qty > 0) {
        info = t("newStockWillBe", {
          n: round(product.stock + qty),
          unit: product.unit,
        });
      }
    } else if (qty >= 0) {
      info = t("countInfo", {
        expected: product.stock,
        diff: signed(round(qty - product.stock)),
      });
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-picture">
          <ProductPicture product={product} big />
          <div className="photo-buttons">
            <label className="btn btn-small">
              {photoBusy
                ? t("savingPhoto")
                : product.photo
                ? t("changePhoto")
                : t("addPhoto")}
              <input
                type="file"
                accept="image/*"
                hidden
                disabled={photoBusy}
                onChange={handleChoosePhoto}
              />
            </label>
            {product.photo && (
              <button
                type="button"
                className="link-button"
                disabled={photoBusy}
                onClick={() => savePhoto("", "photoRemoved")}
              >
                {t("removePhoto")}
              </button>
            )}
          </div>
          {photoError && <p className="error-text">{photoError}</p>}
        </div>

        <h2>{product.name}</h2>
        <p className="modal-sub">
          {t("inStockLine", { n: product.stock, unit: product.unit })}
        </p>

        <div className="mode-tabs">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={"mode-tab" + (mode === m.id ? " is-active" : "")}
              disabled={m.id === "sale" && outOfStock}
              onClick={() => switchMode(m.id)}
            >
              {t(m.labelKey)}
            </button>
          ))}
        </div>

        <p className="modal-label">
          {mode === "sale" && t("qSold")}
          {mode === "restock" && t("qArrived")}
          {mode === "count" && t("qShelf")}
        </p>

        <div className="qty-row">
          <button type="button" className="qty-btn" onClick={() => step(-1)}>
            −
          </button>
          <input
            className="amount-input"
            type="number"
            inputMode="decimal"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button type="button" className="qty-btn" onClick={() => step(1)}>
            +
          </button>
        </div>

        <p className={"modal-info" + (infoBad ? " is-bad" : "")}>
          {info || "\u00A0"}
        </p>

        {mode !== "sale" && (
          <div className="field">
            <label htmlFor="note">{t("noteLabel")}</label>
            <input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                mode === "restock" ? t("notePhRestock") : t("notePhCount")
              }
            />
          </div>
        )}

        {error && <p className="error-text">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>
            {t("cancel")}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy || !valid}
            onClick={handleSubmit}
          >
            {busy
              ? t("saving")
              : mode === "sale"
              ? t("confirmSale")
              : mode === "restock"
              ? t("addToStock")
              : t("saveCount")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Form to add a new product ----------
const emptyForm = {
  name: "",
  price: "",
  cost: "",
  stock: "",
  minStock: "",
  unit: "pcs",
};

function AddProductForm({ onAdd, onClose }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState(""); // small JPEG as text, or ""
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleChoosePhoto(event) {
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (!file) return;

    setError("");
    try {
      setPhoto(await resizeImage(file));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      // Only send the optional fields the user actually filled in
      const body = {
        name: form.name,
        price: Number(form.price),
        unit: form.unit || "pcs",
      };
      if (form.cost !== "") body.cost = Number(form.cost);
      if (form.stock !== "") body.stock = Number(form.stock);
      if (form.minStock !== "") body.minStock = Number(form.minStock);
      if (photo) body.photo = photo;

      await onAdd(body);
      setForm(emptyForm);
      setPhoto("");
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <h2 className="add-form-title">{t("newProduct")}</h2>

      <div className="field">
        <label htmlFor="name">{t("fieldName")}</label>
        <input
          id="name"
          name="name"
          value={form.name}
          onChange={updateField}
          required
        />
      </div>

      <div className="field">
        <label>{t("photoOptional")}</label>
        <div className="photo-field-row">
          {photo && (
            <img className="photo-preview" src={photo} alt="Preview" />
          )}
          <label className="btn btn-small">
            {photo ? t("changePhoto") : t("takePhoto")}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleChoosePhoto}
            />
          </label>
          {photo && (
            <button
              type="button"
              className="link-button"
              onClick={() => setPhoto("")}
            >
              {t("removePhoto")}
            </button>
          )}
        </div>
      </div>

      <div className="add-form-row">
        <div className="field">
          <label htmlFor="price">{t("sellPrice", { cur: t("currency") })}</label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="any"
            value={form.price}
            onChange={updateField}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="cost">{t("buyPrice", { cur: t("currency") })}</label>
          <input
            id="cost"
            name="cost"
            type="number"
            min="0"
            step="any"
            value={form.cost}
            onChange={updateField}
          />
        </div>
      </div>

      <div className="add-form-row">
        <div className="field">
          <label htmlFor="stock">{t("stockNow")}</label>
          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            step="any"
            value={form.stock}
            onChange={updateField}
          />
        </div>
        <div className="field">
          <label htmlFor="minStock">{t("warnBelow")}</label>
          <input
            id="minStock"
            name="minStock"
            type="number"
            min="0"
            step="any"
            value={form.minStock}
            onChange={updateField}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="unit">{t("unitLabel")}</label>
        <input
          id="unit"
          name="unit"
          value={form.unit}
          onChange={updateField}
        />
      </div>

      {error && <p className="error-text">{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? t("saving") : t("saveProduct")}
      </button>
    </form>
  );
}

// ---------- The page itself ----------
export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [selected, setSelected] = useState(null); // product in the popup
  const [showAdd, setShowAdd] = useState(false);

  function handleUnauthorized() {
    clearSession();
    router.replace("/login");
  }

  function showToast(text) {
    setToast(text);
    setTimeout(() => setToast(""), 3000);
  }

  // Runs once when the page opens
  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }

    async function loadProducts() {
      try {
        const data = await apiFetch("/api/products");
        setProducts(data);
      } catch (err) {
        if (err.status === 401) {
          clearSession();
          router.replace("/login");
          return;
        }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [router]);

  // Called by the popup after a sale, restock or count succeeded
  function handleDone(updatedProduct, message) {
    setProducts((current) =>
      current.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
    );
    showToast(message);
    setSelected(null);
  }

  // Called when only the photo changed: update the list, keep the popup open
  function handlePhotoChange(updatedProduct, message) {
    setProducts((current) =>
      current.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
    );
    setSelected(updatedProduct);
    showToast(message);
  }

  async function handleAdd(body) {
    const product = await apiFetch("/api/products", {
      method: "POST",
      body: JSON.stringify(body),
    });
    setProducts((current) => [product, ...current]);
    showToast(t("toastAdded", { name: product.name }));
  }

  return (
    <div className="dash">
      <AppHeader />

      <div className="dash-actions">
        <p className="dash-sub">{t("tapHint")}</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowAdd(!showAdd)}
        >
          {showAdd ? t("closeForm") : t("addProduct")}
        </button>
      </div>

      {showAdd && (
        <AddProductForm onAdd={handleAdd} onClose={() => setShowAdd(false)} />
      )}

      {error && <p className="error-text">{error}</p>}
      {loading && <p className="center-text">{t("loadingProducts")}</p>}
      {!loading && !error && products.length === 0 && (
        <p className="center-text">{t("noProducts")}</p>
      )}

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onClick={() => setSelected(product)}
          />
        ))}
      </div>

      {selected && (
        <StockModal
          key={selected._id}
          product={selected}
          onClose={() => setSelected(null)}
          onDone={handleDone}
          onPhotoChange={handlePhotoChange}
          onUnauthorized={handleUnauthorized}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}