varying vec3 norm;
varying vec3 pos;

void main() {
	//to be used in fragment shader
	pos = position;
	norm = normal;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}