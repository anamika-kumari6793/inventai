// mockData.js - Comprehensive Mock Data for InventAI FEFO Inventory Management System

const INVENTORY_DATA = {
  // 1. Daily Highlights KPI metrics
  highlights: {
    totalSkus: 1482,
    totalBatches: 3840,
    inventoryValue: "$248,650",
    fefoClearanceUrgent: 14, // Batches needing immediate FEFO dispatch
    criticalExpiryCount: 8,  // Batches expiring within 7 days
    lowStockCount: 11,       // Items below reorder threshold
    scannedToday: 412,       // Barcodes scanned in today's shift
    accuracyRate: "99.4%"
  },

  // Daily activity log
  activities: [
    {
      id: "ACT-001",
      type: "scan",
      title: "Barcode Scanned",
      desc: "Batch #B-104 of Amoxicillin 500mg verified at Bay 3.",
      time: "8 mins ago",
      badge: "Scan Station A",
      status: "success"
    },
    {
      id: "ACT-002",
      type: "fefo",
      title: "FEFO Clearance Triggered",
      desc: "Dispatched Batch #DAIRY-771 (Exp: In 4 days) before newer batch #DAIRY-802.",
      time: "24 mins ago",
      badge: "FEFO Auto-Rule",
      status: "urgent"
    },
    {
      id: "ACT-003",
      type: "alert",
      title: "Low Stock Alert",
      desc: "Insulin Glargine 100IU reached 14 units (Reorder threshold: 30 units).",
      time: "1 hour ago",
      badge: "Inventory Risk",
      status: "warning"
    },
    {
      id: "ACT-004",
      type: "restock",
      title: "New Inward Batch Received",
      desc: "Received 500 units of Paracetamol 650mg, Batch #PCM-2026-99.",
      time: "2 hours ago",
      badge: "Dock 1",
      status: "info"
    }
  ],

  // 2. Comprehensive Products with FEFO Batches
  products: [
    {
      id: "PROD-101",
      name: "Amoxicillin Trihydrate 500mg",
      category: "Pharmaceuticals",
      sku: "MED-AMX-500",
      barcode: "8901030889211",
      qrCode: "QR-MED-AMX-500-2026",
      unit: "Strips (10s)",
      totalStock: 85,
      reorderPoint: 150,
      isLowStock: true,
      storageLocation: "Aisle 4, Shelf B-2 (Temp 20-25°C)",
      consumptionRatePerDay: 14,
      predictedStockoutDays: 6,
      batches: [
        {
          batchNumber: "AMX-B101",
          mfgDate: "2025-09-10",
          expiryDate: "2026-09-08", // Very close!
          quantity: 25,
          daysToExpiry: 6,
          status: "urgent", // < 7 days
          fefoPriority: 1,  // Must dispatch first!
          shelfLifePercent: 12
        },
        {
          batchNumber: "AMX-B102",
          mfgDate: "2025-11-15",
          expiryDate: "2026-10-15",
          quantity: 60,
          daysToExpiry: 43,
          status: "warning",
          fefoPriority: 2,
          shelfLifePercent: 45
        }
      ]
    },
    {
      id: "PROD-102",
      name: "Fresh Whole Milk 1L - Pasteurized",
      category: "Dairy & Perishables",
      sku: "DRY-WMLK-1L",
      barcode: "8902519001423",
      qrCode: "QR-DRY-WMLK-1L-2026",
      unit: "Cartons",
      totalStock: 42,
      reorderPoint: 80,
      isLowStock: true,
      storageLocation: "Chiller Room 2, Rack C (Temp 2-4°C)",
      consumptionRatePerDay: 18,
      predictedStockoutDays: 2.3,
      batches: [
        {
          batchNumber: "MLK-708A",
          mfgDate: "2026-08-28",
          expiryDate: "2026-09-05", // 3 days left!
          quantity: 18,
          daysToExpiry: 3,
          status: "urgent",
          fefoPriority: 1,
          shelfLifePercent: 18
        },
        {
          batchNumber: "MLK-709B",
          mfgDate: "2026-09-01",
          expiryDate: "2026-09-12",
          quantity: 24,
          daysToExpiry: 10,
          status: "warning",
          fefoPriority: 2,
          shelfLifePercent: 60
        }
      ]
    },
    {
      id: "PROD-103",
      name: "Paracetamol 650mg (Fast Relief)",
      category: "Pharmaceuticals",
      sku: "MED-PCM-650",
      barcode: "8904005128763",
      qrCode: "QR-MED-PCM-650-2026",
      unit: "Boxes (100 tabs)",
      totalStock: 240,
      reorderPoint: 100,
      isLowStock: false,
      storageLocation: "Aisle 2, Bin 12",
      consumptionRatePerDay: 20,
      predictedStockoutDays: 12,
      batches: [
        {
          batchNumber: "PCM-901",
          mfgDate: "2024-10-01",
          expiryDate: "2026-09-18",
          quantity: 50,
          daysToExpiry: 16,
          status: "warning",
          fefoPriority: 1,
          shelfLifePercent: 25
        },
        {
          batchNumber: "PCM-902",
          mfgDate: "2025-04-10",
          expiryDate: "2027-04-10",
          quantity: 190,
          daysToExpiry: 220,
          status: "safe",
          fefoPriority: 2,
          shelfLifePercent: 88
        }
      ]
    },
    {
      id: "PROD-104",
      name: "Organic Greek Yogurt 500g",
      category: "Dairy & Perishables",
      sku: "DRY-YGT-500",
      barcode: "8901233005882",
      qrCode: "QR-DRY-YGT-500-2026",
      unit: "Tubs",
      totalStock: 15,
      reorderPoint: 50,
      isLowStock: true,
      storageLocation: "Chiller Room 1, Rack A",
      consumptionRatePerDay: 8,
      predictedStockoutDays: 1.8,
      batches: [
        {
          batchNumber: "YGT-221",
          mfgDate: "2026-08-15",
          expiryDate: "2026-09-04", // 2 days left!
          quantity: 7,
          daysToExpiry: 2,
          status: "urgent",
          fefoPriority: 1,
          shelfLifePercent: 8
        },
        {
          batchNumber: "YGT-222",
          mfgDate: "2026-08-25",
          expiryDate: "2026-09-20",
          quantity: 8,
          daysToExpiry: 18,
          status: "warning",
          fefoPriority: 2,
          shelfLifePercent: 42
        }
      ]
    },
    {
      id: "PROD-105",
      name: "Insulin Glargine Pen 100 IU/ml",
      category: "Pharmaceuticals",
      sku: "MED-INS-100",
      barcode: "8906001229384",
      qrCode: "QR-MED-INS-100-2026",
      unit: "Vials",
      totalStock: 14,
      reorderPoint: 30,
      isLowStock: true,
      storageLocation: "Cold Vault A (Temp 2-8°C)",
      consumptionRatePerDay: 3,
      predictedStockoutDays: 4.6,
      batches: [
        {
          batchNumber: "INS-GL-08",
          mfgDate: "2025-06-01",
          expiryDate: "2026-09-25",
          quantity: 14,
          daysToExpiry: 23,
          status: "warning",
          fefoPriority: 1,
          shelfLifePercent: 35
        }
      ]
    },
    {
      id: "PROD-106",
      name: "Whole Wheat Bread Loaf 400g",
      category: "Bakery & Fresh",
      sku: "BKY-WBRD-400",
      barcode: "8908877112233",
      qrCode: "QR-BKY-WBRD-400-2026",
      unit: "Loaves",
      totalStock: 8,
      reorderPoint: 40,
      isLowStock: true,
      storageLocation: "Bakery Dispatch Bay 1",
      consumptionRatePerDay: 12,
      predictedStockoutDays: 0.6,
      batches: [
        {
          batchNumber: "BRD-990",
          mfgDate: "2026-08-30",
          expiryDate: "2026-09-03", // 1 day left!
          quantity: 8,
          daysToExpiry: 1,
          status: "urgent",
          fefoPriority: 1,
          shelfLifePercent: 5
        }
      ]
    },
    {
      id: "PROD-107",
      name: "Ceftriaxone 1g Injection",
      category: "Pharmaceuticals",
      sku: "MED-CEF-1G",
      barcode: "8904556117821",
      qrCode: "QR-MED-CEF-1G-2026",
      unit: "Vials",
      totalStock: 320,
      reorderPoint: 120,
      isLowStock: false,
      storageLocation: "Aisle 5, Shelf D-1",
      consumptionRatePerDay: 15,
      predictedStockoutDays: 21,
      batches: [
        {
          batchNumber: "CEF-512",
          mfgDate: "2025-01-10",
          expiryDate: "2026-09-30",
          quantity: 60,
          daysToExpiry: 28,
          status: "warning",
          fefoPriority: 1,
          shelfLifePercent: 30
        },
        {
          batchNumber: "CEF-513",
          mfgDate: "2025-08-01",
          expiryDate: "2027-08-01",
          quantity: 260,
          daysToExpiry: 333,
          status: "safe",
          fefoPriority: 2,
          shelfLifePercent: 92
        }
      ]
    }
  ],

  // 3. AI Predictions & Demand Forecasting Data
  predictions: {
    labels: ["Day 1", "Day 3", "Day 5", "Day 7", "Day 9", "Day 11", "Day 14"],
    milkDemandForecast: [38, 32, 28, 22, 16, 9, 2], // projected depletion
    milkRecommendedRestock: [0, 0, 45, 0, 0, 60, 0],
    amoxicillinDepletion: [85, 71, 57, 43, 29, 15, 1],
    highRiskStockouts: [
      { product: "Whole Wheat Bread 400g", daysRemaining: 0.6, risk: "CRITICAL", currentQty: 8, leadTimeDays: 1 },
      { product: "Organic Greek Yogurt 500g", daysRemaining: 1.8, risk: "CRITICAL", currentQty: 15, leadTimeDays: 2 },
      { product: "Fresh Whole Milk 1L", daysRemaining: 2.3, risk: "HIGH", currentQty: 42, leadTimeDays: 2 },
      { product: "Insulin Glargine 100IU", daysRemaining: 4.6, risk: "HIGH", currentQty: 14, leadTimeDays: 4 },
      { product: "Amoxicillin 500mg", daysRemaining: 6.0, risk: "MODERATE", currentQty: 85, leadTimeDays: 3 }
    ]
  },

  // 4. Multilingual AI Chatbot Knowledge Base & Intent responses
  chatbot: {
    languages: [
      { code: "en", name: "English", flag: "🇬🇧" },
      { code: "hi", name: "हिन्दी (Hindi)", flag: "🇮🇳" },
      { code: "es", name: "Español", flag: "🇪🇸" },
      { code: "fr", name: "Français", flag: "🇫🇷" }
    ],
    samplePrompts: {
      en: [
        "Which batch of Milk expires first?",
        "Show all low stock alerts",
        "What is our FEFO clearance priority for today?",
        "Scan product details for Amoxicillin"
      ],
      hi: [
        "दूध का कौन सा बैच पहले एक्सपायर होगा?",
        "कम स्टॉक वाले सामान की सूची दिखाएं",
        "आज FEFO नियम के अनुसार क्या डिस्पैच करना है?",
        "Amoxicillin उत्पाद का विवरण बताएं"
      ],
      es: [
        "¿Qué lote de leche vence primero?",
        "Mostrar alertas de stock bajo",
        "¿Cuál es la prioridad FEFO para hoy?",
        "Detalles del producto Amoxicilina"
      ],
      fr: [
        "Quel lot de lait expire en premier ?",
        "Afficher les alertes de stock faible",
        "Quelle est la priorité FEFO aujourd'hui ?",
        "Détails du produit Amoxicilline"
      ]
    },
    // Pre-calculated conversational answers
    responses: {
      en: {
        fefo_milk: "Under the **FEFO (First Expiry, First Out)** protocol, **Batch #MLK-708A** must be dispatched FIRST! It has only **3 days left** before expiration (Expiry: Sep 05, 2026). Do not dispatch Batch #MLK-709B until Batch 708A is cleared.",
        low_stock: "⚠️ You currently have **5 critical low stock products**: Bread (8 left), Insulin (14 left), Greek Yogurt (15 left), Milk (42 left), and Amoxicillin (85 left). Restock purchase orders are recommended.",
        fefo_today: "📋 **Today's FEFO Priority List**: \n1. Bread Batch #BRD-990 (1 day left)\n2. Greek Yogurt Batch #YGT-221 (2 days left)\n3. Milk Batch #MLK-708A (3 days left)\n4. Amoxicillin Batch #AMX-B101 (6 days left).",
        amoxicillin_details: "💊 **Amoxicillin Trihydrate 500mg**:\n• Total Stock: 85 strips\n• FEFO Priority Batch: #AMX-B101 (25 strips, expires in 6 days!)\n• Storage: Aisle 4, Shelf B-2\n• Stockout Risk: Projected in 6 days."
      },
      hi: {
        fefo_milk: "नियम **FEFO (पहले एक्सपायर, पहले बाहर)** के अनुसार, **बैच #MLK-708A** को सबसे पहले डिस्पैच किया जाना चाहिए! इसकी एक्सपायरी में केवल **3 दिन शेष** हैं (एक्सपायरी: 05 सितंबर 2026)।",
        low_stock: "⚠️ वर्तमान में आपके पास **5 महत्वपूर्ण कम स्टॉक उत्पाद** हैं: ब्रेड (8 शेष), इंसुलिन (14 शेष), दही (15 शेष), दूध (42 शेष)। तुरंत रीऑर्डर करने की सलाह दी जाती है।",
        fefo_today: "📋 **आज की FEFO प्राथमिकता सूची**:\n1. ब्रेड बैच #BRD-990 (1 दिन शेष)\n2. दही बैच #YGT-221 (2 दिन शेष)\n3. दूध बैच #MLK-708A (3 दिन शेष)\n4. Amoxicillin बैच #AMX-B101 (6 दिन शेष)।",
        amoxicillin_details: "💊 **Amoxicillin Trihydrate 500mg विवरण**:\n• कुल स्टॉक: 85 स्ट्रिप्स\n• FEFO प्राथमिकता बैच: #AMX-B101 (25 स्ट्रिप्स, 6 दिन में एक्सपायर!)\n• स्थान: रैक Aisle 4, Shelf B-2।"
      },
      es: {
        fefo_milk: "Bajo la regla **FEFO (Primero en expirar, primero en salir)**, ¡el **Lote #MLK-708A** debe despacharse PRIMERO! Le quedan solo **3 días** antes de vencer.",
        low_stock: "⚠️ Tiene **5 productos con stock bajo crítico**: Pan (8 restantes), Insulina (14), Yogur (15), Leche (42) y Amoxicilina (85).",
        fefo_today: "📋 **Prioridad FEFO de hoy**:\n1. Pan Lote #BRD-990 (1 día restante)\n2. Yogur Lote #YGT-221 (2 días restantes)\n3. Leche Lote #MLK-708A (3 días restantes).",
        amoxicillin_details: "💊 **Amoxicilina 500mg**:\n• Stock total: 85 unidades\n• Lote prioritario FEFO: #AMX-B101 (25 unidades, vence en 6 días)\n• Ubicación: Pasillo 4, Estante B-2."
      },
      fr: {
        fefo_milk: "Selon le protocole **FEFO (Premier expiré, premier sorti)**, le **Lot #MLK-708A** doit être expédié EN PREMIER ! Il ne reste que **3 jours** avant péremption.",
        low_stock: "⚠️ Vous avez actuellement **5 produits en stock critique**: Pain (8 restants), Insuline (14), Yaourt (15), Lait (42).",
        fefo_today: "📋 **Priorités FEFO du jour**:\n1. Pain Lot #BRD-990 (1 jour restant)\n2. Yaourt Lot #YGT-221 (2 jours restants)\n3. Lait Lot #MLK-708A (3 jours restants).",
        amoxicillin_details: "💊 **Amoxicilline 500mg**:\n• Stock total: 85 unités\n• Lot prioritaire FEFO: #AMX-B101 (25 unités, expire dans 6 jours)\n• Emplacement: Allée 4, Étagère B-2."
      }
    }
  }
};

// Export or attach to window for global access
if (typeof window !== "undefined") {
  window.INVENTORY_DATA = INVENTORY_DATA;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = INVENTORY_DATA;
}
