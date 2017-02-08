varying vec3 vPosition;
varying vec3 vNormal;

void main() {

    vNormal = normal;
    vPosition = position;
 
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}