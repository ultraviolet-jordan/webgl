precision mediump float;

// inputs
attribute vec3 vertPosition;
attribute vec3 vertColor;

// outputs
varying vec3 fragColor;

uniform mat4 mWorld; // world matrix
uniform mat4 mView; // view matrix
uniform mat4 mProj; // projection matrix

void main() {
    fragColor = vertColor;
    // multiplication in reverse order
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}