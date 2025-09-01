// Convert HEX (#RRGGBB) to RGB [0-1]
function hexToRgb(hex) {
  hex = hex.replace("#", "");
  const bigint = parseInt(hex, 16);
  return [
    ((bigint >> 16) & 255) / 255,
    ((bigint >> 8) & 255) / 255,
    (bigint & 255) / 255,
  ];
}

// Apply sRGB → Linear
function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

// Apply Linear → sRGB
function linearToSrgb(c) {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

// Clamp helper (to keep values in [0,1])
function clamp01(x) {
  return Math.min(1, Math.max(0, x));
}

// Convert [0–1] RGB → HEX
function rgbToHex(rgb) {
  return (
    "#" +
    rgb
      .map((v) => {
        const c = Math.round(clamp01(v) * 255)
          .toString(16)
          .padStart(2, "0");
        return c;
      })
      .join("")
  );
}

// Convert sRGB → ACEScct
function srgbToAcescct(hex) {
  const srgb = hexToRgb(hex).map(srgbToLinear);

  // sRGB → ACEScg matrix
  const M = [
    [0.6131, 0.3395, 0.0474],
    [0.0702, 0.9160, 0.0138],
    [0.0206, 0.1096, 0.8698],
  ];

  const acescg = [
    srgb[0] * M[0][0] + srgb[1] * M[0][1] + srgb[2] * M[0][2],
    srgb[0] * M[1][0] + srgb[1] * M[1][1] + srgb[2] * M[1][2],
    srgb[0] * M[2][0] + srgb[1] * M[2][1] + srgb[2] * M[2][2],
  ];

  // Apply ACEScct curve
  function toAcescct(x) {
    if (x <= 0.0078125) return 10.5402377416545 * x + 0.0729055341958355;
    return (Math.log2(x) + 9.72) / 17.52;
  }

  const acescct = acescg.map(toAcescct);

  return acescct;
}

// Hook to button
document.getElementById("convertBtn").addEventListener("click", () => {
  const hex = document.getElementById("hexInput").value;
  const acescct = srgbToAcescct(hex);

  // For visualization → just convert back to HEX (approx)
  const acescctHex = rgbToHex(acescct);

  document.getElementById("result").innerHTML = `
    <p>ACEScct (float): ${acescct.map((v) => v.toFixed(5)).join(", ")}</p>
    <p>ACEScct HEX: <span style="color:${acescctHex}">${acescctHex}</span></p>
  `;
});
