// sRGB -> linear
function srgbToLinear(c) {
  c = c / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c+0.055)/1.055, 2.4);
}

// linear -> sRGB for display
function linearToSrgb(c) {
  c = Math.max(0, Math.min(1, c));
  return c <= 0.0031308 ? 12.92*c : 1.055*Math.pow(c, 1/2.4)-0.055;
}

// sRGB hex -> linear RGB
function hexToLinearRGB(hex) {
  let r = srgbToLinear(parseInt(hex.slice(1,3),16));
  let g = srgbToLinear(parseInt(hex.slice(3,5),16));
  let b = srgbToLinear(parseInt(hex.slice(5,7),16));
  return [r,g,b];
}

// Linear RGB -> ACEScg (AP1)
function linearRGBtoACEScg([r,g,b]) {
  return [
    0.6130*r + 0.3390*g + 0.0480*b,
    0.0700*r + 0.9160*g + 0.0140*b,
    0.0190*r + 0.0660*g + 0.9150*b
  ];
}

// ACEScg -> ACEScct
function ACEScgToACEScct([r,g,b]) {
  const toCCT = c => c <= 0.0078125 ? 10.5402377416545*c : (Math.log2(c*0.002 +1.0)*0.5 + 0.0928);
  return [toCCT(r), toCCT(g), toCCT(b)];
}

// Apply simple ACEScct -> sRGB preview transform (preserves saturation visually)
function acescctToDisplay(rgb) {
  // normalize by max component to preserve relative saturation
  let maxC = Math.max(...rgb, 1e-6);
  return rgb.map(c => linearToSrgb(c/maxC));
}

// RGB 0-1 -> hex
function rgbToHex(rgb) {
  return "#" + rgb.map(c => Math.round(Math.max(0,Math.min(1,c))*255).toString(16).padStart(2,'0')).join('');
}

// Convert & update UI
document.getElementById('convertBtn').onclick = () => {
  const srgbHex = document.getElementById('srgbHex').value.trim();
  if(!/^#([0-9a-fA-F]{6})$/.test(srgbHex)) { alert("Enter valid #RRGGBB hex"); return; }

  document.getElementById('srgbBox').style.backgroundColor = srgbHex;

  const linearRGB = hexToLinearRGB(srgbHex);
  const acesRGB = linearRGBtoACEScg(linearRGB);
  const acescctRGB = ACEScgToACEScct(acesRGB);

  const previewRGB = acescctToDisplay(acescctRGB);
  document.getElementById('acesBox').style.backgroundColor = rgbToHex(previewRGB);

  // Optional: scaled ACEScct hex
  document.getElementById('acesHex').value = rgbToHex(acescctRGB.map(c=>Math.min(c,1)));
}

// Copy ACEScct hex
document.getElementById('copyBtn').onclick = () => {
  document.getElementById('acesHex').select();
  document.execCommand('copy');
  alert("ACEScct Hex copied!");
}
