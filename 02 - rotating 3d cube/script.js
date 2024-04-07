const { mat4 } = glMatrix;

function demo() {
    const canvas = document.getElementById('game');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        alert('Your browser does not support WebGL.');
    }

    // alpha always 1.0
    // specify the color to use for clearing.
    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    // there is a color buffer and a depth (z) buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // need a vertex shader and a fragment shader
    // need to setup the entire graphics pipeline program

    gl.enable(gl.DEPTH_TEST); // draw pixels only closest to the camera
    gl.enable(gl.CULL_FACE); // ignore drawing/work pixels the camera cant see
    gl.cullFace(gl.BACK); // tell the which side you want to cull (get rid of)
    gl.frontFace(gl.CCW); // face is formed by the ordering of the vertices appearing to each other (counterclockwise)

    // create and compile shaders.
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    const vertexLoader = new XMLHttpRequest();
    vertexLoader.open('GET', 'vshader.glsl', false);
    vertexLoader.onload = () => {
        if (vertexLoader.status === 200) {
            gl.shaderSource(vertexShader, vertexLoader.responseText);
            gl.compileShader(vertexShader);
            if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
                console.error('Error compiling vertex shader:', gl.getShaderInfoLog(vertexShader));
            } else {
                console.log('Vertex shader compiled.');
            }
        }
    };
    vertexLoader.send();

    const shaderLoader = new XMLHttpRequest();
    shaderLoader.open('GET', 'fshader.glsl', false);
    shaderLoader.onload = () => {
        if (shaderLoader.status === 200) {
            gl.shaderSource(fragmentShader, shaderLoader.responseText);
            gl.compileShader(fragmentShader);
            if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
                console.error('Error compiling fragment shader:', gl.getShaderInfoLog(fragmentShader));
            } else {
                console.log('Fragment shader compiled.');
            }
        }
    };
    shaderLoader.send();

    // create program and attach shaders/
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Error linking program:', gl.getProgramInfoLog(program));
    } else {
        console.log('Program linked.');
    }
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('Error validating program:', gl.getProgramInfoLog(program));
    } else {
        console.log('Program validated.');
    }

    // create buffer
    const vertices = [
        // counterclockwise
        //X    Y    Z    R    G    B
        // Top
        -1.0, 1.0, -1.0,   0.5, 0.5, 0.5,
        -1.0, 1.0, 1.0,    0.5, 0.5, 0.5,
        1.0, 1.0, 1.0,     0.5, 0.5, 0.5,
        1.0, 1.0, -1.0,    0.5, 0.5, 0.5,

        // Left
        -1.0, 1.0, 1.0,    0.75, 0.25, 0.5,
        -1.0, -1.0, 1.0,   0.75, 0.25, 0.5,
        -1.0, -1.0, -1.0,  0.75, 0.25, 0.5,
        -1.0, 1.0, -1.0,   0.75, 0.25, 0.5,

        // Right
        1.0, 1.0, 1.0,    0.25, 0.25, 0.75,
        1.0, -1.0, 1.0,   0.25, 0.25, 0.75,
        1.0, -1.0, -1.0,  0.25, 0.25, 0.75,
        1.0, 1.0, -1.0,   0.25, 0.25, 0.75,

        // Front
        1.0, 1.0, 1.0,    1.0, 0.0, 0.15,
        1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
        -1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
        -1.0, 1.0, 1.0,    1.0, 0.0, 0.15,

        // Back
        1.0, 1.0, -1.0,    0.0, 1.0, 0.15,
        1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
        -1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
        -1.0, 1.0, -1.0,    0.0, 1.0, 0.15,

        // Bottom
        -1.0, -1.0, -1.0,   0.5, 0.5, 1.0,
        -1.0, -1.0, 1.0,    0.5, 0.5, 1.0,
        1.0, -1.0, 1.0,     0.5, 0.5, 1.0,
        1.0, -1.0, -1.0,    0.5, 0.5, 1.0,
    ];

    const indices = [
        // Top
        0, 1, 2,
        0, 2, 3,

        // Left
        5, 4, 6,
        6, 4, 7,

        // Right
        8, 9, 10,
        8, 10, 11,

        // Front
        13, 12, 14,
        15, 14, 12,

        // Back
        16, 17, 18,
        16, 18, 19,

        // Bottom
        21, 20, 22,
        22, 20, 23
    ];

    // chunk of memory on gpu
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // opengl expects it to be 32 bits instead of js 64 bits floats.
    // STATIC_DRAW - go from cpu memory to gpu memory just once and done.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

    const vertPosition = gl.getAttribLocation(program, 'vertPosition');
    const vertColor = gl.getAttribLocation(program, 'vertColor');

    gl.vertexAttribPointer(
        vertPosition, // the attribute location
        3, // number of elements per attribute
        gl.FLOAT, // the type of elements
        false,
        6 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
        0 // offset from the beginning of a single vertex to this attribute
    );

    gl.vertexAttribPointer(
        vertColor, // the attribute location
        3, // number of elements per attribute
        gl.FLOAT, // the type of elements
        false,
        6 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
        3 * Float32Array.BYTES_PER_ELEMENT // offset from the beginning of a single vertex to this attribute
    );

    gl.enableVertexAttribArray(vertPosition);
    gl.enableVertexAttribArray(vertColor);

    // Tell OpenGL state machine which program should be active.
    gl.useProgram(program);

    const mWorld = gl.getUniformLocation(program, 'mWorld');
    const mView = gl.getUniformLocation(program, 'mView');
    const mProj = gl.getUniformLocation(program, 'mProj');

    const worldMatrix = new Float32Array(16); // 4x4
    const viewMatrix = new Float32Array(16); // 4x4
    const projectionMatrix = new Float32Array(16); // 4x4

    mat4.identity(worldMatrix);
    mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]); // camera
    mat4.perspective(projectionMatrix, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

    // send matrices to the shader
    gl.uniformMatrix4fv(mWorld, false, worldMatrix); // must be false for WebGL.
    gl.uniformMatrix4fv(mView, false, viewMatrix); // must be false for WebGL.
    gl.uniformMatrix4fv(mProj, false, projectionMatrix); // must be false for WebGL.

    const xRotationMatrix = new Float32Array(16);
    const yRotationMatrix = new Float32Array(16);

    // main render loop
    const identityMatrix = new Float32Array(16); // 4x4
    mat4.identity(identityMatrix);
    let angle = 0;

    const loop = function () {
        angle = performance.now() / 1000 / 6 * 2 * Math.PI;

        mat4.rotate(worldMatrix, identityMatrix, angle, [0, 1, 0]);
        mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
        mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
        mat4.mul(worldMatrix, xRotationMatrix, yRotationMatrix);

        gl.uniformMatrix4fv(mWorld, false, worldMatrix); // must be false for WebGL.
        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);

        window.requestAnimationFrame(loop);
    }
    window.requestAnimationFrame(loop);
}
