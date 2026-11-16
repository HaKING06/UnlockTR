export const modOptions = [
  ["special", "Özel yama", "Oyuna özgü içerik veya düzenleme"],
  [
    "incest",
    "Ensest yaması · 18+",
    "Yetişkin tema / aile diyalogu düzenlemesi",
  ],
  [
    "gallery_unlock",
    "Galeri kilidi açma",
    "Galeri ve hatıra içeriklerine erişim",
  ],
  [
    "character_names",
    "Karakter / ilişki isimleri",
    "İsim ve ilişki hitaplarını düzenleme · 18+",
  ],
  [
    "walkthrough",
    "Rehber / seçim desteği",
    "Oyun içi seçim veya ilerleme rehberi",
  ],
  [
    "quality_of_life",
    "Oynanış kolaylığı",
    "Tekrar eden işlemler ve kullanım iyileştirmeleri",
  ],
  [
    "interface",
    "Arayüz yaması",
    "Yazı tipi, okunabilirlik veya menü düzenlemesi",
  ],
  ["other", "Diğer", "Açıklamada belirtilen farklı bir çalışma"],
];
export const modLabel = (key) =>
  modOptions.find(([v]) => v === key)?.[1] || key;
