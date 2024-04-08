precision mediump float;

struct DirectionalLight {
    vec3 direction;
    vec3 color;
};

// inputs
varying vec2 fragTexCoord;
varying vec3 fragNormal;

uniform vec3 ambientLightIntensity;
uniform DirectionalLight sun;
uniform sampler2D sampler; // texture 0

void main() {
    // choices::
    // ambient light
    // directional light (sun)
    // point light (lamp)
    // spot light (flash light)
    vec3 surfaceNormal = normalize(fragNormal);
    vec3 normalSunDirection = normalize(sun.direction);
    vec4 texel = texture2D(sampler, fragTexCoord);

    vec3 lightIntensity = ambientLightIntensity + sun.color * max(dot(fragNormal, normalSunDirection), 0.0);

    // always the only output for fragment shaders
    gl_FragColor = vec4(texel.rgb * lightIntensity, texel.a);
    // gl_FragColor = texture2D(sampler, fragTexCoord);
}
