// renderer.js

// Helper functions
function hexToLinearRGB(hex) {
  let r = parseInt(hex.slice(1,3),16)/255;
  let g = parseInt(hex.slice(3,5),16)/255;
  let b = parseInt(hex.slice(5,7),16)/255;

  const linear = (c) => c <= 0.04045 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4);
  return [linear(r), linear(g), linear(b)];
}

function linearRGBtoACEScct(rgb) {
  // sRGB linear → ACES2065-1 → ACEScct simplified
  let [r,g,b] = rgb;
  let R = 0.59719*r + 0.35458*g + 0.04823*b;
  let G = 0.07600*r + 0.90834*g + 0.01566*b;
  let B = 0.02840*r + 0.13383*g + 0.83777*b;

  const toCCT = (c) => c <= 0.0078125 ? 10.5402377416545*c : (Math.log2(c*0.002 + 1.0)*0.5 + 0.010);
  return [toCCT(R), toCCT(G), toCCT(B)];
}

function linearToHex(rgb) {
  const clamp = (c) => Math.min(1, Math.max(0, c));
  return "#" + rgb.map(c => Math.round(clamp(c)*255).toString(16).padStart(2,'0')).join('');
}

// Event listeners
document.getElementById('convertBtn').addEventListener('click', () => {
  let srgbHex = document.getElementById('srgbHex').value;
  if(!/^#([0-9a-fA-F]{6})$/.test(srgbHex)) { alert("Enter valid #RRGGBB hex"); return; }

  document.getElementById('srgbBox').style.backgroundColor = srgbHex;

  let linearRGB = hexToLinearRGB(srgbHex);
  let acesRGB = linearRGBtoACEScct(linearRGB);

  let acesHex = linearToHex(acesRGB);
  document.getElementById('acesHex').value = acesHex;
  document.getElementById('acesBox').style.backgroundColor = acesHex;
});

document.getElementById('copyBtn').addEventListener('click', () => {
  document.getElementById('acesHex').select();
  document.execCommand('copy');
  alert("ACEScct Hex copied!");
});
