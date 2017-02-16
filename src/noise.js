const THREE = require('three');

var random = function (a, b, c) {
    var vec1 = new THREE.Vector3(a, b, c);
    var vec2 = new THREE.Vector3(12.9898, 78.233, 198.233);
    return Math.abs(Math.sin(vec1.dot(vec2)*43758.5453));
}

var lerp = function(a, b, t) {
    return a * (1.0 - t) + b * t;
}

var cerp = function(a, b, t) {
    var cos_t = (1.0 - Math.cos(t*3.14159)) * 0.5;
    return lerp(a, b, cos_t);
}

var interpolateNoise  = function(x, y, z) {
    var x0, y0, z0, x1, y1, z1;
    
    // Find the grid voxel that this point falls in
    x0 = Math.floor(x);
    y0 = Math.floor(y);
    z0 = Math.floor(z);
    
    x1 = x0 + 1.0;
    y1 = y0 + 1.0;
    z1 = z0 + 1.0;
    
    // Generate noise at each of the 8 points
    var FUL, FUR, FLL, FLR, BUL, BUR, BLL, BLR;
    
    // front upper left
    FUL = random(x0, y1, z1);
    
    // front upper right
    FUR = random(x1, y1, z1);
    
    // front lower left
    FLL = random(x0, y0, z1);
    
    // front lower right
    FLR = random(x1, y0, z1);
    
    // back upper left
    BUL = random(x0, y1, z0);
    
    // back upper right
    BUR = random(x1, y1, z0);
    
    // back lower left
    BLL = random(x0, y0, z0);
    
    // back lower right
    BLR = random(x1, y0, z0);
    
    // Find the interpolate t values
    var n0, n1, m0, m1, v;
    var tx = x - x0;
    var ty = y - y0;
    var tz = z - z0;
    tx = (x - x0);
    ty = (y - y0);
    tz = (z - z0);
    
    // interpolate along x and y for back
    n0 = cerp(BLL, BLR, tx);
    n1 = cerp(BUL, BUR, tx);
    m0 = cerp(n0, n1, ty);
    
    // interpolate along x and y for front
    n0 = cerp(FLL, FLR, tx);
    n1 = cerp(FUL, FUR, tx);
    m1 = cerp(n0, n1, ty);
    
    // interpolate along z
    v = cerp(m0, m1, tz);
    
    return v;
}

var generateNoise = function (x, y, z) {
    var total = 0.0;
    var persistence = 1.0 / 2.0;
    for (var i = 0; i < 32; i++) {
        var freq = Math.pow(2.0, i);
        var ampl = Math.pow(persistence, i);
        total += interpolateNoise(freq*x, freq*y, freq*z)*ampl;
    }
    return total;
}

export default {
    generateNoise : generateNoise
}