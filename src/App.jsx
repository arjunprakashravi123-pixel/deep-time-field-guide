import { useState, useCallback, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// DEEP TIME FIELD GUIDE — v0.2
// What's Beneath Your Feet?
// Built by Arjun Ravi · Deep Time Studios
// ═══════════════════════════════════════════════════════════════

const GEOLOGICAL_PERIODS = [
  { name: "Quaternary",     start: 2.58,  end: 0,     color: "#F9F97F", era: "Cenozoic",   desc: "The Ice Ages. Glaciers advanced and retreated, megafauna like mammoths and saber-toothed cats roamed the land, and modern humans appeared." },
  { name: "Neogene",        start: 23.03, end: 2.58,  color: "#FFE619", era: "Cenozoic",   desc: "Grasslands spread across the continents, driving the evolution of grazing mammals like horses, rhinos, and early elephants. The world cooled steadily." },
  { name: "Paleogene",      start: 66,    end: 23.03, color: "#FD9A52", era: "Cenozoic",   desc: "After the dinosaur extinction, mammals exploded in diversity. Early whales entered the sea, giant predatory birds ruled, and early primates appeared." },
  { name: "Cretaceous",     start: 145,   end: 66,    color: "#7FC64E", era: "Mesozoic",   desc: "The last age of dinosaurs. Flowering plants appeared, sea levels were high, and the period ended with the asteroid impact that wiped out 75% of species." },
  { name: "Jurassic",       start: 201.4, end: 145,   color: "#34B2C9", era: "Mesozoic",   desc: "The golden age of dinosaurs. Giant sauropods and predators like Allosaurus dominated. The first birds evolved from feathered theropods." },
  { name: "Triassic",       start: 251.9, end: 201.4, color: "#812B92", era: "Mesozoic",   desc: "Life rebounded after the greatest mass extinction in Earth's history. The first dinosaurs appeared, along with the first mammals and flying pterosaurs." },
  { name: "Permian",        start: 298.9, end: 251.9, color: "#F04028", era: "Paleozoic",  desc: "All continents merged into Pangaea. The period ended with the Great Dying — the worst mass extinction ever, killing over 90% of marine species." },
  { name: "Carboniferous",  start: 358.9, end: 298.9, color: "#67A599", era: "Paleozoic",  desc: "Vast swamp forests covered the tropics, locking up carbon that formed today's coal deposits. The first reptiles appeared, freeing vertebrates from water." },
  { name: "Devonian",       start: 419.2, end: 358.9, color: "#CB8C37", era: "Paleozoic",  desc: "The Age of Fish. Armored and lobe-finned fish dominated the seas. The first land-walking vertebrates emerged, and forests appeared on the continents." },
  { name: "Silurian",       start: 443.8, end: 419.2, color: "#B3E1B6", era: "Paleozoic",  desc: "Life recovered from the Ordovician mass extinction. Jawed fish first appeared, coral reefs flourished, and vascular plants colonized the land." },
  { name: "Ordovician",     start: 485.4, end: 443.8, color: "#009270", era: "Paleozoic",  desc: "Marine invertebrates reached peak diversity. Trilobites, brachiopods, and graptolites filled the seas. The period ended with a major ice age and extinction." },
  { name: "Cambrian",       start: 538.8, end: 485.4, color: "#7FA056", era: "Paleozoic",  desc: "The Cambrian Explosion — almost all major animal body plans appeared within a geologically short time. Trilobites, early chordates, and bizarre soft-bodied creatures filled the seas." },
  { name: "Precambrian",    start: 4600,  end: 538.8, color: "#F73667", era: "Precambrian", desc: "Nearly 90% of Earth's history. The planet formed, the first oceans appeared, cyanobacteria pumped oxygen into the atmosphere, and the first simple cells evolved into complex multicellular life." },
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

function getPhylumEmoji(phl) {
  if (!phl) return "❓";
  const p = phl.toLowerCase();
  // Vertebrate classes
  if (p.includes("mammalia"))                             return "🦣"; // mammals
  if (p.includes("reptilia"))                             return "🦕"; // reptiles/dinosaurs
  if (p.includes("aves"))                                 return "🦅"; // birds
  if (p.includes("actinopterygii") || p.includes("osteichthyes")) return "🐟"; // ray-finned fish
  if (p.includes("chondrichthyes"))                       return "🦈"; // sharks & rays
  if (p.includes("amphibia"))                             return "🐸"; // amphibians
  if (p.includes("placodermi"))                           return "🐡"; // armoured fish
  if (p.includes("agnatha") || p.includes("cyclostomata")) return "🐍"; // jawless fish
  // Chordata (broad — early vertebrate ancestors)
  if (p.includes("chordata"))                             return "🦴";
  // Mollusca & subdivisions
  if (p.includes("mollusca"))                             return "🐌"; // mollusks (broad)
  if (p.includes("cephalopoda"))                          return "🐙"; // ammonites, nautiloids
  if (p.includes("gastropoda"))                           return "🐚"; // snails
  if (p.includes("bivalvia"))                             return "🦪"; // clams, oysters
  if (p.includes("polyplacophora"))                       return "🪨"; // chitons
  // Arthropoda & subdivisions
  if (p.includes("trilobita"))                            return "🦂"; // trilobites
  if (p.includes("insecta"))                              return "🪲"; // insects
  if (p.includes("arachnida"))                            return "🕷\uFE0F"; // spiders/scorpions
  if (p.includes("crustacea") || p.includes("malacostraca")) return "🦐"; // crustaceans
  if (p.includes("arthropoda"))                           return "🦗"; // other arthropods
  // Echinoderms
  if (p.includes("crinoidea"))                            return "🌸"; // sea lilies
  if (p.includes("echinoidea"))                           return "🦔"; // sea urchins
  if (p.includes("asteroidea"))                           return "⭐"; // sea stars
  if (p.includes("echinodermata"))                        return "🌟"; // echinoderms (broad)
  // Other invertebrates
  if (p.includes("brachiopoda"))                          return "🐚"; // lamp shells
  if (p.includes("hemichordata"))                         return "🪱"; // acorn worms/graptolites
  if (p.includes("coral") || p.includes("anthozoa"))      return "🪸"; // corals
  if (p.includes("porifera") || p.includes("sponge"))     return "🧽"; // sponges
  if (p.includes("archaeocyatha"))                        return "🏺"; // ancient reef builders
  if (p.includes("bryozoa"))                              return "🕸\uFE0F"; // moss animals
  if (p.includes("cnidaria"))                             return "🪼"; // jellyfish & kin
  if (p.includes("annelida"))                             return "🪱"; // worms
  if (p.includes("foraminifera"))                         return "🔬"; // forams
  // Plants & microbes
  if (p.includes("plantae"))                              return "🌿"; // plants
  if (p.includes("cyanobacteria") || p.includes("bacteria")) return "🦠"; // microbes/stromatolites
  if (p.includes("fungi"))                                return "🍄"; // fungi
  if (p.includes("algae") || p.includes("chlorophyta"))   return "🌱"; // algae
  // Unknown
  return "❓";
}

function getRockTexture(lith) {
  if (!lith) return "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 4px)";
  const l = lith.toLowerCase();
  // Sandstone — dots (cross-hatched grid like sand grains)
  if (l.includes("sandstone") || l.includes("sand") || l.includes("quartzite") || l.includes("arenite"))
    return "radial-gradient(circle, rgba(0,0,0,0.18) 1px, transparent 1px) 0 0 / 5px 5px";
  // Shale / mudstone — tight horizontal lines (laminated)
  if (l.includes("shale") || l.includes("mudstone") || l.includes("siltstone") || l.includes("clay") || l.includes("marl"))
    return "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.14) 3px, rgba(0,0,0,0.14) 4px)";
  // Limestone / dolomite — brick pattern
  if (l.includes("limestone") || l.includes("dolomite") || l.includes("chalk") || l.includes("carbonate") || l.includes("calcarenite"))
    return "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.1) 8px, rgba(0,0,0,0.1) 9px), repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 6px)";
  // Granite / gneiss / schist — scattered diagonal dashes (crystalline)
  if (l.includes("granite") || l.includes("gneiss") || l.includes("schist") || l.includes("metamorphic") || l.includes("quartzite"))
    return "repeating-linear-gradient(60deg, transparent, transparent 4px, rgba(0,0,0,0.15) 4px, rgba(0,0,0,0.15) 5px), repeating-linear-gradient(-60deg, transparent, transparent 4px, rgba(0,0,0,0.1) 4px, rgba(0,0,0,0.1) 5px)";
  // Volcanic / tuff / basalt / rhyolite — irregular blotchy
  if (l.includes("basalt") || l.includes("rhyolite") || l.includes("tuff") || l.includes("volcanic") || l.includes("obsidian") || l.includes("andesite"))
    return "radial-gradient(ellipse at 30% 30%, rgba(0,0,0,0.15) 2px, transparent 3px) 0 0 / 8px 8px, radial-gradient(ellipse at 70% 70%, rgba(0,0,0,0.1) 1px, transparent 2px) 0 0 / 6px 6px";
  // Conglomerate / breccia — large dots (pebbles)
  if (l.includes("conglomerate") || l.includes("breccia") || l.includes("gravel") || l.includes("diamictite"))
    return "radial-gradient(circle, rgba(0,0,0,0.2) 2px, transparent 2px) 0 0 / 9px 9px";
  // Coal / bitumen / oil shale — tight black grid
  if (l.includes("coal") || l.includes("bitumen") || l.includes("asphalt") || l.includes("oil shale"))
    return "repeating-linear-gradient(45deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2) 2px, transparent 2px, transparent 5px)";
  // Evaporite / gypsum / salt — fine diagonal stripes
  if (l.includes("gypsum") || l.includes("salt") || l.includes("anhydrite") || l.includes("evaporite"))
    return "repeating-linear-gradient(30deg, transparent, transparent 2px, rgba(255,255,255,0.25) 2px, rgba(255,255,255,0.25) 3px)";
  // Default — gentle diagonal hatch
  return "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 4px)";
}

function getEnvIcon(environ) {
  if (!environ) return "🪨";
  const e = environ.toLowerCase();
  // Check non-marine FIRST — before "marine" match fires accidentally
  if (e.includes("non-marine") || e.includes("terrestrial") || e.includes("continental")) return "🌄";
  // Marine environments
  if (e.includes("marine") || e.includes("ocean") || e.includes("reef") || e.includes("shelf") || e.includes("subtidal") || e.includes("peritidal") || e.includes("offshore")) return "🌊";
  // Freshwater / fluvial
  if (e.includes("fluvial") || e.includes("river") || e.includes("stream") || e.includes("alluvial")) return "🏞\uFE0F";
  if (e.includes("lacustrine") || e.includes("lake")) return "💧";
  if (e.includes("deltaic") || e.includes("delta") || e.includes("coastal") || e.includes("paralic")) return "🏖\uFE0F";
  // Arid / wind
  if (e.includes("eolian") || e.includes("aeolian") || e.includes("desert") || e.includes("dune")) return "🏜\uFE0F";
  // Ice
  if (e.includes("glacial") || e.includes("periglacial")) return "❄\uFE0F";
  // Rock types
  if (e.includes("volcanic") || e.includes("lava") || e.includes("pyroclastic")) return "🌋";
  if (e.includes("metamorphic") || e.includes("schist") || e.includes("gneiss")) return "💎";
  if (e.includes("intrusive") || e.includes("plutonic")) return "🔥";
  if (e.includes("carbonate")) return "🐚";
  if (e.includes("evaporite")) return "✨";
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
      .sort((a, b) => b.min_ma - a.min_ma); // newest first

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
  // Heavily aged parchment — grain, foxing, coffee stain, uneven yellowing, ruled lines
  app: { minHeight: "100vh", maxWidth: 480, margin: "0 auto", background: "#dfc99a", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.09'/%3E%3C/svg%3E\"), radial-gradient(ellipse 38px 28px at 9% 18%, rgba(140,90,30,0.13) 0%, transparent 100%), radial-gradient(ellipse 22px 18px at 87% 42%, rgba(120,78,22,0.11) 0%, transparent 100%), radial-gradient(ellipse 30px 24px at 47% 80%, rgba(150,100,35,0.1) 0%, transparent 100%), radial-gradient(ellipse 16px 13px at 73% 11%, rgba(130,85,28,0.12) 0%, transparent 100%), radial-gradient(ellipse 25px 20px at 28% 67%, rgba(140,95,32,0.1) 0%, transparent 100%), radial-gradient(ellipse 18px 14px at 62% 35%, rgba(110,70,20,0.08) 0%, transparent 100%), radial-gradient(ellipse 70px 58px at 82% 14%, transparent 57%, rgba(100,65,18,0.09) 62%, rgba(100,65,18,0.05) 68%, transparent 74%), radial-gradient(ellipse at 30% 20%, rgba(255,235,170,0.28) 0%, transparent 50%), radial-gradient(ellipse at 80% 90%, rgba(160,110,40,0.1) 0%, transparent 45%), repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(80,50,15,0.08) 27px, rgba(80,50,15,0.08) 28px)", fontFamily: "'Crimson Text', 'Palatino Linotype', Palatino, Georgia, serif", fontSize: "16px", color: "#1a0e04", position: "relative", boxShadow: "0 0 80px rgba(0,0,0,0.25), inset 0 0 150px rgba(80,45,5,0.09)", filter: "sepia(12%) contrast(94%) saturate(88%)" },
  // Battered dark green book cover binding
  header: { padding: "18px 20px 14px", textAlign: "center", background: "#16221200", backgroundImage: "linear-gradient(135deg, #162212 0%, #1e2d18 40%, #162010 100%), url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E\")", borderBottom: "3px solid #9a6a34", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 3px 16px rgba(0,0,0,0.5)" },
  brand: { fontFamily: "'Special Elite', 'Courier New', monospace", fontSize: 8, letterSpacing: "0.45em", textTransform: "uppercase", color: "#b8824c", marginBottom: 6, opacity: 0.9 },
  title: { fontSize: 22, fontWeight: 700, color: "#ede0c4", lineHeight: 1.2, margin: 0, fontFamily: "'Crimson Text', Palatino, Georgia, serif", letterSpacing: "0.02em", textShadow: "1px 1px 4px rgba(0,0,0,0.6), 0 0 20px rgba(0,0,0,0.3)" },
  tagline: { fontSize: 13, color: "rgba(230,210,170,0.45)", fontStyle: "italic", marginTop: 4, fontFamily: "'Crimson Text', Georgia, serif" },
  locationBtn: { display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, padding: "4px 14px", background: "rgba(200,149,108,0.18)", border: "1px solid rgba(200,149,108,0.35)", borderRadius: 3, fontFamily: "'Special Elite', monospace", fontSize: 10, color: "#c8956c", cursor: "pointer" },
  // Location screen
  locScreen: { padding: "28px 20px" },
  gpsBtn: { width: "100%", padding: 14, background: "#1a2916", color: "#f5ead8", border: "2px solid rgba(200,149,108,0.3)", borderRadius: 3, fontFamily: "'Crimson Text', Georgia, serif", fontSize: 18, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 24, letterSpacing: "0.03em", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" },
  gpsBtnDisabled: { opacity: 0.6, cursor: "not-allowed" },
  divider: { textAlign: "center", color: "#a09080", fontSize: 10, fontFamily: "'Special Elite', 'Courier New', monospace", letterSpacing: "0.2em", marginBottom: 20, padding: "8px 0", borderTop: "1px dashed rgba(90,60,20,0.15)", borderBottom: "1px dashed rgba(90,60,20,0.15)" },
  presetGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32, padding: "14px 6px" },
  // Preset cards — scraps of paper taped onto the notebook page
  presetCard: { paddingTop: 26, padding: "26px 12px 14px", background: "#fef9ef", border: "none", borderRadius: 2, cursor: "pointer", textAlign: "left", transition: "transform 0.18s, box-shadow 0.18s", position: "relative", boxShadow: "2px 4px 14px rgba(42,26,10,0.22), 0 1px 3px rgba(42,26,10,0.1)" },
  presetIcon: { fontSize: 22, marginBottom: 7 },
  presetName: { fontSize: 14, fontWeight: 700, color: "#1a0e04", lineHeight: 1.3, letterSpacing: "0.01em", fontFamily: "'Crimson Text', Georgia, serif" },
  presetDesc: { fontSize: 10, color: "#8a7a6a", marginTop: 3, fontFamily: "'Special Elite', 'Courier New', monospace" },
  // Tabs — worn, fingerprinted folder tabs
  tabBar: { display: "flex", background: "#b8a070", borderBottom: "2px solid rgba(42,26,10,0.35)", position: "sticky", top: 82, zIndex: 99, gap: 2, padding: "0 6px 0", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" },
  tab: { flex: 1, padding: "9px 6px 7px", background: "#a89060", border: "1px solid rgba(42,26,10,0.25)", borderBottom: "none", borderRadius: "4px 6px 0 0", fontFamily: "'Special Elite', 'Courier New', monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5a4a30", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, transition: "background 0.12s", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), inset 2px 0 4px rgba(0,0,0,0.06)" },
  tabActive: { background: "#dfc99a", color: "#1a0e04", borderColor: "rgba(42,26,10,0.35)", fontWeight: 700, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)" },
  tabBadge: { background: "#7a4a20", color: "#f0d8b0", fontSize: 9, padding: "1px 5px", borderRadius: 2 },
  // Strata — geological cross-section style
  strataHeader: { padding: "7px 20px", fontFamily: "'Special Elite', 'Courier New', monospace", fontSize: 9, color: "#8a7a6a", letterSpacing: "0.18em", textTransform: "uppercase", background: "rgba(42,26,10,0.04)", borderBottom: "1px dashed rgba(42,26,10,0.12)" },
  stratLayer: { display: "flex", cursor: "pointer", borderBottom: "1px solid rgba(42,26,10,0.08)", transition: "background 0.12s" },
  stratAge: { width: 58, flexShrink: 0, padding: "12px 6px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Special Elite', 'Courier New', monospace", fontSize: 9, color: "#8a7a6a", textAlign: "center", lineHeight: 1.3, borderRight: "1px dashed rgba(42,26,10,0.12)" },
  stratBar: (color, h) => ({ width: 40, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, position: "relative", minHeight: h, background: color }),
  stratBarTexture: { position: "absolute", inset: 0, opacity: 0.08, backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)" },
  stratInfo: { flex: 1, padding: "10px 14px", minHeight: 52, display: "flex", flexDirection: "column", justifyContent: "center" },
  stratName: { fontSize: 16, fontWeight: 700, color: "#1a0e04", lineHeight: 1.25, letterSpacing: "0.01em", fontFamily: "'Crimson Text', Georgia, serif" },
  stratMeta: { fontFamily: "'Special Elite', 'Courier New', monospace", fontSize: 9, color: "#8a7a6a", marginTop: 3 },
  stratDetail: { padding: "12px 16px", background: "#fdf4e0", borderTop: "1px solid rgba(42,26,10,0.1)", backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(90,60,20,0.06) 23px, rgba(90,60,20,0.06) 24px)" },
  detailRow: { display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 14, borderBottom: "1px dotted rgba(42,26,10,0.07)", fontFamily: "'Crimson Text', Georgia, serif" },
  detailLabel: { color: "#8a7a6a", fontFamily: "'Special Elite', 'Courier New', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em" },
  detailValue: { color: "#1a0e04", fontSize: 14, fontFamily: "'Crimson Text', Georgia, serif" },
  strataFooter: { padding: "10px 20px", fontFamily: "'Special Elite', 'Courier New', monospace", fontSize: 9, color: "#a09080", textAlign: "center", letterSpacing: "0.14em", borderTop: "1px dashed rgba(42,26,10,0.12)", background: "rgba(42,26,10,0.03)" },
  // Fossils — specimen index card style
  fossilContainer: { padding: "12px 16px" },
  fossilHeader: { fontFamily: "'Special Elite', 'Courier New', monospace", fontSize: 9, color: "#8a7a6a", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 12, paddingBottom: 8, borderBottom: "2px solid rgba(42,26,10,0.12)" },
  fossilCard: { padding: "12px 14px", background: "#fdf4e0", border: "1px solid rgba(42,26,10,0.13)", borderLeft: "4px solid #b8824c", borderRadius: "0 3px 3px 0", marginBottom: 10, boxShadow: "0 2px 6px rgba(42,26,10,0.09), 0 1px 0 rgba(255,255,255,0.55) inset" },
  fossilSpecies: { fontSize: 17, fontWeight: 600, fontStyle: "italic", color: "#1a0e04", display: "flex", alignItems: "center", gap: 8, fontFamily: "'Crimson Text', Georgia, serif" },
  fossilMeta: { fontFamily: "'Special Elite', 'Courier New', monospace", fontSize: 9, color: "#8a7a6a", marginTop: 4, display: "flex", flexWrap: "wrap", gap: "4px 12px" },
  fossilDot: (color) => ({ width: 8, height: 8, borderRadius: "50%", display: "inline-block", background: color, flexShrink: 0 }),
  fossilEmpty: { textAlign: "center", padding: "40px 20px", color: "#8a7a6a", fontFamily: "'Crimson Text', Georgia, serif", fontSize: 15 },
  // Timeline
  timelineContainer: { padding: 16 },
  timelinePeriod: { display: "flex", gap: 0, marginBottom: 3, overflow: "hidden" },
  timelineBar: (color) => ({ width: 6, flexShrink: 0, background: color }),
  timelineContent: (present) => ({ flex: 1, padding: "9px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", background: present ? "#fdf6e8" : "transparent", opacity: present ? 1 : 0.42, borderBottom: "1px dotted rgba(42,26,10,0.07)", backgroundImage: present ? "repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(80,50,15,0.04) 27px, rgba(80,50,15,0.04) 28px)" : "none" }),
  timelineName: { fontSize: 16, fontWeight: 700, letterSpacing: "0.01em", fontFamily: "'Crimson Text', Georgia, serif" },
  timelineAge: { fontFamily: "'Special Elite', 'Courier New', monospace", fontSize: 9, color: "#8a7a6a" },
  timelineEra: { fontSize: 9, color: "#8a7a6a", fontFamily: "'Special Elite', 'Courier New', monospace" },
  timelineIcons: { display: "flex", alignItems: "center", gap: 6, fontSize: 13 },
  timelineGap: { fontFamily: "'Special Elite', 'Courier New', monospace", fontSize: 9, color: "#b0a090", letterSpacing: "0.1em" },
  timelineNote: { marginTop: 16, padding: "12px 16px", background: "#fdf4e0", border: "1px solid rgba(42,26,10,0.12)", borderLeft: "3px solid #b8824c", borderRadius: "0 3px 3px 0", fontSize: 15, fontStyle: "italic", color: "#6a5a4a", lineHeight: 1.6, fontFamily: "'Crimson Text', Georgia, serif" },
  // Loading — aged field notes leafing effect
  loading: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", textAlign: "center" },
  spinner: { width: 44, height: 44, border: "2px solid rgba(154,106,52,0.3)", borderTopColor: "#9a6a34", borderRadius: "50%", animation: "spin 1.4s linear infinite" },
  loadingText: { marginTop: 18, fontSize: 18, color: "#5a4a30", fontStyle: "italic", fontFamily: "'Crimson Text', Georgia, serif", lineHeight: 1.4 },
  loadingSub: { fontFamily: "'Special Elite', 'Courier New', monospace", fontSize: 9, color: "#a09070", marginTop: 6, letterSpacing: "0.14em" },
  // Tab search bar
  tabSearch: { display: "flex", alignItems: "center", gap: 8, margin: "10px 16px 4px", padding: "8px 12px", background: "#f5e8c8", border: "1px solid rgba(154,106,52,0.3)", borderRadius: 0, borderLeft: "3px solid rgba(154,106,52,0.4)" },
  tabSearchInput: { flex: 1, border: "none", background: "transparent", fontFamily: "'Crimson Text', Georgia, serif", fontSize: 15, color: "#1a0e04", outline: "none" },
  tabSearchClear: { background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#b0a090", padding: "0 2px", lineHeight: 1 },
  // Footer — matches the dark header binding
  footer: { padding: "18px 20px", textAlign: "center", background: "#1e2d1a", borderTop: "3px solid #c8956c", fontFamily: "monospace", fontSize: 9, color: "rgba(200,149,108,0.65)", lineHeight: 2.2, letterSpacing: "0.06em" },
  footerLink: { color: "#c8956c", textDecoration: "none" },
  // Error
  errorBox: { margin: 20, padding: 16, background: "rgba(240,64,40,0.07)", border: "1px solid rgba(240,64,40,0.2)", borderRadius: 3, textAlign: "center" },
  // Data badge
  dataBadge: { display: "inline-block", marginTop: 6, padding: "2px 10px", borderRadius: 3, fontSize: 9, fontFamily: "monospace", letterSpacing: "0.06em" },
  liveBadge: { background: "rgba(34,139,34,0.12)", color: "#2a7a20", border: "1px solid rgba(34,139,34,0.2)" },
  demoBadge: { background: "rgba(200,149,108,0.14)", color: "#a07048", border: "1px solid rgba(200,149,108,0.25)" },
};

// ═══════════════════════════════════════════════════════════════
// Components
// ═══════════════════════════════════════════════════════════════

function getWhatItLookedLike(unit, period) {
  const e = (unit.environ || "").toLowerCase();
  const l = (unit.lith || "").toLowerCase();
  const ageStr = formatAge((unit.b_age + unit.t_age) / 2);

  if (e.includes("marine") && !e.includes("non-marine")) {
    if (e.includes("deep") || e.includes("offshore")) return `${ageStr}, you would have been standing on the dark floor of a deep ocean, miles of water above you.`;
    if (e.includes("reef")) return `${ageStr}, this spot was a thriving coral reef, teeming with marine life in warm, clear shallow water.`;
    return `${ageStr}, you would have been underwater — on the floor of a warm, shallow sea filled with marine invertebrates.`;
  }
  if (e.includes("eolian") || e.includes("aeolian") || e.includes("dune"))
    return `${ageStr}, this was a vast wind-swept desert. Enormous sand dunes rolled across the landscape as far as the eye could see.`;
  if (e.includes("fluvial") || e.includes("river") || e.includes("alluvial"))
    return `${ageStr}, a river system wound through this landscape, depositing sediment across broad floodplains.`;
  if (e.includes("lacustrine") || e.includes("lake"))
    return `${ageStr}, a large freshwater lake covered this spot, its still waters slowly accumulating layers of sediment.`;
  if (e.includes("deltaic"))
    return `${ageStr}, this was a river delta where a great river met the sea, building land outward from the shoreline.`;
  if (e.includes("glacial"))
    return `${ageStr}, massive glaciers covered this region, grinding and reshaping the landscape beneath sheets of ice.`;
  if (e.includes("volcanic") || e.includes("pyroclastic"))
    return `${ageStr}, this area was volcanically active — rivers of lava or ash falls blanketed the surrounding landscape.`;
  if (e.includes("metamorphic") || e.includes("intrusive") || e.includes("plutonic"))
    return `${ageStr}, these rocks were forming miles underground — buried under mountain ranges that have long since been eroded away.`;
  if (e.includes("swamp") || l.includes("coal"))
    return `${ageStr}, dense tropical swamp forests blanketed this region, their decaying plant material slowly compressing into coal.`;
  if (e.includes("non-marine") || e.includes("terrestrial"))
    return `${ageStr}, this was dry land — a continental environment shaped by wind, rain, and rivers.`;

  // fallback based on period
  if (period.name === "Quaternary") return `${ageStr}, this landscape would have looked surprisingly familiar — shaped by the same ice age climate cycles that carved the modern world.`;
  if (period.name === "Cretaceous") return `${ageStr}, dinosaurs may have walked across this very ground in a warm, greenhouse world with no polar ice.`;
  if (period.name === "Jurassic") return `${ageStr}, giant sauropod dinosaurs roamed this region in a warm, humid world blanketed by ferns and cycads.`;
  if (period.name === "Triassic") return `${ageStr}, the first dinosaurs were just appearing, recovering in a world still scarred by the greatest mass extinction in Earth's history.`;
  if (period.name === "Permian") return `${ageStr}, this was part of the supercontinent Pangaea — a vast landmass stretching nearly from pole to pole.`;
  if (period.name === "Carboniferous") return `${ageStr}, towering swamp forests dominated the tropics, their fallen trunks slowly transforming into the coal beds we mine today.`;
  if (period.name === "Devonian") return `${ageStr}, fish dominated the seas and the first four-limbed animals were hauling themselves onto land for the first time.`;
  if (period.era === "Paleozoic") return `${ageStr}, this spot was part of an ancient world where the continents looked nothing like today and complex animal life was still finding its footing.`;
  if (period.era === "Precambrian") return `${ageStr}, the world was almost unrecognizable — no land plants, no animals, just microbial mats and ancient oceans under a sky with far more carbon dioxide.`;
  return `${ageStr}, this location existed in a world profoundly different from today.`;
}

function getFormationDescription(unit, period) {
  const l = (unit.lith || "").toLowerCase();
  const e = (unit.environ || "").toLowerCase();
  const ageStr = formatAge(unit.b_age);
  const youngStr = formatAge(unit.t_age);

  // Build a lith description
  let lithDesc = "";
  if (l.includes("limestone") || l.includes("calcarenite"))
    lithDesc = "Limestone is a sedimentary rock made of calcium carbonate, typically from the shells and skeletons of marine organisms. It often preserves fossils exceptionally well.";
  else if (l.includes("dolomite"))
    lithDesc = "Dolomite is a carbonate rock similar to limestone but with magnesium replacing some calcium. It often forms when limestone is chemically altered by magnesium-rich fluids.";
  else if (l.includes("chalk"))
    lithDesc = "Chalk is a soft, fine-grained limestone formed from the microscopic shells of marine plankton. It indicates deep, warm, clear seas far from any land source of sediment.";
  else if (l.includes("shale"))
    lithDesc = "Shale is a fine-grained sedimentary rock formed from compacted clay and silt. It splits into thin layers and often preserves delicate fossils of soft-bodied organisms.";
  else if (l.includes("mudstone") || l.includes("siltstone"))
    lithDesc = "Mudstone and siltstone are fine-grained rocks formed from slowly deposited clay and silt particles, typically in calm, low-energy environments like lake beds or quiet seas.";
  else if (l.includes("sandstone"))
    lithDesc = "Sandstone is formed from compressed sand grains cemented together over time. Depending on the environment it can record ancient rivers, beaches, dunes, or shallow seas.";
  else if (l.includes("conglomerate"))
    lithDesc = "Conglomerate is a coarse sedimentary rock made of rounded pebbles and gravel cemented together. It indicates high-energy environments like fast-moving rivers or beaches.";
  else if (l.includes("breccia"))
    lithDesc = "Breccia is similar to conglomerate but with angular, jagged fragments instead of rounded ones — a sign of violent, short-distance transport like landslides or fault zones.";
  else if (l.includes("coal"))
    lithDesc = "Coal is the compressed remains of ancient plant material from swamp forests. It records lush, oxygen-rich environments and is one of humanity's most important fossil fuels.";
  else if (l.includes("chert") || l.includes("diatomite"))
    lithDesc = "Chert and diatomite are silica-rich rocks formed from the accumulated skeletons of microscopic organisms like radiolarians and diatoms, often in deep or upwelling ocean waters.";
  else if (l.includes("gypsum") || l.includes("anhydrite") || l.includes("evaporite") || l.includes("salt"))
    lithDesc = "Evaporite minerals like gypsum, anhydrite, and halite (salt) precipitate when seawater or lake water evaporates in hot, arid conditions — recording ancient enclosed seas or salt flats.";
  else if (l.includes("granite"))
    lithDesc = "Granite is an intrusive igneous rock that forms deep underground when magma slowly cools. Its presence at the surface means millions of years of erosion have stripped away the overlying rock.";
  else if (l.includes("basalt"))
    lithDesc = "Basalt is a fine-grained volcanic rock formed from rapid cooling of lava at the surface. It is the most common rock in Earth's oceanic crust and records ancient volcanic eruptions.";
  else if (l.includes("rhyolite") || l.includes("tuff") || l.includes("obsidian"))
    lithDesc = "Rhyolite and volcanic tuff are silica-rich volcanic rocks. Tuff forms from compacted volcanic ash and can be explosively deposited across vast areas from major eruptions.";
  else if (l.includes("schist") || l.includes("gneiss") || l.includes("quartzite") || l.includes("amphibolite"))
    lithDesc = "Metamorphic rocks like schist, gneiss, and quartzite form when existing rocks are subjected to extreme heat and pressure deep within the Earth's crust, often during mountain-building events.";
  else if (l.includes("phyllite") || l.includes("slate"))
    lithDesc = "Slate and phyllite are low-grade metamorphic rocks formed from shale under moderate heat and pressure. They split into flat sheets and were historically used as roofing material.";
  else if (l.includes("oil shale") || l.includes("bitumen") || l.includes("asphalt"))
    lithDesc = "Oil shale and bitumen-bearing rocks contain organic material that never fully converted to oil. They record ancient lakes or seas with abundant organic matter and poor oxygen levels.";
  else if (l.includes("phosphorite") || l.includes("phosphate"))
    lithDesc = "Phosphorite forms in shallow marine upwelling zones where nutrient-rich cold water rises to the surface. It is a major source of phosphate used in fertilizers.";
  else if (l.includes("diamictite") || l.includes("tillite"))
    lithDesc = "Diamictite is a poorly sorted mix of fine and coarse sediment deposited directly by glaciers. It records ancient ice ages and glacial advances across the landscape.";
  else if (l.includes("alluvium") || l.includes("gravel") || l.includes("sand") || l.includes("silt"))
    lithDesc = "Alluvial deposits of gravel, sand, and silt are the youngest materials in the column — sediment actively being moved and deposited by rivers, streams, and surface processes.";
  else
    lithDesc = `This formation consists of ${unit.lith}, recording conditions during the ${period.name}.`;

  // Add an environment sentence
  let envDesc = "";
  if (e.includes("marine") && !e.includes("non-marine"))
    envDesc = " These rocks were deposited on the floor of an ancient sea.";
  else if (e.includes("fluvial") || e.includes("river") || e.includes("alluvial"))
    envDesc = " These sediments were laid down by ancient rivers and streams.";
  else if (e.includes("lacustrine") || e.includes("lake"))
    envDesc = " This material settled at the bottom of an ancient lake.";
  else if (e.includes("eolian") || e.includes("aeolian") || e.includes("dune"))
    envDesc = " These grains were deposited by ancient winds in a desert environment.";
  else if (e.includes("glacial"))
    envDesc = " The sediment was transported and dropped by glaciers.";
  else if (e.includes("volcanic") || e.includes("pyroclastic"))
    envDesc = " This material erupted from ancient volcanoes.";
  else if (e.includes("deltaic"))
    envDesc = " It formed where ancient rivers met the sea, building a delta.";
  else if (e.includes("metamorphic") || e.includes("intrusive"))
    envDesc = " It formed deep underground under intense heat and pressure.";
  else if (e.includes("non-marine") || e.includes("terrestrial"))
    envDesc = " These rocks record a continental, non-marine setting.";

  return `${lithDesc}${envDesc} Deposited ${ageStr} to ${youngStr}.`;
}

// ── Wikipedia image fetcher ──
// Fetches a thumbnail + page URL from Wikipedia when a card is expanded.
// Cleans the query: strips parenthetical notes, trailing "Formation" adjustments, etc.
function WikiImage({ query, genusFallback = false }) {
  const [status, setStatus] = useState("idle"); // idle | loading | found | notfound
  const [imgUrl, setImgUrl] = useState(null);
  const [pageUrl, setPageUrl] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (!query || status !== "idle") return;
    setStatus("loading");

    // Clean query: strip parenthetical notes like "(saber-toothed cat)"
    const clean = query.replace(/\s*\([^)]*\)/g, "").trim();
    // Fallback: just the genus (first word), e.g. "Stegosaurus stenops" → "Stegosaurus"
    const genus = clean.split(" ")[0];

    // Action API with origin=* is the CORS-safe Wikipedia image endpoint
    const actionFetch = (name) =>
      fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(name)}&prop=pageimages|info&pithumbsize=400&inprop=url&format=json&origin=*`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (!data) return null;
          const page = Object.values(data.query?.pages || {})[0];
          if (!page || page.missing !== undefined) return null;
          return {
            img: page.thumbnail?.source || null,
            page: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(name)}`,
          };
        })
        .catch(() => null);

    // Try full name first; only fall back to genus for fossil taxa (not formations)
    actionFetch(clean)
      .then(result => {
        if (result?.img) return result;
        if (genusFallback && genus && genus !== clean) return actionFetch(genus);
        return null;
      })
      .then(result => {
        if (result?.img) {
          setImgUrl(result.img);
          setPageUrl(result.page);
          setStatus("found");
        } else {
          setStatus("notfound");
        }
      })
      .catch(() => setStatus("notfound"));
  }, [query, status]);

  if (status === "idle") return null;

  if (status === "loading") return (
    <div style={{ marginTop: 12, padding: "12px 14px", background: "#f5e8c8", border: "1px dashed rgba(154,106,52,0.4)", borderRadius: 0, display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 20, height: 20, border: "2px solid rgba(154,106,52,0.3)", borderTopColor: "#9a6a34", borderRadius: "50%", animation: "spin 1.4s linear infinite", flexShrink: 0 }} />
      <span style={{ fontFamily: "'Special Elite', monospace", fontSize: 9, color: "#9a7a50", letterSpacing: "0.1em" }}>consulting field records…</span>
    </div>
  );

  if (status === "notfound") return (
    <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(200,160,90,0.05)", border: "1px dashed rgba(154,106,52,0.2)", borderRadius: 0, fontFamily: "'Caveat', cursive", fontSize: 13, color: "#b0a090", textAlign: "center" }}>
      [no illustration on file]
    </div>
  );

  return (
    <div style={{ marginTop: 12, overflow: "hidden", border: "1px solid rgba(42,26,10,0.15)", background: "#e8ddd0", position: "relative" }}>
      {/* Corner fold effect */}
      <div style={{ position: "absolute", top: 0, right: 0, width: 0, height: 0, borderStyle: "solid", borderWidth: "0 14px 14px 0", borderColor: `transparent #dfc99a transparent transparent`, zIndex: 2 }} />
      {!imgLoaded && (
        <div style={{ height: 140, background: "#f0e6ce", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Special Elite', monospace", fontSize: 9, color: "#b0a090", letterSpacing: "0.1em" }}>
          ✎ developing plate…
        </div>
      )}
      <img
        src={imgUrl}
        alt={query}
        style={{ width: "100%", maxHeight: 200, objectFit: "cover", display: imgLoaded ? "block" : "none", filter: "sepia(15%) contrast(92%) saturate(85%)" }}
        onLoad={() => setImgLoaded(true)}
        onError={() => setStatus("notfound")}
      />
      {imgLoaded && (
        <div style={{ padding: "4px 10px 5px", fontSize: 9, color: "#9a7a50", fontFamily: "'Special Elite', monospace", textAlign: "right", letterSpacing: "0.06em", background: "#f0e6ce", borderTop: "1px dashed rgba(154,106,52,0.2)" }}>
          fig. — {pageUrl
            ? <a href={pageUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#9a6a34", textDecoration: "none" }}>Wikipedia</a>
            : "Wikipedia"}
        </div>
      )}
    </div>
  );
}

// Small handwritten marginal notes a field geologist might scrawl beside a unit
const MARGIN_NOTES = [
  "good exposure", "cf. above", "collect here", "see fig. 2", "unconformity?",
  "recheck age", "fossiliferous", "note colour", "cross-bedded", "friable",
  "well-cemented", "recessive", "resistant unit", "bioturbated", "pyrite nodules",
];
function getMarginNote(unit) {
  const hash = unit.strat_name.split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0);
  if (Math.abs(hash) % 3 !== 0) return null;
  return MARGIN_NOTES[Math.abs(hash) % MARGIN_NOTES.length];
}

function StratLayer({ unit, index, isSelected, onClick }) {
  const period = getPeriodForAge((unit.b_age + unit.t_age) / 2);
  const ageSpan = unit.b_age - unit.t_age;
  const thickness = Math.max(52, Math.min(140, ageSpan > 100 ? 140 : ageSpan > 10 ? 80 : 52));
  const icon = getEnvIcon(unit.environ);
  const description = getFormationDescription(unit, period);
  const whatItLookedLike = getWhatItLookedLike(unit, period);
  const marginNote = getMarginNote(unit);

  return (
    <div>
      <div style={S.stratLayer} onClick={onClick}>
        <div style={S.stratAge}>
          {unit.t_age < 1 ? `${Math.round(unit.t_age * 1000)}Ka` : `${Math.round(unit.t_age)}Ma`}
        </div>
        <div style={S.stratBar(period.color, thickness)}>
          <div style={{ ...S.stratBarTexture, backgroundImage: getRockTexture(unit.lith) }} />
          <span style={{ position: "relative", zIndex: 1 }}>{icon}</span>
        </div>
        <div style={S.stratInfo}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={S.stratName}>{unit.strat_name}</div>
            <span style={{ fontFamily: "'Special Elite', monospace", fontSize: 8, color: "rgba(154,106,52,0.55)", letterSpacing: "0.08em", flexShrink: 0, marginTop: 4, marginLeft: 6 }}>
              {isSelected ? "▲ close" : "▼ examine"}
            </span>
          </div>
          <div style={S.stratMeta}>{period.name} · {unit.lith}</div>
          {marginNote && (
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: 12, color: "rgba(100,55,15,0.45)", marginTop: 2, transform: "rotate(-1deg)", display: "inline-block" }}>
              ✎ {marginNote}
            </div>
          )}
        </div>
      </div>
      {isSelected && (
        <div style={S.stratDetail}>
          {/* Hero narrative — biggest and most readable, front and centre */}
          <p style={{ fontSize: 15, color: "#1a0e04", lineHeight: 1.82, fontFamily: "'Crimson Text', Georgia, serif", margin: "0 0 8px", fontWeight: 500 }}>
            {whatItLookedLike}
          </p>
          <p style={{ fontSize: 13, color: "#4a3a2a", lineHeight: 1.65, fontFamily: "'Crimson Text', Georgia, serif", margin: "0 0 12px", fontStyle: "italic" }}>
            {description}
          </p>
          {/* Technical field data — de-emphasised below the fold */}
          <div style={{ borderTop: "1px dashed rgba(154,106,52,0.28)", paddingTop: 10, opacity: 0.72 }}>
            <div style={S.detailRow}>
              <span style={S.detailLabel}>Period / Era</span>
              <span style={S.detailValue}>{period.name} · {period.era}</span>
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
            <div style={S.detailRow}>
              <span style={S.detailLabel}>Age</span>
              <span style={S.detailValue}>{formatAge(unit.b_age)} → {formatAge(unit.t_age)}</span>
            </div>
          </div>
          <WikiImage query={unit.strat_name} />
        </div>
      )}
    </div>
  );
}

