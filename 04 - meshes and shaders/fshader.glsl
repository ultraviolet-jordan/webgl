precision mediump float;

// inputs
varying vec2 fragTexCoord;

uniform sampler2D sampler; // texture 0

void main() {
    // always the only output for fragment shaders
    gl_FragColor = texture2D(sampler, fragTexCoord);
}
