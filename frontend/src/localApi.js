/**
 * Local API layer - replaces backend API calls with localStorage-backed data.
 * All default data from the backend's init_database() is embedded here.
 */

const STORAGE_KEYS = {
  family: "dahrendorf_family",
  trips: "dahrendorf_trips",
  suggestions: "dahrendorf_suggestions",
  packingLists: "dahrendorf_packing_lists",
};

// ==================== DEFAULT DATA ====================

const DEFAULT_FAMILY = [
  { id: "f1", name: "Lukas", role: "parent", emoji: "\u{1F468}", color: "#264653", avatar_url: "https://customer-assets.emergentagent.com/job_2b2386c2-84ba-4ac6-aaff-7fc29c17627e/artifacts/h54hss2g_Lukas.jpeg" },
  { id: "f2", name: "Laura", role: "parent", emoji: "\u{1F469}", color: "#E76F51", avatar_url: "https://customer-assets.emergentagent.com/job_2b2386c2-84ba-4ac6-aaff-7fc29c17627e/artifacts/i1e6nwmw_Laura.jpeg" },
  { id: "f3", name: "Louie", role: "child", emoji: "\u{1F466}", color: "#2A9D8F", avatar_url: "https://customer-assets.emergentagent.com/job_2b2386c2-84ba-4ac6-aaff-7fc29c17627e/artifacts/qweag9iu_Louie.jpg" },
  { id: "f4", name: "Levi", role: "child", emoji: "\u{1F466}", color: "#E9C46A", avatar_url: "https://customer-assets.emergentagent.com/job_2b2386c2-84ba-4ac6-aaff-7fc29c17627e/artifacts/jneoby5a_Levi.jpeg" },
  { id: "f5", name: "Noah", role: "child", emoji: "\u{1F466}", color: "#F4A261", avatar_url: "https://customer-assets.emergentagent.com/job_2b2386c2-84ba-4ac6-aaff-7fc29c17627e/artifacts/y6swu8gc_Noah.jpg" },
];

