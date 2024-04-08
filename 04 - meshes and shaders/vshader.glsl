precision mediump float;

// inputs
attribute vec3 vertPosition;
attribute vec2 vertTexCoord;

// outputs
varying vec2 fragTexCoord;

uniform mat4 mWorld; // world matrix
uniform mat4 mView; // view matrix
uniform mat4 mProj; // projection matrix

void main() {
    fragTexCoord = vertTexCoord;
    // multiplication in reverse order
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}