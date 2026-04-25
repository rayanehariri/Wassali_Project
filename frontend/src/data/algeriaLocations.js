import wilayaDataset from "@dzcode-io/leblad/data/WilayaList.json";

const baseWilayas = [
  { code: "01", name: "Adrar" },
  { code: "02", name: "Chlef" },
  { code: "03", name: "Laghouat" },
  { code: "04", name: "Oum El Bouaghi" },
  { code: "05", name: "Batna" },
  { code: "06", name: "Bejaia" },
  { code: "07", name: "Biskra" },
  { code: "08", name: "Bechar" },
  { code: "09", name: "Blida" },
  { code: "10", name: "Bouira" },
  { code: "11", name: "Tamanrasset" },
  { code: "12", name: "Tebessa" },
  { code: "13", name: "Tlemcen" },
  { code: "14", name: "Tiaret" },
  { code: "15", name: "Tizi Ouzou" },
  { code: "16", name: "Alger" },
  { code: "17", name: "Djelfa" },
  { code: "18", name: "Jijel" },
  { code: "19", name: "Setif" },
  { code: "20", name: "Saida" },
  { code: "21", name: "Skikda" },
  { code: "22", name: "Sidi Bel Abbes" },
  { code: "23", name: "Annaba" },
  { code: "24", name: "Guelma" },
  { code: "25", name: "Constantine" },
  { code: "26", name: "Medea" },
  { code: "27", name: "Mostaganem" },
  { code: "28", name: "M'Sila" },
  { code: "29", name: "Mascara" },
  { code: "30", name: "Ouargla" },
  { code: "31", name: "Oran" },
  { code: "32", name: "El Bayadh" },
  { code: "33", name: "Illizi" },
  { code: "34", name: "Bordj Bou Arreridj" },
  { code: "35", name: "Boumerdes" },
  { code: "36", name: "El Tarf" },
  { code: "37", name: "Tindouf" },
  { code: "38", name: "Tissemsilt" },
  { code: "39", name: "El Oued" },
  { code: "40", name: "Khenchela" },
  { code: "41", name: "Souk Ahras" },
  { code: "42", name: "Tipaza" },
  { code: "43", name: "Mila" },
  { code: "44", name: "Ain Defla" },
  { code: "45", name: "Naama" },
  { code: "46", name: "Ain Temouchent" },
  { code: "47", name: "Ghardaia" },
  { code: "48", name: "Relizane" },
  { code: "49", name: "Timimoun" },
  { code: "50", name: "Bordj Badji Mokhtar" },
  { code: "51", name: "Ouled Djellal" },
  { code: "52", name: "Beni Abbes" },
  { code: "53", name: "In Salah" },
  { code: "54", name: "In Guezzam" },
  { code: "55", name: "Touggourt" },
  { code: "56", name: "Djanet" },
  { code: "57", name: "El M'Ghair" },
  { code: "58", name: "El Meniaa" },
  { code: "59", name: "Aflou" },
  { code: "60", name: "Barika" },
  { code: "61", name: "Ksar Chellala" },
  { code: "62", name: "Messaad" },
  { code: "63", name: "Ain Oussera" },
  { code: "64", name: "Boussaada" },
  { code: "65", name: "El Abiodh Sidi Cheikh" },
  { code: "66", name: "El Kantara" },
  { code: "67", name: "Bir El Ater" },
  { code: "68", name: "Ksar El Boukhari" },
  { code: "69", name: "El Aricha" },
];

export const wilayas = baseWilayas;

const normalize = (v) =>
  String(v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9']/g, "")
    .toLowerCase();

const knownByNormalized = Object.fromEntries(baseWilayas.map((w) => [normalize(w.name), w.name]));
const communesMap = {};
for (const w of baseWilayas) communesMap[w.name] = [];

try {
  for (const w of wilayaDataset || []) {
    const targetName =
      knownByNormalized[normalize(w?.name)] ||
      knownByNormalized[normalize(w?.name_en)] ||
      knownByNormalized[normalize(w?.name_ber)] ||
      null;
    if (!targetName) continue;
    const list = (w?.dairats || []).flatMap((d) => d?.baladyiats || []);
    communesMap[targetName] = list
      .map((c) => c?.name || c?.name_en || c?.name_ar)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }
} catch {
  // Keep empty arrays on failure.
}

export const communesByWilaya = communesMap;
