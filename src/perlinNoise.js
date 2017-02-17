const THREE = require('three');

// Hash lookup table as defined by Ken Perlin
// NOTE: This is array is of size 512 (a copy of the original concatenated to the original) to remove the need for
// index wrapping later on
var permArray = [
  151,160,137,91,90,15,
  131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
  190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
  88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
  77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
  102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
  135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
  5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
  223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
  129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
  251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
  49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
  138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180,
  151,160,137,91,90,15,
  131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
  190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
  88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
  77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
  102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
  135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
  5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
  223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
  129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
  251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
  49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
  138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
  ];
      
var gradArray = [
  new THREE.Vector3(1, 1, 0), new THREE.Vector3(-1, 1, 0), new THREE.Vector3(1, -1, 0), new THREE.Vector3(-1, -1, 0),
  new THREE.Vector3(1, 0, 1), new THREE.Vector3(-1, 0, 1), new THREE.Vector3(1, 0, -1), new THREE.Vector3(-1, 0, -1),
  new THREE.Vector3(0, 1, 1), new THREE.Vector3(0, -1, 1), new THREE.Vector3(0, 1, -1), new THREE.Vector3(0, -1, -1)
];

/** Helper Functions: **/

//Apply the fade curve (6t^5 - 15t^4 + 10t^3) to some input
function fade(t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

// Linear Interpolation function
function lerp(a, b, w) {
    return (1.0 - w) * a + w * b;
}

//Compute the dot product of two vector3s
function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/** Perlin Noise Computation Functions **/

// Given an x, y, and z coordinate, produce a 3D noise value
function PerlinNoiseValue(x, y, z) {
  
  // First find the unit lattice cell containing the coordinate
  var xFloor = Math.floor(x);
  var yFloor = Math.floor(y);
  var zFloor = Math.floor(z);
  
  // Get the x, y, and z values local to this lattice cell
  var xLocal = x - xFloor;
  var yLocal = y - yFloor;
  var zLocal = z - zFloor;
  
  // Wrap the lattice integer cells to 255
  xFloor = xFloor & 255;
  yFloor = yFloor & 255;
  zFloor = zFloor & 255;
  
  // Get indices which we will use to fetch the gradient vectors from the uniform grad array
  var gIndexAAA = Math.floor(permArray[permArray[permArray[xFloor ] +    yFloor ]+     zFloor ] % 12);
  var gIndexAAB = Math.floor(permArray[permArray[permArray[xFloor ] +    yFloor ] +    zFloor + 1] % 12);
  var gIndexABA = Math.floor(permArray[permArray[permArray[xFloor ] +    yFloor + 1] + zFloor ] % 12);
  var gIndexABB = Math.floor(permArray[permArray[permArray[xFloor ] +    yFloor + 1] + zFloor + 1] % 12);
  var gIndexBAA = Math.floor(permArray[permArray[permArray[xFloor + 1] + yFloor ]+     zFloor ] % 12);
  var gIndexBAB = Math.floor(permArray[permArray[permArray[xFloor + 1] + yFloor ]+     zFloor + 1] % 12);
  var gIndexBBA = Math.floor(permArray[permArray[permArray[xFloor + 1] + yFloor + 1] + zFloor ] % 12);
  var gIndexBBB = Math.floor(permArray[permArray[permArray[xFloor + 1] + yFloor + 1] + zFloor + 1] % 12);
  
  // Index the uniform grad array and compute the dot product with the local x, y, and z values to get the
  // noise contributions from each of the eight corners
  var noiseAAA = dot(gradArray[gIndexAAA], new THREE.Vector3(xLocal, yLocal, zLocal));
  var noiseBAA = dot(gradArray[gIndexBAA], new THREE.Vector3(xLocal - 1, yLocal, zLocal));
  var noiseABA = dot(gradArray[gIndexABA], new THREE.Vector3(xLocal, yLocal - 1, zLocal));
  var noiseBBA = dot(gradArray[gIndexBBA], new THREE.Vector3(xLocal - 1, yLocal - 1, zLocal));
  var noiseAAB = dot(gradArray[gIndexAAB], new THREE.Vector3(xLocal, yLocal, zLocal - 1));
  var noiseBAB = dot(gradArray[gIndexBAB], new THREE.Vector3(xLocal - 1, yLocal, zLocal - 1));
  var noiseABB = dot(gradArray[gIndexABB], new THREE.Vector3(xLocal, yLocal - 1, zLocal - 1));
  var noiseBBB = dot(gradArray[gIndexBBB], new THREE.Vector3(xLocal - 1, yLocal - 1, zLocal - 1));
  
  // Using the fade curve, compute smoother weights for the trilinear interpolation
  var u = fade(xLocal);
  var v = fade(yLocal);
  var w = fade(zLocal);
    
  // Trilinearly Interpolate the eight noise contributions
    
  // Along x-axis
  var noiseInterpXAA = lerp(noiseAAA, noiseBAA, u); //Lower-back-left to lower-back-right
  var noiseInterpXAB = lerp(noiseAAB, noiseBAB, u);
  var noiseInterpXBA = lerp(noiseABA, noiseBBA, u);
  var noiseInterpXBB = lerp(noiseABB, noiseBBB, u);
    
  // Along y-axis
  var noiseInterpXYA = lerp(noiseInterpXAA, noiseInterpXBA, v);
  var noiseInterpXYB = lerp(noiseInterpXAB, noiseInterpXBB, v);
  
  // Along z-axis
  var noiseInterpXYZ = lerp(noiseInterpXYA, noiseInterpXYB, w);
  
  // on the range (-1, 1)
  return noiseInterpXYZ;
}

export default function PerlinNoiseMultiOctave(x, y, z) {
    var totalNoise = 0; // running sum of noise values over all octaves
    var frequency = 1; // sampling rate
    var persistence = 0; // how much each successive octave contributes to the sum
    var amplitude = 1; // how much a particular octave contributes to the sum
    var maxValue = 0; // for normalizing the noise back to (-1, 1)
    
    // Number of octaves is the upper limit in the conditional statement
    // GLSL can only use constant expressions in for loops
    for(var i = 0; i < 2; i++) {
        // Retrieve Perlin Noise value at this frequency
        totalNoise += PerlinNoiseValue(x * frequency, y * frequency, z * frequency);
        
        // Keep track of max value
        maxValue += amplitude;
        
        // Update parameters for the next octave
        amplitude *= persistence;
        frequency *= 2;
    }
    return totalNoise / maxValue; //remap back to (-1, 1)
}
