uniform vec3 genericColor;

void main()
{
  //vec4 color = feathercolor;
  gl_FragColor = vec4( genericColor, 1.0 );
}
