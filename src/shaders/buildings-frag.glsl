uniform vec3 shapeColor;
varying vec3 PosBasedColor;
uniform vec3 lightVec;
varying vec3 vnor;

void main()
{
  // Calculate the diffuse term for Lambert shading
  float diffuseTerm = dot(normalize(vnor), normalize(lightVec));
  clamp( diffuseTerm, 0.0, 1.0);

  float ambientTerm = 0.3;
  float lightIntensity = diffuseTerm + ambientTerm;
  clamp( lightIntensity, 0.0, 1.0);

  vec3 lambert_color = PosBasedColor.rgb * 0.2 * lightIntensity;
  gl_FragColor = vec4( lambert_color, 1.0 );
}
