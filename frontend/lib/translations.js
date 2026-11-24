export const translations = {
  en: {
    // ----- shared -----
    currency: "Rs.",
    appName: "Smart Inventory",
    cancel: "Cancel",
    saving: "Saving...",

    // ----- login -----
    loginSub: "Log in to your shop",
    registerSub: "Create your shop account",
    shopName: "Shop name",
    email: "Email",
    password: "Password (at least 8 characters)",
    loginButton: "Log in",
    registerButton: "Register",
    pleaseWait: "Please wait...",
    newShop: "New shop?",
    createAccount: "Create an account",
    alreadyRegistered: "Already registered?",
    loginLink: "Log in",

    // ----- header -----
    myShop: "My shop",
    logout: "Log out",
    navShop: "Shop",
    navReorder: "Reorder",

    // ----- dashboard -----
    tapHint: "Tap a product to sell, restock or count",
    addProduct: "+ Add product",
    closeForm: "Close",
    loadingProducts: "Loading products...",
    noProducts: "No products yet. Add your first one.",
    outOfStock: "Out of stock",
    leftLabel: "{n} {unit} left",
    modeSell: "Sell",
    modeRestock: "Restock",
    modeCount: "Count",
    inStockLine: "In stock: {n} {unit}",
    qSold: "How many sold?",
    qArrived: "How many arrived?",
    qShelf: "How many are on the shelf now?",
    totalLine: "Total: {cur} {n}",
    notEnough: "Not enough stock for this sale",
    newStockWillBe: "New stock will be {n} {unit}",
    countInfo: "System expected {expected}. Difference: {diff}",
    noteLabel: "Note (optional)",
    notePhRestock: "e.g. Delivery from supplier",
    notePhCount: "e.g. Evening count",
    confirmSale: "Confirm sale",
    addToStock: "Add to stock",
    saveCount: "Save count",
    addPhoto: "Add photo",
    changePhoto: "Change photo",
    removePhoto: "Remove",
    savingPhoto: "Saving photo...",
    photoSaved: "Photo saved",
    photoRemoved: "Photo removed",
    toastSold: "Sold {qty} × {name}",
    toastRestocked: "Added {qty} {unit} to {name}",
    toastCountMatch: "{name}: count matches ({stock})",
    toastCounted: "{name}: counted {stock} ({diff})",
    toastAdded: "Added {name}",
    newProduct: "New product",
    fieldName: "Name",
    photoOptional: "Photo (optional)",
    takePhoto: "Take or choose photo",
    sellPrice: "Selling price ({cur})",
    buyPrice: "Buying price ({cur})",
    stockNow: "Stock now",
    warnBelow: "Warn me below",
    unitLabel: "Unit (pcs, kg, litre...)",
    saveProduct: "Save product",

    // ----- reorder -----
    supplierDelivers: "Supplier delivers in",
    dayOne: "1 day",
    dayMany: "{n} days",
    reorderNote:
      "Estimates use the last 14 days of sales and stock counts. They get more accurate the longer you use the app.",
    calculating: "Calculating...",
    allGood: "All good. Nothing needs reordering right now.",
    needAttentionOne: "1 product needs attention",
    needAttentionMany: "{n} products need attention",
    statInStock: "In stock",
    statSellsAbout: "Sells about",
    perDay: "{n} / day",
    statDaysLeft: "Days left",
    noSalesYet: "No sales yet",
    statSuggested: "Suggested order",
    reasonSoon: "Will run out soon",
    reasonBelowMin: "Below minimum stock",

    // ----- errors -----
    errNetwork: "Cannot reach the server. Is the backend running?",
    errGeneric: "Something went wrong",
    errChooseImage: "Please choose an image file",
    errReadImage: "Could not read this image",
    errBadLogin: "Invalid email or password",
    errEmailTaken: "This email is already registered",
    errPasswordShort: "Password must be at least 8 characters",
    errNotEnoughStock: "Not enough stock for this sale",
    errNotFound: "Product not found",
    errLoginRequired: "Please log in",
    errSessionExpired: "Invalid or expired token",
  },

  ne: {
    // ----- shared -----
    currency: "रू",
    appName: "Smart Inventory",
    cancel: "रद्द गर्नुहोस्",
    saving: "सुरक्षित गर्दै...",

    // ----- login -----
    loginSub: "आफ्नो पसलमा लगइन गर्नुहोस्",
    registerSub: "आफ्नो पसलको खाता बनाउनुहोस्",
    shopName: "पसलको नाम",
    email: "इमेल",
    password: "पासवर्ड (कम्तीमा 8 अक्षर)",
    loginButton: "लगइन",
    registerButton: "दर्ता गर्नुहोस्",
    pleaseWait: "कृपया पर्खनुहोस्...",
    newShop: "नयाँ पसल?",
    createAccount: "खाता बनाउनुहोस्",
    alreadyRegistered: "पहिले नै दर्ता गर्नुभएको छ?",
    loginLink: "लगइन गर्नुहोस्",

    // ----- header -----
    myShop: "मेरो पसल",
    logout: "लगआउट",
    navShop: "पसल",
    navReorder: "पुनः अर्डर",

    // ----- dashboard -----
    tapHint: "बिक्री, स्टक थप्न वा गन्न सामानमा थिच्नुहोस्",
    addProduct: "+ सामान थप्नुहोस्",
    closeForm: "बन्द गर्नुहोस्",
    loadingProducts: "सामान लोड हुँदैछ...",
    noProducts: "अहिलेसम्म कुनै सामान छैन। पहिलो सामान थप्नुहोस्।",
    outOfStock: "स्टक सकियो",
    leftLabel: "{n} {unit} बाँकी",
    modeSell: "बिक्री",
    modeRestock: "स्टक थप",
    modeCount: "गणना",
    inStockLine: "स्टकमा: {n} {unit}",
    qSold: "कति बिक्री भयो?",
    qArrived: "कति आयो?",
    qShelf: "अहिले सेल्फमा कति छन्?",
    totalLine: "जम्मा: {cur} {n}",
    notEnough: "यो बिक्रीका लागि पर्याप्त स्टक छैन",
    newStockWillBe: "नयाँ स्टक {n} {unit} हुनेछ",
    countInfo: "प्रणालीले {expected} अपेक्षा गरेको थियो। फरक: {diff}",
    noteLabel: "टिप्पणी (वैकल्पिक)",
    notePhRestock: "जस्तै: आपूर्तिकर्ताबाट डेलिभरी",
    notePhCount: "जस्तै: साँझको गणना",
    confirmSale: "बिक्री पुष्टि गर्नुहोस्",
    addToStock: "स्टकमा थप्नुहोस्",
    saveCount: "गणना सुरक्षित गर्नुहोस्",
    addPhoto: "फोटो थप्नुहोस्",
    changePhoto: "फोटो बदल्नुहोस्",
    removePhoto: "हटाउनुहोस्",
    savingPhoto: "फोटो सुरक्षित गर्दै...",
    photoSaved: "फोटो सुरक्षित भयो",
    photoRemoved: "फोटो हटाइयो",
    toastSold: "{qty} × {name} बिक्री भयो",
    toastRestocked: "{name} मा {qty} {unit} थपियो",
    toastCountMatch: "{name}: गणना मिल्यो ({stock})",
    toastCounted: "{name}: गणना {stock} ({diff})",
    toastAdded: "{name} थपियो",
    newProduct: "नयाँ सामान",
    fieldName: "नाम",
    photoOptional: "फोटो (वैकल्पिक)",
    takePhoto: "फोटो खिच्नुहोस् वा छान्नुहोस्",
    sellPrice: "बिक्री मूल्य ({cur})",
    buyPrice: "खरिद मूल्य ({cur})",
    stockNow: "अहिलेको स्टक",
    warnBelow: "यति भन्दा कम भए सूचना",
    unitLabel: "एकाइ (pcs, kg, litre...)",
    saveProduct: "सामान सुरक्षित गर्नुहोस्",

    // ----- reorder -----
    supplierDelivers: "आपूर्तिकर्ताले डेलिभर गर्ने समय",
    dayOne: "1 दिन",
    dayMany: "{n} दिन",
    reorderNote:
      "अनुमान पछिल्ला 14 दिनको बिक्री र स्टक गणनामा आधारित छ। एप जति लामो समय प्रयोग गरिन्छ, अनुमान त्यति नै सही हुन्छ।",
    calculating: "गणना गर्दै...",
    allGood: "सबै ठीक छ। अहिले कुनै सामान पुनः अर्डर गर्नु पर्दैन।",
    needAttentionOne: "1 सामानमा ध्यान दिनुपर्छ",
    needAttentionMany: "{n} सामानमा ध्यान दिनुपर्छ",
    statInStock: "स्टकमा",
    statSellsAbout: "दैनिक बिक्री",
    perDay: "{n} / दिन",
    statDaysLeft: "बाँकी दिन",
    noSalesYet: "बिक्री डेटा छैन",
    statSuggested: "सुझाव गरिएको अर्डर",
    reasonSoon: "चाँडै सकिँदैछ",
    reasonBelowMin: "न्यूनतम स्टकभन्दा कम",

    // ----- errors -----
    errNetwork: "सर्भरमा पुग्न सकिएन। ब्याकइन्ड चलिरहेको छ?",
    errGeneric: "केही गलत भयो",
    errChooseImage: "कृपया फोटो फाइल छान्नुहोस्",
    errReadImage: "यो फोटो पढ्न सकिएन",
    errBadLogin: "इमेल वा पासवर्ड मिलेन",
    errEmailTaken: "यो इमेल पहिले नै दर्ता भइसकेको छ",
    errPasswordShort: "पासवर्ड कम्तीमा 8 अक्षरको हुनुपर्छ",
    errNotEnoughStock: "यो बिक्रीका लागि पर्याप्त स्टक छैन",
    errNotFound: "सामान फेला परेन",
    errLoginRequired: "कृपया लगइन गर्नुहोस्",
    errSessionExpired: "सत्र समाप्त भयो, फेरि लगइन गर्नुहोस्",
  },
};

// Turns a key into text. {name} placeholders are filled from params.
export function translate(lang, key, params = {}) {
  const dictionary = translations[lang] || translations.en;
  const text = dictionary[key] ?? translations.en[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (match, name) =>
    params[name] !== undefined ? String(params[name]) : match
  );
}

// Reads the saved language (used by files that are not React components)
export function getSavedLanguage() {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem("lang");
    return saved === "ne" ? "ne" : "en";
  } catch (err) {
    return "en";
  }
}