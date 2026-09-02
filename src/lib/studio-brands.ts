export type StudioBrand = {
  slug: string;
  name: string;
  category: string;
  year: string;
  image: string;
  colors: { hex: string; name: string; use: string }[];
  summary: string;
  client: string;
  location: string;
  duration: string;
  scope: string;
  brief: string;
  problem: string[];
  audience: string;
  process: { title: string; body: string }[];
  type: string;
  voice: string;
  photography: string;
  deliverables: string[];
  applications: { title: string; body: string }[];
  outcomes: string[];
  quote: { text: string; name: string; role: string };
};

export const studioBrands: StudioBrand[] = [
  {
    slug: "noon-harvest",
    name: "Noon Harvest",
    category: "Organic grocery",
    year: "2025",
    image: "/brands/noon-harvest.jpg",
    colors: [
      { hex: "#2F4A3C", name: "Garden", use: "Wordmark, boards, tape" },
      { hex: "#E8D5B5", name: "Cream paper", use: "Packing and labels" },
      { hex: "#EA6A1A", name: "Harvest", use: "Offers and stamps" },
    ],
    summary: "A quiet grocery brand that looks as fresh as the produce.",
    client: "Family grocer, Gulshan",
    location: "Dhaka",
    duration: "6 weeks",
    scope: "Identity, packing, store, weekly offers",
    brief:
      "The shop already sold better produce than the stalls around it. Nothing on the crate, the bag, or the board said so. Regulars knew. Walk-ins treated it like any other organic corner.",
    problem: [
      "The leaf-mark and green crate look that every Gulshan grocer already uses.",
      "Offers written on A4 paper, taped to the glass, changing the whole room every Friday.",
      "No packing that could travel to a home kitchen and still look like Noon Harvest.",
    ],
    audience:
      "Households in Gulshan and Banani who will pay for produce they trust — and want the bag on the counter to look as considered as the fruit inside it.",
    process: [
      {
        title: "Name and tone",
        body: "Noon is the heat of the market. Harvest is the work. We kept both words quiet, stacked, and easy to stamp on tape.",
      },
      {
        title: "One room, one system",
        body: "Cream paper, garden green, one orange for price. The store board, the produce tape, and the weekly poster share the same grid so the shop never looks rewritten.",
      },
      {
        title: "Things that ship",
        body: "We designed for a printer in Mogbazar and a plotter for the fascia — not a brand book nobody would open.",
      },
    ],
    type: "A sturdy serif for the wordmark. A clean grotesque for weights, prices, and the weekly list.",
    voice: "Short, seasonal, no health claims. “This week’s mangoes.” Not “farm to table.”",
    photography:
      "Daylight, produce in the hand, paper and tape in frame. No stock leaves.",
    deliverables: [
      "Wordmark and type pairing",
      "Produce packing tape",
      "Store fascia and sandwich board",
      "Weekly offer poster grid",
      "Price cards and bag stamp",
      "Staff apron mark",
    ],
    applications: [
      {
        title: "Packing",
        body: "Cream bags with garden-green tape. The mark sits on the seal so the kitchen counter still says Noon Harvest after the walk home.",
      },
      {
        title: "Store",
        body: "One fascia, one sandwich board, one offer grid. Friday prices change. The room does not.",
      },
      {
        title: "Offers",
        body: "A two-colour poster the owner can update without a designer. Orange only for the price.",
      },
    ],
    outcomes: [
      "The shop no longer borrows the same leaf mark as the stall next door.",
      "Weekly offers print from one file. The glass stays clean.",
      "Packing is now part of the brand, not a leftover supermarket bag.",
    ],
    quote: {
      text: "People photograph the tape. That never happened with the old crates.",
      name: "Naima Chowdhury",
      role: "Owner",
    },
  },
  {
    slug: "rupsha-house",
    name: "Rupsha House",
    category: "Boutique hotel",
    year: "2025",
    image: "/brands/rupsha.jpg",
    colors: [
      { hex: "#1C2A3A", name: "River navy", use: "Wordmark and night" },
      { hex: "#C9A36A", name: "Brass", use: "Monogram and keys" },
      { hex: "#F4EFE6", name: "Warm paper", use: "Stationery and menus" },
    ],
    summary: "A riverside stay with stationery that feels like the rooms.",
    client: "Family hotel",
    location: "Khulna",
    duration: "8 weeks",
    scope: "Identity, guest journey, booking page",
    brief:
      "The house sits on the Rupsha. The rooms are quiet. Online, it looked like a Facebook guesthouse — three photos, a phone number, no reason to book a night instead of a lodge down the road.",
    problem: [
      "Guests could not tell if they were arriving at a hotel, a homestay, or a rest house.",
      "Key cards, menus, and the guest book were leftover print from three different jobs.",
      "The booking page was a WhatsApp button on a blurry river photo.",
    ],
    audience:
      "Dhaka couples and small families who want a river night without a resort programme. They book on a phone. They notice paper.",
    process: [
      {
        title: "A house, not a lodge",
        body: "The name already had the river. We added a small brass monogram that works on a key card and on the gate.",
      },
      {
        title: "The stay in paper",
        body: "Check-in card, room directory, breakfast card, and a guest book in the same navy and warm stock. Nothing laminated.",
      },
      {
        title: "A page that books",
        body: "One page: four rooms, the river, a rate, a date. No slider. The phone number is still there for the family who prefer to call.",
      },
    ],
    type: "A high-contrast serif for the house name. A humanist sans for rooms, rates, and the directory.",
    voice: "Measured. Time of day, not amenities lists. “The river at five.”",
    photography:
      "Early light, brass, linen, the water. People small in the frame.",
    deliverables: [
      "Identity and brass monogram",
      "Key cards and sleeve",
      "Guest book and check-in card",
      "Room directory",
      "Breakfast and bar cards",
      "Booking one-pager",
    ],
    applications: [
      {
        title: "Arrival",
        body: "Gate mark, key sleeve, and a one-line welcome. The first object in the hand matches the room.",
      },
      {
        title: "In-room",
        body: "Directory, breakfast card, and a note for the boat. Same paper, same navy, no plastic tent cards.",
      },
      {
        title: "Booking",
        body: "A single page the family can send as a link. Four rooms. A rate. A date.",
      },
    ],
    outcomes: [
      "The house now reads as one stay from the gate to the guest book.",
      "The booking page replaced a thread of Facebook comments.",
      "Staff reprint cards from one set of files, not three printers.",
    ],
    quote: {
      text: "Guests mention the key card before they mention the view. That is new.",
      name: "Farid Hossain",
      role: "Family manager",
    },
  },
  {
    slug: "kite-pay",
    name: "Kite Pay",
    category: "Fintech",
    year: "2024",
    image: "/brands/kite-pay.jpg",
    colors: [
      { hex: "#0F172A", name: "Ink", use: "App chrome and type" },
      { hex: "#EA6A1A", name: "Action", use: "Send, confirm, pay" },
      { hex: "#FFFFFF", name: "Clear", use: "Screens and cards" },
    ],
    summary: "A payments app that looks trustworthy on a small screen.",
    client: "Early-stage wallet",
    location: "Dhaka",
    duration: "5 weeks",
    scope: "Mark, colour, launch screens, store kit",
    brief:
      "The product moved money. The screens looked like a spreadsheet export. Test users would not add a card. Trust was a design problem, not a backend one.",
    problem: [
      "The icon was a generic wallet glyph in three blues.",
      "Every button was a different orange. Nothing was the action.",
      "Store listing screenshots were raw UI with debug labels still on.",
    ],
    audience:
      "Young professionals in Dhaka sending money to family and paying small vendors. They will not read a white paper. They will decide in the first three screens.",
    process: [
      {
        title: "A mark that sits in a grid",
        body: "A kite, not a wallet. It reads at 16 pixels. It does not look like a bank crest or a cartoon.",
      },
      {
        title: "One action colour",
        body: "Ink for structure. White for space. Orange only for send, confirm, and pay. If it is not an action, it is not orange.",
      },
      {
        title: "A kit the team can ship",
        body: "Launch screens, store shots, and a colour token list. The next build does not need us in the Figma file.",
      },
    ],
    type: "A geometric grotesque. Tabular figures for amounts. No display serif on a payments screen.",
    voice: "Plain verbs. Send, request, split. No “revolutionising payments.”",
    photography:
      "Hands, phones, a stall, a desk. The UI in daylight, not a fake 3D phone.",
    deliverables: [
      "App icon and wordmark",
      "Interface colour tokens",
      "Onboarding and launch screens",
      "Play Store and App Store kit",
      "Empty and error states",
      "Merchant sticker mark",
    ],
    applications: [
      {
        title: "Icon",
        body: "A kite that holds on a home screen full of banks. Orange as a small field, not a gradient.",
      },
      {
        title: "Send flow",
        body: "Amount, name, confirm. One orange button. The rest of the screen stays quiet.",
      },
      {
        title: "Store",
        body: "Three shots: send, split, paid. Real type sizes. No fake reviews on the screenshot.",
      },
    ],
    outcomes: [
      "Test users could name the action colour without being asked.",
      "Store shots no longer leaked internal labels.",
      "The team shipped a build with the kit and did not reopen the mark.",
    ],
    quote: {
      text: "People finally tap Send without asking if it is a test app.",
      name: "Rafi Karim",
      role: "Product lead",
    },
  },
  {
    slug: "bari-atelier",
    name: "Bari Atelier",
    category: "Home & furniture",
    year: "2024",
    image: "/brands/bari.jpg",
    colors: [
      { hex: "#EA6A1A", name: "House orange", use: "Mark, tags, reels" },
      { hex: "#1F2933", name: "Timber ink", use: "Type and drawings" },
      { hex: "#F6F1EA", name: "Plaster", use: "Showroom and paper" },
    ],
    summary: "Furniture with a pattern language you can spot across a room.",
    client: "Two-person workshop",
    location: "Mirpur, Dhaka",
    duration: "7 weeks",
    scope: "Identity, pattern, showroom, social",
    brief:
      "The chairs were good. The Instagram was a grey room and a caption. Nothing told a buyer the stool and the table came from the same house.",
    problem: [
      "Each piece photographed as a one-off. No repeating mark or motif.",
      "Hang tags were kraft with a Sharpie name.",
      "Reels used whatever song and whatever crop. The feed did not hold.",
    ],
    audience:
      "Apartment buyers in Dhaka who want one well-made piece, not a catalogue sofa. They find Bari on Instagram, then visit the workshop.",
    process: [
      {
        title: "A house motif",
        body: "A simple repeating line, taken from the chair rail. It works on a tag, a reel cover, and the showroom floor.",
      },
      {
        title: "Orange as the house",
        body: "Timber stays timber. Orange is the only invented colour — tags, tape, and the mark. Easy to reprint.",
      },
      {
        title: "A look for photos",
        body: "Plaster wall, one plant, daylight from the east window. Every piece is shot in the same room so the feed is a showroom.",
      },
    ],
    type: "A condensed grotesque for the name. Captions in a readable sans. Dimensions always in millimetres.",
    voice: "Material first. Teak, cane, plaster. No “lifestyle.”",
    photography:
      "East light, full piece, then a joint. Hands in the last frame.",
    deliverables: [
      "Wordmark and motif",
      "Hang tags and invoices",
      "Showroom look and floor tape",
      "Reel and post covers",
      "Care card",
      "Workshop sign",
    ],
    applications: [
      {
        title: "Tags",
        body: "Orange stock, timber ink, the motif as a stamp. The invoice matches the tag.",
      },
      {
        title: "Showroom",
        body: "The same plaster and orange tape that appear in the photographs. Visitors recognise the room from the phone.",
      },
      {
        title: "Feed",
        body: "Covers with the motif at a fixed crop. The song can change. The frame does not.",
      },
    ],
    outcomes: [
      "Stool, table, and lamp now read as one house.",
      "The feed looks like a room, not a dump of workshop photos.",
      "Tags and invoices reprint from the same two-colour job.",
    ],
    quote: {
      text: "People now ask for “the Bari orange stool.” They never asked by colour before.",
      name: "Lamia Rahman",
      role: "Maker",
    },
  },
  {
    slug: "saffron-kitchen",
    name: "Saffron Kitchen",
    category: "D2C pantry",
    year: "2025",
    image: "/brands/saffron.jpg",
    colors: [
      { hex: "#9A3412", name: "Chilli", use: "Wordmark and seals" },
      { hex: "#F59E0B", name: "Saffron", use: "Bands and gifts" },
      { hex: "#FFF7ED", name: "Kitchen paper", use: "Labels and cards" },
    ],
    summary: "Pantry goods that look worth a gift, not a refill.",
    client: "Spice and pickle maker",
    location: "Old Dhaka / nationwide ship",
    duration: "6 weeks",
    scope: "Labels, packing, gift box, recipe cards",
    brief:
      "The recipes were family. The jars were unmarked. Fine for the bazaar. Weak for a gift that has to survive a courier and still look like a kitchen, not a factory.",
    problem: [
      "Handwritten names on lids. No weight, no batch, no story.",
      "Courier packing hid the product. Unboxing was tape and newspaper.",
      "No system from a 200g jar to a three-jar gift box.",
    ],
    audience:
      "Dhaka buyers sending a pantry gift, and a smaller set of people restocking chilli and achar for their own shelf.",
    process: [
      {
        title: "A label that scales",
        body: "One layout: name, heat, weight, batch. 200g jar, 500g tin, recipe card. The type does not rebuild each time.",
      },
      {
        title: "The box is the ad",
        body: "Warm paper, chilli seal, saffron band. You see the brand before you see a jar. The courier does not get to design the first impression.",
      },
      {
        title: "A card that cooks",
        body: "One recipe per insert. No QR maze. The card stays in the drawer.",
      },
    ],
    type: "A warm serif for the kitchen name. A sturdy sans for heat and weight. Batch numbers in tabular figures.",
    voice: "Kitchen, not gourmet. “This week’s pickle.” Origin on the back, not a manifesto.",
    photography:
      "Jars on a table, oil, a spoon. Hands, not a seamless sweep.",
    deliverables: [
      "Jar and tin labels",
      "Lid seals",
      "Packing tape",
      "Gift box wrap and band",
      "Recipe cards",
      "Shipper sticker",
    ],
    applications: [
      {
        title: "Jars",
        body: "Kitchen paper labels, chilli wordmark, saffron band at the lid. Heat marked in dots, not a paragraph.",
      },
      {
        title: "Gift box",
        body: "Wrap, band, and a card. Three jars sit in a tray so nothing rolls in the van.",
      },
      {
        title: "Shipper",
        body: "A sticker that still reads after a day in a courier bag. The box inside stays clean.",
      },
    ],
    outcomes: [
      "The same label file now covers jar, tin, and card.",
      "Gifts leave the kitchen looking finished, not packed in newspaper.",
      "Restock buyers can find heat and weight without opening the lid.",
    ],
    quote: {
      text: "We stopped apologising for the packing. People keep the box.",
      name: "Sajid Ali",
      role: "Maker",
    },
  },
  {
    slug: "lumen-studio",
    name: "Lumen Studio",
    category: "Architecture",
    year: "2024",
    image: "/brands/lumen.jpg",
    colors: [
      { hex: "#E7E0D6", name: "Stone", use: "Boards and covers" },
      { hex: "#B45309", name: "Restraint gold", use: "Foil and rules" },
      { hex: "#292524", name: "Ink", use: "Drawings and type" },
    ],
    summary: "An architecture practice with a desk that matches the buildings.",
    client: "Banani practice",
    location: "Dhaka",
    duration: "9 weeks",
    scope: "Stationery, site, proposals, project covers",
    brief:
      "The projects were careful. The Word logo and the pitch deck were not. Clients walked into a site that felt cheaper than the drawings.",
    problem: [
      "A stretched wordmark in a free font, used at three different weights.",
      "Proposal decks rebuilt from last year’s file, with leftover project names.",
      "Site boards that looked like contractor hoarding.",
    ],
    audience:
      "House clients and a few small commercial jobs. They judge the desk, the PDF, and the board on the gate before they judge a section.",
    process: [
      {
        title: "A mark that draws",
        body: "A light cut, not a logo lockup with a building icon. It works foil-stamped and as a simple line on a site board.",
      },
      {
        title: "Paper like the work",
        body: "Stone stock, ink, a little gold. Letters, drawing titles, and the proposal cover belong to the same room as the models.",
      },
      {
        title: "A deck that does not drift",
        body: "A master file: cover, contents, two project pages, fees. New jobs duplicate. They do not redesign.",
      },
    ],
    type: "A sharp grotesque for the studio name. Captions in a slightly wider cut. Drawing titles always the same size.",
    voice: "Light, plan, room. No “creating spaces.” Materials named plainly.",
    photography:
      "Models, drawings, a window. Gold as a thin rule, not a texture overlay.",
    deliverables: [
      "Wordmark and drawing title block",
      "Letterhead and cards",
      "Proposal deck master",
      "Project covers and spines",
      "Site boards",
      "Email signature and PDF preset",
    ],
    applications: [
      {
        title: "Desk",
        body: "Letter, card, and a drawing stamp. Gold only on the card. Everyday print stays ink on stone.",
      },
      {
        title: "Proposal",
        body: "A cover that can sit on a table next to a material sample. Fees on the last page, not hidden in a paragraph.",
      },
      {
        title: "Site",
        body: "A board that looks like the studio, not the contractor. Name, architect, and a small plan.",
      },
    ],
    outcomes: [
      "Pitches no longer start with an apology for the deck.",
      "Site boards match the stationery instead of the hoarding next door.",
      "New projects open from one master, not last year’s leftover file.",
    ],
    quote: {
      text: "Clients now ask who did our paper. That used to be a question we hoped they would not ask.",
      name: "Ishrat Khan",
      role: "Principal",
    },
  },
];

export function getStudioBrand(slug: string) {
  return studioBrands.find((item) => item.slug === slug);
}

export function brandCategories() {
  return [...new Set(studioBrands.map((item) => item.category))];
}

export function nextStudioBrand(slug: string) {
  const index = studioBrands.findIndex((item) => item.slug === slug);
  if (index < 0) return undefined;
  return studioBrands[(index + 1) % studioBrands.length];
}
