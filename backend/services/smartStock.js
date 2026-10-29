const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");

const DAY_MS = 24 * 60 * 60 * 1000;

async function getReorderSuggestions({
  days = 14,         // how many days of history to look at
  leadTimeDays = 3,  // how long the supplier takes to deliver
  safetyDays = 2,    // extra buffer
  targetDays = 14,   // order enough to last this many days
} = {}) {
  const since = new Date(Date.now() - days * DAY_MS);

  // Add up how many units left the shelf per product (sales and count drops)
  const usageRows = await StockMovement.aggregate([
    { $match: { createdAt: { $gte: since }, change: { $lt: 0 } } },
    { $group: { _id: "$product", used: { $sum: { $abs: "$change" } } } },
  ]);

  const usageByProduct = {};
  for (const row of usageRows) {
    usageByProduct[String(row._id)] = row.used;
  }

  const products = await Product.find();
  const suggestions = [];

  for (const product of products) {
    const used = usageByProduct[String(product._id)] || 0;
    const avgPerDay = used / days;

    let daysLeft = null; // null means "no sales data yet"
    if (product.stock === 0) {
      daysLeft = 0;
    } else if (avgPerDay > 0) {
      daysLeft = product.stock / avgPerDay;
    }

    const runningOutSoon = daysLeft !== null && daysLeft <= leadTimeDays + safetyDays;
    const belowMinimum = product.stock <= product.minStock;

    if (!runningOutSoon && !belowMinimum) continue; // this product is fine

    // Order enough to last targetDays, minus what we already have
    let suggestedQty = Math.ceil(avgPerDay * targetDays) - product.stock;

    // No sales data yet: fall back to twice the minimum stock
    if (suggestedQty <= 0) {
      suggestedQty = Math.max(product.minStock * 2 - product.stock, 1);
    }

    suggestions.push({
      productId: product._id,
      name: product.name,
      unit: product.unit,
      stock: product.stock,
      avgPerDay: Number(avgPerDay.toFixed(2)),
      daysLeft: daysLeft === null ? null : Number(daysLeft.toFixed(1)),
      suggestedQty,
      reason: runningOutSoon ? "Will run out soon" : "Below minimum stock",
    });
  }

  // Most urgent first
  suggestions.sort((a, b) => (a.daysLeft ?? Infinity) - (b.daysLeft ?? Infinity));

  return suggestions;
}

module.exports = { getReorderSuggestions };