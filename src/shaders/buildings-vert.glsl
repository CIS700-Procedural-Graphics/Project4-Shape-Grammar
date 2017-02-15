varying vec3 vnor;
varying vec3 PosBasedColor;
varying vec3 randcolor;

void main()
{
    vnor = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    PosBasedColor = vec3( ((gl_Position.x + 100.0) /200.0), ((gl_Position.y + 100.0) /200.0), ((gl_Position.z + 100.0) /200.0) );
}
