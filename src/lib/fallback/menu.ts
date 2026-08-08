import type { MenuCategory, MenuItem, MenuSettings } from "@/lib/types";

export const fallbackMenuCategories: MenuCategory[] = [
  { _id: "cat-kalte-vorspeisen", title: "Kalte Vorspeisen", slug: "kalte-vorspeisen", order: 1 },
  { _id: "cat-warme-vorspeisen", title: "Warme Vorspeisen", slug: "warme-vorspeisen", order: 2 },
  { _id: "cat-doenerspeisen", title: "Dönerspeisen", slug: "doenerspeisen", order: 3, note: "Kalb- oder Geflügelfleisch" },
  { _id: "cat-kleiner-hunger", title: "Für den kleinen Hunger", slug: "kleiner-hunger", order: 4, note: "Alle Gerichte mit Pommes oder Reis und Zaziki" },
  { _id: "cat-backofen", title: "Aus dem Backofen", slug: "backofen", order: 5, note: "Mit Tomatensauce und Käse überbacken, mit Pommes oder Reis und einem kleinen gemischten Salat" },
  { _id: "cat-grillspezialitaeten", title: "Grillspezialitäten", slug: "grillspezialitaeten", order: 6, note: "Alle Gerichte mit Pommes oder Reis und einem gemischten Salat" },
  { _id: "cat-grillplatten", title: "Grillplatten", slug: "grillplatten", order: 7, note: "Alle Gerichte mit Pommes oder Reis, Döner, Zaziki, kleinem Lahmacun und einem gemischten Salat" },
  { _id: "cat-ueberbackenes", title: "Überbackenes", slug: "ueberbackenes", order: 8, note: "Mit Rahmsauce und Käse überbacken, mit Pommes oder Reis und einem gemischten Salat" },
  { _id: "cat-pizzen", title: "Pizzen", slug: "pizzen", order: 9, meta: "28 cm", note: "Alle Pizzen mit Tomatensauce und Käse belegt" },
  { _id: "cat-rollo", title: "Rollo", slug: "rollo", order: 10 },
  { _id: "cat-pasta", title: "Spaghetti & Penne", slug: "pasta", order: 11 },
  { _id: "cat-beilagen", title: "Beilagen", slug: "beilagen", order: 12 },
  { _id: "cat-getraenke", title: "Getränke", slug: "getraenke", order: 13 },
];

let n = 0;
const item = (
  categorySlug: string,
  name: string,
  price: number,
  opts: Partial<MenuItem> = {}
): MenuItem => ({
  _id: `item-${++n}`,
  name,
  price,
  available: true,
  category: { slug: categorySlug },
  ...opts,
});

