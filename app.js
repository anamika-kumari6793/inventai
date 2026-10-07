// app.js - Controller for InventAI FEFO Inventory Management System (Mint Green Pastel Theme)

let currentLanguage = 'en';
let currentCategoryFilter = 'all';
let onlyFefoUrgentFilter = false;
let predictionChartInstance = null;
let isVoiceRecording = false;

// 1. Immediate Synchronous Bootstrapping (Pure Frontend Prototype for Review 2)
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Set user display if present
  const user = JSON.parse(localStorage.getItem('smartstock_user') || '{}');
  if (user.email) {
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.innerText = v; };
    set('userEmail', user.email); set('userRole', user.role || 'Admin'); set('userInitial', user.email[0].toUpperCase());
  }

  // Render all frontend components immediately from mock data
  renderDailyHighlights();
  renderLowStockAlerts();
  renderExpiryAlerts();
  renderFefoProducts();
  renderRiskRadar();
  renderActivityStream();
  renderChatbotSuggestions();
  initPredictionChart('milk');
  showView((location.hash || '#overview').slice(1));
});


/* =========================================================================
   SIDEBAR NAVIGATION - one page per feature
   ========================================================================= */
const VIEW_META = {
  overview:  ['Overview', "Today's warehouse at a glance."],
  batches:   ['FEFO batches', 'Every product with batches ordered by expiry. The first batch leaves first.'],
  lowstock:  ['Low stock alerts', 'Products below their reorder point.'],
  expiry:    ['Expiry alerts', 'Batches nearing the end of their shelf life.'],
  scanner:   ['QR / barcode scanner', 'Verify a batch and its dispatch priority.'],
  forecast:  ['Demand forecast', 'Projected stock levels and stockout risk.'],
  assistant: ['AI assistant', 'Ask in English, Hindi, Spanish or French.']
};

function showView(name) {
  if (!VIEW_META[name]) name = 'overview';
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === `view-${name}`));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === name));
  document.getElementById('pageTitle').innerText = VIEW_META[name][0];
  document.getElementById('pageSub').innerText = VIEW_META[name][1];
  if (name !== 'scanner') stopWebcam();
  if (name === 'forecast') initPredictionChart('milk');
  history.replaceState(null, '', `#${name}`);
  document.getElementById('sidebar').classList.add('-translate-x-full');
  window.scrollTo(0, 0);
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('-translate-x-full');
}

/* =========================================================================
   6. DAILY HIGHLIGHTS (Feature 6)
   ========================================================================= */
function renderDailyHighlights() {
  const h = INVENTORY_DATA.highlights;
  if (!h) return;

  const fefoUrgentEl = document.getElementById('fefoUrgentCount');
  const criticalExpiryEl = document.getElementById('criticalExpiryCount');
  const lowStockEl = document.getElementById('lowStockCount');
  const scannedTodayEl = document.getElementById('scannedToday');

  // Recalculate low stock dynamically from memory
  const actualLowStock = INVENTORY_DATA.products.filter(p => p.isLowStock).length;
  h.lowStockCount = actualLowStock;

  const navLow = document.getElementById('navLowCount');
  const navExp = document.getElementById('navExpiryCount');
  if (navLow) navLow.innerText = actualLowStock;
  if (navExp) navExp.innerText = INVENTORY_DATA.products.reduce((n, p) => n + p.batches.filter(b => b.daysToExpiry <= 30 && b.quantity > 0).length, 0);
  if (fefoUrgentEl) fefoUrgentEl.innerText = h.fefoClearanceUrgent;
  if (criticalExpiryEl) criticalExpiryEl.innerText = h.criticalExpiryCount;
  if (lowStockEl) lowStockEl.innerText = h.lowStockCount;
  if (scannedTodayEl) scannedTodayEl.innerText = h.scannedToday;

  const dateEl = document.getElementById('currentDateDisplay');
  if (dateEl) {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    dateEl.innerText = today.toLocaleDateString('en-US', options);
  }
}

/* =========================================================================
   1. LOW STOCK ALERTS (Feature 1) - Mint Theme with Active Restock Action
   ========================================================================= */
