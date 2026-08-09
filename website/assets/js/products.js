/* Zorvilo product catalogue.
 *
 * Single source of truth for every SKU on the site. Plain script (not a module)
 * so the pages also work when opened straight off the file system for review.
 *
 * fit: "cutout"  transparent PNG/WebP, floats on the tile tint
 *      "plate"   product on a white plate, sits on a white tile
 *      "photo"   photographic crop, fills the tile edge to edge
 *
 * available: false greys the whole range out and labels it "Coming soon".
 * Flip it to true to put a range on sale — nothing else needs changing.
 */
window.ZORVILO = window.ZORVILO || {};

window.ZORVILO.ranges = [
  {
    id: 'energy',
    name: 'Zorvilo Energy',
    short: 'Energy',
    available: true,
    accent: '#e4222a',
    tagline: 'The Standard of Strength',
    text: 'A classic energy drink built on taurine, caffeine and four B vitamins — engineered to push you beyond your limits.',
    image: 'assets/img/can-front.webp'
  },
  {
    id: 'soft',
    name: 'Zorvilo Soft Drinks',
    short: 'Soft Drinks',
    available: false,
    accent: '#d7262b',
    tagline: 'Everyday fizz, everywhere',
    text: 'Four carbonated classics in a 200 ml grab-and-go bottle, priced for the neighbourhood shop.',
    image: 'assets/img/soft-orange.webp'
  },
  {
    id: 'fruit',
    name: 'Zorvilo Fruit Drinks',
    short: 'Fruit Drinks',
    available: false,
    accent: '#f5a623',
    tagline: 'Playful fruit, 160 ml',
    text: 'Bright, sweet and made for lunchboxes — the small format that moves fastest at the counter.',
    image: 'assets/img/fruit-mango.webp'
  },
  {
    id: 'juice',
    name: 'Zorvilo Aloe Vera Juices',
    short: 'Aloe Vera Juices',
    available: false,
    accent: '#3f8f5b',
    tagline: 'Aloe vera, pulp and juice',
    text: 'Seven aloe vera blends with visible pulp — the wellness end of the portfolio, built for modern trade.',
    image: 'assets/img/juice-kiwi.webp'
  },
  {
    id: 'beer',
    name: 'Zorvilo 0.0 Brews',
    short: '0.0% Brews',
    available: false,
    accent: '#16233f',
    tagline: 'All of the ritual, none of the alcohol',
    text: 'Alcohol-free beers and malty drinks at 0.0% ABV, brewed for the moments where a soft drink will not do.',
    image: 'assets/img/beer-classic.webp'
  }
];

