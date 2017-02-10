varying vec3 norm;
varying vec3 pos;
uniform vec3 roofColor;
uniform vec3 wallColor;

void main() {

  vec3 basecolor;

  if(abs(norm[1]) < 0.0001) //if the normal has no upward component, this vertex is not on the roof
  {
      basecolor = wallColor;
  }
  else
  {
      basecolor = roofColor;
  }

  //lambertian shading calculation
  vec3 lightDir = pos - vec3(10.0, 30.0, 20.0);
  float lambert = clamp(dot(normalize(norm), -1.0*normalize(lightDir)), 0.5, 1.0);

  vec3 color = lambert*basecolor;

  gl_FragColor = vec4( color.rgb, 1.0 );

}