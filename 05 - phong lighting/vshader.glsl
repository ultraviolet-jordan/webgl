precision mediump float;

// inputs
attribute vec3 vertPosition;
attribute vec2 vertTexCoord;
attribute vec3 vertNormal;

// outputs
varying vec2 fragTexCoord;
varying vec3 fragNormal;

uniform mat4 mWorld; // world matrix
uniform mat4 mView; // view matrix
uniform mat4 mProj; // projection matrix

void main() {
    fragTexCoord = vertTexCoord;
    fragNormal = (mWorld * vec4(vertNormal, 0.0)).xyz;
    // multiplication in reverse order
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}