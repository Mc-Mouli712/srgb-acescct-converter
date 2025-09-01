// === Conversion Helpers ===
function srgbToLinear(c) {
  c = c / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function linearToSRGB(c) {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1/2.4) - 0.055;
}
function linearToACEScct(x) {
  const a = 0.0078125;
  if (x < a * 0.155251141552511) {
    return 10.5402377416545 * x + 0.0729055341958355;
  }
  return (Math.log10(x * 171.2102946929 + 1.0) + 9.72) / 17.52;
}
function ACEScctToLinear(x) {
  if (x < 0.155251141552511) {
    return (x - 0.0729055341958355) / 10.5402377416545;
  }
  return (Math.pow(10, (x * 17.52) - 9.72) - 1.0) / 171.2102946929;
}

// === HEX utils ===
function toHex(c) {
  return Math.round(c * 255).toString(16).padStart(2, "0");
}
function clamp(v) {
  return Math.min(Math.max(v, 0), 1);
}

// === Forward: HEX → ACEScct ===
document.getElementById("convert").addEventListener("click", () => {
  let hex = document.getElementById("hex").value.trim();
  if (hex.startsWith("#")) hex = hex.slice(1);
  if (hex.length !== 6) return alert("Enter a valid 6-digit hex code!");

  // Extract sRGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // sRGB → Linear → ACEScct
  const rACES = linearToACEScct(srgbToLinear(r));
  const gACES = linearToACEScct(srgbToLinear(g));
  const bACES = linearToACEScct(srgbToLinear(b));

  const floatStr = `${rACES.toFixed(4)}, ${gACES.toFixed(4)}, ${bACES.toFixed(4)}`;
  document.getElementById("aces-float").innerText = floatStr;

  // Show original HEX
  const srgbHex = `#${hex.toUpperCase()}`;
  document.getElementById("srgb-hex").innerText = srgbHex;
  document.getElementById("srgb-swatch").style.backgroundColor = srgbHex;

  // ACEScct → Linear → sRGB → HEX (Preview)
  const rPrev = clamp(linearToSRGB(ACEScctToLinear(rACES)));
  const gPrev = clamp(linearToSRGB(ACEScctToLinear(gACES)));
  const bPrev = clamp(linearToSRGB(ACEScctToLinear(bACES)));

  const previewHex = `#${toHex(rPrev)}${toHex(gPrev)}${toHex(bPrev)}`.toUpperCase();
  document.getElementById("aces-hex").innerText = previewHex;
  document.getElementById("aces-swatch").style.backgroundColor = previewHex;
});

// === Backward: ACEScct Float → sRGB ===
document.getElementById("convert-back").addEventListener("click", () => {
  let floatStr = document.getElementById("float").value.trim();
  if (!floatStr.includes(",")) return alert("Enter values like: 0.2, 0.3, 0.4");

  const parts = floatStr.split(",").map(v => parseFloat(v.trim()));
  if (parts.length !== 3 || parts.some(isNaN)) return alert("Invalid float values!");

  // ACEScct → Linear → sRGB
  const rSRGB = clamp(linearToSRGB(ACEScctToLinear(parts[0])));
  const gSRGB = clamp(linearToSRGB(ACEScctToLinear(parts[1])));
  const bSRGB = clamp(linearToSRGB(ACEScctToLinear(parts[2])));

  const backHex = `#${toHex(rSRGB)}${toHex(gSRGB)}${toHex(bSRGB)}`.toUpperCase();
  document.getElementById("back-hex").innerText = backHex;
  document.getElementById("back-swatch").style.backgroundColor = backHex;
});

// === Copy Helper ===
function copyText(id) {
  const text = document.getElementById(id).innerText;
  navigator.clipboard.writeText(text).then(() => {
    const copiedMsg = document.getElementById("copied-" + id.split("-")[1]);
    if (copiedMsg) {
      copiedMsg.style.display = "inline";
      setTimeout(() => (copiedMsg.style.display = "none"), 1000);
    }
  });
}
