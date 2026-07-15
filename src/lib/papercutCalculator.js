// Port dari public/pixelso-calculator-core.js milik landing page lama (pixelso_nodejs) -
// kalkulator hasil potong kertas/papercut yang sempat hilang saat storefront ditulis ulang.
// Menghitung berapa potongan (ukuran hasil jadi) yang muat dari satu lembar bahan, mencoba
// orientasi normal maupun diputar 90 derajat, lalu pakai yang hasilnya lebih banyak.

function number(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function fitCount(available, piece, gap) {
  const safeAvailable = number(available);
  const safePiece = number(piece);
  const safeGap = Math.max(0, number(gap));
  if (safeAvailable <= 0 || safePiece <= 0) return 0;
  return Math.max(0, Math.floor((safeAvailable + safeGap) / (safePiece + safeGap)));
}

function calculateLayout(input, rotated) {
  const sheetW = Math.max(0, number(input.sheetW));
  const sheetH = Math.max(0, number(input.sheetH));
  const pieceW = Math.max(0, number(input.pieceW));
  const pieceH = Math.max(0, number(input.pieceH));
  const margin = Math.max(0, number(input.margin));
  const gap = Math.max(0, number(input.gap));
  const pw = rotated ? pieceH : pieceW;
  const ph = rotated ? pieceW : pieceH;
  const usableW = sheetW - 2 * margin;
  const usableH = sheetH - 2 * margin;
  const cols = fitCount(usableW, pw, gap);
  const rows = fitCount(usableH, ph, gap);
  const count = cols * rows;
  const usedArea = count * pieceW * pieceH;
  const sheetArea = sheetW * sheetH;
  return {
    rotated,
    cols,
    rows,
    count,
    efficiency: sheetArea > 0 ? (usedArea / sheetArea) * 100 : 0,
  };
}

export function calculatePaperCut(input) {
  const quantity = Math.max(0, Math.ceil(number(input.quantity)));
  const normal = calculateLayout(input, false);
  const rotated = calculateLayout(input, true);
  const best = rotated.count > normal.count ? rotated : normal;
  const sheetsNeeded = best.count > 0 ? Math.ceil(quantity / best.count) : 0;
  return {
    normal,
    rotated,
    best,
    piecesPerSheet: best.count,
    sheetsNeeded,
    orientation: best.rotated ? 'rotated' : 'normal',
  };
}

export const SHEET_PRESETS = [
  { label: 'A4', w: 21, h: 29.7 },
  { label: 'A3', w: 29.7, h: 42 },
  { label: 'A3+', w: 32, h: 47 },
  { label: 'Plano 65×100', w: 65, h: 100 },
  { label: 'Plano 79×109', w: 79, h: 109 },
];