export const fallbackMenuItems: MenuItem[] = [
  // Kalte Vorspeisen
  item("kalte-vorspeisen", "Gemischter Salat", 7.0, { number: "1", description: "mit Dressing", allergenNumbers: [5, 20] }),
  item("kalte-vorspeisen", "Krautsalat", 4.0, { number: "2", description: "mit Dressing", allergenNumbers: [20] }),
  item("kalte-vorspeisen", "Bauernsalat", 8.5, { number: "3", description: "Weißkäse, Krautsalat, Eisbergsalat, Tomaten, Zwiebeln, Oliven und Brot", allergenNumbers: [5, 19, 20] }),
  item("kalte-vorspeisen", "Hirtensalat", 8.0, { number: "4", description: "Weißkäse, Tomaten, Gurken, Peperoni, Zwiebeln, Oliven und Brot", allergenNumbers: [5, 19] }),
  item("kalte-vorspeisen", "Großer gemischter Salat", 9.5, { number: "5", description: "Weißkäse, Eisbergsalat, Dalmadaki, Zaziki, Krautsalat, Tomaten, Gurken, Joghurtdressing, Peperoni und Oliven", allergenNumbers: [5, 20] }),
  item("kalte-vorspeisen", "Käsesalat", 6.5, { number: "6", description: "Weißkäse, Paprika, Oliven und Brot", allergenNumbers: [19] }),
  item("kalte-vorspeisen", "Tomatensalat", 6.5, { number: "7", description: "Tomaten, Gurken, Zwiebeln, Oliven, Essig" }),
  item("kalte-vorspeisen", "Dalmadaki", 6.5, { number: "8", description: "gefüllte Weinblätter mit Zaziki", allergenNumbers: [20] }),
  item("kalte-vorspeisen", "Weißkäse in Salzlake", 7.0, { number: "9", description: "mit Zwiebeln, Tomaten, Gurken, Peperoni und Brot", allergenNumbers: [5, 8, 19, 20] }),
  item("kalte-vorspeisen", "Peperoni", 5.0, { number: "10", allergenNumbers: [5] }),
  item("kalte-vorspeisen", "Oliven", 4.0, { number: "11" }),
  item("kalte-vorspeisen", "Zaziki", 5.0, { number: "12", allergenNumbers: [20] }),

  // Warme Vorspeisen
  item("warme-vorspeisen", "Vorspeisenteller", 14.0, { number: "13", description: "mit Auberginen, Paprika, dicke Bohnen, gebackener Schafskäse, Salat, Zaziki und Brot", allergenNumbers: [19, 20] }),
  item("warme-vorspeisen", "Gebackener Schafskäse", 9.0, { number: "14", description: "in Salzlake", allergenNumbers: [20] }),
  item("warme-vorspeisen", "Gegrillte Peperoni", 6.5, { number: "15", description: "in Knoblauchöl, mit Brot", allergenNumbers: [5, 19] }),
  item("warme-vorspeisen", "Dicke Bohnen", 6.0, { number: "16", description: "mit Tomatenöl und Brot", allergenNumbers: [19] }),

  // Dönerspeisen
  item("doenerspeisen", "Döner Tasche", 8.0, { number: "20", description: "mit Zwiebeln, Krautsalat und scharfer Sauce", allergenNumbers: [18, 19] }),
  item("doenerspeisen", "Döner Tasche", 8.0, { number: "21", description: "mit Zwiebeln, Krautsalat und Zaziki", allergenNumbers: [18, 19, 20] }),
  item("doenerspeisen", "Döner Teller", 15.0, { number: "22", description: "Pommes oder Reis, Zwiebeln, gemischter Salat und scharfer Sauce", allergenNumbers: [17, 18] }),
  item("doenerspeisen", "Döner Teller", 15.5, { number: "23", description: "Pommes oder Reis, Tomatensauce und gemischter Salat", allergenNumbers: [17, 18] }),
  item("doenerspeisen", "Döner Teller", 16.5, { number: "24", description: "Pommes oder Reis, Zaziki und gemischter Salat", allergenNumbers: [17, 18, 20] }),
  item("doenerspeisen", "Döner Teller", 17.5, { number: "25", description: "Pommes oder Reis, Tomatensauce, Fladenbrot, Zaziki und gemischter Salat", isBestseller: true, allergenNumbers: [17, 18, 19, 20] }),

  // Kleiner Hunger
  item("kleiner-hunger", "Döner Teller", 12.5, { number: "90", description: "mit Zwiebeln", allergenNumbers: [18] }),
  item("kleiner-hunger", "Lammspieß", 14.0, { number: "91", description: "1 Fleischspieß und Zaziki", allergenNumbers: [20] }),
  item("kleiner-hunger", "Köfte", 13.0, { number: "92", description: "2 Mettklöße und Zaziki", allergenNumbers: [20] }),
  item("kleiner-hunger", "Lammkoteletts", 14.0, { number: "93", description: "3 Stück mit Zaziki", allergenNumbers: [20] }),

  // Aus dem Backofen
  item("backofen", "Döner", 17.5, { number: "26", description: "mit dicken Bohnen", allergenNumbers: [18] }),
  item("backofen", "Döner", 17.5, { number: "27", description: "mit Auberginen", allergenNumbers: [18] }),
  item("backofen", "Döner", 17.5, { number: "28", description: "mit grünen Bohnen", allergenNumbers: [18] }),
  item("backofen", "Döner", 17.5, { number: "29", description: "mit Champignons", allergenNumbers: [3, 18] }),

  // Grillspezialitäten
  item("grillspezialitaeten", "Putenspieß", 19.0, { number: "30" }),
  item("grillspezialitaeten", "Köfte", 19.0, { number: "31", description: "3 Mettklöße" }),
  item("grillspezialitaeten", "Lammkoteletts", 22.0, { number: "32", description: "5 Stück" }),
  item("grillspezialitaeten", "Lammspieß", 19.5, { number: "33", description: "2 Fleischspieße" }),
  item("grillspezialitaeten", "Lammspieß", 20.0, { number: "34", description: "2 Fleischspieße mit Zaziki", allergenNumbers: [20] }),
  item("grillspezialitaeten", "Hähnchenspieß", 18.0, { number: "35", description: "2 Fleischspieße", isBestseller: true }),

  // Grillplatten
  item("grillplatten", "Grillplatte", 24.0, { number: "36", description: "1 Lammspieß, 1 Hähnchenspieß, 1 Köfte" }),
  item("grillplatten", "Gemischter Grillteller", 25.0, { number: "37", description: "1 Lammspieß, 1 Köfte, 2 Lammkoteletts", isBestseller: true }),
  item("grillplatten", "Kochplatte", 27.0, { number: "38", description: "1 Lammkotelett, 1 Hähnchenspieß, 1 Köfte und 1 Lammspieß" }),

  // Überbackenes
  item("ueberbackenes", "Hähnchenschnitzel paniert", 17.0, { number: "40" }),
  item("ueberbackenes", "Karnıyarık", 15.0, { number: "41", description: "Überbackene Auberginen gefüllt mit Hackfleisch" }),
  item("ueberbackenes", "Döner überbacken", 17.0, { number: "42", allergenNumbers: [18] }),
  item("ueberbackenes", "Putenspieß", 18.5, { number: "43" }),
  item("ueberbackenes", "Köfte", 18.5, { number: "44", description: "3 Mettklöße" }),
  item("ueberbackenes", "Lammspieß", 22.0, { number: "45", description: "2 Fleischspieße" }),
  item("ueberbackenes", "Putenschnitzel paniert", 17.0, { number: "46" }),
  item("ueberbackenes", "Geflügel Döner überbacken", 17.0, { number: "47", allergenNumbers: [18] }),

  // Pizzen
  item("pizzen", "Pizza Sucuk", 10.0, { number: "48", description: "mit Knoblauchwurst" }),
  item("pizzen", "Pizza Margeritha", 9.5, { number: "49" }),
  item("pizzen", "Pizza Salami", 10.0, { number: "50", allergenNumbers: [2] }),
  item("pizzen", "Pizza Tonno", 10.0, { number: "51", description: "mit Thunfisch und Zwiebeln", allergenNumbers: [7] }),
  item("pizzen", "Pizza Schinken", 10.0, { number: "52", allergenNumbers: [1] }),
  item("pizzen", "Pizza Döner", 10.0, { number: "53", description: "mit Peperoni und Zwiebeln", allergenNumbers: [5, 18] }),
  item("pizzen", "Pizza Hawaii", 10.0, { number: "54", description: "mit Ananas und Schinken", allergenNumbers: [1] }),
  item("pizzen", "Pizza Vegetarisch", 10.5, { number: "57", isVegetarian: true }),
  item("pizzen", "Pizza Funghi", 9.5, { number: "58", description: "mit Champignons", allergenNumbers: [3] }),
  item("pizzen", "Pizza Spezial", 10.5, { number: "59", description: "mit Salami, Schinken, Pilzen und Paprika", allergenNumbers: [1, 2, 3] }),
  item("pizzen", "Lahmacun", 7.0, { number: "55", description: "türkische Pizza — mit Salat und Zaziki", allergenNumbers: [20] }),
  item("pizzen", "Lahmacun", 8.0, { number: "56", description: "mit Dönerfleisch, Salat und Zaziki", isBestseller: true, allergenNumbers: [18, 20] }),

  // Rollo
  item("rollo", "Rollo Arabic", 10.0, { number: "60", description: "Döner, Tomaten, Käse, Zwiebeln, Peperoni", allergenNumbers: [5, 8, 18, 19] }),
  item("rollo", "Rollo Thunfisch", 10.0, { number: "61", description: "Tomaten, Käse, Zwiebeln, Peperoni", allergenNumbers: [5, 8, 19] }),
  item("rollo", "Rollo Schinken", 10.0, { number: "62", description: "Tomaten, Käse, Peperoni", allergenNumbers: [5, 8, 19] }),
  item("rollo", "Rollo Spinat", 10.0, { number: "63", description: "mit Döner und Gemüse", allergenNumbers: [18, 19] }),
  item("rollo", "Rollo Vegetarisch", 10.0, { number: "64", isVegetarian: true, allergenNumbers: [19] }),
  item("rollo", "Rollo Dürüm", 8.5, { number: "65", description: "mit Döner, Zwiebeln, Krautsalat, Eisbergsalat und Zaziki", isBestseller: true, allergenNumbers: [18, 19, 20] }),
  item("rollo", "Zigarrenbörek", 0.6, { number: "66", description: "vegetarisch — pro Stück", isVegetarian: true, allergenNumbers: [19] }),

  // Spaghetti & Penne
  item("pasta", "Spaghetti Bolognese", 12.0, { number: "70" }),
  item("pasta", "Spaghetti Rahmsauce", 11.5, { number: "71", description: "mit Butterkäse", allergenNumbers: [8, 20] }),
  item("pasta", "Spaghetti Tomatensauce", 12.0, { number: "72", description: "mit Weißkäse", allergenNumbers: [8, 20] }),
  item("pasta", "Spaghetti mit Dönerfleisch", 12.0, { number: "73", description: "& Rahmsauce", allergenNumbers: [18] }),
  item("pasta", "Penne mit Dönerfleisch", 12.0, { number: "74", description: "& Rahmsauce", allergenNumbers: [18] }),
  item("pasta", "Penne Rahmsauce", 12.0, { number: "75", description: "mit Butterkäse", allergenNumbers: [8, 20] }),

  // Beilagen
  item("beilagen", "Pommes Frites", 3.5, { number: "97", allergenNumbers: [17] }),
  item("beilagen", "Kroketten", 3.5, { number: "98", description: "6 Stück" }),
  item("beilagen", "Reis", 3.0, { number: "99" }),
  item("beilagen", "Ketchup oder Majonaise", 0.25, { number: "·" }),

  // Getränke
  item("getraenke", "Cola", 2.5, { number: "·", description: "Dose 0,3 l", allergenNumbers: [13] }),
  item("getraenke", "Cola Zero", 2.5, { number: "·", description: "Dose 0,3 l", allergenNumbers: [14] }),
  item("getraenke", "Cola light", 2.5, { number: "·", description: "Dose 0,3 l", allergenNumbers: [13] }),
  item("getraenke", "Fanta", 2.5, { number: "·", description: "Dose 0,3 l", allergenNumbers: [14] }),
  item("getraenke", "Sprite", 2.5, { number: "·", description: "Dose 0,3 l", allergenNumbers: [15] }),
  item("getraenke", "Mezzomix", 2.5, { number: "·", description: "Dose 0,3 l", allergenNumbers: [14] }),
  item("getraenke", "Ayran", 2.0, { number: "·", description: "0,2 l" }),
  item("getraenke", "Krombacher Bier", 2.5, { number: "·", description: "Flasche 0,3 l", allergenNumbers: [21] }),
  item("getraenke", "Efes Bier", 2.5, { number: "·", description: "Flasche 0,3 l", allergenNumbers: [21] }),
  item("getraenke", "Uludağ", 2.5, { number: "·", description: "0,3 l" }),
];

