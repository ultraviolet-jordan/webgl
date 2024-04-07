precision mediump float;

// inputs
attribute vec2 vertPosition;
attribute vec3 vertColor;

// outputs
varying vec3 fragColor;

void main() {
    fragColor = vertColor;
    gl_Position = vec4(vertPosition, 0.0, 1.0);
}