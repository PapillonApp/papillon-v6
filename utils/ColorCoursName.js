/* give 50 random colors of all hues but with enough contrast with white text */
const colors = ["#2C3E50","#34495E","#2980B9","#3498DB","#1ABC9C","#16A085","#27AE60","#2ECC71","#F39C12","#E49F37","#E67E22","#D35400","#E74C3C","#C0392B","#9B59B6","#8E44AD","#2980B9","#2C3E50","#34495E","#3498DB","#1ABC9C","#16A085","#27AE60","#2ECC71","#F39C12","#E49F37","#E67E22","#D35400","#E74C3C","#C0392B","#9B59B6","#8E44AD","#2980B9","#2C3E50","#34495E","#3498DB","#1ABC9C","#16A085","#27AE60","#2ECC71","#F39C12","#E49F37","#E67E22","#D35400","#E74C3C","#C0392B","#9B59B6","#8E44AD","#2980B9","#2C3E50"];

function hexToRGB(hex) {
    // Remove '#' if present
    hex = hex.replace('#', '');
    
    // Split into RGB components
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
}

function calculateDistance(color1, color2) {
    const dr = color1.r - color2.r;
    const dg = color1.g - color2.g;
    const db = color1.b - color2.b;
    
    return Math.sqrt(dr * dr + dg * dg + db * db);
}

function findClosestColor(hexColor, colorList) {
    const inputColor = hexToRGB(hexColor);
    let closestColor = null;
    let closestDistance = Infinity;
    
    for (const color of colorList) {
        const distance = calculateDistance(inputColor, hexToRGB(color));
        
        if (distance < closestDistance) {
            closestColor = color;
            closestDistance = distance;
        }
    }
    
    return closestColor;
}

function getClosestColor(hexColor) {
    return findClosestColor(hexColor, colors);
}

export default getClosestColor;