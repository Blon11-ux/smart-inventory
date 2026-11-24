"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getToken, clearSession } from "../../lib/api";
import AppHeader from "../../components/AppHeader";
import "./reorder.css";

export default function ReorderPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [leadTime, setLeadTime] = useState(3); // supplier delivery time in days
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Runs on open, and again whenever the delivery time changes
  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }

    let cancelled = false; // ignore old answers if the choice changed again

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch(
          `/api/stock/reorder-suggestions?leadTimeDays=${leadTime}`
        );
        if (!cancelled) setItems(data);
      } catch (err) {
        if (err.status === 401) {
          clearSession();
          router.replace("/login");
          return;
        }
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [leadTime, router]);

  return (
    <div className="reorder">
      <AppHeader />

      <div className="reorder-toolbar">
        <label htmlFor="leadTime">Supplier delivers in</label>
        <select
          id="leadTime"
          value={leadTime}
          onChange={(e) => setLeadTime(Number(e.target.value))}
        >
          <option value={1}>1 day</option>
          <option value={2}>2 days</option>
          <option value={3}>3 days</option>
          <option value={5}>5 days</option>
          <option value={7}>7 days</option>
        </select>
      </div>

      <p className="reorder-note">
        Estimates use the last 14 days of sales and stock counts. They get more
        accurate the longer you use the app.
      </p>

      {error && <p className="error-text">{error}</p>}
      {loading && <p className="center-text">Calculating...</p>}

      {!loading && !error && items.length === 0 && (
        <p className="center-text">
          All good. Nothing needs reordering right now.
        </p>
      )}

      {!loading && items.length > 0 && (
        <p className="reorder-count">
          {items.length} product{items.length === 1 ? "" : "s"} need attention
        </p>
      )}

      <div className="reorder-list">
        {items.map((item) => {
          const urgent = item.daysLeft === 0;
          return (
            <div
              key={item.productId}
              className={"reorder-card" + (urgent ? " is-urgent" : "")}
            >
              <div className="reorder-head">
                <h2 className="reorder-name">{item.name}</h2>
                <span className="reorder-reason">{item.reason}</span>
              </div>

              <div className="reorder-stats">
                <div>
                  <div className="stat-label">In stock</div>
                  <div className="stat-value">
                    {item.stock} {item.unit}
                  </div>
                </div>
                <div>
                  <div className="stat-label">Sells about</div>
                  <div className="stat-value">
                    {item.avgPerDay} / day
                  </div>
                </div>
                <div>
                  <div className="stat-label">Days left</div>
                  <div className="stat-value">
                    {item.daysLeft === null ? "No sales yet" : item.daysLeft}
                  </div>
                </div>
                <div>
                  <div className="stat-label">Suggested order</div>
                  <div className="stat-value stat-order">
                    {item.suggestedQty} {item.unit}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}