function getFossilDescription(fossil, period) {
  const p = (fossil.phl || "").toLowerCase();
  const age = (fossil.max_ma + fossil.min_ma) / 2;
  const ageStr = formatAge(fossil.max_ma);
  const youngStr = formatAge(fossil.min_ma);

  // ── Vertebrates ──
  if (p.includes("mammalia")) {
    if (age < 0.05)  return `Mammalia — warm-blooded vertebrates with hair and mammary glands. This Ice Age mammal was preserved in tar, permafrost, or sediment. Lived from ${ageStr} to ${youngStr}.`;
    if (age < 2.58)  return `Mammalia — warm-blooded vertebrates with hair and mammary glands. This species roamed during the Pliocene-Pleistocene, when modern mammals were taking shape. Lived from ${ageStr} to ${youngStr}.`;
    if (age < 66)    return `Mammalia — warm-blooded vertebrates with hair and mammary glands. Early mammals were small, mostly nocturnal creatures that survived alongside the dinosaurs. Lived from ${ageStr} to ${youngStr}.`;
    return `Mammalia — warm-blooded vertebrates with hair and mammary glands. Mammals first appeared in the Triassic but only diversified explosively after the dinosaur extinction 66 million years ago. Lived from ${ageStr} to ${youngStr}.`;
  }
  if (p.includes("reptilia")) {
    if (fossil.max_ma > 66) return `Reptilia — cold-blooded, scaly vertebrates. During the Mesozoic, this group included dinosaurs, pterosaurs, and giant marine reptiles that ruled every major habitat on Earth. Lived from ${ageStr} to ${youngStr}.`;
    return `Reptilia — cold-blooded, scaly vertebrates including lizards, snakes, turtles, and crocodilians. Reptiles have been on Earth since the Carboniferous, over 300 million years ago. Lived from ${ageStr} to ${youngStr}.`;
  }
  if (p.includes("aves")) return `Aves — birds. Modern birds are living dinosaurs, descended directly from feathered theropod dinosaurs in the Jurassic. They survived the end-Cretaceous extinction and now number over 10,000 species. Lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("chondrichthyes")) return `Chondrichthyes — cartilaginous fish including sharks, rays, and skates. Unlike bony fish, their skeletons are made of cartilage. Sharks have patrolled Earth's oceans largely unchanged for over 450 million years. Swam from ${ageStr} to ${youngStr}.`;
  if (p.includes("actinopterygii")) return `Actinopterygii — ray-finned fish, the largest group of vertebrates on Earth. Their fins are supported by bony spines and rays. Today they make up over 30,000 species, more than half of all vertebrates. Swam from ${ageStr} to ${youngStr}.`;
  if (p.includes("osteichthyes")) return `Osteichthyes — bony fish, the group encompassing all fish with calcified skeletons. This ancient lineage gave rise to all land vertebrates. Swam from ${ageStr} to ${youngStr}.`;
  if (p.includes("sarcopterygii")) return `Sarcopterygii — lobe-finned fish. This group includes lungfish and coelacanths, and is critically important as the ancestors of all land vertebrates including amphibians, reptiles, birds, and mammals. Lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("amphibia")) return `Amphibia — frogs, salamanders, and caecilians. Amphibians were the first vertebrates to colonize land in the Devonian, but still depend on water to reproduce. Lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("placodermi")) return `Placodermi — armored fish. These extinct jawed fish were the dominant vertebrates of the Devonian seas, armored with bony plates covering the head and thorax. They went extinct at the end of the Devonian, 359 million years ago. Lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("agnatha") || p.includes("cyclostomata") || p.includes("petromyzontida")) return `Agnatha — jawless fish, among the most primitive vertebrates. This ancient group includes lampreys and hagfish today, but in the Paleozoic they were far more diverse. Lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("chordata")) return `Chordata — the broad phylum of all vertebrates and their close relatives, united by having a notochord at some stage of life. Includes fish, amphibians, reptiles, birds, and mammals. The exact class isn't recorded here. Lived from ${ageStr} to ${youngStr}.`;

  // ── Mollusca ──
  if (p.includes("cephalopoda")) return `Cephalopoda — the most intelligent invertebrates, including octopuses, squids, nautiluses, and the extinct ammonites. Ammonites were dominant marine predators for over 300 million years before vanishing at the end-Cretaceous. Swam from ${ageStr} to ${youngStr}.`;
  if (p.includes("gastropoda")) return `Gastropoda — snails and slugs, the largest class of mollusks. They have been diversifying since the Cambrian and today live in oceans, freshwater, and on land. This species lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("bivalvia")) return `Bivalvia — clams, oysters, mussels, and scallops. These two-shelled mollusks filter food from water and are found in nearly every aquatic environment. They have thrived since the Cambrian, over 500 million years ago. Lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("polyplacophora")) return `Polyplacophora — chitons. These slow-moving mollusks have eight overlapping shell plates and cling tightly to rocky surfaces. One of the oldest molluskan lineages, relatively unchanged for 500 million years. Lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("scaphopoda")) return `Scaphopoda — tusk shells. These burrowing mollusks have a tubular, slightly curved shell open at both ends. They live buried in seafloor sediment and have existed since the Ordovician. Lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("mollusca")) return `Mollusca — one of the most diverse animal phyla on Earth, including snails, clams, squid, and octopuses. Mollusks are united by a soft body, a muscular foot, and often a hard shell. Appeared in the Cambrian over 500 million years ago. Lived from ${ageStr} to ${youngStr}.`;

  // ── Arthropoda ──
  if (p.includes("trilobita")) return `Trilobita — armored arthropods that were among the most successful animals in Earth's history. With three body lobes and compound eyes, they dominated Paleozoic seas for 270 million years before the end-Permian extinction wiped them out. Crawled from ${ageStr} to ${youngStr}.`;
  if (p.includes("insecta")) return `Insecta — insects, the most species-rich class of animals on Earth with over a million described species. The first insects appeared in the Devonian, and flying insects emerged in the Carboniferous. Lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("arachnida")) return `Arachnida — spiders, scorpions, mites, and ticks. Arachnids were among the earliest animals to colonize land, with scorpions appearing over 430 million years ago. Lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("malacostraca") || p.includes("crustacea")) return `Crustacea — crabs, lobsters, shrimp, barnacles, and their relatives. Crustaceans have dominated marine ecosystems since the Cambrian and are the arthropod equivalent of insects in the sea. Lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("merostomata")) return `Merostomata — horseshoe crabs and the extinct eurypterids (sea scorpions). Horseshoe crabs are living fossils, virtually unchanged for 450 million years. Sea scorpions could grow over 2 meters long. Lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("ostracoda")) return `Ostracoda — seed shrimp. These tiny crustaceans are encased in a two-valved shell resembling a bivalve. They are among the most abundant microfossils in the geologic record and are used to date rock layers. Lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("arthropoda")) return `Arthropoda — the largest animal phylum on Earth, including insects, spiders, crabs, and the extinct trilobites. All arthropods have a segmented body, jointed limbs, and an exoskeleton. Lived from ${ageStr} to ${youngStr}.`;

  // ── Echinoderms ──
  if (p.includes("crinoidea")) return `Crinoidea — sea lilies and feather stars. Though they look like plants, crinoids are animals that anchor to the seafloor and filter food with feathery arms. They were so abundant in the Paleozoic that entire limestone formations are made of their remains. Bloomed from ${ageStr} to ${youngStr}.`;
  if (p.includes("echinoidea")) return `Echinoidea — sea urchins and sand dollars. These spiny echinoderms graze on algae and detritus on the seafloor. Their five-fold symmetry is a hallmark of the echinoderm group. Lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("asteroidea")) return `Asteroidea — sea stars (starfish). Voracious predators of the seafloor, sea stars can pry open bivalves and evert their stomachs to digest prey externally. They have existed since the Ordovician. Lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("ophiuroidea")) return `Ophiuroidea — brittle stars. The most species-rich class of echinoderms, brittle stars move quickly on their snake-like arms and are found from shallow reefs to the deep ocean. Lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("holothuroidea")) return `Holothuroidea — sea cucumbers. These soft-bodied echinoderms are important seafloor recyclers, processing sediment and organic matter. Some species eviscerate themselves when threatened. Lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("blastoidea")) return `Blastoidea — blastoids, or sea buds. These extinct echinoderms resembled crinoids and attached to the seafloor by a stalk. They were common in Carboniferous seas but went extinct at the end-Permian. Lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("echinodermata")) return `Echinodermata — the phylum of sea urchins, sea stars, crinoids, and sea cucumbers. All share five-fold body symmetry and a water-vascular system used for movement and feeding. An ancient marine lineage dating to the Cambrian. Lived from ${ageStr} to ${youngStr}.`;

  // ── Other invertebrates ──
  if (p.includes("brachiopoda")) return `Brachiopoda — lamp shells. Though they look like clams, brachiopods are a completely separate phylum with a different body plan. They were the dominant shelled animals of the Paleozoic but declined sharply after the end-Permian extinction. Lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("bryozoa")) return `Bryozoa — moss animals. These tiny colonial invertebrates build intricate calcium carbonate skeletons and filter food from the water. Despite their microscopic individual size, bryozoan colonies can form large reef-like structures. Lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("hemichordata")) return `Hemichordata — acorn worms and graptolites. Graptolites were colonial organisms that floated in Paleozoic seas and are crucial index fossils for dating Ordovician and Silurian rocks. They went extinct in the Carboniferous. Lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("anthozoa") || p.includes("coral")) return `Anthozoa — corals and sea anemones. Hard corals build calcium carbonate skeletons that accumulate into reefs — some of the most biodiverse ecosystems on Earth. Coral reefs have existed in various forms since the Ordovician. Built reefs from ${ageStr} to ${youngStr}.`;
  if (p.includes("cnidaria")) return `Cnidaria — jellyfish, corals, sea anemones, and hydroids. All cnidarians have stinging cells called nematocysts used for capturing prey. Jellyfish are among the oldest animals, with fossils dating back over 500 million years. Lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("porifera")) return `Porifera — sponges, the simplest multicellular animals. Sponges have no organs, no nervous system, and no muscles — they filter water through their porous bodies to extract food. They have existed largely unchanged since the Ediacaran, over 600 million years ago. Lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("archaeocyatha")) return `Archaeocyatha — an extinct phylum of early Cambrian reef-builders that resembled sponges. They were the first animals to build reefs, forming structures up to several meters tall, but went extinct by the mid-Cambrian. Lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("annelida")) return `Annelida — segmented worms, including earthworms, leeches, and polychaetes. Marine polychaetes are abundant in seafloor sediment and have a good fossil record going back to the Cambrian. Lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("graptolithina") || p.includes("graptolite")) return `Graptolithina — graptolites, extinct colonial organisms that drifted in Paleozoic oceans. Their fossils look like tiny hacksaw blades and are so useful for dating rocks that geologists call them index fossils. Lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("ostracoda")) return `Ostracoda — seed shrimp, tiny crustaceans encased in a two-valved shell. Despite their small size they are extremely important microfossils used to date and correlate rock layers worldwide. Lived from ${ageStr} to ${youngStr}.`;

  // ── Plants & microbes ──
  if (p.includes("plantae")) return `Plantae — the plant kingdom. Land plants first colonized Earth's surface in the Ordovician, fundamentally transforming the atmosphere, soil, and climate. Fossil plants preserve leaves, spores, wood, and pollen. Grew from ${ageStr} to ${youngStr}.`;
  if (p.includes("cyanobacteria")) return `Cyanobacteria — photosynthetic bacteria responsible for producing Earth's oxygen atmosphere starting around 2.4 billion years ago. Stromatolites — layered mounds built by cyanobacterial mats — are among the oldest fossils on Earth. Thrived from ${ageStr} to ${youngStr}.`;
  if (p.includes("bacteria") || p.includes("prokaryota")) return `Bacteria / Prokaryota — single-celled organisms without a nucleus, and the first life forms on Earth. Microbial fossils and chemical traces of bacteria extend back over 3.5 billion years. Thrived from ${ageStr} to ${youngStr}.`;
  if (p.includes("foraminifera")) return `Foraminifera — single-celled organisms that build intricate shells of calcite or agglutinated grains. Despite being microscopic, forams are hugely important in geology — their shells accumulate on the seafloor, forming thick limestone deposits and serving as precise index fossils. Lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("radiolaria")) return `Radiolaria — single-celled marine organisms with ornate silica skeletons. When they die their skeletons sink and form radiolarian chert on the seafloor. They have existed since the Cambrian and are used to date deep-sea rocks. Lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("algae") || p.includes("chlorophyta") || p.includes("rhodophyta")) return `Algae — photosynthetic organisms that form the base of most aquatic food chains. Calcareous algae contribute to reef formation and limestone deposits. They have been important primary producers since the Precambrian. Lived from ${ageStr} to ${youngStr}.`;
  if (p.includes("fungi")) return `Fungi — decomposers and recyclers that break down dead organic matter. Fossil fungi are rare but have been found dating back to the Precambrian. Fungi played a key role in helping the first land plants colonize bare rock. Lived from ${ageStr} to ${youngStr}.`;

  // ── Catch-all ──
  return `A fossil organism classified under ${fossil.phl || "an unidentified group"}, from the ${period.name} (${period.era}). Preserved in the rock record near this location. Lived from ${ageStr} to ${youngStr}.`;
}