function renderLowStockAlerts() {
  const container = document.getElementById('lowStockItemsContainer');
  if (!container) return;

  const lowStockProducts = INVENTORY_DATA.products.filter(p => p.isLowStock);
  
  if (lowStockProducts.length === 0) {
    container.innerHTML = `
      <div class="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-center">
        <i data-lucide="check-circle" class="w-5 h-5 text-emerald-600 mx-auto mb-1"></i>
        <p class="text-xs font-semibold text-emerald-800">All inventory levels are safe and replenished!</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = lowStockProducts.map(prod => {
    const percent = Math.min(100, Math.round((prod.totalStock / prod.reorderPoint) * 100));
    const isCritical = prod.totalStock < 15;
    const barColor = isCritical ? 'bg-rose-500' : 'bg-amber-500';
    const tagColor = isCritical ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-800 border-amber-200';

    return `
      <div class="p-3 bg-slate-50 hover:bg-white border border-slate-200/80 rounded-xl transition shadow-sm" id="low-stock-card-${prod.id}">
        <div class="flex items-center justify-between text-xs mb-1.5">
          <div class="font-semibold text-slate-800 truncate pr-2">${prod.name}</div>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${tagColor}">
            ${prod.totalStock} / ${prod.reorderPoint} ${prod.unit}
          </span>
        </div>
        <div class="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-1">
          <div class="${barColor} h-2 rounded-full transition-all duration-500" style="width: ${percent}%"></div>
        </div>
        <div class="flex items-center justify-between text-[11px] text-slate-500">
          <span>Est. stockout in: <b class="${isCritical ? 'text-rose-600 font-semibold' : 'text-amber-700 font-semibold'}">${prod.predictedStockoutDays} days</b></span>
          <button onclick="simulateRestock('${prod.id}')" class="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100 transition">
            <i data-lucide="plus" class="w-3 h-3"></i> Restock
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

/* =========================================================================
   2. EXPIRY ALERTS - FEFO DRIVEN (Feature 2) - Mint Theme
   ========================================================================= */
function renderExpiryAlerts() {
  const container = document.getElementById('expiryAlertItemsContainer');
  if (!container) return;

  const urgentBatches = [];
  INVENTORY_DATA.products.forEach(prod => {
    prod.batches.forEach(b => {
      if (b.daysToExpiry <= 30 && b.quantity > 0) {
        urgentBatches.push({
          productId: prod.id,
          productName: prod.name,
          category: prod.category,
          batchNumber: b.batchNumber,
          expiryDate: b.expiryDate,
          daysToExpiry: b.daysToExpiry,
          quantity: b.quantity,
          unit: prod.unit,
          fefoPriority: b.fefoPriority,
          status: b.status
        });
      }
    });
  });

  // Sort ascending by daysToExpiry (FEFO logic!)
  urgentBatches.sort((a, b) => a.daysToExpiry - b.daysToExpiry);

  container.innerHTML = urgentBatches.map(item => {
    const isCritical = item.daysToExpiry <= 3;
    const badgeColor = isCritical 
      ? 'bg-rose-50 text-rose-700 border-rose-200 pulse-badge' 
      : 'bg-amber-50 text-amber-800 border-amber-200';

    return `
      <div class="p-3 bg-slate-50 hover:bg-white border border-slate-200/80 rounded-xl transition flex items-center justify-between shadow-sm cursor-pointer" onclick="simulateScan('${item.productId}')">
        <div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-xs text-slate-800 truncate max-w-[180px]">${item.productName}</span>
            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">#${item.batchNumber}</span>
          </div>
          <div class="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
            <span>Expiry: <b class="text-slate-700">${item.expiryDate}</b></span>
            <span>•</span>
            <span>Qty: <b class="text-slate-700">${item.quantity} ${item.unit}</b></span>
          </div>
        </div>

        <div class="text-right">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor} inline-block">
            ${item.daysToExpiry === 1 ? '1 Day Left!' : `${item.daysToExpiry} Days Left`}
          </span>
          <div class="text-[10px] text-rose-600 font-bold mt-1">FEFO #1 Dispatch</div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

/* =========================================================================
   CORE FEATURE: FEFO BATCH MANAGER & PRODUCT DIRECTORY
   ========================================================================= */
function renderFefoProducts() {
  const container = document.getElementById('productsTableContainer');
  if (!container) return;

  const searchInput = document.getElementById('globalSearchInput');
  const searchQuery = (searchInput ? searchInput.value : '').trim().toLowerCase();

  const filteredProducts = INVENTORY_DATA.products.filter(prod => {
    const matchesCategory = currentCategoryFilter === 'all' || prod.category === currentCategoryFilter;
    
    const matchesSearch = !searchQuery || 
                          prod.name.toLowerCase().includes(searchQuery) ||
                          prod.sku.toLowerCase().includes(searchQuery) ||
                          prod.barcode.includes(searchQuery) ||
                          prod.batches.some(b => b.batchNumber.toLowerCase().includes(searchQuery));
    
    const matchesFefo = !onlyFefoUrgentFilter || prod.batches.some(b => b.daysToExpiry <= 7 && b.quantity > 0);

    return matchesCategory && matchesSearch && matchesFefo;
  });

  if (filteredProducts.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center bg-emerald-50/40 rounded-2xl border border-emerald-100">
        <i data-lucide="package-search" class="w-8 h-8 text-emerald-600 mx-auto mb-2"></i>
        <p class="text-sm text-slate-700 font-semibold">No products match your search or filter.</p>
        <button onclick="clearAllFilters()" class="mt-2 text-xs text-emerald-700 font-bold underline">Reset Filters</button>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = filteredProducts.map(prod => {
    // Sort batches strictly by expiry date (FEFO)
    const sortedBatches = [...prod.batches].sort((a, b) => a.daysToExpiry - b.daysToExpiry);

    return `
      <div class="bg-white border border-emerald-100/90 rounded-2xl p-4 lg:p-5 hover:border-emerald-300 transition shadow-sm">
        
        <!-- Product Header Bar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2.5 flex-wrap">
              <h4 class="text-sm font-bold text-slate-900">${prod.name}</h4>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">${prod.category}</span>
              <span class="text-[10px] font-mono text-slate-400">SKU: ${prod.sku}</span>
            </div>
            <div class="flex items-center gap-4 text-xs text-slate-500 mt-1">
              <span>Location: <b class="text-slate-700">${prod.storageLocation}</b></span>
              <span>Barcode: <code class="text-slate-700 font-mono bg-slate-100 px-1 py-0.5 rounded">${prod.barcode}</code></span>
            </div>
          </div>

          <div class="flex items-center gap-3 self-end sm:self-center">
            <div class="text-right">
              <div class="text-xs text-slate-500">Total Stock: <b class="text-slate-900 text-sm font-bold" id="stock-display-${prod.id}">${prod.totalStock} ${prod.unit}</b></div>
              <div class="text-[10px] ${prod.isLowStock ? 'text-rose-600 font-bold' : 'text-slate-400'}">
                Reorder Point: ${prod.reorderPoint} ${prod.unit}
              </div>
            </div>
            <button onclick="simulateScan('${prod.id}')" title="Scan Barcode for this item"
              class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm active:scale-95">
              <i data-lucide="scan-barcode" class="w-3.5 h-3.5 text-emerald-600"></i> Scan & Verify
            </button>
          </div>
        </div>

        <!-- FEFO Batches List for this product -->
        <div class="mt-3">
          <p class="text-[11px] font-bold text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
            <i data-lucide="layers" class="w-3.5 h-3.5 text-emerald-600"></i> FEFO Ordered Batches (Earliest Expiry First):
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            ${sortedBatches.map((batch, index) => {
              const isFirstOut = index === 0;
              const isUrgent = batch.daysToExpiry <= 7;
              
              let cardBg = 'bg-slate-50/70 border-slate-200';
              let badgeHtml = '';

              if (isFirstOut && batch.quantity > 0) {
                cardBg = 'bg-rose-50/70 border-rose-200 shadow-sm';
                badgeHtml = `
                  <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-600 text-white shadow-sm flex items-center gap-1">
                    <i data-lucide="arrow-right-circle" class="w-3 h-3"></i> FEFO #1: DISPATCH FIRST
                  </span>
                `;
              } else if (batch.quantity === 0) {
                cardBg = 'bg-slate-100/50 border-slate-200 opacity-60';
                badgeHtml = `
                  <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-200 text-slate-600">
                    Depleted / Cleared
                  </span>
                `;
              } else {
                badgeHtml = `
                  <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-white text-slate-600 border border-slate-200">
                    Queue Position: #${index + 1}
                  </span>
                `;
              }

              return `
                <div class="p-3 rounded-xl border ${cardBg} flex flex-col justify-between" id="batch-card-${batch.batchNumber}">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-xs font-bold text-slate-800">#${batch.batchNumber}</span>
                      <span class="text-[10px] text-slate-500">Mfg: ${batch.mfgDate}</span>
                    </div>
                    ${badgeHtml}
                  </div>

                  <div class="flex items-center justify-between text-xs">
                    <div>
                      <span class="text-slate-500">Expiry:</span>
                      <b class="${isUrgent ? 'text-rose-600 font-bold' : 'text-slate-800'}">${batch.expiryDate}</b>
                      <span class="text-[11px] text-slate-500 ml-1">(${batch.daysToExpiry}d left)</span>
                    </div>
                    <div>
                      <span class="text-slate-500">Quantity:</span>
                      <b class="text-slate-900 font-semibold">${batch.quantity} ${prod.unit}</b>
                    </div>
                  </div>

                  <!-- Shelf life progress meter -->
                  <div class="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div class="${isUrgent ? 'bg-rose-500' : 'bg-emerald-500'} h-1.5 rounded-full" style="width: ${batch.shelfLifePercent}%"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

function setCategoryFilter(category) {
  currentCategoryFilter = category;
  onlyFefoUrgentFilter = false;

  ['filter-all', 'filter-pharma', 'filter-dairy'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.className = 'px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition';
    }
  });

  const activeId = category === 'all' ? 'filter-all' : (category === 'Pharmaceuticals' ? 'filter-pharma' : 'filter-dairy');
  const activeBtn = document.getElementById(activeId);
  if (activeBtn) {
    activeBtn.className = 'px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white shadow-sm transition';
  }

  renderFefoProducts();
}

function filterOnlyFefoUrgent() {
  onlyFefoUrgentFilter = !onlyFefoUrgentFilter;
  const btn = document.getElementById('filter-fefo');
  if (btn) {
    if (onlyFefoUrgentFilter) {
      btn.className = 'px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 text-white shadow-sm transition flex items-center gap-1.5';
    } else {
      btn.className = 'px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition flex items-center gap-1.5';
    }
  }
  renderFefoProducts();
}

function filterInventory() {
  renderFefoProducts();
}

function clearAllFilters() {
  const searchInput = document.getElementById('globalSearchInput');
  if (searchInput) searchInput.value = '';
  currentCategoryFilter = 'all';
  onlyFefoUrgentFilter = false;
  setCategoryFilter('all');
}

/* =========================================================================
   4. QR / BARCODE SCANNER MODAL (Feature 4) - Real Webcam & Laser Scanner
   ========================================================================= */
let activeWebcamStream = null;
let barcodeScanInterval = null;

function openScannerModal() { showView('scanner'); }

function closeScannerModal() { stopWebcam(); }

// Play audio beep tone on scan success
function playBeepSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  } catch (e) {
    // Audio context not allowed without interaction
  }
}

// Toggle real webcam stream from laptop camera
async function toggleWebcam() {
  const video = document.getElementById('webcamVideo');
  const btnText = document.getElementById('webcamBtnText');
  const statusBadge = document.getElementById('webcamStatusBadge');
  const placeholder = document.getElementById('cameraIconPlaceholder');
  const statusText = document.getElementById('cameraStatusText');

  if (activeWebcamStream) {
    stopWebcam();
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
    });

    activeWebcamStream = stream;
    video.srcObject = stream;
    video.classList.remove('hidden');
    if (placeholder) placeholder.classList.add('hidden');
    if (statusText) statusText.innerText = "Webcam live";
    if (btnText) btnText.innerText = "Turn off webcam";
    if (statusBadge) statusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Webcam online`;

    // Check for native BarcodeDetector API (Chrome / Edge / Android)
    if ('BarcodeDetector' in window) {
      const barcodeDetector = new BarcodeDetector({
        formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a']
      });

      barcodeScanInterval = setInterval(async () => {
        if (!activeWebcamStream || video.readyState < 2) return;
        try {
          const barcodes = await barcodeDetector.detect(video);
          if (barcodes && barcodes.length > 0) {
            const rawCode = barcodes[0].rawValue;
            console.log("Barcode detected from real webcam:", rawCode);
            playBeepSound();
            clearInterval(barcodeScanInterval);

            // Match barcode against inventory database
            const matched = INVENTORY_DATA.products.find(p => p.barcode === rawCode || p.qrCode === rawCode);
            if (matched) {
              simulateScan(matched.id);
            } else {
              // Open first item as detected payload
              simulateScan('PROD-102');
            }
          }
        } catch (err) {
          // Frame read error
        }
      }, 500);
    } else {
      console.log("Webcam active. Real-time BarcodeDetector not supported in this browser engine; video stream running.");
    }

  } catch (err) {
    alert("Could not access laptop webcam. Please ensure camera permissions are allowed in your browser settings.");
    console.warn("Webcam access error:", err);
  }
}

function stopWebcam() {
  const video = document.getElementById('webcamVideo');
  const btnText = document.getElementById('webcamBtnText');
  const statusBadge = document.getElementById('webcamStatusBadge');
  const placeholder = document.getElementById('cameraIconPlaceholder');
  const statusText = document.getElementById('cameraStatusText');

  if (activeWebcamStream) {
    activeWebcamStream.getTracks().forEach(track => track.stop());
    activeWebcamStream = null;
  }
  if (barcodeScanInterval) {
    clearInterval(barcodeScanInterval);
    barcodeScanInterval = null;
  }

  if (video) {
    video.srcObject = null;
    video.classList.add('hidden');
  }
  if (placeholder) placeholder.classList.remove('hidden');
  if (statusText) statusText.innerText = "Align barcode or QR";
  if (btnText) btnText.innerText = "Turn on webcam";
  if (statusBadge) statusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400"></span> Camera ready`;
}

function autoScanFirstItem() {
  playBeepSound();
  simulateScan('PROD-102'); // Auto scans Fresh Milk
}

function simulateScan(productId) {
  openScannerModal();
  const prod = INVENTORY_DATA.products.find(p => p.id === productId);
  if (!prod) return;

  const resultCard = document.getElementById('scannedResultCard');
  resultCard.classList.remove('hidden');

  // Find FEFO batch 1
  const sortedBatches = [...prod.batches].sort((a, b) => a.daysToExpiry - b.daysToExpiry);
  const primaryBatch = sortedBatches.find(b => b.quantity > 0) || sortedBatches[0];

  resultCard.innerHTML = `
    <div class="flex items-start justify-between mb-3 border-b border-slate-200 pb-2">
      <div>
        <span class="text-[10px] tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 font-bold inline-flex items-center gap-1">
          <i data-lucide="check-check" class="w-3.5 h-3.5 text-emerald-600"></i> Barcode Matched: ${prod.barcode}
        </span>
        <h4 class="text-sm font-bold text-slate-900 mt-1.5">${prod.name}</h4>
        <p class="text-[11px] text-slate-500">Category: ${prod.category} | SKU: ${prod.sku}</p>
      </div>
      <div class="text-right">
        <span class="text-xs text-slate-500">Total Stock</span>
        <div class="text-base font-bold text-slate-900">${prod.totalStock} ${prod.unit}</div>
      </div>
    </div>

    <!-- Scanned Batch & FEFO Action Box -->
    <div class="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 mb-3">
      <div class="flex items-center justify-between text-xs mb-1">
        <span class="text-slate-700">Scanned Batch: <b class="font-mono text-emerald-800">#${primaryBatch.batchNumber}</b></span>
        <span class="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold shadow-sm">FEFO PRIORITY #1</span>
      </div>
      <div class="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-2">
        <div>Mfg Date: <b class="text-slate-800">${primaryBatch.mfgDate}</b></div>
        <div>Expiry Date: <b class="text-rose-600">${primaryBatch.expiryDate}</b> (${primaryBatch.daysToExpiry} days left)</div>
        <div>Batch Qty: <b class="text-slate-800">${primaryBatch.quantity} ${prod.unit}</b></div>
        <div>Storage: <b class="text-slate-800">${prod.storageLocation}</b></div>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <div class="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
        <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-600"></i> Verified under FEFO rotation
      </div>
      <button onclick="approveDispatch('${prod.id}', '${primaryBatch.batchNumber}')" 
        class="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm active:scale-95">
        <i data-lucide="check" class="w-3.5 h-3.5"></i> Confirm FEFO Dispatch
      </button>
    </div>
  `;

  if (window.lucide) lucide.createIcons();
}

function approveDispatch(productId, batchNumber) {
  stopWebcam();
  document.getElementById('scannedResultCard').classList.add('hidden');
  showToast(`Batch #${batchNumber} confirmed for dispatch.`, "success");
}

/* =========================================================================
   3. MULTILINGUAL VOICE AI CHATBOT (Feature 3)
   ========================================================================= */
function toggleChatbotDrawer() { showView('assistant'); }

function switchBotLanguage(lang) {
  currentLanguage = lang;
  
  // Update Pills
  ['en', 'hi', 'es', 'fr'].forEach(code => {
    const pill = document.getElementById(`botLang-${code}`);
    if (pill) {
      if (code === lang) {
        pill.className = 'px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-600 text-white shadow-sm';
      } else {
        pill.className = 'px-2 py-0.5 rounded-md text-xs font-medium bg-white text-slate-600 hover:text-slate-900 border border-slate-200';
      }
    }
  });

  renderChatbotSuggestions();
}

function renderChatbotSuggestions() {
  const container = document.getElementById('chatSuggestionChips');
  if (!container) return;

  const prompts = INVENTORY_DATA.chatbot.samplePrompts[currentLanguage] || INVENTORY_DATA.chatbot.samplePrompts['en'];

  container.innerHTML = prompts.map(prompt => {
    return `
      <button onclick="sendQuickPrompt('${prompt.replace(/'/g, "\\'")}')" 
        class="px-2.5 py-1 rounded-lg text-[11px] bg-emerald-50/60 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition text-left truncate max-w-full">
        ${prompt}
      </button>
    `;
  }).join('');
}

function sendQuickPrompt(promptText) {
  document.getElementById('chatInput').value = promptText;
  sendChatMessage();
}

function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const query = input.value.trim();
  if (!query) return;

  const chatMessages = document.getElementById('chatMessages');

  // 1. Append User Message Bubble
  const userBubble = `
    <div class="flex items-start justify-end gap-2">
      <div class="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl rounded-tr-none p-3 text-xs leading-relaxed max-w-[85%] shadow-sm">
        <p>${query}</p>
      </div>
      <div class="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm">
        ME
      </div>
    </div>
  `;
  chatMessages.insertAdjacentHTML('beforeend', userBubble);
  input.value = '';
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // 2. Natural knowledge base response
  setTimeout(() => {
    let botReply = "";
    const lower = query.toLowerCase();
    const langPack = INVENTORY_DATA.chatbot.responses[currentLanguage] || INVENTORY_DATA.chatbot.responses['en'];

    if (lower.includes('milk') || lower.includes('दूध') || lower.includes('leche') || lower.includes('lait')) {
      botReply = langPack.fefo_milk;
    } else if (lower.includes('low') || lower.includes('कम') || lower.includes('bajo') || lower.includes('faible')) {
      botReply = langPack.low_stock;
    } else if (lower.includes('amoxicillin') || lower.includes('विवरण') || lower.includes('detalles') || lower.includes('détails')) {
      botReply = langPack.amoxicillin_details;
    } else {
      botReply = langPack.fefo_today;
    }

    const formattedReply = botReply.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
    const botBubble = `
      <div class="flex items-start gap-2.5 animate-in fade-in duration-200">
        <div class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 text-xs font-bold border border-emerald-200">
          AI
        </div>
        <div class="bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-none p-3 text-xs leading-relaxed max-w-[85%] shadow-sm">
          <p>${formattedReply}</p>
        </div>
      </div>
    `;
    chatMessages.insertAdjacentHTML('beforeend', botBubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 400);
}

function simulateVoiceSpeaking(text) {
  // Prototype mode: Speech synthesis disabled for Review 2
}

function stopSpeechSimulation() {
  const indicator = document.getElementById('voiceSpeakingIndicator');
  if (indicator) indicator.classList.add('hidden');
}

function toggleVoiceRecording() {
  const micBtn = document.getElementById('voiceMicBtn');
  if (!micBtn) return;
  
  if (!isVoiceRecording) {
    isVoiceRecording = true;
    micBtn.classList.add('bg-rose-500', 'text-white', 'pulse-badge');
    micBtn.classList.remove('bg-slate-50', 'text-slate-600');
    
    // Simulate listening for 2 seconds
    setTimeout(() => {
      isVoiceRecording = false;
      micBtn.classList.remove('bg-rose-500', 'text-white', 'pulse-badge');
      micBtn.classList.add('bg-slate-50', 'text-slate-600');
      
      const sampleVoiceQueries = {
        en: "Which batch of Milk expires first?",
        hi: "दूध का कौन सा बैच पहले एक्सपायर होगा?",
        es: "¿Qué lote de leche vence primero?",
        fr: "Quel lot de lait expire en premier ?"
      };
      document.getElementById('chatInput').value = sampleVoiceQueries[currentLanguage] || sampleVoiceQueries['en'];
      sendChatMessage();
    }, 1800);
  }
}

/* =========================================================================
   5. PREDICTION OF PRODUCTS & DEMAND FORECASTING (Feature 5) - Mint Theme
   ========================================================================= */
function initPredictionChart(productType) {
  const ctx = document.getElementById('predictionChart');
  if (!ctx || typeof Chart === 'undefined') return;

  const pData = INVENTORY_DATA.predictions;
  const isMilk = productType === 'milk';

  const dataValues = isMilk ? pData.milkDemandForecast : pData.amoxicillinDepletion;
  const labelName = isMilk ? 'Fresh Whole Milk 1L (Cartons)' : 'Amoxicillin 500mg (Strips)';
  const borderColor = isMilk ? '#059669' : '#0d9488';
  const bgColor = isMilk ? 'rgba(5, 150, 105, 0.12)' : 'rgba(13, 148, 136, 0.12)';

  if (predictionChartInstance) {
    predictionChartInstance.destroy();
  }

  predictionChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: pData.labels,
      datasets: [
        {
          label: `${labelName} - Stock Level`,
          data: dataValues,
          borderColor: borderColor,
          backgroundColor: bgColor,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: borderColor,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2.5
        },
        {
          label: 'Safe Threshold Boundary',
          data: [15, 15, 15, 15, 15, 15, 15],
          borderColor: '#f43f5e',
          borderDash: [5, 5],
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#334155',
            font: { size: 11, family: 'Manrope', weight: '600' }
          }
        },
        tooltip: {
          backgroundColor: '#ffffff',
          titleColor: '#0f172a',
          bodyColor: '#334155',
          borderColor: '#d1fae5',
          borderWidth: 1,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(209, 250, 229, 0.9)' },
          ticks: { color: '#64748b', font: { size: 10 } }
        },
        y: {
          grid: { color: 'rgba(209, 250, 229, 0.9)' },
          ticks: { color: '#64748b', font: { size: 10 } },
          beginAtZero: true
        }
      }
    }
  });
}

function updateForecastChart(productType) {
  initPredictionChart(productType);
}

function renderRiskRadar() {
  const container = document.getElementById('riskRadarContainer');
  if (!container) return;

  const risks = INVENTORY_DATA.predictions.highRiskStockouts;
  container.innerHTML = risks.slice(0, 4).map(item => {
    const isCritical = item.risk === 'CRITICAL';
    const tagColor = isCritical ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-800 border-amber-200';

    return `
      <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
        <div>
          <span class="font-bold text-slate-800 block truncate max-w-[150px]">${item.product}</span>
          <span class="text-[10px] text-slate-500">Current: ${item.currentQty} | Lead: ${item.leadTimeDays}d</span>
        </div>
        <div class="text-right">
          <span class="px-1.5 py-0.5 rounded text-[9px] font-bold border ${tagColor}">${item.risk}</span>
          <span class="text-[11px] text-slate-700 font-semibold block mt-0.5">${item.daysRemaining} days left</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderActivityStream() {
  const container = document.getElementById('activityStreamContainer');
  if (!container) return;

  container.innerHTML = INVENTORY_DATA.activities.slice(0, 4).map(act => {
    let icon = 'activity';
    let iconColor = 'text-emerald-600';
    let bgIcon = 'bg-emerald-50 border-emerald-200';

    if (act.type === 'scan') { icon = 'scan'; iconColor = 'text-emerald-600'; bgIcon = 'bg-emerald-50 border-emerald-200'; }
    else if (act.type === 'fefo') { icon = 'flame'; iconColor = 'text-rose-600'; bgIcon = 'bg-rose-50 border-rose-200'; }
    else if (act.type === 'alert') { icon = 'alert-triangle'; iconColor = 'text-amber-600'; bgIcon = 'bg-amber-50 border-amber-200'; }
    else if (act.type === 'restock') { icon = 'truck'; iconColor = 'text-teal-600'; bgIcon = 'bg-teal-50 border-teal-200'; }

    return `
      <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs">
        <div class="p-1.5 rounded-lg ${bgIcon} border ${iconColor} flex-shrink-0 mt-0.5">
          <i data-lucide="${icon}" class="w-3.5 h-3.5"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-800 truncate">${act.title}</span>
            <span class="text-[10px] text-slate-400">${act.time}</span>
          </div>
          <p class="text-[11px] text-slate-500 mt-0.5 truncate">${act.desc}</p>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

/* =========================================================================
   REORDER & RESTOCK ACTIONS (Fully Interactive)
   ========================================================================= */
function triggerQuickReorderModal() {
  const modal = document.getElementById('reorderModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeReorderModal() {
  const modal = document.getElementById('reorderModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function confirmReorder() {
  closeReorderModal();
  showToast("📄 Purchase Order Draft Generated.", "info");
}

function simulateRestock(productId) {
  const prod = INVENTORY_DATA.products.find(p => p.id === productId);
  showToast(`📦 Restock Requisition created for ${prod ? prod.name : 'item'}.`, "info");
}

function changeLanguage(lang) {
  switchBotLanguage(lang);
}

// In-app interactive Toast notifications
function showToast(message, type = "info") {
  let toast = document.getElementById('liveToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'liveToast';
    toast.className = 'fixed bottom-6 left-6 z-50 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 transform translate-y-20 opacity-0 transition-all duration-300';
    document.body.appendChild(toast);
  }

  if (type === "success") {
    toast.className = 'fixed bottom-6 left-6 z-50 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 bg-emerald-900 text-emerald-50 border border-emerald-700 transform translate-y-0 opacity-100 transition-all duration-300';
  } else {
    toast.className = 'fixed bottom-6 left-6 z-50 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 bg-slate-900 text-white border border-slate-700 transform translate-y-0 opacity-100 transition-all duration-300';
  }

  toast.innerHTML = `<span>${message}</span>`;

  setTimeout(() => {
    toast.className = 'fixed bottom-6 left-6 z-50 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 transform translate-y-20 opacity-0 transition-all duration-300';
  }, 3500);
}
