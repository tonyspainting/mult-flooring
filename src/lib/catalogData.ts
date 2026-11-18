// Centralized catalog data shared by the Flooring page, the Floors page and
// the global site search. Values moved here verbatim from FlooringPage.tsx
// (COLLECTIONS) and FloorsPage.tsx (SWATCHES): do not change prices, names
// or images here without updating the catalog.

export type Tone = "Light" | "Medium" | "Dark";

// ─────────────────────────────────────────────────
// LVP Flooring (vinyl plank) collections
// ─────────────────────────────────────────────────

export interface FloorProduct {
  id: string;
  name: string;
  collection: string;
  brand: string;
  thickness: string;
  price: string;
  tone: Tone;
  swatchImage: string;
  roomImage: string;
  tag?: string;
}

export interface Collection {
  id: string;
  brand: string;
  name: string;
  label: string;
  thickness: string;
  price: string;
  description: string;
  features: string[];
  products: FloorProduct[];
}

/** Builds product entries for a collection from compact [slug, name, tone, tag?] tuples. */
function build(
  prefix: string,
  idPrefix: string,
  collection: string,
  brand: string,
  thickness: string,
  price: string,
  items: [string, string, Tone, string?][],
): FloorProduct[] {
  return items.map(([slug, name, tone, tag]) => ({
    id: `${idPrefix}-${slug}`,
    name,
    collection,
    brand,
    thickness,
    price,
    tone,
    tag,
    swatchImage: `/flooring/${prefix}-${slug}-swatch.jpg`,
    roomImage: `/flooring/${prefix}-${slug}-room.jpg`,
  }));
}

export const COLLECTIONS: Collection[] = [
  {
    id: "permshield-lite",
    brand: "Permshield Flooring",
    name: "Lite Collection",
    label: "Permshield Lite",
    thickness: "5.2 MM",
    price: "$2.20 / sq. ft.",
    description: "Durable and affordable vinyl plank with realistic wood-look texture. Perfect for high-traffic areas in any room.",
    features: ["Waterproof", "Scratch Resistant", "Easy Install", "Kid & Pet Friendly"],
    products: build("permshield-lite", "ps-lite", "Permshield Lite", "Permshield", "5.2 MM", "$2.20 / sq. ft.", [
      ["mocha", "Mocha", "Dark"],
      ["natural-oak", "Natural Oak", "Medium", "Popular"],
      ["sand-dunes", "Sand Dunes", "Light"],
      ["beach-beige", "Beach Beige", "Light"],
      ["silver-grey", "Silver Grey", "Light"],
    ]),
  },
  {
    id: "permshield-plus",
    brand: "Permshield Flooring",
    name: "One Plus Collection",
    label: "Permshield One Plus",
    thickness: "6.5 MM",
    price: "$3.39 / sq. ft.",
    description: "Premium thicker construction for superior comfort underfoot and enhanced sound insulation. The ultimate LVP experience.",
    features: ["100% Waterproof", "Enhanced Comfort", "Sound Insulation", "Commercial Grade"],
    products: build("permshield-plus", "ps-plus", "Permshield One Plus", "Permshield", "6.5 MM", "$3.39 / sq. ft.", [
      ["santorini", "Santorini", "Light", "Trending"],
      ["beach-beige", "Beach Beige", "Light"],
      ["rustic-white", "Rustic White", "Light"],
      ["silver-grey", "Silver Grey", "Medium"],
      ["slate", "Slate", "Dark"],
      ["french-roast", "French Roast", "Medium"],
      ["mocha", "Mocha", "Dark"],
    ]),
  },
  {
    id: "msi-cyrus",
    brand: "MSI",
    name: "Cyrus Collection",
    label: "MSI Cyrus",
    thickness: "6.0 MM",
    price: "$2.25 / sq. ft.",
    description: "Making Dream Surfaces Attainable. The Cyrus Collection offers premium wood-look LVP with a wide range of tones for every style.",
    features: ["Waterproof Core", "Wear Layer Protection", "Easy Float Install", "Residential & Light Commercial"],
    products: build("cyrus", "cyrus", "MSI Cyrus", "MSI", "6.0 MM", "$2.25 / sq. ft.", [
      ["billingham", "Billingham", "Dark"],
      ["boswell", "Boswell", "Dark"],
      ["bracken-hill", "Bracken Hill", "Medium"],
      ["braly", "Braly", "Dark"],
      ["brianka", "Brianka", "Dark"],
      ["brookings", "Brookings", "Dark"],
      ["akadia", "Akadia", "Light", "Trending"],
      ["amber-forrester", "Amber Forrester", "Medium"],
      ["austell-grove", "Austell Grove", "Light"],
      ["barnstorm", "Barnstorm", "Medium"],
      ["barrell", "Barrell", "Light"],
      ["bembi", "Bembi", "Dark"],
    ]),
  },
];