function FossilCard({ fossil }) {
  const [expanded, setExpanded] = useState(false);
  const period = getPeriodForAge((fossil.max_ma + fossil.min_ma) / 2);
  const description = getFossilDescription(fossil, period);
  // Specimen number hashed from species name — unique per taxon
  const nameHash = fossil.tna.split("").reduce((h, c) => (Math.imul(31, h) + c.charCodeAt(0)) | 0, 0);
  const specNum = String((Math.abs(nameHash) % 9000) + 1000);

  return (
    <div style={{ ...S.fossilCard, cursor: "pointer", position: "relative" }} onClick={() => setExpanded(e => !e)}>
      {/* Specimen stamp — top right corner, like a library catalog number */}
      <div style={{ position: "absolute", top: 8, right: 10, fontFamily: "'Special Elite', monospace", fontSize: 8, color: "rgba(120,60,20,0.55)", letterSpacing: "0.05em", lineHeight: 1.4, textAlign: "right" }}>
        SPEC.{"\u00A0"}NO.<br />
        <span style={{ fontSize: 11, fontFamily: "'Caveat', cursive", color: "rgba(100,45,15,0.65)", fontWeight: 600 }}>#{specNum}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingRight: 48 }}>
        <div style={S.fossilSpecies}>
          <span>{getPhylumEmoji(fossil.phl)}</span>
          {fossil.tna}
        </div>
        <span style={{ fontSize: 10, color: "#b0a090", fontFamily: "monospace", marginLeft: 8, flexShrink: 0, marginTop: 4, display: "none" }}>{expanded ? "▲" : "▼"}</span>
      </div>
      <div style={{ ...S.fossilMeta, justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
          <span><span style={S.fossilDot(period.color)} /> {period.name}</span>
          <span>{period.era}</span>
          {fossil.phl && <span>{fossil.phl}</span>}
        </div>
        <span style={{ fontFamily: "'Special Elite', monospace", fontSize: 8, color: "rgba(154,106,52,0.55)", letterSpacing: "0.08em", flexShrink: 0 }}>
          {expanded ? "▲ close" : "▼ examine"}
        </span>
      </div>
      {expanded && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(200,149,108,0.2)" }}>
          <p style={{ fontSize: 13, color: "#4a3a2a", lineHeight: 1.65, fontFamily: "'Crimson Text', Georgia, serif", margin: 0 }}>
            {description}
          </p>
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
            <span style={S.detailLabel}>Period</span>
            <span style={{ fontSize: 12, color: "#2a1a0a" }}>{period.name} · {period.era}</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
            <span style={S.detailLabel}>Age</span>
            <span style={{ fontSize: 12, color: "#2a1a0a" }}>{formatAge(fossil.max_ma)} → {formatAge(fossil.min_ma)}</span>
          </div>
          <WikiImage query={fossil.tna} genusFallback={true} />
        </div>
      )}
    </div>
  );
}

function TimelineView({ units, fossils, searchQuery = "" }) {
  const tq = searchQuery.toLowerCase();
  const visiblePeriods = tq
    ? GEOLOGICAL_PERIODS.filter(p =>
        p.name.toLowerCase().includes(tq) ||
        p.era.toLowerCase().includes(tq) ||
        p.desc.toLowerCase().includes(tq)
      )
    : GEOLOGICAL_PERIODS;

  return (
    <div style={S.timelineContainer}>
      <div style={S.fossilHeader}>Geological time at this location</div>
      {visiblePeriods.length === 0 && (
        <div style={S.fossilEmpty}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>No periods match "{searchQuery}"</div>
        </div>
      )}
      {visiblePeriods.map((period) => {
        const hasUnits = units.some(u => u.b_age >= period.end && u.t_age <= period.start);
        const pf = fossils.filter(f => f.max_ma >= period.end && f.min_ma <= period.start);
        const present = hasUnits || pf.length > 0;
        return (
          <div key={period.name} style={S.timelinePeriod}>
            <div style={S.timelineBar(period.color)} />
            <div style={S.timelineContent(present)}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
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
                    {hasUnits && <span title="Rock strata recorded">🪨</span>}
                    {pf.length > 0 && <span title={`${pf.length} fossil taxa`}>🦴{pf.length}</span>}
                    {present && (
                      <span style={{ fontFamily: "'Caveat', cursive", fontSize: 13, color: "rgba(154,106,52,0.65)", fontWeight: 700, transform: "rotate(3deg)", display: "inline-block" }}>✓</span>
                    )}
                    {!present && <span style={S.timelineGap}>gap</span>}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: present ? "#6a5a4a" : "#b0a090", lineHeight: 1.55, marginTop: 6, fontFamily: "'Crimson Text', Georgia, serif", fontStyle: "italic" }}>
                  {period.desc}
                </div>
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
  const [showIntro, setShowIntro] = useState(false);
  const [strataSearch, setStrataSearch] = useState("");
  const [fossilSearch, setFossilSearch] = useState("");
  const [timelineSearch, setTimelineSearch] = useState("");
  const [showTutorial, setShowTutorial] = useState(true);
  const [strataEraFilter, setStrataEraFilter] = useState(null); // null = show all
  const [fossilEraFilter, setFossilEraFilter] = useState(null);

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
    setShowIntro(true);
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
    setShowIntro(false);
    setStrataSearch("");
    setFossilSearch("");
    setTimelineSearch("");
    setStrataEraFilter(null);
    setFossilEraFilter(null);
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

  // ── Narrative summary ──
  function buildNarrative() {
    if (units.length === 0 && fossils.length === 0) return null;
    const oldest = oldestAge;
    const oldestPeriod = getPeriodForAge(oldest);
    const youngest = units.length > 0 ? Math.min(...units.map(u => u.t_age)) : 0;
    const spanMa = oldest - youngest;
    const spanStr = oldest > 1000 ? `${(oldest / 1000).toFixed(1)} billion years` : `${Math.round(oldest)} million years`;
    const periodCount = new Set(units.map(u => getPeriodForAge((u.b_age + u.t_age) / 2).name)).size;

    // Opening — how far back does the record go?
    let opening = "";
    if (oldest > 1000) opening = `The rock beneath ${locationName} stretches back ${spanStr} — nearly to the formation of the Earth itself.`;
    else if (oldest > 500) opening = `The rock beneath ${locationName} spans ${spanStr}, reaching deep into the Paleozoic era when complex animal life was just getting started.`;
    else if (oldest > 250) opening = `The rock beneath ${locationName} records ${spanStr} of Earth history, from the age of dinosaurs to the present.`;
    else if (oldest > 66) opening = `The rock beneath ${locationName} carries a ${spanStr} record, from the Mesozoic era through today.`;
    else opening = `The rock beneath ${locationName} preserves ${spanStr} of relatively recent Earth history.`;

    // Middle — what was it like?
    const environments = [...new Set(units.map(u => u.environ).filter(Boolean))];
    let middle = "";
    const hasMarine = environments.some(e => e.toLowerCase().includes("marine") && !e.toLowerCase().includes("non-marine"));
    const hasFluvial = environments.some(e => e.toLowerCase().includes("fluvial") || e.toLowerCase().includes("alluvial"));
    const hasEolian = environments.some(e => e.toLowerCase().includes("eolian") || e.toLowerCase().includes("aeolian"));
    const hasGlacial = environments.some(e => e.toLowerCase().includes("glacial"));
    const hasVolcanic = environments.some(e => e.toLowerCase().includes("volcanic"));

    const envParts = [];
    if (hasMarine) envParts.push("ancient seas");
    if (hasFluvial) envParts.push("river systems");
    if (hasEolian) envParts.push("wind-blown desert dunes");
    if (hasGlacial) envParts.push("glaciers");
    if (hasVolcanic) envParts.push("volcanic activity");

    if (envParts.length >= 2) middle = ` Over that time, this spot has been shaped by ${envParts.slice(0, -1).join(", ")} and ${envParts[envParts.length - 1]}.`;
    else if (envParts.length === 1) middle = ` Over that time, this spot was dominated by ${envParts[0]}.`;

    // Closing — fossils?
    let closing = "";
    if (fossils.length > 0) {
      const mammal = fossils.find(f => (f.phl || "").toLowerCase().includes("mammalia"));
      const dino = fossils.find(f => (f.phl || "").toLowerCase().includes("reptilia") && f.max_ma > 66);
      const fish = fossils.find(f => (f.phl || "").toLowerCase().includes("actinopterygii") || (f.phl || "").toLowerCase().includes("chondrichthyes"));
      const trilobite = fossils.find(f => (f.phl || "").toLowerCase().includes("trilobita"));
      if (dino) closing = ` Fossils here include dinosaur-era reptiles — creatures that walked this ground over 66 million years ago.`;
      else if (mammal) closing = ` The fossil record nearby includes ancient mammals, connecting this place to the age of megafauna.`;
      else if (trilobite) closing = ` Trilobites found nearby are remnants of Paleozoic seas that once covered this land.`;
      else if (fish) closing = ` Ancient fish fossils nearby hint at the marine or freshwater worlds that once existed here.`;
      else closing = ` Fossils found within ~100km offer a glimpse into the creatures that once lived here.`;
    }

    return opening + middle + closing;
  }
  const narrative = buildNarrative();

  // Auto-hide the animated intro after 3s
  useEffect(() => {
    if (!showIntro) return;
    const t = setTimeout(() => setShowIntro(false), 3000);
    return () => clearTimeout(t);
  }, [showIntro]);

  const tabs = [
    { id: "strata", label: "Strata", icon: "🪨", count: units.length },
    { id: "fossils", label: "Fossils", icon: "🦴", count: fossils.length },
    { id: "timeline", label: "Timeline", icon: "⏳" },
  ];

  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Special+Elite&family=Caveat:wght@400;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes introAnim {
          0%   { opacity: 0; transform: translateY(14px) scale(0.98); }
          14%  { opacity: 1; transform: translateY(0) scale(1); }
          75%  { opacity: 1; }
          100% { opacity: 0; transform: scale(0.97); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { -webkit-font-smoothing: antialiased; }
        ::selection { background: rgba(200,149,108,0.3); }
        input::placeholder { color: rgba(90,70,40,0.45); font-style: italic; }
      `}</style>

      {/* Header */}
      <div style={S.header}>
        {/* Double-rule decoration */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(200,149,108,0.4)" }} />
          <div style={S.brand}>◆ Deep Time Field Guide ◆</div>
          <div style={{ flex: 1, height: 1, background: "rgba(200,149,108,0.4)" }} />
        </div>
        <h1 style={S.title}>What's Beneath Your Feet?</h1>
        {screen === "results" ? (
          <div>
            <button style={S.locationBtn} onClick={handleBack}>
              {"📍"} {locationName} · {units.length} formations · ← return to field notes
            </button>
            <div style={{...S.dataBadge, ...(isLive ? S.liveBadge : S.demoBadge)}}>
              {isLive ? "🟢 Live data" : "🟠 Sample data"}
            </div>
          </div>
        ) : (
          <div style={S.tagline}>Select a survey site to read the stratigraphic record.</div>
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

          {/* ── Tutorial card — dismissible ── */}
          {showTutorial && (
            <div style={{ margin: "0 0 22px", background: "#1a2916", borderRadius: 3, padding: "18px 18px 14px", position: "relative", boxShadow: "0 3px 14px rgba(0,0,0,0.28)", border: "1px solid rgba(200,149,108,0.22)" }}>
              <div style={{ fontFamily: "'Special Elite', monospace", fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase", color: "#c8956c", marginBottom: 14, textAlign: "center" }}>◆ How to use this guide ◆</div>
              {/* 3-step mini diagram */}
              <div style={{ display: "flex", gap: 0, alignItems: "flex-start", marginBottom: 14 }}>
                {[
                  { icon: "📡", label: "Fix Position", sub: "Use GPS or search for any place on Earth" },
                  { icon: "🪨", label: "Read Strata", sub: "See every rock layer beneath that spot, oldest to youngest" },
                  { icon: "🦴", label: "Find Fossils", sub: "Browse fossil taxa found within 100km of your site" },
                ].map((step, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center", padding: "0 6px", position: "relative" }}>
                    {i > 0 && (
                      <div style={{ position: "absolute", left: 0, top: 18, width: 12, height: 1, background: "rgba(200,149,108,0.35)" }} />
                    )}
                    <div style={{ fontSize: 26, marginBottom: 6 }}>{step.icon}</div>
                    <div style={{ fontFamily: "'Special Elite', monospace", fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c8956c", marginBottom: 4 }}>{step.label}</div>
                    <div style={{ fontFamily: "'Crimson Text', Georgia, serif", fontSize: 11, color: "rgba(230,210,170,0.7)", lineHeight: 1.5 }}>{step.sub}</div>
                  </div>
                ))}
              </div>
              {/* Mini strata diagram */}
              <div style={{ margin: "0 0 12px", borderRadius: 2, overflow: "hidden", border: "1px solid rgba(200,149,108,0.15)" }}>
                {[
                  { color: "#F9F97F", label: "Quaternary", desc: "Ice Ages · mammals" },
                  { color: "#7FC64E", label: "Cretaceous", desc: "Dinosaur era" },
                  { color: "#34B2C9", label: "Jurassic", desc: "Great forests" },
                  { color: "#F04028", label: "Permian", desc: "Pangaea · mass extinction" },
                  { color: "#009270", label: "Ordovician", desc: "Ancient seas" },
                ].map((layer, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px", background: "rgba(0,0,0,0.25)", borderBottom: i < 4 ? "1px solid rgba(200,149,108,0.08)" : "none" }}>
                    <div style={{ width: 8, height: 16, background: layer.color, flexShrink: 0, opacity: 0.85 }} />
                    <span style={{ fontFamily: "'Special Elite', monospace", fontSize: 8, color: "#c8956c", letterSpacing: "0.08em", width: 70, flexShrink: 0 }}>{layer.label}</span>
                    <span style={{ fontFamily: "'Crimson Text', Georgia, serif", fontSize: 10, color: "rgba(230,210,170,0.55)", fontStyle: "italic" }}>{layer.desc}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowTutorial(false)}
                style={{ width: "100%", padding: "8px", background: "rgba(200,149,108,0.15)", border: "1px solid rgba(200,149,108,0.3)", borderRadius: 2, fontFamily: "'Special Elite', monospace", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c8956c", cursor: "pointer" }}
              >
                Get Started →
              </button>
            </div>
          )}

          {/* ── GPS — hero CTA ── */}
          <div style={{ marginBottom: 20 }}>
            <button
              style={{ ...S.gpsBtn, ...(gpsLoading ? S.gpsBtnDisabled : {}), fontSize: 20, padding: "18px 14px", flexDirection: "column", gap: 4 }}
              onClick={handleGPS}
              disabled={gpsLoading}
            >
              <span>{gpsLoading ? "📡 Acquiring fix…" : "📡 Fix My Position"}</span>
              {!gpsLoading && <span style={{ fontFamily: "'Crimson Text', Georgia, serif", fontSize: 12, color: "rgba(240,220,170,0.6)", fontWeight: 400, fontStyle: "italic", letterSpacing: 0 }}>Use your current location — the most accurate survey possible</span>}
            </button>
          </div>

          {/* ── Search + Coordinates — consolidated location input area ── */}
          <div style={{ marginBottom: 20 }}>
            {/* Place search */}
            <div style={{ position: "relative", marginBottom: 8 }}>
              <input
                style={{ width: "100%", padding: "10px 12px", border: "1px solid rgba(154,106,52,0.3)", borderBottom: "2px solid rgba(154,106,52,0.5)", borderRadius: 0, fontFamily: "'Crimson Text', Georgia, serif", fontSize: 16, background: "#f5e8c8", color: "#2a1a0a", outline: "none", boxSizing: "border-box" }}
                type="text"
                placeholder="🔍 Search for a place..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />

              {/* Single dropdown — content changes based on state */}
              {searchQuery.length >= 3 && (searchStatus !== null || searchResults.length > 0) && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#f5e8c8", border: "1px solid rgba(154,106,52,0.3)", borderTop: "2px solid #9a6a34", borderRadius: "0 0 3px 3px", zIndex: 10, marginTop: 0, overflow: "hidden", boxShadow: "0 4px 12px rgba(42,26,10,0.18)" }}>

                  {searchStatus === "searching" && (
                    <div style={{ padding: "10px 14px", fontSize: 13, color: "#9a7a50", fontStyle: "italic", fontFamily: "'Crimson Text', Georgia, serif" }}>
                      Consulting the index…
                    </div>
                  )}

                  {searchStatus === "no_results" && (
                    <div style={{ padding: "10px 14px", fontSize: 13, color: "#8a7a6a", fontFamily: "'Crimson Text', Georgia, serif", fontStyle: "italic" }}>
                      No places found. Try a different name, or enter coordinates below.
                    </div>
                  )}

                  {searchStatus === null && searchResults.map((r, i) => (
                    <div
                      key={i}
                      style={{ padding: "10px 14px", cursor: "pointer", fontSize: 14, borderBottom: i < searchResults.length - 1 ? "1px dashed rgba(154,106,52,0.2)" : "none", fontFamily: "'Crimson Text', Georgia, serif" }}
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

            {/* Manual coordinates — directly under search, no big divider */}
            <div style={{ display: "flex", gap: 6 }}>
              <input
                style={{ flex: 1, padding: "7px 10px", border: "1px solid rgba(154,106,52,0.25)", borderBottom: "2px solid rgba(154,106,52,0.4)", borderRadius: 0, fontFamily: "'Special Elite', 'Courier New', monospace", fontSize: 11, background: "#f5e8c8", color: "#2a1a0a", outline: "none" }}
                type="text"
                placeholder="Lat  e.g. 36.05"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
              />
              <input
                style={{ flex: 1, padding: "7px 10px", border: "1px solid rgba(154,106,52,0.25)", borderBottom: "2px solid rgba(154,106,52,0.4)", borderRadius: 0, fontFamily: "'Special Elite', 'Courier New', monospace", fontSize: 11, background: "#f5e8c8", color: "#2a1a0a", outline: "none" }}
                type="text"
                placeholder="Lng  e.g. -112.14"
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
              />
              <button
                style={{ padding: "7px 14px", background: "#1a2916", color: "#f0d8b0", border: "2px solid rgba(200,149,108,0.3)", borderRadius: 2, fontFamily: "'Special Elite', monospace", fontSize: 10, letterSpacing: "0.08em", cursor: "pointer" }}
                onClick={handleManualGo}
              >
                GO →
              </button>
            </div>
          </div>

          {/* ── Compact educational timeline ── */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: "'Special Elite', monospace", fontSize: 8, letterSpacing: "0.25em", textTransform: "uppercase", color: "#a09080", textAlign: "center", marginBottom: 8 }}>◆ Geological Time Scale ◆</div>
            <div style={{ borderRadius: 2, overflow: "hidden", border: "1px solid rgba(42,26,10,0.15)", boxShadow: "0 1px 4px rgba(42,26,10,0.1)" }}>
              {GEOLOGICAL_PERIODS.map((period, i) => (
                <div key={period.name} style={{ display: "flex", alignItems: "center", gap: 0, borderBottom: i < GEOLOGICAL_PERIODS.length - 1 ? "1px solid rgba(42,26,10,0.07)" : "none" }}>
                  <div style={{ width: 10, flexShrink: 0, background: period.color, alignSelf: "stretch", opacity: 0.85 }} />
                  <div style={{ flex: 1, padding: "5px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(253,244,224,0.55)" }}>
                    <div>
                      <span style={{ fontFamily: "'Crimson Text', Georgia, serif", fontSize: 13, fontWeight: 600, color: "#1a0e04" }}>{period.name}</span>
                      <span style={{ fontFamily: "'Special Elite', monospace", fontSize: 8, color: "#9a7a60", marginLeft: 8, letterSpacing: "0.06em" }}>{period.era}</span>
                    </div>
                    <span style={{ fontFamily: "'Special Elite', monospace", fontSize: 8, color: "#b0a080", letterSpacing: "0.04em", flexShrink: 0 }}>
                      {period.start > 1000 ? `${(period.start/1000).toFixed(1)}Ga` : `${period.start}Ma`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontFamily: "'Crimson Text', Georgia, serif", fontSize: 11, color: "#a09080", textAlign: "center", marginTop: 6, fontStyle: "italic" }}>4.6 billion years · tap a preset site to explore the record beneath it</div>
          </div>

          <div style={S.divider}>── known field sites ──</div>

          <div style={S.presetGrid}>
            {PRESETS.map((p, i) => {
              // Each card gets a slightly different tilt and tape position for a natural look
              const rotations = [-2.2, 1.8, -1.2, 2.4, -1.6, 1.0];
              const tapeOffsets = ["40%", "55%", "45%", "50%", "42%", "52%"];
              const tapeRotations = [-2, 3, -1, 2, -3, 1];
              const rot = rotations[i % rotations.length];
              const tapeLeft = tapeOffsets[i % tapeOffsets.length];
              const tapeRot = tapeRotations[i % tapeRotations.length];
              return (
                <div
                  key={p.name}
                  style={{ ...S.presetCard, transform: `rotate(${rot}deg)` }}
                  onClick={() => loadLocation(p.name, p.lat, p.lng)}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = `rotate(${rot * 0.25}deg) translateY(-3px)`;
                    e.currentTarget.style.boxShadow = "4px 10px 24px rgba(42,26,10,0.3), 0 2px 6px rgba(42,26,10,0.15)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = `rotate(${rot}deg)`;
                    e.currentTarget.style.boxShadow = "2px 4px 14px rgba(42,26,10,0.22), 0 1px 3px rgba(42,26,10,0.1)";
                  }}
                >
                  {/* Scotch tape strip */}
                  <div style={{
                    position: "absolute",
                    top: -10,
                    left: tapeLeft,
                    transform: `translateX(-50%) rotate(${tapeRot}deg)`,
                    width: 52,
                    height: 22,
                    background: "rgba(215,200,140,0.52)",
                    backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.18) 2px, rgba(255,255,255,0.18) 3px)",
                    borderRadius: 2,
                    boxShadow: "0 1px 3px rgba(42,26,10,0.14)",
                    zIndex: 2,
                  }} />
                  <div style={S.presetIcon}>{p.icon}</div>
                  <div style={S.presetName}>{p.name}</div>
                  <div style={S.presetDesc}>{p.desc}</div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {screen === "loading" && (
        <div style={S.loading}>
          <div style={{ position: "relative", width: 80, height: 80, marginBottom: 4 }}>
            {/* Spinning compass rose */}
            <div style={{ ...S.spinner, position: "absolute", inset: 0, width: "100%", height: "100%", boxSizing: "border-box" }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🧭</div>
          </div>
          <div style={S.loadingText}>
            Drilling through time…<br />
            <span style={{ fontFamily: "'Caveat', cursive", fontSize: 20, fontStyle: "normal", color: "#9a6a34" }}>{locationName}</span>
          </div>
          <div style={S.loadingSub}>◆ Querying Macrostrat · PBDB ◆</div>
          <div style={{ marginTop: 20, padding: "10px 16px", background: "#f5e8c8", border: "1px solid rgba(42,26,10,0.18)", borderLeft: "3px solid #9a6a34", borderRadius: "0 3px 3px 0", fontFamily: "'Special Elite', monospace", fontSize: 9, color: "#9a7a50", letterSpacing: "0.12em", maxWidth: 220, textAlign: "left", backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(80,50,15,0.07) 19px, rgba(80,50,15,0.07) 20px)" }}>
            FIELD NOTE: Each rock layer<br />took thousands — sometimes<br />millions — of years to form.
          </div>
        </div>
      )}

      {/* Results */}
      {screen === "results" && (
        <>
          {/* Animated intro card — fades in then out over 3s */}
          {showIntro && (
            <div style={{ padding: "16px 16px 0", animation: "introAnim 3s ease forwards", pointerEvents: "none" }}>
              <div style={{
                background: "linear-gradient(135deg, #2a1a0a 0%, #3d2510 60%, #1a2a1a 100%)",
                borderRadius: 16,
                padding: "22px 20px",
                textAlign: "center",
                color: "white",
                boxShadow: "0 4px 24px rgba(42,26,10,0.25)",
              }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🌍</div>
                <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.22em", color: "#c8956c", textTransform: "uppercase", marginBottom: 8 }}>◆ Descending through deep time ◆</div>
                <div style={{ fontFamily: "'Crimson Text', Georgia, serif", fontSize: 19, fontWeight: 700, color: "white", marginBottom: 6, lineHeight: 1.3 }}>
                  {locationName}
                </div>
                <div style={{ fontFamily: "'Crimson Text', Georgia, serif", fontSize: 14, color: "#d4b896", fontStyle: "italic", lineHeight: 1.55 }}>
                  {oldestAge > 1000
                    ? `${(oldestAge / 1000).toFixed(1)} billion years of history beneath your feet`
                    : oldestAge > 0
                      ? `${Math.round(oldestAge)} million years of history beneath your feet`
                      : "Exploring the geological record..."}
                </div>
                {(units.length > 0 || fossils.length > 0) && (
                  <div style={{ marginTop: 12, fontFamily: "monospace", fontSize: 10, color: "#c8956c", letterSpacing: "0.06em" }}>
                    {units.length > 0 && `${units.length} rock formations`}
                    {units.length > 0 && fossils.length > 0 && " · "}
                    {fossils.length > 0 && `${fossils.length} fossil taxa`}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Narrative summary card — field journal style */}
          {narrative && (
            <div style={{ margin: "0 16px 0", padding: "16px 18px", background: "#f5e8c8", border: "1px solid rgba(42,26,10,0.18)", borderLeft: "5px solid #9a6a34", borderRadius: "0 3px 3px 0", backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(80,50,15,0.09) 23px, rgba(80,50,15,0.09) 24px), radial-gradient(ellipse 60px 40px at 90% 20%, rgba(120,80,20,0.06) 0%, transparent 100%)" }}>
              <div style={{ fontFamily: "'Special Elite', monospace", fontSize: 8, color: "#9a6a34", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span>◆ Field Observation</span>
                <div style={{ flex: 1, height: 1, background: "rgba(120,80,30,0.22)" }} />
                <span style={{ fontFamily: "'Caveat', cursive", fontSize: 14, color: "rgba(100,50,15,0.5)", letterSpacing: 0, textTransform: "none", transform: "rotate(-2deg)", display: "inline-block" }}>see notes →</span>
              </div>
              <p style={{ fontFamily: "'Crimson Text', Georgia, serif", fontSize: 15, color: "#1a0e04", lineHeight: 1.85, margin: 0 }}>{narrative}</p>
              <div style={{ marginTop: 12, paddingTop: 8, borderTop: "1px dashed rgba(42,26,10,0.15)", fontFamily: "'Special Elite', monospace", fontSize: 9, color: "#9a8a70", display: "flex", gap: 12, flexWrap: "wrap" }}>
                {units.length > 0 && <span>🪨 {units.length} formations · </span>}
                {fossils.length > 0 && <span>🦴 {fossils.length} fossil taxa · </span>}
                <span>⏳ {oldestAge > 1000 ? `${(oldestAge/1000).toFixed(1)}Ga` : `${Math.round(oldestAge)}Ma`} record</span>
              </div>
            </div>
          )}

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
              {units.length > 0 && (
                <div style={S.tabSearch}>
                  <span style={{ fontSize: 14, color: "#b0a090" }}>🔍</span>
                  <input
                    style={S.tabSearchInput}
                    placeholder="Search formations, rock types, environments…"
                    value={strataSearch}
                    onChange={e => setStrataSearch(e.target.value)}
                  />
                  {strataSearch && (
                    <button style={S.tabSearchClear} onClick={() => setStrataSearch("")}>✕</button>
                  )}
                </div>
              )}
              {/* Era filter pills */}
              {units.length > 0 && (
                <div style={{ display: 'flex', gap: 6, padding: '8px 16px 4px', flexWrap: 'wrap' }}>
                  {[null, 'Cenozoic', 'Mesozoic', 'Paleozoic', 'Precambrian'].map(era => {
                    const active = strataEraFilter === era;
                    const eraColors = { Cenozoic: '#FFE619', Mesozoic: '#34B2C9', Paleozoic: '#F04028', Precambrian: '#F73667' };
                    return (
                      <button key={era ?? 'all'} onClick={() => setStrataEraFilter(era)}
                        style={{ padding: '3px 10px', fontFamily: "'Special Elite', monospace", fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2, border: active ? `1.5px solid ${eraColors[era] || '#9a6a34'}` : '1px solid rgba(154,106,52,0.3)', background: active ? (eraColors[era] ? `${eraColors[era]}28` : 'rgba(154,106,52,0.12)') : 'transparent', color: active ? '#1a0e04' : '#8a7a6a' }}>
                        {era ?? 'All'}
                      </button>
                    );
                  })}
                </div>
              )}
              <div style={S.strataHeader}>{"⬇\uFE0F"} Surface ↓ Depth · tap any layer</div>
              {(() => {
                const sq = strataSearch.toLowerCase();
                const filteredUnits = (strataEraFilter
                  ? units.filter(u => getPeriodForAge((u.b_age + u.t_age) / 2).era === strataEraFilter)
                  : units
                ).filter(u => !sq || (
                  (u.strat_name || "").toLowerCase().includes(sq) ||
                  (u.lith || "").toLowerCase().includes(sq) ||
                  (u.environ || "").toLowerCase().includes(sq)
                ));
                const ERA_STYLES = {
                  "Cenozoic":   { bg: "rgba(255,230,25,0.10)",  border: "#FFE619", emoji: "🦣", label: "Cenozoic" },
                  "Mesozoic":   { bg: "rgba(52,178,201,0.10)",  border: "#34B2C9", emoji: "🦕", label: "Mesozoic" },
                  "Paleozoic":  { bg: "rgba(240,64,40,0.10)",   border: "#F04028", emoji: "🦂", label: "Paleozoic" },
                  "Precambrian":{ bg: "rgba(247,54,103,0.10)",  border: "#F73667", emoji: "🦠", label: "Precambrian" },
                };
                if (filteredUnits.length === 0 && strataSearch) {
                  return (
                    <div style={S.fossilEmpty}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>No formations match "{strataSearch}"</div>
                      <div style={{ fontSize: 12, marginTop: 6, color: "#8a7a6a" }}>Try searching by rock type (e.g. "limestone") or environment (e.g. "marine")</div>
                    </div>
                  );
                }
                const items = [];
                let prevEra = null;
                filteredUnits.forEach((unit, i) => {
                  const period = getPeriodForAge((unit.b_age + unit.t_age) / 2);
                  if (period.era !== prevEra) {
                    prevEra = period.era;
                    const es = ERA_STYLES[period.era] || { bg: "rgba(200,149,108,0.08)", border: "#c8956c", emoji: "🪨", label: period.era };
                    items.push(
                      <div key={`era-${period.era}-${i}`} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 20px 7px",
                        background: es.bg,
                        borderTop: `2px solid ${es.border}`,
                        borderBottom: `1px dashed rgba(0,0,0,0.08)`,
                        position: "relative",
                      }}>
                        <span style={{ fontSize: 15 }}>{es.emoji}</span>
                        <span style={{ fontFamily: "'Special Elite', 'Courier New', monospace", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#4a3a2a" }}>{es.label} Era</span>
                        {/* Handwritten stamp-like mark */}
                        <span style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: `${es.border}99`, transform: "rotate(-4deg)", display: "inline-block", marginLeft: "auto", fontWeight: 700, letterSpacing: "0.05em" }}>
                          {period.era === "Cenozoic" ? "Cz" : period.era === "Mesozoic" ? "Mz" : period.era === "Paleozoic" ? "Pz" : "pC"}
                        </span>
                      </div>
                    );
                  }
                  items.push(
                    <StratLayer
                      key={i}
                      unit={unit}
                      index={i}
                      isSelected={selectedLayer === i}
                      onClick={() => setSelectedLayer(selectedLayer === i ? null : i)}
                    />
                  );
                });
                return items;
              })()}
              {units.length > 0 && !strataSearch && (
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
              {fossils.length > 0 && (
                <div style={S.tabSearch}>
                  <span style={{ fontSize: 14, color: "#b0a090" }}>🔍</span>
                  <input
                    style={S.tabSearchInput}
                    placeholder="Search species names, phyla…"
                    value={fossilSearch}
                    onChange={e => setFossilSearch(e.target.value)}
                  />
                  {fossilSearch && (
                    <button style={S.tabSearchClear} onClick={() => setFossilSearch("")}>✕</button>
                  )}
                </div>
              )}
              {/* Era filter pills for fossils */}
              {fossils.length > 0 && (
                <div style={{ display: 'flex', gap: 6, padding: '4px 16px 4px', flexWrap: 'wrap' }}>
                  {[null, 'Cenozoic', 'Mesozoic', 'Paleozoic', 'Precambrian'].map(era => {
                    const active = fossilEraFilter === era;
                    const eraColors = { Cenozoic: '#FFE619', Mesozoic: '#34B2C9', Paleozoic: '#F04028', Precambrian: '#F73667' };
                    return (
                      <button key={era ?? 'all'} onClick={() => setFossilEraFilter(era)}
                        style={{ padding: '3px 10px', fontFamily: "'Special Elite', monospace", fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2, border: active ? `1.5px solid ${eraColors[era] || '#9a6a34'}` : '1px solid rgba(154,106,52,0.3)', background: active ? (eraColors[era] ? `${eraColors[era]}28` : 'rgba(154,106,52,0.12)') : 'transparent', color: active ? '#1a0e04' : '#8a7a6a' }}>
                        {era ?? 'All'}
                      </button>
                    );
                  })}
                </div>
              )}
              <div style={S.fossilHeader}>Fossil taxa found within ~100km</div>
              {fossils.length > 0 ? (() => {
                const fq = fossilSearch.toLowerCase();
                const filteredFossils = (fossilEraFilter
                  ? fossils.filter(f => getPeriodForAge((f.max_ma + f.min_ma) / 2).era === fossilEraFilter)
                  : fossils
                ).filter(f => !fq || (
                  (f.tna || "").toLowerCase().includes(fq) ||
                  (f.phl || "").toLowerCase().includes(fq)
                ));

                if (filteredFossils.length === 0 && fossilSearch) {
                  return (
                    <div style={S.fossilEmpty}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>No fossils match "{fossilSearch}"</div>
                      <div style={{ fontSize: 12, marginTop: 6, color: "#8a7a6a" }}>Try searching by phylum (e.g. "Mammalia") or part of a species name</div>
                    </div>
                  );
                }

                // Group fossils by geological period, newest first
                const groups = {};
                filteredFossils.forEach(f => {
                  const period = getPeriodForAge((f.max_ma + f.min_ma) / 2);
                  if (!groups[period.name]) groups[period.name] = { period, fossils: [] };
                  groups[period.name].fossils.push(f);
                });
                // Sort groups newest first by period start age
                const sorted = Object.values(groups).sort((a, b) => a.period.start - b.period.start);
                return sorted.map(({ period, fossils: pf }) => (
                  <div key={period.name} style={{ marginBottom: 22 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, paddingBottom: 5, borderBottom: `2px solid ${period.color}`, position: "relative" }}>
                      <div style={{ width: 10, height: 10, flexShrink: 0, background: period.color, transform: "rotate(45deg)" }} />
                      <span style={{ fontFamily: "'Special Elite', 'Courier New', monospace", fontSize: 10, fontWeight: 700, color: "#4a3a2a", letterSpacing: "0.14em", textTransform: "uppercase" }}>{period.name}</span>
                      <span style={{ fontFamily: "'Special Elite', monospace", fontSize: 9, color: "#a09070", letterSpacing: "0.06em" }}>{period.era} · {period.start}–{period.end} Ma</span>
                      <span style={{ marginLeft: "auto", background: period.color, color: "#2a1a0a", fontSize: 9, fontFamily: "'Special Elite', monospace", padding: "1px 8px", borderRadius: 1, opacity: 0.88, letterSpacing: "0.06em" }}>{pf.length} spp.</span>
                    </div>
                    {pf.map((f, i) => <FossilCard key={i} fossil={f} />)}
                  </div>
                ));
              })() : (
                <div style={S.fossilEmpty}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>🦴</div>
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

          {activeTab === "timeline" && (
            <div>
              <div style={S.tabSearch}>
                <span style={{ fontSize: 14, color: "#b0a090" }}>🔍</span>
                <input
                  style={S.tabSearchInput}
                  placeholder="Search periods or eras (e.g. Jurassic, Paleozoic)…"
                  value={timelineSearch}
                  onChange={e => setTimelineSearch(e.target.value)}
                />
                {timelineSearch && (
                  <button style={S.tabSearchClear} onClick={() => setTimelineSearch("")}>✕</button>
                )}
              </div>
              <TimelineView units={units} fossils={fossils} searchQuery={timelineSearch} />
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <div style={S.footer}>
        Field Journal No. 1 · Deep Time Studios
        <br />Stratigraphic data: <a href="https://macrostrat.org" style={S.footerLink} target="_blank" rel="noopener noreferrer">Macrostrat</a> · Fossil occurrences: <a href="https://paleobiodb.org" style={S.footerLink} target="_blank" rel="noopener noreferrer">PBDB</a>
        <br /><span style={{ color: 'rgba(200,149,108,0.4)', fontSize: 8 }}>Coverage strongest in North America · global fossil data varies by region</span>
        <br />{"◆"} compiled by Arjun Ravi · v0.2 {"◆"}
      </div>
    </div>
  );
}
