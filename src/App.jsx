import { useState, useCallback, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// DEEP TIME FIELD GUIDE — v0.2
// What's Beneath Your Feet?
// Built by Arjun Ravi · Deep Time Studios
// ═══════════════════════════════════════════════════════════════

const GEOLOGICAL_PERIODS = [
  { name: "Quaternary", start: 2.58, end: 0, color: "#F9F97F", era: "Cenozoic" },
  { name: "Neogene", start: 23.03, end: 2.58, color: "#FFE619", era: "Cenozoic" },
  { name: "Paleogene", start: 66, end: 23.03, color: "#FD9A52", era: "Cenozoic" },
  { name: "Cretaceous", start: 145, end: 66, color: "#7FC64E", era: "Mesozoic" },
  { name: "Jurassic", start: 201.4, end: 145, color: "#34B2C9", era: "Mesozoic" },
  { name: "Triassic", start: 251.9, end: 201.4, color: "#812B92", era: "Mesozoic" },
  { name: "Permian", start: 298.9, end: 251.9, color: "#F04028", era: "Paleozoic" },
  { name: "Carboniferous", start: 358.9, end: 298.9, color: "#67A599", era: "Paleozoic" },
  { name: "Devonian", start: 419.2, end: 358.9, color: "#CB8C37", era: "Paleozoic" },
  { name: "Silurian", start: 443.8, end: 419.2, color: "#B3E1B6", era: "Paleozoic" },
  { name: "Ordovician", start: 485.4, end: 443.8, color: "#009270", era: "Paleozoic" },
  { name: "Cambrian", start: 538.8, end: 485.4, color: "#7FA056", era: "Paleozoic" },
  { name: "Precambrian", start: 4600, end: 538.8, color: "#F73667", era: "Precambrian" },
];

// ── Demo data so the app works without network access ──
const DEMO_DATA = {
  "Grand Canyon, AZ": {
    units: [
      { strat_name: "Kaibab Limestone", lith: "limestone, chert", b_age: 270, t_age: 260, environ: "marine" },
      { strat_name: "Toroweap Formation", lith: "limestone, sandstone, gypsum", b_age: 273, t_age: 270, environ: "marine" },
      { strat_name: "Coconino Sandstone", lith: "sandstone", b_age: 275, t_age: 273, environ: "eolian" },
      { strat_name: "Hermit Formation", lith: "shale, siltstone", b_age: 280, t_age: 275, environ: "fluvial" },
      { strat_name: "Supai Group", lith: "sandstone, shale, limestone", b_age: 315, t_age: 280, environ: "fluvial" },
      { strat_name: "Redwall Limestone", lith: "limestone", b_age: 340, t_age: 315, environ: "marine" },
      { strat_name: "Temple Butte Formation", lith: "limestone, dolomite", b_age: 385, t_age: 340, environ: "marine" },
      { strat_name: "Muav Limestone", lith: "limestone", b_age: 505, t_age: 497, environ: "marine" },
      { strat_name: "Bright Angel Shale", lith: "shale, sandstone", b_age: 515, t_age: 505, environ: "marine" },
      { strat_name: "Tapeats Sandstone", lith: "sandstone, conglomerate", b_age: 525, t_age: 515, environ: "marine" },
      { strat_name: "Vishnu Schist & Zoroaster Granite", lith: "schist, granite", b_age: 1750, t_age: 1680, environ: "metamorphic" },
    ],
    fossils: [
      { tna: "Trilobite trackways", max_ma: 515, min_ma: 505, phl: "Trilobita" },
      { tna: "Crinoid columnals (sea lilies)", max_ma: 340, min_ma: 315, phl: "Crinoidea" },
      { tna: "Brachiopod assemblages", max_ma: 340, min_ma: 260, phl: "Brachiopoda" },
      { tna: "Placoderm fish", max_ma: 385, min_ma: 360, phl: "Placodermi" },
      { tna: "Reptile & scorpion trackways", max_ma: 275, min_ma: 273, phl: "Reptilia" },
      { tna: "Fern impressions", max_ma: 280, min_ma: 275, phl: "Plantae" },
      { tna: "Stromatolites", max_ma: 1200, min_ma: 750, phl: "Cyanobacteria" },
    ],
  },
  "Yellowstone, WY": {
    units: [
      { strat_name: "Quaternary Rhyolite Flows", lith: "rhyolite, obsidian", b_age: 0.64, t_age: 0.07, environ: "volcanic" },
      { strat_name: "Lava Creek Tuff", lith: "welded tuff, ash", b_age: 0.64, t_age: 0.63, environ: "volcanic" },
      { strat_name: "Mesa Falls Tuff", lith: "welded tuff", b_age: 1.3, t_age: 1.29, environ: "volcanic" },
      { strat_name: "Huckleberry Ridge Tuff", lith: "welded tuff, rhyolite", b_age: 2.1, t_age: 2.0, environ: "volcanic" },
      { strat_name: "Absaroka Volcanics", lith: "basalt, andesite, breccia", b_age: 55, t_age: 45, environ: "volcanic" },
      { strat_name: "Cretaceous Shale", lith: "shale, mudstone", b_age: 90, t_age: 66, environ: "marine" },
      { strat_name: "Sundance Formation", lith: "shale, limestone", b_age: 165, t_age: 155, environ: "marine" },
      { strat_name: "Bighorn Dolomite", lith: "dolomite", b_age: 460, t_age: 443, environ: "marine" },
      { strat_name: "Madison Limestone", lith: "limestone", b_age: 358, t_age: 318, environ: "marine" },
    ],
    fossils: [
      { tna: "Mammuthus primigenius (woolly mammoth)", max_ma: 0.4, min_ma: 0.004, phl: "Mammalia" },
      { tna: "Bison antiquus (ancient bison)", max_ma: 0.24, min_ma: 0.01, phl: "Mammalia" },
      { tna: "Brontotherium sp. (thunder beast)", max_ma: 37, min_ma: 33, phl: "Mammalia" },
      { tna: "Hyracotherium (dawn horse)", max_ma: 55, min_ma: 45, phl: "Mammalia" },
      { tna: "Metasequoia (dawn redwood)", max_ma: 55, min_ma: 34, phl: "Plantae" },
      { tna: "Crinoid columnals", max_ma: 340, min_ma: 310, phl: "Crinoidea" },
      { tna: "Brachiopoda assemblages", max_ma: 358, min_ma: 318, phl: "Brachiopoda" },
    ],
  },
  "Badlands, SD": {
    units: [
      { strat_name: "Quaternary Alluvium", lith: "gravel, sand", b_age: 2.58, t_age: 0, environ: "fluvial" },
      { strat_name: "Sharps Formation", lith: "siltstone, volcanic ash", b_age: 30, t_age: 28, environ: "fluvial" },
      { strat_name: "Brule Formation", lith: "siltstone, claystone", b_age: 34, t_age: 30, environ: "fluvial" },
      { strat_name: "Chadron Formation", lith: "mudstone, sandstone", b_age: 37, t_age: 34, environ: "fluvial" },
      { strat_name: "Pierre Shale", lith: "shale, bentonite", b_age: 83, t_age: 67, environ: "marine" },
      { strat_name: "Niobrara Formation", lith: "chalk, shale", b_age: 87, t_age: 83, environ: "marine" },
      { strat_name: "Greenhorn Limestone", lith: "limestone, shale", b_age: 95, t_age: 87, environ: "marine" },
    ],
    fossils: [
      { tna: "Archaeotherium (Hell Pig)", max_ma: 35, min_ma: 28, phl: "Mammalia" },
      { tna: "Mesohippus (three-toed horse)", max_ma: 37, min_ma: 30, phl: "Mammalia" },
      { tna: "Oreodont sp. (sheep-like mammal)", max_ma: 37, min_ma: 28, phl: "Mammalia" },
      { tna: "Hyaenodon (predatory mammal)", max_ma: 35, min_ma: 30, phl: "Mammalia" },
      { tna: "Subhyracodon (early rhino)", max_ma: 37, min_ma: 28, phl: "Mammalia" },
      { tna: "Brontotherium sp. (thunder beast)", max_ma: 37, min_ma: 34, phl: "Mammalia" },
      { tna: "Tylosaurus sp. (mosasaur)", max_ma: 85, min_ma: 80, phl: "Reptilia" },
      { tna: "Baculites sp. (ammonite)", max_ma: 83, min_ma: 68, phl: "Cephalopoda" },
    ],
  },
  "Dinosaur National Monument, UT": {
    units: [
      { strat_name: "Quaternary Alluvium", lith: "gravel, sand", b_age: 2.58, t_age: 0, environ: "fluvial" },
      { strat_name: "Green River Formation", lith: "oil shale, limestone", b_age: 53, t_age: 46, environ: "lacustrine" },
      { strat_name: "Wasatch Formation", lith: "sandstone, mudstone", b_age: 58, t_age: 50, environ: "fluvial" },
      { strat_name: "Morrison Formation", lith: "mudstone, sandstone, siltstone", b_age: 157, t_age: 147, environ: "fluvial" },
      { strat_name: "Sundance Formation", lith: "shale, limestone, sandstone", b_age: 170, t_age: 157, environ: "marine" },
      { strat_name: "Twin Creek Limestone", lith: "limestone", b_age: 175, t_age: 165, environ: "marine" },
      { strat_name: "Nugget Sandstone", lith: "sandstone", b_age: 200, t_age: 175, environ: "eolian" },
      { strat_name: "Chinle Formation", lith: "mudstone, siltstone", b_age: 228, t_age: 201, environ: "fluvial" },
    ],
    fossils: [
      { tna: "Apatosaurus (Brontosaurus)", max_ma: 157, min_ma: 147, phl: "Reptilia" },
      { tna: "Allosaurus fragilis", max_ma: 155, min_ma: 147, phl: "Reptilia" },
      { tna: "Stegosaurus ungulatus", max_ma: 157, min_ma: 147, phl: "Reptilia" },
      { tna: "Diplodocus sp.", max_ma: 157, min_ma: 147, phl: "Reptilia" },
      { tna: "Camarasaurus sp.", max_ma: 155, min_ma: 147, phl: "Reptilia" },
      { tna: "Dryosaurus altus", max_ma: 155, min_ma: 147, phl: "Reptilia" },
      { tna: "Knightia sp. (Eocene fish)", max_ma: 53, min_ma: 46, phl: "Actinopterygii" },
    ],
  },
  "Death Valley, CA": {
    units: [
      { strat_name: "Lake Manly Deposits", lith: "lake sediments, salt, gravel", b_age: 0.2, t_age: 0, environ: "lacustrine" },
      { strat_name: "Furnace Creek Formation", lith: "conglomerate, sandstone, mudstone", b_age: 5.3, t_age: 2.6, environ: "lacustrine" },
      { strat_name: "Artist Drive Formation", lith: "volcanic tuff, mudstone", b_age: 12, t_age: 5, environ: "volcanic" },
      { strat_name: "Zabriskie Quartzite", lith: "quartzite, sandstone", b_age: 510, t_age: 500, environ: "marine" },
      { strat_name: "Wood Canyon Formation", lith: "sandstone, shale", b_age: 530, t_age: 510, environ: "marine" },
      { strat_name: "Noonday Dolomite", lith: "dolomite", b_age: 635, t_age: 550, environ: "marine" },
      { strat_name: "Kingston Peak Formation", lith: "diamictite, sandstone", b_age: 700, t_age: 635, environ: "glacial" },
      { strat_name: "Crystal Spring Formation", lith: "dolomite, shale, quartzite", b_age: 1300, t_age: 700, environ: "marine" },
    ],
    fossils: [
      { tna: "Mammuthus columbi (Columbian mammoth)", max_ma: 0.2, min_ma: 0.012, phl: "Mammalia" },
      { tna: "Camelops hesternus (western camel)", max_ma: 0.2, min_ma: 0.011, phl: "Mammalia" },
      { tna: "Trilobite sp.", max_ma: 510, min_ma: 500, phl: "Trilobita" },
      { tna: "Archaeocyatha (reef sponges)", max_ma: 530, min_ma: 510, phl: "Archaeocyatha" },
      { tna: "Cloudina sp. (early shelly fossil)", max_ma: 560, min_ma: 540, phl: "Incertae sedis" },
      { tna: "Stromatolites", max_ma: 1300, min_ma: 700, phl: "Cyanobacteria" },
    ],
  },
  "Los Angeles, CA": {
    units: [
      { strat_name: "Quaternary Alluvium", lith: "gravel, sand, silt", b_age: 2.58, t_age: 0, environ: "fluvial" },
      { strat_name: "La Brea Tar Seeps (Asphaltum)", lith: "bitumen, clay, sand", b_age: 0.04, t_age: 0.008, environ: "lacustrine" },
      { strat_name: "Fernando Formation", lith: "sandstone, siltstone, conglomerate", b_age: 3.6, t_age: 0.78, environ: "marine" },
      { strat_name: "Repetto Formation", lith: "shale, sandstone", b_age: 4.2, t_age: 3.6, environ: "marine" },
      { strat_name: "Modelo Formation", lith: "shale, diatomite, chert", b_age: 15, t_age: 5.3, environ: "marine" },
      { strat_name: "Topanga Formation", lith: "sandstone, conglomerate, basalt", b_age: 20, t_age: 13, environ: "marine" },
      { strat_name: "Vaqueros Formation", lith: "sandstone, siltstone", b_age: 23, t_age: 18, environ: "marine" },
      { strat_name: "Sespe Formation", lith: "red sandstone, mudstone", b_age: 40, t_age: 23, environ: "fluvial" },
    ],
    fossils: [
      { tna: "Smilodon fatalis (saber-toothed cat)", max_ma: 0.04, min_ma: 0.008, phl: "Mammalia" },
      { tna: "Canis dirus (dire wolf)", max_ma: 0.04, min_ma: 0.008, phl: "Mammalia" },
      { tna: "Mammuthus columbi (Columbian mammoth)", max_ma: 0.04, min_ma: 0.008, phl: "Mammalia" },
      { tna: "Megatherium (giant ground sloth)", max_ma: 0.04, min_ma: 0.008, phl: "Mammalia" },
      { tna: "Equus occidentalis (western horse)", max_ma: 0.04, min_ma: 0.008, phl: "Mammalia" },
      { tna: "Arctodus simus (short-faced bear)", max_ma: 0.04, min_ma: 0.008, phl: "Mammalia" },
      { tna: "Teratornis merriami (giant condor)", max_ma: 0.04, min_ma: 0.008, phl: "Aves" },
      { tna: "Turritella sp.", max_ma: 15, min_ma: 5, phl: "Gastropoda" },
    ],
  },
};

const PRESETS = [
  { name: "Grand Canyon, AZ", lat: 36.107, lng: -112.113, icon: "🏞\uFE0F", desc: "1.7 billion years exposed" },
  { name: "Yellowstone, WY", lat: 44.428, lng: -110.588, icon: "🌋", desc: "Supervolcano beneath your feet" },
  { name: "Badlands, SD", lat: 43.855, lng: -102.340, icon: "🦴", desc: "Ancient mammal graveyard" },
  { name: "Dinosaur National Monument, UT", lat: 40.439, lng: -108.972, icon: "🦕", desc: "Jurassic bone quarry" },
  { name: "Death Valley, CA", lat: 36.532, lng: -116.933, icon: "☀\uFE0F", desc: "Ancient sea floor, now desert" },
  { name: "Los Angeles, CA", lat: 34.052, lng: -118.244, icon: "🐆", desc: "La Brea tar pits & Ice Age beasts" },
];

// ── Helpers ──
function getPeriodForAge(ma) {
  for (const p of GEOLOGICAL_PERIODS) {
    if (ma >= p.end && ma <= p.start) return p;
  }
  return GEOLOGICAL_PERIODS[GEOLOGICAL_PERIODS.length - 1];
}

function formatAge(ma) {
  if (ma < 0.01) return `${Math.round(ma * 1000000)} years ago`;
  if (ma < 1) return `${Math.round(ma * 1000).toLocaleString()} thousand years ago`;
  if (ma < 1000) return `${ma.toFixed(1)} million years ago`;
  return `${(ma / 1000).toFixed(1)} billion years ago`;
}

function getEnvIcon(environ) {
  if (!environ) return "🪨";
  const icons = { marine: "🌊", eolian: "🏜\uFE0F", fluvial: "🏞\uFE0F", lacustrine: "💧", glacial: "❄\uFE0F", volcanic: "🌋", metamorphic: "💎", deltaic: "🏖\uFE0F", carbonate: "🐚", intrusive: "🔥", evaporite: "✨" };
  const e = environ.toLowerCase();
  for (const [k, v] of Object.entries(icons)) { if (e.includes(k)) return v; }
  if (e.includes("ocean") || e.includes("reef") || e.includes("shelf")) return "🌊";
  if (e.includes("river") || e.includes("stream")) return "🏞\uFE0F";
  if (e.includes("lake")) return "💧";
  if (e.includes("desert") || e.includes("dune")) return "🏜\uFE0F";
  return "🪨";
}

// ── Fetch Macrostrat (geology) independently ──
async function fetchMacrostrat(lat, lng) {
  try {
    const res = await fetch(
      `https://macrostrat.org/api/v2/units?lat=${lat}&lng=${lng}&response=long`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!data?.success?.data?.length) return { units: [], error: "no_data" };

    const units = data.success.data
      .map(u => ({
        strat_name: u.strat_name_long || u.strat_name || "Unknown Formation",
        lith: (u.lith || []).map(l => l.name || l).join(", ") || "unknown",
        b_age: typeof u.b_age === "number" ? u.b_age : 0,
        t_age: typeof u.t_age === "number" ? u.t_age : 0,
        environ: (u.environ || []).map(e => e.name || e).join(", ") || "",
        descrip: u.strat_name_long || "",
      }))
      .filter(u => u.strat_name !== "Unknown Formation" || u.b_age > 0)
      .sort((a, b) => a.t_age - b.t_age);

    return { units, error: units.length === 0 ? "no_data" : null };
  } catch (e) {
    console.warn("Macrostrat error:", e.message);
    return { units: [], error: "network" };
  }
}

// ── Fetch PBDB (fossils) independently ──
async function fetchPBDB(lat, lng) {
  try {
    const res = await fetch(
      `https://paleobiodb.org/data1.2/occs/list.json?lngmin=${lng - 1.5}&lngmax=${lng + 1.5}&latmin=${lat - 1.5}&latmax=${lat + 1.5}&show=class,coords,loc`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!data?.records?.length) return { fossils: [], error: "no_data" };

    const seen = new Set();
    const fossils = data.records
      .map(r => ({
        tna: r.tna || "Unknown taxon",
        max_ma: typeof r.eag === "number" ? r.eag : 0,
        min_ma: typeof r.lag === "number" ? r.lag : 0,
        phl: r.phl || "",
      }))
      .filter(f => {
        if (!f.tna || f.tna === "Unknown taxon") return false;
        if (seen.has(f.tna)) return false;
        seen.add(f.tna);
        return true;
      })
      .sort((a, b) => a.min_ma - b.min_ma);

    return { fossils, error: fossils.length === 0 ? "no_data" : null };
  } catch (e) {
    console.warn("PBDB error:", e.message);
    return { fossils: [], error: "network" };
  }
}

// ── Fetch with demo fallback ──
async function fetchLocation(name, lat, lng) {
  // Run both APIs independently — one failing won't take down the other
  const [macroResult, pbdbResult] = await Promise.all([
    fetchMacrostrat(lat, lng),
    fetchPBDB(lat, lng),
  ]);

  const hasLiveData = macroResult.units.length > 0 || pbdbResult.fossils.length > 0;

  if (hasLiveData) {
    return {
      units: macroResult.units,
      fossils: pbdbResult.fossils,
      live: true,
      macroError: macroResult.error,
      pbdbError: pbdbResult.error,
    };
  }

  // Fall back to demo data for known locations
  if (DEMO_DATA[name]) {
    return { ...DEMO_DATA[name], live: false, macroError: null, pbdbError: null };
  }

  // Unknown location with no data
  return {
    units: [],
    fossils: [],
    live: false,
    macroError: macroResult.error || "no_data",
    pbdbError: pbdbResult.error || "no_data",
  };
}

// ═══════════════════════════════════════════════════════════════
// Styles (all inline to avoid sandbox CSS issues)
// ═══════════════════════════════════════════════════════════════

const S = {
  app: { minHeight: "100vh", maxWidth: 480, margin: "0 auto", background: "linear-gradient(180deg, #faf6f0 0%, #e8ddd0 100%)", fontFamily: "'Georgia', 'Times New Roman', serif", color: "#2a1a0a", position: "relative" },
  header: { padding: "24px 20px 16px", textAlign: "center", borderBottom: "1px solid rgba(200,149,108,0.25)", background: "rgba(250,246,240,0.95)", position: "sticky", top: 0, zIndex: 100 },
  brand: { fontFamily: "monospace", fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "#c8956c", marginBottom: 2 },
  title: { fontSize: 22, fontWeight: 700, color: "#2a1a0a", lineHeight: 1.2, margin: 0 },
  tagline: { fontSize: 13, color: "#8a7a6a", fontStyle: "italic", marginTop: 2 },
  locationBtn: { display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, padding: "4px 14px", background: "rgba(200,149,108,0.12)", borderRadius: 20, fontFamily: "monospace", fontSize: 11, color: "#a07048", cursor: "pointer", border: "none" },
  // Location screen
  locScreen: { padding: "32px 20px" },
  gpsBtn: { width: "100%", padding: 14, background: "#c8956c", color: "white", border: "none", borderRadius: 12, fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 24 },
  gpsBtnDisabled: { opacity: 0.6, cursor: "not-allowed" },
  divider: { textAlign: "center", color: "#b0a090", fontSize: 12, fontFamily: "monospace", letterSpacing: "0.15em", marginBottom: 20, padding: "0 40px" },
  presetGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 },
  presetCard: { padding: "14px 12px", background: "#f5efe6", border: "1px solid rgba(200,149,108,0.25)", borderRadius: 12, cursor: "pointer", textAlign: "left", transition: "all 0.2s" },
  presetIcon: { fontSize: 20, marginBottom: 6 },
  presetName: { fontSize: 14, fontWeight: 600, color: "#2a1a0a", lineHeight: 1.3 },
  presetDesc: { fontSize: 11, color: "#8a7a6a", marginTop: 2, fontFamily: "monospace" },
  // Tabs
  tabBar: { display: "flex", borderBottom: "1px solid rgba(200,149,108,0.25)", background: "#f5efe6", position: "sticky", top: 89, zIndex: 99 },
  tab: { flex: 1, padding: "12px 8px 10px", background: "none", border: "none", borderBottom: "2px solid transparent", fontFamily: "monospace", fontSize: 11, letterSpacing: "0.05em", color: "#b0a090", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 },
  tabActive: { color: "#a07048", borderBottomColor: "#c8956c", background: "rgba(200,149,108,0.06)" },
  tabBadge: { background: "#c8956c", color: "white", fontSize: 9, padding: "1px 6px", borderRadius: 10 },
  // Strata
  strataHeader: { padding: "10px 20px", fontFamily: "monospace", fontSize: 10, color: "#b0a090", letterSpacing: "0.12em", textTransform: "uppercase" },
  stratLayer: { display: "flex", cursor: "pointer", borderBottom: "1px solid rgba(200,149,108,0.1)", transition: "background 0.15s" },
  stratAge: { width: 58, flexShrink: 0, padding: "12px 6px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: 10, color: "#8a7a6a", textAlign: "center", lineHeight: 1.3 },
  stratBar: (color, h) => ({ width: 40, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, position: "relative", minHeight: h, background: color }),
  stratBarTexture: { position: "absolute", inset: 0, opacity: 0.08, backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)" },
  stratInfo: { flex: 1, padding: "10px 14px", minHeight: 52, display: "flex", flexDirection: "column", justifyContent: "center" },
  stratName: { fontSize: 15, fontWeight: 600, color: "#2a1a0a", lineHeight: 1.3 },
  stratMeta: { fontFamily: "monospace", fontSize: 10, color: "#8a7a6a", marginTop: 2 },
  stratDetail: { padding: "10px 14px", background: "rgba(200,149,108,0.06)", borderTop: "1px solid rgba(200,149,108,0.25)" },
  detailRow: { display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 13 },
  detailLabel: { color: "#8a7a6a", fontFamily: "monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" },
  detailValue: { color: "#2a1a0a", fontSize: 13 },
  strataFooter: { padding: "12px 20px", fontFamily: "monospace", fontSize: 10, color: "#b0a090", textAlign: "center", letterSpacing: "0.08em" },
  // Fossils
  fossilContainer: { padding: "12px 16px" },
  fossilHeader: { fontFamily: "monospace", fontSize: 10, color: "#b0a090", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 },
  fossilCard: { padding: "14px 16px", background: "#f5efe6", border: "1px solid rgba(200,149,108,0.25)", borderRadius: 12, marginBottom: 10 },
  fossilSpecies: { fontSize: 16, fontWeight: 600, fontStyle: "italic", color: "#2a1a0a", display: "flex", alignItems: "center", gap: 6 },
  fossilMeta: { fontFamily: "monospace", fontSize: 10, color: "#8a7a6a", marginTop: 4, display: "flex", flexWrap: "wrap", gap: "4px 12px" },
  fossilDot: (color) => ({ width: 8, height: 8, borderRadius: "50%", display: "inline-block", background: color }),
  fossilEmpty: { textAlign: "center", padding: "40px 20px", color: "#8a7a6a" },
  // Timeline
  timelineContainer: { padding: 16 },
  timelinePeriod: { display: "flex", gap: 0, marginBottom: 4, borderRadius: 8, overflow: "hidden" },
  timelineBar: (color) => ({ width: 6, flexShrink: 0, background: color, borderRadius: "3px 0 0 3px" }),
  timelineContent: (present) => ({ flex: 1, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", background: present ? "rgba(200,149,108,0.08)" : "transparent", opacity: present ? 1 : 0.45 }),
  timelineName: { fontSize: 14, fontWeight: 600 },
  timelineAge: { fontFamily: "monospace", fontSize: 10, color: "#8a7a6a" },
  timelineEra: { fontSize: 11, color: "#8a7a6a" },
  timelineIcons: { display: "flex", alignItems: "center", gap: 6, fontSize: 13 },
  timelineGap: { fontFamily: "monospace", fontSize: 9, color: "#b0a090", letterSpacing: "0.1em" },
  timelineNote: { marginTop: 16, padding: 12, background: "rgba(200,149,108,0.08)", borderRadius: 8, fontSize: 13, fontStyle: "italic", color: "#8a7a6a", lineHeight: 1.5 },
  // Loading
  loading: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px" },
  spinner: { width: 48, height: 48, border: "3px solid rgba(200,149,108,0.25)", borderTopColor: "#c8956c", borderRadius: "50%", animation: "spin 1s linear infinite" },
  loadingText: { marginTop: 16, fontSize: 15, color: "#8a7a6a", fontStyle: "italic" },
  loadingSub: { fontFamily: "monospace", fontSize: 10, color: "#b0a090", marginTop: 4 },
  // Footer
  footer: { padding: "24px 20px", textAlign: "center", borderTop: "1px solid rgba(200,149,108,0.25)", fontFamily: "monospace", fontSize: 10, color: "#b0a090", lineHeight: 2 },
  footerLink: { color: "#a07048", textDecoration: "none" },
  // Error
  errorBox: { margin: 20, padding: 16, background: "rgba(240,64,40,0.08)", border: "1px solid rgba(240,64,40,0.2)", borderRadius: 12, textAlign: "center" },
  // Data badge
  dataBadge: { display: "inline-block", marginTop: 6, padding: "2px 10px", borderRadius: 10, fontSize: 9, fontFamily: "monospace", letterSpacing: "0.05em" },
  liveBadge: { background: "rgba(34,139,34,0.12)", color: "#228B22" },
  demoBadge: { background: "rgba(200,149,108,0.15)", color: "#a07048" },
};

// ═══════════════════════════════════════════════════════════════
// Components
// ═══════════════════════════════════════════════════════════════

function StratLayer({ unit, index, isSelected, onClick }) {
  const period = getPeriodForAge((unit.b_age + unit.t_age) / 2);
  const ageSpan = unit.b_age - unit.t_age;
  const thickness = Math.max(52, Math.min(140, ageSpan > 100 ? 140 : ageSpan > 10 ? 80 : 52));
  const icon = getEnvIcon(unit.environ);

  return (
    <div>
      <div style={S.stratLayer} onClick={onClick}>
        <div style={S.stratAge}>
          {unit.t_age < 1 ? `${Math.round(unit.t_age * 1000)}Ka` : `${Math.round(unit.t_age)}Ma`}
        </div>
        <div style={S.stratBar(period.color, thickness)}>
          <div style={S.stratBarTexture} />
          <span style={{ position: "relative", zIndex: 1 }}>{icon}</span>
        </div>
        <div style={S.stratInfo}>
          <div style={S.stratName}>{unit.strat_name}</div>
          <div style={S.stratMeta}>{period.name} · {unit.lith}</div>
        </div>
      </div>
      {isSelected && (
        <div style={S.stratDetail}>
          <div style={S.detailRow}>
            <span style={S.detailLabel}>Age Range</span>
            <span style={S.detailValue}>{formatAge(unit.b_age)} — {formatAge(unit.t_age)}</span>
          </div>
          <div style={S.detailRow}>
            <span style={S.detailLabel}>Period / Era</span>
            <span style={S.detailValue}>{period.name} ({period.era})</span>
          </div>
          <div style={S.detailRow}>
            <span style={S.detailLabel}>Lithology</span>
            <span style={S.detailValue}>{unit.lith}</span>
          </div>
          {unit.environ && (
            <div style={S.detailRow}>
              <span style={S.detailLabel}>Environment</span>
              <span style={S.detailValue}>{unit.environ}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FossilCard({ fossil }) {
  const period = getPeriodForAge((fossil.max_ma + fossil.min_ma) / 2);
  return (
    <div style={S.fossilCard}>
      <div style={S.fossilSpecies}>
        <span>🧬</span>
        {fossil.tna}
      </div>
      <div style={S.fossilMeta}>
        <span><span style={S.fossilDot(period.color)} /> {period.name}</span>
        <span>{fossil.max_ma}–{fossil.min_ma} Ma</span>
        {fossil.phl && <span>{fossil.phl}</span>}
      </div>
    </div>
  );
}

function TimelineView({ units, fossils }) {
  return (
    <div style={S.timelineContainer}>
      <div style={S.fossilHeader}>Geological time at this location</div>
      {GEOLOGICAL_PERIODS.map((period) => {
        const hasUnits = units.some(u => u.b_age >= period.end && u.t_age <= period.start);
        const pf = fossils.filter(f => f.max_ma >= period.end && f.min_ma <= period.start);
        const present = hasUnits || pf.length > 0;
        return (
          <div key={period.name} style={S.timelinePeriod}>
            <div style={S.timelineBar(period.color)} />
            <div style={S.timelineContent(present)}>
              <div>
                <div style={S.timelineName}>{period.name}</div>
                <div style={S.timelineAge}>
                  {period.start > 1000 ? `${(period.start/1000).toFixed(1)}Ga` : `${period.start}Ma`}
                  –
                  {period.end === 0 ? "now" : period.end > 1000 ? `${(period.end/1000).toFixed(1)}Ga` : `${period.end}Ma`}
                </div>
                <div style={S.timelineEra}>{period.era}</div>
              </div>
              <div style={S.timelineIcons}>
                {hasUnits && <span>🪨</span>}
                {pf.length > 0 && <span>🧬{pf.length}</span>}
                {!present && <span style={S.timelineGap}>gap</span>}
              </div>
            </div>
          </div>
        );
      })}
      <div style={S.timelineNote}>
        Gaps are <em>unconformities</em> — periods when rocks were eroded or never deposited. They're as important as the rocks themselves.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main App
// ═══════════════════════════════════════════════════════════════

export default function DeepTimeFieldGuide() {
  const [screen, setScreen] = useState("pick");
  const [locationName, setLocationName] = useState("");
  const [units, setUnits] = useState([]);
  const [fossils, setFossils] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [activeTab, setActiveTab] = useState("strata");
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchStatus, setSearchStatus] = useState(null); // "searching" | "no_results" | null
  const searchTimerRef = useRef(null);
  const searchVersionRef = useRef(0);

  const [macroError, setMacroError] = useState(null);
  const [pbdbError, setPbdbError] = useState(null);

  const loadLocation = useCallback(async (name, lat, lng) => {
    setScreen("loading");
    setLocationName(name);
    setError(null);
    setMacroError(null);
    setPbdbError(null);
    setSelectedLayer(null);
    setActiveTab("strata");

    let data;
    try {
      data = await fetchLocation(name, lat, lng);
    } catch (e) {
      setError("Can't reach the geology databases. Check your connection and try again.");
      setScreen("pick");
      return;
    }

    // Even with no data, still show the results screen — the empty states explain what's missing

    setUnits(data.units);
    setFossils(data.fossils);
    setIsLive(data.live);
    setMacroError(data.macroError || null);
    setPbdbError(data.pbdbError || null);
    setScreen("results");
  }, []);

  const handleBack = () => {
    setScreen("pick");
    setUnits([]);
    setFossils([]);
    setLocationName("");
    setError(null);
    setSearchQuery("");
    setSearchResults([]);
    setSearchStatus(null);
  };

  const handleGPS = () => {
    if (!navigator.geolocation) {
      setError("GPS not available in this browser. Try a preset or enter coordinates.");
      return;
    }
    setGpsLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        loadLocation(
          `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
          pos.coords.latitude,
          pos.coords.longitude
        );
      },
      () => {
        setGpsLoading(false);
        setError("Location access denied. Try a preset or enter coordinates manually.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleManualGo = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError("Enter valid coordinates (lat: -90 to 90, lng: -180 to 180).");
      return;
    }
    loadLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);

    // Clear previous debounce timer
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (query.length < 3) {
      setSearchResults([]);
      setSearchStatus(null);
      return;
    }

    setSearchStatus("searching");

    // Debounce: wait 400ms after user stops typing before fetching
    searchTimerRef.current = setTimeout(async () => {
      // Version number lets us ignore results from stale requests
      const thisVersion = ++searchVersionRef.current;

      try {
        // Photon (by Komoot) — free, no API key, OpenStreetMap data, no rate limit issues
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`;
        const res = await fetch(url);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        // Ignore this result if a newer search has started
        if (thisVersion !== searchVersionRef.current) return;

        // Photon returns GeoJSON — convert to the {display_name, lat, lon} shape we need
        const features = Array.isArray(data.features) ? data.features : [];
        const results = features.slice(0, 5).map(f => ({
          display_name: [
            f.properties.name,
            f.properties.city,
            f.properties.state,
            f.properties.country,
          ].filter(Boolean).join(", "),
          lat: f.geometry.coordinates[1],
          lon: f.geometry.coordinates[0],
        }));

        setSearchResults(results);
        setSearchStatus(results.length === 0 ? "no_results" : null);

      } catch (e) {
        if (thisVersion !== searchVersionRef.current) return;
        setSearchResults([]);
        setSearchStatus("no_results");
      }
    }, 400);
  };

  const oldestAge = units.length > 0 ? Math.max(...units.map(u => u.b_age)) : 0;
  const tabs = [
    { id: "strata", label: "Strata", icon: "🪨", count: units.length },
    { id: "fossils", label: "Fossils", icon: "🧬", count: fossils.length },
    { id: "timeline", label: "Timeline", icon: "⏳" },
  ];

  return (
    <div style={S.app}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={S.header}>
        <div style={S.brand}>{"◆"} Deep Time Field Guide {"◆"}</div>
        <h1 style={S.title}>What's Beneath Your Feet?</h1>
        {screen === "results" ? (
          <div>
            <button style={S.locationBtn} onClick={handleBack}>
              {"📍"} {locationName} · {units.length} formations · ← Back
            </button>
            <div style={{...S.dataBadge, ...(isLive ? S.liveBadge : S.demoBadge)}}>
              {isLive ? "🟢 Live API data" : "🟠 Demo data (APIs unavailable in preview)"}
            </div>
          </div>
        ) : (
          <div style={S.tagline}>Tap a location. See millions of years of Earth history.</div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={S.errorBox}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>{"⚠\uFE0F"}</div>
          <div style={{ fontSize: 14 }}>{error}</div>
        </div>
      )}

      {/* Location Picker */}
      {screen === "pick" && (
        <div style={S.locScreen}>

          {/* GPS Button */}
          <button
            style={{ ...S.gpsBtn, ...(gpsLoading ? S.gpsBtnDisabled : {}) }}
            onClick={handleGPS}
            disabled={gpsLoading}
          >
            {gpsLoading ? "📡 Locating you..." : "📱 Use My Location"}
          </button>

          {/* Place Search */}
          <div style={{ position: "relative", marginBottom: 20 }}>
            <input
              style={{ width: "100%", padding: "10px 12px 10px 34px", border: "1px solid rgba(200,149,108,0.25)", borderRadius: 10, fontFamily: "Georgia, serif", fontSize: 15, background: "#f5efe6", color: "#2a1a0a", outline: "none", boxSizing: "border-box" }}
              type="text"
              placeholder="🔍 Search for a place..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />

            {/* Single dropdown — content changes based on state */}
            {searchQuery.length >= 3 && (searchStatus !== null || searchResults.length > 0) && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#f5efe6", border: "1px solid rgba(200,149,108,0.25)", borderRadius: 10, zIndex: 10, marginTop: 4, overflow: "hidden" }}>

                {searchStatus === "searching" && (
                  <div style={{ padding: "10px 14px", fontSize: 13, color: "#8a7a6a", fontStyle: "italic" }}>
                    Searching...
                  </div>
                )}

                {searchStatus === "no_results" && (
                  <div style={{ padding: "10px 14px", fontSize: 13, color: "#8a7a6a" }}>
                    No places found. Try a different name, or use the coordinates box below.
                  </div>
                )}

                {searchStatus === null && searchResults.map((r, i) => (
                  <div
                    key={i}
                    style={{ padding: "10px 14px", cursor: "pointer", fontSize: 14, borderBottom: i < searchResults.length - 1 ? "1px solid rgba(200,149,108,0.15)" : "none" }}
                    onClick={() => {
                      setSearchResults([]);
                      setSearchQuery("");
                      setSearchStatus(null);
                      loadLocation(
                        r.display_name.split(",").slice(0, 2).join(","),
                        parseFloat(r.lat),
                        parseFloat(r.lon)
                      );
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(200,149,108,0.1)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    📍 {r.display_name}
                  </div>
                ))}

              </div>
            )}
          </div>

          <div style={S.divider}>── or explore a preset ──</div>

          <div style={S.presetGrid}>
            {PRESETS.map(p => (
              <div
                key={p.name}
                style={S.presetCard}
                onClick={() => loadLocation(p.name, p.lat, p.lng)}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#c8956c"; e.currentTarget.style.background = "rgba(200,149,108,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(200,149,108,0.25)"; e.currentTarget.style.background = "#f5efe6"; }}
              >
                <div style={S.presetIcon}>{p.icon}</div>
                <div style={S.presetName}>{p.name}</div>
                <div style={S.presetDesc}>{p.desc}</div>
              </div>
            ))}
          </div>

          {/* Coverage disclaimer */}
          <div style={{ background: "rgba(200,149,108,0.1)", border: "1px solid rgba(200,149,108,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>ℹ️</span>
            <div style={{ fontSize: 12, color: "#7a6a5a", lineHeight: 1.6, fontFamily: "Georgia, serif" }}>
              <strong>Coverage note:</strong> Geological data (Macrostrat) is strongest in North America. Fossil data (PBDB) is global but patchy. Many regions outside the US may show limited or no results.
            </div>
          </div>

          {/* Manual Coordinates */}
          <div style={S.divider}>── or enter coordinates ──</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              style={{ flex: 1, padding: "10px 12px", border: "1px solid rgba(200,149,108,0.25)", borderRadius: 8, fontFamily: "monospace", fontSize: 13, background: "#f5efe6", color: "#2a1a0a", outline: "none" }}
              type="text"
              placeholder="Lat (e.g. 26.05)"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
            />
            <input
              style={{ flex: 1, padding: "10px 12px", border: "1px solid rgba(200,149,108,0.25)", borderRadius: 8, fontFamily: "monospace", fontSize: 13, background: "#f5efe6", color: "#2a1a0a", outline: "none" }}
              type="text"
              placeholder="Lng (e.g. -80.24)"
              value={manualLng}
              onChange={(e) => setManualLng(e.target.value)}
            />
            <button
              style={{ padding: "10px 18px", background: "#c8956c", color: "white", border: "none", borderRadius: 8, fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              onClick={handleManualGo}
            >
              Go
            </button>
          </div>

        </div>
      )}

      {/* Loading */}
      {screen === "loading" && (
        <div style={S.loading}>
          <div style={S.spinner} />
          <div style={S.loadingText}>Drilling through time at {locationName}...</div>
          <div style={S.loadingSub}>Querying Macrostrat + PBDB</div>
        </div>
      )}

      {/* Results */}
      {screen === "results" && (
        <>
          <div style={S.tabBar}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                style={{...S.tab, ...(activeTab === tab.id ? S.tabActive : {})}}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon} {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span style={S.tabBadge}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {activeTab === "strata" && (
            <div>
              <div style={S.strataHeader}>{"⬇\uFE0F"} Surface ↓ Depth · tap any layer</div>
              {units.map((unit, i) => (
                <StratLayer
                  key={i}
                  unit={unit}
                  index={i}
                  isSelected={selectedLayer === i}
                  onClick={() => setSelectedLayer(selectedLayer === i ? null : i)}
                />
              ))}
              {units.length > 0 && (
                <div style={S.strataFooter}>{"◆"} Basement · {formatAge(oldestAge)} {"◆"}</div>
              )}
              {units.length === 0 && (
                <div style={S.fossilEmpty}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>🪨</div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>No geological data available for this location.</div>
                  <div style={{ fontSize: 13, marginTop: 8, color: "#8a7a6a", lineHeight: 1.5 }}>
                    {macroError === "network"
                      ? "⚠️ Couldn't reach the Macrostrat database. Check your connection."
                      : "Macrostrat doesn't have coverage here yet. Try nearby coordinates!"}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "fossils" && (
            <div style={S.fossilContainer}>
              <div style={S.fossilHeader}>Fossil taxa found within ~100km</div>
              {fossils.length > 0 ? (
                fossils.map((f, i) => <FossilCard key={i} fossil={f} />)
              ) : (
                <div style={S.fossilEmpty}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>🧬</div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>No fossil records nearby.</div>
                  <div style={{ fontSize: 13, marginTop: 8, color: "#8a7a6a", lineHeight: 1.5 }}>
                    {pbdbError === "network"
                      ? "⚠️ Couldn't reach the Paleobiology Database. Check your connection."
                      : "The PBDB doesn't have fossil occurrences recorded within ~100km of here yet. Try a different location!"}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "timeline" && <TimelineView units={units} fossils={fossils} />}
        </>
      )}

      {/* Footer */}
      <div style={S.footer}>
        Data: Macrostrat · Paleobiology Database
        <br />Built by Arjun Ravi · Deep Time Studios
        <br />{"◆"} v0.2 {"◆"}
      </div>
    </div>
  );
}
