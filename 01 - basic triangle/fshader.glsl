precision mediump float;

// inputs
varying vec3 fragColor;

void main() {
    // always the only output for fragment shaders
    gl_FragColor = vec4(fragColor, 1.0);
}
