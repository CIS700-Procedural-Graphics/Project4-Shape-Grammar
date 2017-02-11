varying vec2 vUv;
varying vec3 vNormal;
uniform float u_color; 

float lerp(float a, float b, float t) {
	return a * (1.0 - t) + b * t; 
}

void main() {
    vec4 color = vec4(vNormal.x, vNormal.y, vNormal.z, 1.0);
}