// ─────────────────────────────────────────────────
// Hardwood / vinyl / laminate swatches (Floors page)
// ─────────────────────────────────────────────────

export type Species =
  | "Red Oak"
  | "White Oak"
  | "Parquet"
  | "Vinyl (LVP)"
  | "Laminate";

export type Width =
  | "Strip"
  | "Medium"
  | "Wide Plank"
  | "Parquet"
  | "LVP"
  | "Laminate";

export interface Swatch {
  id: string;
  name: string;
  species: Species;
  finish: string;
  tone: Tone;
  width: Width;
  rooms: string[];
  description: string;
  details: {
    thickness: string;
    grade: string;
    coating: string;
    available_widths: string;
  };
  image: string;
  hex: string;
  tag?: string;
}

export const SWATCHES: Swatch[] = [
  // ── RED OAK ──
  {
    id: "red-oak-natural",
    name: "Natural",
    species: "Red Oak",
    finish: "Natural",
    tone: "Light",
    width: "Medium",
    rooms: ["Living Room", "Bedroom", "Dining Room"],
    description:
      "Unfinished natural Red Oak. Warm amber tone with open grain character. Site-finished for a custom look unique to your home.",
    details: {
      thickness: '¾"',
      grade: "Select & Better",
      coating: "Site-finished",
      available_widths: '2¼", 3", 3¼", 4", 5"',
    },
    image: "/swatches/red-oak-natural.jpg",
    hex: "#C68C4E",
  },
  {
    id: "red-oak-gunstock",
    name: "Gunstock",
    species: "Red Oak",
    finish: "Gunstock",
    tone: "Medium",
    width: "Medium",
    rooms: ["Living Room", "Bedroom", "Dining Room", "Kitchen"],
    description:
      "Classic Gunstock stain. The most popular Red Oak finish in New England. Warm reddish-brown with rich depth and open grain character.",
    details: {
      thickness: '¾"',
      grade: "Select & Better",
      coating: "Site-finished",
      available_widths: '2¼", 3", 3¼", 4", 5", 6", 7"',
    },
    image: "/swatches/red-oak-gunstock.jpg",
    hex: "#AC6C37",
    tag: "Most Popular",
  },
  {
    id: "red-oak-early-american",
    name: "Early American",
    species: "Red Oak",
    finish: "Early American",
    tone: "Medium",
    width: "Medium",
    rooms: ["Living Room", "Bedroom", "Dining Room"],
    description:
      "Rich golden-brown stain with warm amber undertones. A classic American look that complements both traditional and transitional interiors.",
    details: {
      thickness: '¾"',
      grade: "Select & Better",
      coating: "Site-finished",
      available_widths: '2¼", 3", 3¼", 4", 5"',
    },
    image: "/swatches/red-oak-early-american.jpg",
    hex: "#9B6229",
  },
  {
    id: "red-oak-special-walnut",
    name: "Special Walnut",
    species: "Red Oak",
    finish: "Special Walnut",
    tone: "Medium",
    width: "Medium",
    rooms: ["Living Room", "Dining Room", "Office"],
    description:
      "Medium-dark warm brown stain with rich chocolate undertones. Adds sophistication without going too dark. A versatile choice for any room.",
    details: {
      thickness: '¾"',
      grade: "Select & Better",
      coating: "Site-finished",
      available_widths: '2¼", 3", 3¼", 4", 5", 6"',
    },
    image: "/swatches/red-oak-special-walnut.jpg",
    hex: "#78481E",
  },
  {
    id: "red-oak-dark-walnut",
    name: "Dark Walnut",
    species: "Red Oak",
    finish: "Dark Walnut",
    tone: "Dark",
    width: "Wide Plank",
    rooms: ["Living Room", "Dining Room", "Office", "Bedroom"],
    description:
      "Deep espresso brown stain. Dramatic and luxurious. Works beautifully with light walls and modern or traditional furniture.",
    details: {
      thickness: '¾"',
      grade: "Character",
      coating: "Site-finished",
      available_widths: '3¼", 5", 6", 7", 8", 9"',
    },
    image: "/swatches/red-oak-dark-walnut.jpg",
    hex: "#503012",
  },
  {
    id: "red-oak-ebony",
    name: "Ebony",
    species: "Red Oak",
    finish: "Ebony",
    tone: "Dark",
    width: "Wide Plank",
    rooms: ["Living Room", "Dining Room", "Office"],
    description:
      "Near-black finish with warm brown undertones. The most dramatic Red Oak option: bold, sophisticated, and truly statement-making.",
    details: {
      thickness: '¾"',
      grade: "Select & Better",
      coating: "Site-finished",
      available_widths: '3¼", 4", 5", 6"',
    },
    image: "/swatches/red-oak-ebony.jpg",
    hex: "#20140A",
    tag: "Bold Choice",
  },
  // ── WHITE OAK ──
  {
    id: "white-oak-natural",
    name: "Natural",
    species: "White Oak",
    finish: "Natural",
    tone: "Light",
    width: "Medium",
    rooms: ["Living Room", "Bedroom", "Kitchen", "Dining Room"],
    description:
      "Cool beige-gray tone unique to White Oak. Tighter grain than Red Oak. The designer's choice for modern and Scandinavian-inspired interiors.",
    details: {
      thickness: '¾"',
      grade: "Select & Better",
      coating: "Site-finished",
      available_widths: '3", 3¼", 4", 5", 6", 7", 8"',
    },
    image: "/swatches/white-oak-natural.jpg",
    hex: "#D4C09E",
    tag: "Trending",
  },
  {
    id: "white-oak-gray",
    name: "Gray",
    species: "White Oak",
    finish: "Gray",
    tone: "Medium",
    width: "Medium",
    rooms: ["Living Room", "Bedroom", "Kitchen"],
    description:
      "Cool medium gray stain that enhances White Oak's natural undertones. Contemporary and versatile. Pairs beautifully with white and dark furniture.",
    details: {
      thickness: '¾"',
      grade: "Select & Better",
      coating: "Site-finished",
      available_widths: '3¼", 4", 5", 6", 7"',
    },
    image: "/swatches/white-oak-gray.jpg",
    hex: "#ACA89E",
  },
  {
    id: "white-oak-whitewash",
    name: "Whitewash",
    species: "White Oak",
    finish: "Whitewash",
    tone: "Light",
    width: "Wide Plank",
    rooms: ["Living Room", "Bedroom", "Bathroom"],
    description:
      "Pale bleached finish that creates a bright, airy atmosphere. Perfect for beach houses, farmhouse styles and light-filled spaces.",
    details: {
      thickness: '¾"',
      grade: "Select & Better",
      coating: "Site-finished",
      available_widths: '5", 6", 7", 8"',
    },
    image: "/swatches/white-oak-whitewash.jpg",
    hex: "#E8E1D2",
  },
  {
    id: "white-oak-honey",
    name: "Honey",
    species: "White Oak",
    finish: "Honey",
    tone: "Medium",
    width: "Medium",
    rooms: ["Living Room", "Kitchen", "Dining Room"],
    description:
      "Warm golden-amber stain that brings warmth to White Oak's cooler natural tone. Bright and inviting, great for family spaces.",
    details: {
      thickness: '¾"',
      grade: "Select & Better",
      coating: "Site-finished",
      available_widths: '3¼", 4", 5", 6"',
    },
    image: "/swatches/white-oak-honey.jpg",
    hex: "#CDA862",
  },
  {
    id: "white-oak-driftwood",
    name: "Driftwood",
    species: "White Oak",
    finish: "Driftwood",
    tone: "Medium",
    width: "Wide Plank",
    rooms: ["Living Room", "Bedroom", "Dining Room"],
    description:
      "Warm gray-brown mix that evokes aged, weathered wood. Organic and sophisticated. Highly popular in coastal and transitional New England homes.",
    details: {
      thickness: '¾"',
      grade: "Select & Better",
      coating: "Site-finished",
      available_widths: '5", 6", 7", 8"',
    },
    image: "/swatches/white-oak-driftwood.jpg",
    hex: "#A89880",
    tag: "Trending",
  },
  {
    id: "white-oak-ebony",
    name: "Ebony",
    species: "White Oak",
    finish: "Ebony",
    tone: "Dark",
    width: "Wide Plank",
    rooms: ["Living Room", "Dining Room", "Office"],
    description:
      "Near-black finish on White Oak, cooler and more refined than Red Oak Ebony. Dramatic contrast. Ideal for high-end residential and commercial.",
    details: {
      thickness: '¾"',
      grade: "Select & Better",
      coating: "Site-finished",
      available_widths: '4", 5", 6", 7"',
    },
    image: "/swatches/white-oak-ebony.jpg",
    hex: "#1C1612",
  },
  // ── PARQUET ──
  {
    id: "parquet-natural",
    name: "Natural",
    species: "Parquet",
    finish: "Natural",
    tone: "Light",
    width: "Parquet",
    rooms: ["Living Room", "Dining Room", "Foyer"],
    description:
      "Classic herringbone and basket-weave patterns in natural Red Oak. Adds architectural elegance to any formal space.",
    details: {
      thickness: '¾"',
      grade: "Select",
      coating: "Site-finished",
      available_widths: '12" x 12" tiles',
    },
    image: "/swatches/parquet-natural.jpg",
    hex: "#C68C4E",
    tag: "Signature",
  },
  {
    id: "parquet-gunstock",
    name: "Gunstock",
    species: "Parquet",
    finish: "Gunstock",
    tone: "Medium",
    width: "Parquet",
    rooms: ["Living Room", "Dining Room", "Foyer", "Office"],
    description:
      "Parquet patterns in warm Gunstock stain. Traditional and timeless, a staple of classic New England architecture.",
    details: {
      thickness: '¾"',
      grade: "Select",
      coating: "Site-finished",
      available_widths: '12" x 12" tiles',
    },
    image: "/swatches/parquet-gunstock.jpg",
    hex: "#AC6C37",
  },
  {
    id: "parquet-dark-walnut",
    name: "Dark Walnut",
    species: "Parquet",
    finish: "Dark Walnut",
    tone: "Dark",
    width: "Parquet",
    rooms: ["Living Room", "Dining Room", "Office"],
    description:
      "Dark Walnut parquet, a bold statement piece. The geometric pattern combined with deep color creates an unforgettable floor.",
    details: {
      thickness: '¾"',
      grade: "Select",
      coating: "Site-finished",
      available_widths: '12" x 12" tiles',
    },
    image: "/swatches/parquet-dark-walnut.jpg",
    hex: "#503012",
    tag: "Bold Choice",
  },
  // ── VINYL LVP ──
  {
    id: "lvp-light-ash",
    name: "Light Ash",
    species: "Vinyl (LVP)",
    finish: "Embossed",
    tone: "Light",
    width: "LVP",
    rooms: ["Kitchen", "Bathroom", "Basement", "Living Room", "Bedroom"],
    description:
      "Light pale gray-beige LVP with realistic embossed grain. 100% waterproof. Perfect for kitchens, bathrooms and basements.",
    details: {
      thickness: "6mm",
      grade: "Commercial AC4",
      coating: "UV-cured urethane",
      available_widths: '7" planks',
    },
    image: "/swatches/lvp-light-ash.jpg",
    hex: "#DAD0BC",
    tag: "100% Waterproof",
  },
  {
    id: "lvp-medium-oak",
    name: "Medium Oak",
    species: "Vinyl (LVP)",
    finish: "Embossed",
    tone: "Medium",
    width: "LVP",
    rooms: ["Kitchen", "Bathroom", "Basement", "Living Room"],
    description:
      "Warm medium brown LVP. The most versatile vinyl option. It looks great in any room and handles heavy traffic with ease.",
    details: {
      thickness: "6mm",
      grade: "Commercial AC4",
      coating: "UV-cured urethane",
      available_widths: '7" planks',
    },
    image: "/swatches/lvp-medium-oak.jpg",
    hex: "#BC9458",
  },
  {
    id: "lvp-dark-walnut",
    name: "Dark Walnut",
    species: "Vinyl (LVP)",
    finish: "Embossed",
    tone: "Dark",
    width: "LVP",
    rooms: ["Kitchen", "Basement", "Office"],
    description:
      "Deep dark walnut LVP. Dramatic look with the durability and waterproofing of luxury vinyl. Ideal for high-traffic commercial areas.",
    details: {
      thickness: "6mm",
      grade: "Commercial AC4",
      coating: "UV-cured urethane",
      available_widths: '7" planks',
    },
    image: "/swatches/lvp-dark-walnut.jpg",
    hex: "#482D14",
  },
  {
    id: "lvp-gray-stone",
    name: "Gray Stone",
    species: "Vinyl (LVP)",
    finish: "Embossed",
    tone: "Medium",
    width: "LVP",
    rooms: ["Kitchen", "Bathroom", "Basement"],
    description:
      "Cool gray stone-look LVP. Modern and sleek. Great alternative to tile in bathrooms and kitchens without the cold underfoot feel.",
    details: {
      thickness: "6mm",
      grade: "Commercial AC4",
      coating: "UV-cured urethane",
      available_widths: '7" planks',
    },
    image: "/swatches/lvp-gray-stone.jpg",
    hex: "#A8A5A0",
  },
  // ── LAMINATE ──
  {
    id: "laminate-light-birch",
    name: "Light Birch",
    species: "Laminate",
    finish: "Embossed in Register",
    tone: "Light",
    width: "Laminate",
    rooms: ["Bedroom", "Living Room", "Office"],
    description:
      "Light pale birch laminate. Fresh and clean. Budget-friendly without sacrificing style. Scratch-resistant surface for busy households.",
    details: {
      thickness: "12mm",
      grade: "AC3 Residential",
      coating: "Aluminum Oxide",
      available_widths: '5" planks',
    },
    image: "/swatches/laminate-light-birch.jpg",
    hex: "#E4D7BC",
  },
  {
    id: "laminate-natural-oak",
    name: "Natural Oak",
    species: "Laminate",
    finish: "Embossed in Register",
    tone: "Medium",
    width: "Laminate",
    rooms: ["Bedroom", "Living Room", "Dining Room"],
    description:
      "Classic Natural Oak laminate. Realistic wood look at a fraction of the cost. Easy to maintain and install in any room.",
    details: {
      thickness: "12mm",
      grade: "AC3 Residential",
      coating: "Aluminum Oxide",
      available_widths: '5" planks',
    },
    image: "/swatches/laminate-natural-oak.jpg",
    hex: "#BC9458",
    tag: "Best Value",
  },
  {
    id: "laminate-dark-cherry",
    name: "Dark Cherry",
    species: "Laminate",
    finish: "Embossed in Register",
    tone: "Dark",
    width: "Laminate",
    rooms: ["Bedroom", "Office", "Dining Room"],
    description:
      "Rich reddish-brown cherry laminate. Elegant and warm. Adds a traditional feel to bedrooms and dining rooms.",
    details: {
      thickness: "12mm",
      grade: "AC3 Residential",
      coating: "Aluminum Oxide",
      available_widths: '5" planks',
    },
    image: "/swatches/laminate-dark-cherry.jpg",
    hex: "#5F2619",
  },
  {
    id: "laminate-cool-gray",
    name: "Cool Gray",
    species: "Laminate",
    finish: "Embossed in Register",
    tone: "Medium",
    width: "Laminate",
    rooms: ["Bedroom", "Living Room", "Office"],
    description:
      "Modern cool gray laminate. Contemporary and versatile. Pairs well with white, black and natural wood furniture.",
    details: {
      thickness: "12mm",
      grade: "AC3 Residential",
      coating: "Aluminum Oxide",
      available_widths: '5" planks',
    },
    image: "/swatches/laminate-cool-gray.jpg",
    hex: "#9E9E9B",
  },
];
