// sRGB -> linear
function srgbToLinear(c) {
  c /= 255;
  return c <= 0.04045 ? c/12.92 : Math.pow((c+0.055)/1.055,2.4);
}

// linear -> sRGB for display (gamma 2.4)
function linearToSrgb(c) {
  return c <= 0.0031308 ? c*12.92 : 1.055*Math.pow(c,1/2.4)-0.055;
}

// sRGB hex -> linear RGB
function hexToLinearRGB(hex) {
  return [
    srgbToLinear(parseInt(hex.slice(1,3),16)),
    srgbToLinear(parseInt(hex.slice(3,5),16)),
    srgbToLinear(parseInt(hex.slice(5,7),16))
  ];
}

// Linear sRGB -> ACES2065-1 (AP1 primaries)
function linearRGBtoACES(linear) {
  const [r,g,b] = linear;
  return [
    0.59719*r + 0.35458*g + 0.04823*b,
    0.07600*r + 0.90834*g + 0.01566*b,
    0.02840*r + 0.13383*g + 0.83777*b
  ];
}

// ACES2065-1 -> ACEScct encoding
function ACES2065toACEScct(rgb) {
  return rgb.map(c => c <= 0.0078125 ? 10.5402377416545*c : Math.log2(c*0.002+1)*0.5 + 0.0928);
}

// ACEScct -> sRGB display (simple ODT approximation)
// Maps high dynamic range ACEScct to 0-1 sRGB for correct hue, saturation, brightness
function acescctToDisplay(rgb) {
  const maxVal = Math.max(...rgb,1e-6);
  return rgb.map(c => linearToSrgb(c/maxVal)); // normalized for preview
}

// RGB 0-1 -> hex
function rgbToHex(rgb) {
  return "#" + rgb.map(c => Math.round(Math.min(1,Math.max(0,c))*255).toString(16).padStart(2,'0')).join('');
}

// Main conversion function
function convertSRGBtoACEScct(srgbHex) {
  const linear = hexToLinearRGB(srgbHex);
  const aces2065 = linearRGBtoACES(linear);
  const acescct = ACES2065toACEScct(aces2065);

  const displayRGB = acescctToDisplay(acescct); // preview color
  const previewHex = rgbToHex(displayRGB);

  return { acescct, previewHex };
}

// Example usage
const srgb = "#ff6600";
const { acescct, previewHex } = convertSRGBtoACEScct(srgb);
console.log("ACEScct internal values:", acescct);
console.log("Display-ready hex:", previewHex);
