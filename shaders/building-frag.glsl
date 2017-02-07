uniform vec3 feathercolor;

void main()
{
  //vec4 color = feathercolor;
  gl_FragColor = vec4( feathercolor, 1.0 );
}