window.ZORVILO.products = [
  /* ------------------------------------------------------------- energy -- */
  {
    id: 'energy-250',
    range: 'energy',
    name: 'Zorvilo Energy',
    size: '250 ml can',
    badge: 'Hero SKU',
    accent: '#e4222a',
    tint: '#1a0d10',
    fit: 'cutout',
    image: 'assets/img/can-front.webp',
    text: 'Zorvilo elevates your energy with bold intensity and refined strength. Engineered to push you beyond limits and keep you performing at your peak.',
    specs: {
      Format: '250 ml sleek can',
      Contains: 'Taurine 1000 mg · Caffeine 75 mg per can',
      Vitamins: 'B2 · B3 · B6 · B12',
      'Shelf life': '18 months from manufacture'
    }
  },
  {
    id: 'energy-party-pack',
    range: 'energy',
    name: 'Energy Party Pack',
    size: '6 × 250 ml',
    badge: 'Multipack',
    accent: '#e4222a',
    tint: '#1a0d10',
    fit: 'cutout',
    image: 'assets/img/party-pack.webp',
    text: 'Six cans of unstoppable energy in a shelf-ready carton — the format built for weekends, gyms and gatherings.',
    specs: {
      Format: '6 × 250 ml carton',
      'Case display': 'Shelf-ready party pack',
      Storage: 'Cool, dry place away from direct heat',
      Serve: 'Chilled'
    }
  },

  /* -------------------------------------------------------- soft drinks -- */
  {
    id: 'soft-cola',
    range: 'soft',
    name: 'Cola',
    size: '200 ml',
    accent: '#8b2f24',
    tint: '#f3e7e3',
    fit: 'cutout',
    image: 'assets/img/soft-cola.webp',
    text: 'The dark, deep-caramel cola that anchors the range — sharp carbonation and a clean finish.',
    specs: { Format: '200 ml PET', Serve: 'Chilled', 'Best for': 'Impulse and counter sales' }
  },
  {
    id: 'soft-jeera',
    range: 'soft',
    name: 'Jeera',
    size: '200 ml',
    accent: '#7a4a2b',
    tint: '#f4ebe2',
    fit: 'cutout',
    image: 'assets/img/soft-jeera.webp',
    text: 'Spiced cumin soda with a savoury, digestive edge — the Indian classic done properly.',
    specs: { Format: '200 ml PET', Serve: 'Chilled', 'Best for': 'Meal occasions' }
  },
  {
    id: 'soft-orange',
    range: 'soft',
    name: 'Orange',
    size: '200 ml',
    accent: '#f2760c',
    tint: '#fdefdf',
    fit: 'cutout',
    image: 'assets/img/soft-orange.webp',
    text: 'A bright, fully loaded orange fizz — the colour that sells itself from the chiller.',
    specs: { Format: '200 ml PET', Serve: 'Chilled', 'Best for': 'Family packs' }
  },
  {
    id: 'soft-lemon',
    range: 'soft',
    name: 'Lemon',
    size: '200 ml',
    accent: '#2fa84f',
    tint: '#e8f6ea',
    fit: 'cutout',
    image: 'assets/img/soft-lemon.webp',
    text: 'Cloudy lemon with a sharp citrus lift — crisp, cold and endlessly repeatable.',
    specs: { Format: '200 ml PET', Serve: 'Chilled', 'Best for': 'Summer routes' }
  },

  /* ------------------------------------------------------- fruit drinks -- */
  {
    id: 'fruit-mango',
    range: 'fruit',
    name: 'Mango Magic',
    size: '160 ml',
    accent: '#f5a623',
    tint: '#ffffff',
    fit: 'plate',
    image: 'assets/img/fruit-mango.webp',
    text: 'Thick, golden and unapologetically sweet — the mango drink that defines the Indian summer.',
    specs: { Format: '160 ml PET', Serve: 'Chilled', 'Best for': 'Lunchboxes and schools' }
  },
  {
    id: 'fruit-nimbu',
    range: 'fruit',
    name: 'Naughty Nimbu',
    size: '160 ml',
    accent: '#8cc63f',
    tint: '#ffffff',
    fit: 'plate',
    image: 'assets/img/fruit-nimbu.webp',
    text: 'Zesty lime with a mischievous kick — tart, cloudy and made to be drunk ice cold.',
    specs: { Format: '160 ml PET', Serve: 'Chilled', 'Best for': 'On-the-go refreshment' }
  },
  {
    id: 'fruit-litchi',
    range: 'fruit',
    name: 'Litchi Lush',
    size: '160 ml',
    accent: '#a85bb0',
    tint: '#ffffff',
    fit: 'plate',
    image: 'assets/img/fruit-litchi.webp',
    text: 'Soft, floral litchi with a rounded sweetness — the flavour that keeps shoppers coming back.',
    specs: { Format: '160 ml PET', Serve: 'Chilled', 'Best for': 'Premium impulse' }
  },

  /* --------------------------------------------------- aloe vera juices -- */
  {
    id: 'juice-wildberry',
    range: 'juice',
    name: 'Wild Berry',
    size: 'Aloe vera juice',
    accent: '#9c2451',
    tint: '#efe6e2',
    fit: 'photo',
    image: 'assets/img/juice-wildberry.webp',
    text: 'Deep berry colour with aloe vera pulp suspended through the bottle.',
    specs: { Base: 'Aloe vera, pulp and juice', Serve: 'Chilled, shake well' }
  },
  {
    id: 'juice-orange',
    range: 'juice',
    name: 'Orange',
    size: 'Aloe vera juice',
    accent: '#ef7c1a',
    tint: '#efe6e2',
    fit: 'photo',
    image: 'assets/img/juice-orange.webp',
    text: 'Sunny citrus carrying soft aloe pieces — the easiest entry point into the range.',
    specs: { Base: 'Aloe vera, pulp and juice', Serve: 'Chilled, shake well' }
  },
  {
    id: 'juice-litchi',
    range: 'juice',
    name: 'Litchi',
    size: 'Aloe vera juice',
    accent: '#c98ba6',
    tint: '#efe6e2',
    fit: 'photo',
    image: 'assets/img/juice-litchi.webp',
    text: 'Pale, delicate and floral, with aloe pulp that reads clearly through the glass.',
    specs: { Base: 'Aloe vera, pulp and juice', Serve: 'Chilled, shake well' }
  },
  {
    id: 'juice-pineapple',
    range: 'juice',
    name: 'Pineapple',
    size: 'Aloe vera juice',
    accent: '#e8b21c',
    tint: '#efe6e2',
    fit: 'photo',
    image: 'assets/img/juice-pineapple.webp',
    text: 'Tropical and tangy, balanced by the cooling body of aloe vera.',
    specs: { Base: 'Aloe vera, pulp and juice', Serve: 'Chilled, shake well' }
  },
  {
    id: 'juice-anaar',
    range: 'juice',
    name: 'Anaar',
    size: 'Aloe vera juice',
    accent: '#a5123a',
    tint: '#efe6e2',
    fit: 'photo',
    image: 'assets/img/juice-anaar.webp',
    text: 'Pomegranate at full strength — the richest colour in the line-up.',
    specs: { Base: 'Aloe vera, pulp and juice', Serve: 'Chilled, shake well' }
  },
  {
    id: 'juice-kiwi',
    range: 'juice',
    name: 'Kiwi',
    size: 'Aloe vera juice',
    accent: '#6faa2d',
    tint: '#efe6e2',
    fit: 'photo',
    image: 'assets/img/juice-kiwi.webp',
    text: 'Sharp green kiwi with aloe pulp — the freshest-looking bottle on the shelf.',
    specs: { Base: 'Aloe vera, pulp and juice', Serve: 'Chilled, shake well' }
  },
  {
    id: 'juice-guava',
    range: 'juice',
    name: 'Guava',
    size: 'Aloe vera juice',
    accent: '#e05a72',
    tint: '#efe6e2',
    fit: 'photo',
    image: 'assets/img/juice-guava.webp',
    text: 'Pink guava, soft and fragrant, with the signature aloe texture.',
    specs: { Base: 'Aloe vera, pulp and juice', Serve: 'Chilled, shake well' }
  },

  /* ---------------------------------------------------------- 0.0 brews -- */
  {
    id: 'beer-classic',
    range: 'beer',
    name: 'Beer 0.0 Classic',
    size: 'Non-alcoholic',
    badge: '0.0% ABV',
    accent: '#1f7f8c',
    tint: '#20160f',
    fit: 'photo',
    image: 'assets/img/beer-classic.webp',
    text: 'The straight-down-the-line alcohol-free brew: hop-forward, crisp and properly bitter.',
    specs: { ABV: '0.0%', Style: 'Classic hopped brew', Serve: 'Chilled' }
  },
  {
    id: 'beer-malty',
    range: 'beer',
    name: 'Malty Beer Original',
    size: 'Non-alcoholic',
    badge: '0.0% ABV',
    accent: '#a8442c',
    tint: '#20160f',
    fit: 'photo',
    image: 'assets/img/beer-malty.webp',
    text: 'A full-bodied malt drink with a deep amber pour and a rounded, bready finish.',
    specs: { ABV: '0.0%', Style: 'Malt drink', Serve: 'Chilled' }
  },
  {
    id: 'beer-green-apple',
    range: 'beer',
    name: 'Green Apple Mojito',
    size: 'Non-alcoholic',
    badge: '0.0% ABV',
    accent: '#7fb529',
    tint: '#20160f',
    fit: 'photo',
    image: 'assets/img/beer-green-apple.webp',
    text: 'Sharp green apple over a mojito base — the flavour that brings new drinkers into the category.',
    specs: { ABV: '0.0%', Style: 'Flavoured brew', Serve: 'Chilled' }
  },
  {
    id: 'beer-cranberry',
    range: 'beer',
    name: 'Cranberry',
    size: 'Non-alcoholic',
    badge: '0.0% ABV',
    accent: '#c22348',
    tint: '#20160f',
    fit: 'photo',
    image: 'assets/img/beer-cranberry.webp',
    text: 'Tart cranberry cutting through the malt — bright, dry and food-friendly.',
    specs: { ABV: '0.0%', Style: 'Flavoured brew', Serve: 'Chilled' }
  },
  {
    id: 'beer-candied-malt',
    range: 'beer',
    name: 'Candied Malt',
    size: 'Non-alcoholic',
    badge: '0.0% ABV',
    accent: '#c9a227',
    tint: '#20160f',
    fit: 'photo',
    image: 'assets/img/beer-candied-malt.webp',
    text: 'Sweet caramelised malt with a smooth, dessert-like body.',
    specs: { ABV: '0.0%', Style: 'Malt drink', Serve: 'Chilled' }
  }
];
