(() => {
  "use strict";

  const DEFAULT_URL = "https://doan1oit-default-rtdb.asia-southeast1.firebasedatabase.app";
  const STORAGE_KEY = "greenhouse_history_v1";
  const SETTINGS_KEY = "greenhouse_settings_v1";
  const MAX_RECORDS = 2000;
  const PAGE_SIZE = 10;

  const state = {
    firebaseUrl: DEFAULT_URL,
    pollInterval: 3000,
    pollTimer: null,
    connected: false,
    busy: false,
    sensor: null,
    status: { fan: false, pump: false, light: false },
    mode: { fan_auto: true, pump_auto: true, light_auto: true },
    threshold: { temp: 32, soil: 40, light: 500 },
    pendingControl: {},
    history: [],
    range: 60,
    tablePage: 1,
    query: ""
  };

  const pageMeta = {
    overview: ["TRUNG TÂM ĐIỀU KHIỂN", "Tổng quan nhà kính"],
    charts: ["PHÂN TÍCH MÔI TRƯỜNG", "Biểu đồ cảm biến"],
    control: ["QUẢN LÝ THIẾT BỊ", "Điều khiển hệ thống"],
    csv: ["LƯU TRỮ DỮ LIỆU", "Nhật ký CSV"]
  };

  const metricConfig = {
    temp: { canvas: "chartTemp", color: "#ff9966", label: "Nhiệt độ", digits: 1, suffix: "°C" },
    hum: { canvas: "chartHum", color: "#55aef4", label: "Độ ẩm KK", digits: 0, suffix: "%" },
    soil: { canvas: "chartSoil", color: "#29d391", label: "Độ ẩm đất", digits: 0, suffix: "%" },
    ph: { canvas: "chartPh", color: "#af8bff", label: "pH", digits: 2, suffix: "" },
    lux: { canvas: "chartLight", color: "#f4cd61", label: "Ánh sáng", digits: 0, suffix: " lux" }
  };

  const $ = (id) => document.getElementById(id);
  const safeNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const formatNumber = (value, digits = 0) => Number(value).toLocaleString("vi-VN", { minimumFractionDigits: digits, maximumFractionDigits: digits });

  function loadState() {
    try {
      const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
      state.firebaseUrl = String(settings.firebaseUrl || DEFAULT_URL).replace(/\/$/, "");
      state.pollInterval = Number(settings.pollInterval) || 3000;
      const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      state.history = Array.isArray(history) ? history.slice(-MAX_RECORDS) : [];
    } catch (_) {
      state.history = [];
    }
  }

  function saveHistory() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.history.slice(-MAX_RECORDS)));
  }

  async function firebaseRequest(path, options = {}) {
    const response = await fetch(`${state.firebaseUrl}${path}.json`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      ...options
    });
    if (!response.ok) throw new Error(`Firebase HTTP ${response.status}`);
    return response.json();
  }

  async function fetchData(manual = false) {
    if (state.busy) return;
    state.busy = true;
    $("refreshButton").classList.add("spinning");
    try {
      const data = await firebaseRequest("/plant_iot");
      if (!data || !data.sensor) throw new Error("Chưa tìm thấy dữ liệu /plant_iot/sensor");
      state.sensor = normalizeSensor(data.sensor);
      const incomingStatus = { ...state.status, ...(data.status || {}) };
      ["fan", "pump", "light"].forEach((device) => {
        const pending = state.pendingControl[device];
        if (!pending) return;
        if (Boolean(incomingStatus[device]) === pending.value || Date.now() >= pending.until) {
          delete state.pendingControl[device];
        } else {
          incomingStatus[device] = pending.value;
        }
      });
      state.status = incomingStatus;
      state.mode = { ...state.mode, ...(data.mode || {}) };
      state.threshold = { ...state.threshold, ...(data.threshold || {}) };
      setConnection(true);
      addHistoryRecord(state.sensor);
      renderAll();
      if (manual) toast("Đã cập nhật dữ liệu mới nhất");
    } catch (error) {
      setConnection(false);
      if (manual) toast(error.message || "Không thể kết nối Firebase", true);
    } finally {
      state.busy = false;
      $("refreshButton").classList.remove("spinning");
    }
  }

  function normalizeSensor(raw) {
    return {
      temp: safeNumber(raw.temp),
      hum: safeNumber(raw.hum),
      soil: safeNumber(raw.soil_percent),
      ph: safeNumber(raw.ph, 7),
      lux: safeNumber(raw.lux),
      soil_adc: safeNumber(raw.soil_adc),
      ldr: safeNumber(raw.ldr)
    };
  }

  function addHistoryRecord(sensor) {
    const now = Date.now();
    const last = state.history[state.history.length - 1];
    const sameValues = last && ["temp", "hum", "soil", "ph", "lux"].every((key) => Number(last[key]) === Number(sensor[key]));
    if (last && now - last.time < Math.max(2500, state.pollInterval - 300) && sameValues) return;
    state.history.push({ time: now, temp: sensor.temp, hum: sensor.hum, soil: sensor.soil, ph: sensor.ph, lux: sensor.lux });
    if (state.history.length > MAX_RECORDS) state.history = state.history.slice(-MAX_RECORDS);
    saveHistory();
  }

  function setConnection(connected) {
    state.connected = connected;
    const pill = $("connectionPill");
    pill.classList.toggle("offline", !connected);
    pill.querySelector("b").textContent = connected ? "Đã kết nối" : "Mất kết nối";
    $("sidebarStatus").textContent = connected ? "Trực tuyến · Firebase" : "Không có tín hiệu";
  }

  function renderAll() {
    renderOverview();
    renderControls();
    renderCharts();
    renderTable();
  }

  function renderOverview() {
    if (!state.sensor) return;
    const s = state.sensor;
    $("tempValue").textContent = formatNumber(s.temp, 1);
    $("humValue").textContent = formatNumber(s.hum);
    $("soilValue").textContent = formatNumber(s.soil);
    $("phValue").textContent = formatNumber(s.ph, 2);
    $("lightValue").textContent = formatNumber(s.lux);
    $("tempState").textContent = s.temp < 18 ? "Nhiệt độ thấp" : s.temp > 32 ? "Nhiệt độ cao" : "Trong ngưỡng tốt";
    $("humState").textContent = s.hum < 40 ? "Không khí khô" : s.hum > 80 ? "Độ ẩm cao" : "Trong ngưỡng tốt";
    $("soilState").textContent = s.soil <= 40 ? "Đất cần tưới" : "Độ ẩm phù hợp";
    $("phState").textContent = s.ph < 6 || s.ph > 8 ? "Ngoài ngưỡng" : "Độ pH ổn định";
    $("lightState").textContent = s.lux <= 500 ? "Thiếu ánh sáng" : "Ánh sáng tốt";
    $("lastUpdated").textContent = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date());
    $("overviewEmpty").classList.toggle("hidden", state.history.length > 1);
  }

  function renderControls() {
    ["fan", "pump", "light"].forEach((device) => {
      const isOn = Boolean(state.status[device]);
      const isAuto = Boolean(state.mode[`${device}_auto`]);
      const card = document.querySelector(`.control-card[data-device="${device}"]`);
      card.classList.toggle("is-on", isOn);
      card.classList.toggle("auto-mode", isAuto);
      card.querySelectorAll("[data-mode]").forEach((button) => button.classList.toggle("active", (button.dataset.mode === "auto") === isAuto));
      const power = card.querySelector("[data-power]");
      power.disabled = isAuto;
      power.classList.toggle("on", isOn);
      power.querySelector("strong").textContent = isOn ? "TẮT THIẾT BỊ" : "BẬT THIẾT BỊ";
      const live = $(`${device}LiveState`);
      live.textContent = isOn ? "ĐANG BẬT" : "ĐANG TẮT";
      live.classList.toggle("on", isOn);
      $(`${device}ModeOverview`).textContent = isAuto ? "Chế độ tự động" : "Điều khiển thủ công";
      const badge = $(`${device}StatusOverview`);
      badge.textContent = isOn ? "ĐANG BẬT" : "ĐANG TẮT";
      badge.classList.toggle("on", isOn);
      const thresholdInput = $(`${device}Threshold`);
      const thresholdKey = thresholdKeyFor(device);
      if (thresholdInput && document.activeElement !== thresholdInput) thresholdInput.value = state.threshold[thresholdKey];
    });
  }

  function thresholdKeyFor(device) {
    return ({ fan: "temp", pump: "soil", light: "light" })[device];
  }

  async function saveThreshold(device) {
    const input = $(`${device}Threshold`);
    const key = thresholdKeyFor(device);
    const value = Number(input.value);
    const limits = { fan: [10, 50], pump: [0, 100], light: [0, 100000] }[device];
    if (!Number.isFinite(value) || value < limits[0] || value > limits[1]) {
      input.focus();
      return toast(`Ngưỡng hợp lệ: ${limits[0]} đến ${limits[1]}`, true);
    }
    const normalized = device === "fan" ? Math.round(value * 10) / 10 : Math.round(value);
    const previous = state.threshold[key];
    const button = document.querySelector(`[data-save-threshold="${device}"]`);
    state.threshold[key] = normalized;
    input.value = normalized;
    button.disabled = true;
    button.textContent = "Đang lưu...";
    try {
      await firebaseRequest(`/plant_iot/threshold/${key}`, { method: "PUT", body: JSON.stringify(normalized) });
      toast(`Đã lưu ngưỡng cho ${deviceName(device)}`);
      setTimeout(() => fetchData(false), 600);
    } catch (error) {
      state.threshold[key] = previous;
      input.value = previous;
      toast("Không lưu được ngưỡng lên Firebase", true);
    } finally {
      button.disabled = false;
      button.textContent = "Lưu ngưỡng";
    }
  }

  async function setMode(device, isAuto) {
    const previous = state.mode[`${device}_auto`];
    state.mode[`${device}_auto`] = isAuto;
    renderControls();
    try {
      const updates = { [`mode/${device}_auto`]: isAuto };
      if (!isAuto) updates[`control/${device}`] = Boolean(state.status[device]);
      await firebaseRequest("/plant_iot", { method: "PATCH", body: JSON.stringify(updates) });
      toast(`Đã chuyển ${deviceName(device)} sang ${isAuto ? "tự động" : "thủ công"}`);
      setTimeout(() => fetchData(false), 700);
    } catch (error) {
      state.mode[`${device}_auto`] = previous;
      renderControls();
      toast("Không gửi được lệnh tới Firebase", true);
    }
  }

  async function togglePower(device) {
    if (state.mode[`${device}_auto`]) return;
    const next = !Boolean(state.status[device]);
    const previous = state.status[device];
    const modeKey = `${device}_auto`;
    const previousMode = state.mode[modeKey];
    state.mode[modeKey] = false;
    state.status[device] = next;
    state.pendingControl[device] = { value: next, until: Date.now() + 5000 };
    renderControls();
    try {
      await firebaseRequest("/plant_iot", {
        method: "PATCH",
        body: JSON.stringify({
          [`mode/${device}_auto`]: false,
          [`control/${device}`]: next
        })
      });
      toast(`${deviceName(device)}: ${next ? "đã bật" : "đã tắt"}`);
      setTimeout(() => fetchData(false), 1200);
    } catch (error) {
      delete state.pendingControl[device];
      state.mode[modeKey] = previousMode;
      state.status[device] = previous;
      renderControls();
      toast("Không gửi được lệnh điều khiển", true);
    }
  }

  function deviceName(device) {
    return ({ fan: "Quạt thông gió", pump: "Máy bơm", light: "Đèn chiếu sáng" })[device];
  }

  function getVisibleHistory() {
    return state.range === "all" ? state.history : state.history.slice(-Number(state.range));
  }

  function renderCharts() {
    const records = getVisibleHistory();
    drawLineChart($("overviewChart"), [
      { values: records.map((r) => r.temp), color: "#29d391" },
      { values: records.map((r) => r.hum), color: "#55aef4" }
    ], records.map((r) => r.time), false);

    Object.entries(metricConfig).forEach(([key, config]) => {
      const values = records.map((record) => safeNumber(record[key]));
      drawLineChart($(config.canvas), [{ values, color: config.color }], records.map((r) => r.time), true);
      const latest = values[values.length - 1];
      const valueId = key === "lux" ? "chartLightValue" : `chart${key.charAt(0).toUpperCase() + key.slice(1)}Value`;
      const trendId = key === "lux" ? "chartLightTrend" : `chart${key.charAt(0).toUpperCase() + key.slice(1)}Trend`;
      $(valueId).textContent = latest == null ? "--" : formatNumber(latest, config.digits);
      $(trendId).textContent = trendText(values, config.digits, config.suffix);
    });
  }

  function trendText(values, digits, suffix) {
    if (values.length < 2) return "Chưa có xu hướng";
    const delta = values[values.length - 1] - values[Math.max(0, values.length - 6)];
    if (Math.abs(delta) < Math.pow(10, -digits) / 2) return "Ổn định gần đây";
    return `${delta > 0 ? "Tăng" : "Giảm"} ${formatNumber(Math.abs(delta), digits)}${suffix}`;
  }

  function drawLineChart(canvas, series, labels, fill) {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const width = rect.width, height = rect.height;
    ctx.clearRect(0, 0, width, height);
    const pad = { top: 18, right: 12, bottom: 28, left: 38 };
    const plotW = width - pad.left - pad.right, plotH = height - pad.top - pad.bottom;
    const all = series.flatMap((line) => line.values).filter(Number.isFinite);
    if (all.length < 2) return;
    let min = Math.min(...all), max = Math.max(...all);
    const spread = max - min || Math.max(Math.abs(max) * .1, 1);
    min -= spread * .18; max += spread * .18;
    ctx.font = "8px 'Be Vietnam Pro', Arial";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (plotH / 4) * i;
      ctx.strokeStyle = "rgba(32,82,59,.10)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(width - pad.right, y); ctx.stroke();
      ctx.fillStyle = "#63716b";
      ctx.fillText(formatCompact(max - ((max - min) / 4) * i), pad.left - 8, y);
    }
    const labelIndexes = [0, Math.floor((labels.length - 1) / 2), labels.length - 1];
    ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillStyle = "#63716b";
    labelIndexes.forEach((index) => {
      if (index < 0 || !labels[index]) return;
      const x = pad.left + (index / Math.max(labels.length - 1, 1)) * plotW;
      ctx.fillText(new Date(labels[index]).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }), x, height - 17);
    });
    series.forEach((line) => {
      if (line.values.length < 2) return;
      const points = line.values.map((value, index) => ({ x: pad.left + (index / Math.max(line.values.length - 1, 1)) * plotW, y: pad.top + ((max - value) / (max - min)) * plotH }));
      if (fill && series.length === 1) {
        const gradient = ctx.createLinearGradient(0, pad.top, 0, height - pad.bottom);
        gradient.addColorStop(0, hexToRgba(line.color, .18)); gradient.addColorStop(1, hexToRgba(line.color, 0));
        ctx.beginPath(); ctx.moveTo(points[0].x, height - pad.bottom); points.forEach((p) => ctx.lineTo(p.x, p.y)); ctx.lineTo(points[points.length - 1].x, height - pad.bottom); ctx.closePath(); ctx.fillStyle = gradient; ctx.fill();
      }
      ctx.beginPath(); points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.strokeStyle = line.color; ctx.lineWidth = 1.8; ctx.stroke();
      const last = points[points.length - 1]; ctx.beginPath(); ctx.arc(last.x, last.y, 3, 0, Math.PI * 2); ctx.fillStyle = line.color; ctx.fill();
    });
  }

  function formatCompact(value) {
    const abs = Math.abs(value);
    if (abs >= 1000) return `${Math.round(value / 1000)}k`;
    if (abs < 10) return Number(value).toFixed(1);
    return Math.round(value).toString();
  }

  function hexToRgba(hex, alpha) {
    const int = parseInt(hex.slice(1), 16);
    return `rgba(${int >> 16},${(int >> 8) & 255},${int & 255},${alpha})`;
  }

  function filteredHistory() {
    if (!state.query) return state.history;
    const query = state.query.toLowerCase();
    return state.history.filter((row) => `${new Date(row.time).toLocaleString("vi-VN")} ${row.temp} ${row.hum} ${row.soil} ${row.ph} ${row.lux}`.toLowerCase().includes(query));
  }

  function renderTable() {
    const filtered = filteredHistory().slice().reverse();
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    state.tablePage = Math.min(state.tablePage, totalPages);
    const rows = filtered.slice((state.tablePage - 1) * PAGE_SIZE, state.tablePage * PAGE_SIZE);
    $("csvBody").innerHTML = rows.map((row) => `<tr><td>${escapeHtml(new Date(row.time).toLocaleString("vi-VN"))}</td><td><span class="value-chip">${formatNumber(row.temp, 1)} °C</span></td><td>${formatNumber(row.hum)} %</td><td>${formatNumber(row.soil)} %</td><td>${formatNumber(row.ph, 2)}</td><td>${formatNumber(row.lux)} lux</td></tr>`).join("");
    $("tableEmpty").classList.toggle("hidden", rows.length > 0);
    $("recordCount").textContent = state.history.length.toLocaleString("vi-VN");
    const today = new Date().toDateString();
    $("todayCount").textContent = state.history.filter((row) => new Date(row.time).toDateString() === today).length.toLocaleString("vi-VN");
    $("storageSize").textContent = `${(new Blob([JSON.stringify(state.history)]).size / 1024).toFixed(1)} KB`;
    $("tableInfo").textContent = `Hiển thị ${rows.length} / ${filtered.length} bản ghi`;
    $("pageNumber").textContent = state.tablePage;
    $("prevPage").disabled = state.tablePage <= 1;
    $("nextPage").disabled = state.tablePage >= totalPages;
  }

  function exportCsv() {
    if (!state.history.length) return toast("Chưa có dữ liệu để xuất", true);
    const header = ["timestamp", "temperature_c", "air_humidity_percent", "soil_moisture_percent", "ph", "light_lux"];
    const rows = state.history.map((row) => [new Date(row.time).toISOString(), row.temp, row.hum, row.soil, row.ph, row.lux]);
    const csv = "\uFEFF" + [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = `greenhouse_${new Date().toISOString().slice(0, 10)}.csv`; link.click();
    URL.revokeObjectURL(url); toast(`Đã xuất ${rows.length} bản ghi CSV`);
  }

  function csvCell(value) {
    const text = String(value ?? "");
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  async function importCsv(file) {
    if (!file) return;
    try {
      const text = (await file.text()).replace(/^\uFEFF/, "");
      const lines = text.split(/\r?\n/).filter(Boolean);
      const imported = lines.slice(1).map(parseCsvLine).map((cells) => ({
        time: Date.parse(cells[0]) || Date.now(), temp: safeNumber(cells[1]), hum: safeNumber(cells[2]), soil: safeNumber(cells[3]), ph: safeNumber(cells[4]), lux: safeNumber(cells[5])
      })).filter((row) => Number.isFinite(row.time));
      if (!imported.length) throw new Error("Tệp CSV không có dữ liệu hợp lệ");
      state.history = [...state.history, ...imported].sort((a, b) => a.time - b.time).slice(-MAX_RECORDS);
      saveHistory(); renderAll(); toast(`Đã nhập ${imported.length} bản ghi`);
    } catch (error) { toast(error.message || "Không thể đọc tệp CSV", true); }
  }

  function parseCsvLine(line) {
    const cells = []; let cell = "", quoted = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' && quoted && line[i + 1] === '"') { cell += '"'; i++; }
      else if (char === '"') quoted = !quoted;
      else if (char === "," && !quoted) { cells.push(cell); cell = ""; }
      else cell += char;
    }
    cells.push(cell); return cells;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
  }

  function navigate(page) {
    if (!pageMeta[page]) page = "overview";
    document.querySelectorAll(".page").forEach((el) => el.classList.toggle("active", el.id === `page-${page}`));
    document.querySelectorAll(".nav-item").forEach((el) => el.classList.toggle("active", el.dataset.page === page));
    $("pageEyebrow").textContent = pageMeta[page][0]; $("pageTitle").textContent = pageMeta[page][1];
    $("sidebar").classList.remove("open");
    if (location.hash !== `#${page}`) history.replaceState(null, "", `#${page}`);
    requestAnimationFrame(() => { if (page === "charts" || page === "overview") renderCharts(); });
  }

  function toast(message, error = false) {
    const item = document.createElement("div"); item.className = `toast${error ? " error" : ""}`; item.textContent = message;
    $("toastStack").appendChild(item); setTimeout(() => item.remove(), 3200);
  }

  function updateClock() {
    const now = new Date();
    $("clock").textContent = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const hour = now.getHours(); $("dayPeriod").textContent = hour < 11 ? "SÁNG" : hour < 18 ? "CHIỀU" : "TỐI";
  }

  function restartPolling() {
    clearInterval(state.pollTimer); fetchData(false);
    state.pollTimer = setInterval(() => fetchData(false), state.pollInterval);
  }

  function bindEvents() {
    document.querySelectorAll(".nav-item").forEach((button) => button.addEventListener("click", () => navigate(button.dataset.page)));
    document.querySelectorAll("[data-go]").forEach((button) => button.addEventListener("click", () => navigate(button.dataset.go)));
    $("menuButton").addEventListener("click", () => $("sidebar").classList.toggle("open"));
    $("refreshButton").addEventListener("click", () => fetchData(true));
    document.querySelectorAll(".control-card").forEach((card) => {
      const device = card.dataset.device;
      card.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => setMode(device, button.dataset.mode === "auto")));
      card.querySelector("[data-power]").addEventListener("click", () => togglePower(device));
      card.querySelector("[data-save-threshold]").addEventListener("click", () => saveThreshold(device));
      card.querySelector(".threshold-input input").addEventListener("keydown", (event) => { if (event.key === "Enter") saveThreshold(device); });
    });
    $("rangeSwitch").addEventListener("click", (event) => {
      const button = event.target.closest("button"); if (!button) return;
      document.querySelectorAll("#rangeSwitch button").forEach((item) => item.classList.toggle("active", item === button));
      state.range = button.dataset.range === "all" ? "all" : Number(button.dataset.range); renderCharts();
    });
    $("csvSearch").addEventListener("input", (event) => { state.query = event.target.value.trim(); state.tablePage = 1; renderTable(); });
    $("prevPage").addEventListener("click", () => { state.tablePage--; renderTable(); });
    $("nextPage").addEventListener("click", () => { state.tablePage++; renderTable(); });
    $("exportCsv").addEventListener("click", exportCsv);
    $("csvFile").addEventListener("change", (event) => { importCsv(event.target.files[0]); event.target.value = ""; });
    $("clearData").addEventListener("click", () => {
      if (!state.history.length || !confirm("Xóa toàn bộ lịch sử dữ liệu đã lưu trên trình duyệt?")) return;
      state.history = []; saveHistory(); state.tablePage = 1; renderAll(); toast("Đã xóa lịch sử dữ liệu");
    });
    $("openSettings").addEventListener("click", () => { $("firebaseUrl").value = state.firebaseUrl; $("pollInterval").value = String(state.pollInterval); $("settingsModal").hidden = false; });
    $("closeSettings").addEventListener("click", () => $("settingsModal").hidden = true);
    $("settingsModal").addEventListener("click", (event) => { if (event.target === $("settingsModal")) $("settingsModal").hidden = true; });
    $("saveSettings").addEventListener("click", () => {
      const url = $("firebaseUrl").value.trim().replace(/\/$/, "");
      if (!/^https:\/\//i.test(url)) return toast("Firebase URL phải bắt đầu bằng https://", true);
      state.firebaseUrl = url; state.pollInterval = Number($("pollInterval").value);
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ firebaseUrl: state.firebaseUrl, pollInterval: state.pollInterval }));
      $("settingsModal").hidden = true; restartPolling(); toast("Đã lưu cài đặt kết nối");
    });
    window.addEventListener("hashchange", () => navigate(location.hash.slice(1)));
    let resizeTimer; window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(renderCharts, 120); });
  }

  function init() {
    loadState(); bindEvents(); updateClock(); setInterval(updateClock, 1000);
    navigate(location.hash.slice(1) || "overview"); renderAll(); restartPolling();
  }

  init();
})();
