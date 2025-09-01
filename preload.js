window.convertToACEScct = function (hex) {
  // Simple fake conversion (you can replace with real math later)
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  // Placeholder formula for demo
  let acesR = (r * 0.6).toFixed(4);
  let acesG = (g * 0.6).toFixed(4);
  let acesB = (b * 0.6).toFixed(4);

  return `ACEScct: R=${acesR}, G=${acesG}, B=${acesB}`;
};
