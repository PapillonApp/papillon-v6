
function hexToRGB(hex) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return { r, g, b };
}

function calculateLuminance(rgb) {
  var { r, g, b } = rgb;
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;
  r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function calculateContrast(l1, l2) {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function checkContrast(textColor, backgroundColor, ratio = 4.5) {
  // Get the colors in RGB
  const textColorRGB = hexToRGB(textColor);
  const backgroundColorRGB = hexToRGB(backgroundColor);
    
  // Calculate the luminance
  const textLuminance = calculateLuminance(textColorRGB);
  const backgroundLuminance = calculateLuminance(backgroundColorRGB);
    
  // Calculate the contrast
  const contrast = calculateContrast(textLuminance, backgroundLuminance);
    
  // Check if the contrast is enough
  return contrast >= ratio;
}

export { checkContrast };