export const fallbackMenuSettings: MenuSettings = {
  standDatum: "05/2026",
  footerNote: "Alle Preise in Euro inkl. gesetzlicher MwSt. Preisänderungen und Irrtümer vorbehalten. Abbildungen sind nicht immer identisch.",
  allergenLegend: [
    { number: 1, text: "Schinken = Formfleisch aus Vorderschinken zusammengefügt: mit Konservierungsstoffen, Geschmacksverstärker, Antioxidationsmittel" },
    { number: 2, text: "Salami = konserviert, Antioxidationsmittel, Nitritpökelsalz" },
    { number: 3, text: "Pilze, Champignons = Säuerungsmittel (Zitronensäure & Ascorbinsäure)" },
    { number: 4, text: "Oliven = geschwärzt" },
    { number: 5, text: "Peperoni = Säuerungsmittel, Konservierungsstoffe E221, Antioxidationsmittel E220" },
    { number: 6, text: "Fleisch = Frischfleisch" },
    { number: 7, text: "Thunfisch = Nitritpökelsalz" },
    { number: 8, text: "Käse = Farbstoffe, Konservierungsstoffe, Milch, Milcherzeugnisse / Lactose" },
    { number: 9, text: "Pute / Hähnchen = Antioxidationsmittel, Nitritpökelsalz, Ascorbinsäure" },
    { number: 10, text: "Sauce = Säuerungsmittel, Farbstoff Carotin" },
    { number: 11, text: "Knoblauchsauce = Süßungsmittel, Geschmacksverstärker" },
    { number: 12, text: "Tomatenketchup = Süßungsmittel" },
    { number: 13, text: "Coca-Cola, Coca-Cola light = koffeinhaltig, Farbstoff" },
    { number: 14, text: "Fanta, Mezzomix = koffeinhaltig, Farbstoff, Antioxidationsmittel E150D" },
    { number: 15, text: "Sprite = mit Säuerungsmittel" },
    { number: 16, text: "Red Bull = koffeinhaltig, Taurin" },
    { number: 17, text: "Pommes = Pflanzenöl aus gentechnisch verändertem Soja" },
    { number: 18, text: "Döner = Geschmacksverstärker E621" },
    { number: 19, text: "Glutenhaltiges Getreide" },
    { number: 20, text: "Milch- und Milcherzeugnisse / Lactose" },
    { number: 21, text: "Alkoholhaltiges Getränk" },
  ],
};
