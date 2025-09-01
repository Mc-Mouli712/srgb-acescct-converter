function srgbToLinear(c) {
  c = c / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToACEScct(x) {
  const a = 0.0078125;
  const b = 0.155251141552511;
  if (x < a * b) {
    return 10.5402377416545 * x + 0.0729055341958355;
  }
  return (Math.log10(x * 171.2102946929 + 1.0) + 9.72) / 17.52;
}

function ACEScctToLinear(x) {
  const a = 0.0078125;
  if (x < 0.155251141552511) {
    return (x - 0.0729055341958355) / 10.5402377416545;
  }
  return (Math.pow(10, (x * 17.52) - 9.72) - 1.0) / 171.2102946929;
}

function linearToSRGB(c) {
  return c <= 0.0031308
    ? c * 12.92
    : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

document.getElementById("convert").addEventListener("click", () => {
  let hex = document.getElementById("hex").value.trim();
  if (hex.startsWith("#")) hex = hex.slice(1);
  if (hex.length !== 6) return alert("Enter a valid 6-digit hex code!");

  // Extract RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // sRGB → Linear → ACEScct
  const rLin = srgbToLinear(r);
  const gLin = srgbToLinear(g);
  const bLin = srgbToLinear(b);

  const rACES = linearToACEScct(rLin);
  const gACES = linearToACEScct(gLin);
  const bACES = linearToACEScct(bLin);

  // Show floats
  document.getElementById("aces-float").innerText =
    `${rACES.toFixed(4)}, ${gACES.toFixed(4)}, ${bACES.toFixed(4)}`;

  // For artist preview: ACEScct → Linear → sRGB → HEX
  const rPrev = Math.min(Math.max(linearToSRGB(ACEScctToLinear(rACES)), 0), 1);
  const gPrev = Math.min(Math.max(linearToSRGB(ACEScctToLinear(gACES)), 0), 1);
  const bPrev = Math.min(Math.max(linearToSRGB(ACEScctToLinear(bACES)), 0), 1);

  const rHex = Math.round(rPrev * 255).toString(16).padStart(2, "0");
  const gHex = Math.round(gPrev * 255).toString(16).padStart(2, "0");
  const bHex = Math.round(bPrev * 255).toString(16).padStart(2, "0");

  const previewHex = `#${rHex}${gHex}${bHex}`;
  document.getElementById("aces-hex").innerText = previewHex.toUpperCase();
  document.getElementById("aces-swatch").style.backgroundColor = previewHex;
});