const DEFAULT_TRIPS = [
  {
    id: "t1",
    title: "USA Westk\u00fcste 2026 - Family Road Trip",
    description: "26-t\u00e4giger Familien-Roadtrip f\u00fcr Lukas, Laura, Louie, Levi & Noah.\n\n\u{1F5D3}\uFE0F 17. Juli - 11. August 2026\n\n\u{1F4CD} ROUTE:\n\u2022 Tag 1-2: Las Vegas - Ankunft, Strip, Helikopterflug\n\u2022 Tag 3-5: Los Angeles - Disneyland, Hollywood, Santa Monica\n\u2022 Tag 6-7: Sequoia NP - General Sherman Tree\n\u2022 Tag 8-10: Yosemite NP - El Capitan, Half Dome\n\u2022 Tag 11-12: San Francisco - Cable Car, Alcatraz\n\u2022 Tag 13-15: Redwood NP - Avenue of the Giants\n\u2022 Tag 16-18: Oregon Coast - Cannon Beach\n\u2022 Tag 19-21: Olympic NP - Hoh Rainforest\n\u2022 Tag 24-26: Seattle - Space Needle",
    location: "Las Vegas \u2192 Seattle (USA Westk\u00fcste)",
    latitude: 39.5,
    longitude: -119.5,
    start_date: "2026-07-17",
    end_date: "2026-08-11",
    status: "planned",
    photos: [{ id: "p1", url: "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=800&q=80", caption: "Las Vegas" }],
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_SUGGESTIONS = [
  {
    id: "s1",
    title: "Mount St. Helens",
    description: "Der Vulkan, dessen Nordseite 1980 weggesprengt wurde - eine Explosion 500-mal st\u00e4rker als Hiroshima! Johnston Ridge Observatory mit Blick direkt in den Krater.",
    location: "Mount St. Helens, Washington",
    latitude: 46.1914,
    longitude: -122.1956,
    duration: "1 Tag",
    image_url: "https://customer-assets.emergentagent.com/job_family-travel-hub/artifacts/34y8hl7i_IMG_2693.jpeg",
    highlights: ["Johnston Ridge Observatory", "Blick in den Krater", "Interaktive Ausstellungen", "Umgest\u00fcrzte Baumst\u00e4mme"],
    is_extension: false,
    added_to_trip: false,
  },
  {
    id: "s2",
    title: "Leavenworth - Little Bavaria",
    description: "Ein komplettes bayerisches Dorf mitten in den Cascade Mountains! Fachwerkh\u00e4user, Bierg\u00e4rten, Brezeln - als w\u00e4rt ihr in Garmisch gelandet.",
    location: "Leavenworth, Washington",
    latitude: 47.5962,
    longitude: -120.6615,
    duration: "1-2 Tage",
    image_url: "https://customer-assets.emergentagent.com/job_family-travel-hub/artifacts/e9libzqo_IMG_2692.jpeg",
    highlights: ["Bayerische Bierg\u00e4rten", "Nussknacker-Museum", "Tubing am Wenatchee River", "Wandern in den Cascades"],
    is_extension: false,
    added_to_trip: false,
  },
  {
    id: "s3",
    title: "Yellowstone National Park",
    description: "Der \u00e4lteste Nationalpark der Welt - sitzt auf einem Supervulkan! Old Faithful, Grand Prismatic Spring, Mammoth Hot Springs und wilde Tiere.",
    location: "Yellowstone National Park, Wyoming",
    latitude: 44.428,
    longitude: -110.5885,
    duration: "+4-5 Tage",
    image_url: "https://customer-assets.emergentagent.com/job_family-travel-hub/artifacts/95zuar5m_IMG_2694.webp",
    highlights: ["Old Faithful Geysir", "Grand Prismatic Spring", "Mammoth Hot Springs", "Bisons im Lamar Valley", "Junior Ranger Badge"],
    is_extension: true,
    added_to_trip: false,
  },
  {
    id: "s4",
    title: "Bar J Chuckwagon",
    description: "Legend\u00e4re Cowboy-Dinner-Show auf einer echten Ranch. Die Humphrey-Familie betreibt das seit \u00fcber 40 Jahren. Deftiges Chuckwagon-Essen (BBQ, Steaks, Bohnen, Biscuits) auf Blechtellern, danach eine geniale Live-Show mit den Bar J Wranglers \u2013 echte Cowboys mit Western-Musik, Comedy und Yodeling. Perfekt f\u00fcr die ganze Familie!",
    location: "Wilson/Jackson Hole, Wyoming",
    latitude: 43.4799,
    longitude: -110.8752,
    duration: "1 Abend",
    image_url: "https://customer-assets.emergentagent.com/job_2b2386c2-84ba-4ac6-aaff-7fc29c17627e/artifacts/bjnbg562_IMG_2698.jpeg",
    highlights: ["BBQ & Steaks auf Blechtellern", "Live-Show mit Bar J Wranglers", "Western-Musik & Comedy", "Echte Ranch-Atmosph\u00e4re", "Seit \u00fcber 40 Jahren Familientradition"],
    is_extension: false,
    added_to_trip: false,
  },
];

const DEFAULT_PACKING_LISTS = [
  {
    id: "pl1",
    title: "USA Westk\u00fcste 2026 - Packliste",
    trip_id: "t1",
    items: [
      { id: "i1", name: "Reisep\u00e4sse f\u00fcr alle 5", checked: false, category: "dokumente" },
      { id: "i2", name: "ESTA Genehmigungen", checked: false, category: "dokumente" },
      { id: "i3", name: "F\u00fchrerschein (international)", checked: false, category: "dokumente" },
      { id: "i4", name: "Kreditkarten", checked: false, category: "dokumente" },
      { id: "i5", name: "Wanderschuhe (5x)", checked: false, category: "kleidung" },
      { id: "i6", name: "Regenjacken", checked: false, category: "kleidung" },
      { id: "i7", name: "Badekleidung", checked: false, category: "kleidung" },
      { id: "i8", name: "Kamera + Ladeger\u00e4t", checked: false, category: "elektronik" },
      { id: "i9", name: "Tablet f\u00fcr Autofahrten", checked: false, category: "elektronik" },
      { id: "i10", name: "Fernglas (Wildtiere!)", checked: false, category: "elektronik" },
      { id: "i11", name: "Sonnencreme LSF 50", checked: false, category: "toilettenartikel" },
      { id: "i12", name: "Reiseapotheke", checked: false, category: "toilettenartikel" },
      { id: "i13", name: "Junior Ranger Hefte", checked: false, category: "kinder" },
      { id: "i14", name: "Snacks f\u00fcr Autofahrten", checked: false, category: "essen" },
    ],
    created_at: new Date().toISOString(),
  },
];

// ==================== STORAGE HELPERS ====================

function load(key, defaults) {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  localStorage.setItem(key, JSON.stringify(defaults));
  return defaults;
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ==================== LOCAL API ====================

const localApi = {
  // Family
  getFamily: () => Promise.resolve({ data: load(STORAGE_KEYS.family, DEFAULT_FAMILY) }),
  createFamilyMember: (member) => {
    const family = load(STORAGE_KEYS.family, DEFAULT_FAMILY);
    const newMember = { ...member, id: `f-${Date.now()}` };
    family.push(newMember);
    save(STORAGE_KEYS.family, family);
    return Promise.resolve({ data: newMember });
  },
  deleteFamilyMember: (id) => {
    let family = load(STORAGE_KEYS.family, DEFAULT_FAMILY);
    family = family.filter((m) => m.id !== id);
    save(STORAGE_KEYS.family, family);
    return Promise.resolve({ data: { message: "Deleted" } });
  },

  // Trips
  getTrips: () => Promise.resolve({ data: load(STORAGE_KEYS.trips, DEFAULT_TRIPS) }),

  // Suggestions
  getSuggestions: () => Promise.resolve({ data: load(STORAGE_KEYS.suggestions, DEFAULT_SUGGESTIONS) }),
  toggleSuggestion: (id) => {
    const suggestions = load(STORAGE_KEYS.suggestions, DEFAULT_SUGGESTIONS);
    const sug = suggestions.find((s) => s.id === id);
    if (sug) {
      sug.added_to_trip = !sug.added_to_trip;
      save(STORAGE_KEYS.suggestions, suggestions);
      return Promise.resolve({ data: { message: "Toggled", added_to_trip: sug.added_to_trip } });
    }
    return Promise.reject(new Error("Not found"));
  },

  // Packing Lists
  getPackingLists: () => Promise.resolve({ data: load(STORAGE_KEYS.packingLists, DEFAULT_PACKING_LISTS) }),
  createPackingList: (list) => {
    const lists = load(STORAGE_KEYS.packingLists, DEFAULT_PACKING_LISTS);
    const newList = { ...list, id: `pl-${Date.now()}`, items: list.items || [], created_at: new Date().toISOString() };
    lists.push(newList);
    save(STORAGE_KEYS.packingLists, lists);
    return Promise.resolve({ data: newList });
  },
  updatePackingList: (id, data) => {
    const lists = load(STORAGE_KEYS.packingLists, DEFAULT_PACKING_LISTS);
    const idx = lists.findIndex((l) => l.id === id);
    if (idx >= 0) {
      lists[idx] = { ...lists[idx], ...data, id };
      save(STORAGE_KEYS.packingLists, lists);
      return Promise.resolve({ data: lists[idx] });
    }
    return Promise.reject(new Error("Not found"));
  },
  deletePackingList: (id) => {
    let lists = load(STORAGE_KEYS.packingLists, DEFAULT_PACKING_LISTS);
    lists = lists.filter((l) => l.id !== id);
    save(STORAGE_KEYS.packingLists, lists);
    return Promise.resolve({ data: { message: "Deleted" } });
  },
  togglePackingItem: (listId, itemId) => {
    const lists = load(STORAGE_KEYS.packingLists, DEFAULT_PACKING_LISTS);
    const list = lists.find((l) => l.id === listId);
    if (list) {
      const item = list.items.find((i) => i.id === itemId);
      if (item) {
        item.checked = !item.checked;
        save(STORAGE_KEYS.packingLists, lists);
        return Promise.resolve({ data: { message: "Toggled" } });
      }
    }
    return Promise.reject(new Error("Not found"));
  },
};

export default localApi;
