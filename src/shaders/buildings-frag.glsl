uniform vec3 shapeColor;

void main()
{
  //vec4 color = feathercolor;
  gl_FragColor = vec4( shapeColor, 1.0 );
}
