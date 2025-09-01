// sRGB -> linear
function srgbToLinear(c) {
  c = c / 255;
  return c <= 0.04045 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4);
}

// Linear -> sRGB for preview
function linearToSrgb(c) {
  c = Math.max(0, Math.min(1, c));
  return c <= 0.0031308 ? c*12.92 : 1.055*Math.pow(c, 1/2.4)-0.055;
}

// sRGB hex -> linear RGB
function hexToLinearRGB(hex) {
  let r = srgbToLinear(parseInt(hex.slice(1,3),16));
  let g = srgbToLinear(parseInt(hex.slice(3,5),16));
  let b = srgbToLinear(parseInt(hex.slice(5,7),16));
  return [r,g,b];
}

// Linear RGB -> ACEScg
function linearRGBtoACEScg([r,g,b]) {
  return [
    0.6130*r + 0.3390*g + 0.0480*b,
    0.0700*r + 0.9160*g + 0.0140*b,
    0.0190*r + 0.0660*g + 0.9150*b
  ];
}

// ACEScg -> display sRGB (for preview)
function acescctToDisplay(rgb) {
  // simplified gamma map for ACEScct to sRGB preview
  return rgb.map(c => linearToSrgb(c));
}

// RGB 0-1 -> hex
function rgbToHex(rgb) {
  return "#" + rgb.map(c => Math.round(Math.max(0,Math.min(1,c))*255).toString(16).padStart(2,'0')).join('');
}

// Convert and update UI
document.getElementById('convertBtn').onclick = () => {
  let srgbHex = document.getElementById('srgbHex').value;
  let linearRGB = hexToLinearRGB(srgbHex);
  let acesRGB = linearRGBtoACEScg(linearRGB);

  // Preview color using ACES->sRGB
  let previewRGB = acescctToDisplay(acesRGB);
  document.getElementById('acesBox').style.backgroundColor = rgbToHex(previewRGB);

  document.getElementById('srgbBox').style.backgroundColor = srgbHex;

  // Optional: scaled ACEScct hex (not exact display color)
  document.getElementById('acesHex').value = rgbToHex(acesRGB.map(c=>Math.min(c,1)));
}
