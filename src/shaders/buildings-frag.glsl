uniform vec3 shapeColor;
varying vec3 PosBasedColor;
// varying vec3 randcolor;
uniform vec3 lightVec;
varying vec3 vnor;

void main()
{
  // vec3 diffuseColor = shapeColor;
  vec3 diffuseColor = PosBasedColor;
  // vec3 diffuseColor = randcolor;
  // Calculate the diffuse term for Lambert shading
  float diffuseTerm = dot(normalize(vnor), normalize(lightVec));

  if(diffuseTerm > 1.0)
  {
    diffuseTerm = 1.0;
  }
  else if(diffuseTerm < 0.0)
  {
    diffuseTerm = 0.0;
  }

  float ambientTerm = 0.3;
  float lightIntensity = diffuseTerm + ambientTerm;
  if(lightIntensity > 1.0)
  {
    lightIntensity = 1.0;
  }
  else if(lightIntensity < 0.0)
  {
    lightIntensity = 0.0;
  }
  vec3 lambert_color = diffuseColor.rgb * lightIntensity;

  gl_FragColor = vec4( lambert_color, 1.0 );
}
