varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPos; 

void main() {
    vUv = uv;
    vNormal = normal;
    vPos = position;

    // display the regular position
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}