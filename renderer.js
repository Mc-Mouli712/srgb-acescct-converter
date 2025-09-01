// renderer.js

// Convert sRGB hex (#RRGGBB) to linear RGB (0-1)
function hexToLinearRGB(hex) {
  let r = parseInt(hex.slice(1,3),16)/255;
  let g = parseInt(hex.slice(3,5),16)/255;
  let b = parseInt(hex.slice(5,7),16)/255;

  const linearize = (c) => c <= 0.04045 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4);
  return [linearize(r), linearize(g), linearize(b)];
}

// Convert linear sRGB → ACES2065-1 (AP1) using **official matrix**
function linearRGBtoACES(linearRGB) {
  const [r, g, b] = linearRGB;
  const R = 0.59719*r + 0.35458*g + 0.04823*b;
  const G = 0.07600*r + 0.90834*g + 0.01566*b;
  const B = 0.02840*r + 0.13383*g + 0.83777*b;
  return [R, G, B];
}

// ACES2065-1 → ACEScct encoding (logarithmic)
function ACES2065toACEScct(rgb) {
  return rgb.map(c => {
    // Clamp very small negative values to zero
    c = Math.max(c, 0);
    if (c <= 0.0078125) {
      return 10.5402377416545 * c;
    } else {
      return (Math.log2(c * 0.002 + 1.0) * 0.5) + 0.0928; // standard ACEScct formula
    }
  });
}

// Linear RGB 0-1 → hex
function rgbToHex(rgb) {
  const clamp = (c) => Math.min(1, Math.max(0, c));
  return "#" + rgb.map(c => Math.round(clamp(c)*255).toString(16).padStart(2,'0')).join('');
}

// Update UI on convert
document.getElementById('convertBtn').addEventListener('click', () => {
  const srgbHex = document.getElementById('srgbHex').value.trim();
  if(!/^#([0-9a-fA-F]{6})$/.test(srgbHex)) {
    alert("Enter valid #RRGGBB hex");
    return;
  }

  document.getElementById('srgbBox').style.backgroundColor = srgbHex;

  const linearRGB = hexToLinearRGB(srgbHex);
  const acesRGB = linearRGBtoACES(linearRGB);
  const acescctRGB = ACES2065toACEScct(acesRGB);

  const acesHex = rgbToHex(acescctRGB);

  document.getElementById('acesHex').value = acesHex;
  document.getElementById('acesBox').style.backgroundColor = acesHex;
});

// Copy ACES hex
document.getElementById('copyBtn').addEventListener('click', () => {
  document.getElementById('acesHex').select();
  document.execCommand('copy');
  alert("ACEScct Hex copied!");
});
