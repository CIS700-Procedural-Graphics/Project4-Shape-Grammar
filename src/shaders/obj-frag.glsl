uniform vec3 color;
uniform vec3 light;

varying vec3 vPosition;
varying vec3 vNormal;

vec3 lerp(vec3 a, vec3 b, float t) {
  return a * (1.0-t*t) + b * t*t;
}

void main() {
  vec3 incoming_ray = normalize(light - vPosition);
  float c = dot(vNormal, incoming_ray);
  gl_FragColor = vec4(c * color, 1.0 );

}