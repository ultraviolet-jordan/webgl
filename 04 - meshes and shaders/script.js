const { mat4 } = glMatrix;

function demo() {
    loadTextResource('./vshader.glsl', (verr, vtext) => {
        if (verr) {
            alert('Fatal error getting vertex shader.');
            console.error(verr);
        } else {
            loadTextResource('./fshader.glsl', (ferr, ftext) => {
                if (ferr) {
                    alert('Fatal error getting fragment shader.');
                    console.error(ferr);
                } else {
                    loadJsonResource('./model.json', (merr, model) => {
                        if (ferr) {
                            alert('Fatal error getting model.');
                            console.error(ferr);
                        } else {
                            loadImage('./texture.png', (imgerr, image) => {
                                if (imgerr) {
                                    alert('Fatal error getting image texture.');
                                    console.error(ferr);
                                } else {
                                    run(vtext, ftext, model, image);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

function run(vertexShaderText, fragmentShaderText, model, image) {
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

    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('Error compiling vertex shader:', gl.getShaderInfoLog(vertexShader));
    } else {
        console.log('Vertex shader compiled.');
    }

    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('Error compiling fragment shader:', gl.getShaderInfoLog(fragmentShader));
    } else {
        console.log('Fragment shader compiled.');
    }

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
    const vertices = model.meshes[0].vertices;
    const indices = [].concat.apply([], model.meshes[0].faces);
    const texCoords = model.meshes[0].texturecoords[0];

    // chunk of memory on gpu
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // opengl expects it to be 32 bits instead of js 64 bits floats.
    // STATIC_DRAW - go from cpu memory to gpu memory just once and done.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const texCoordsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    const vertPosition = gl.getAttribLocation(program, 'vertPosition');
    gl.vertexAttribPointer(
        vertPosition, // the attribute location
        3, // number of elements per attribute
        gl.FLOAT, // the type of elements
        false,
        3 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
        0 // offset from the beginning of a single vertex to this attribute
    );
    gl.enableVertexAttribArray(vertPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsBuffer);
    const texCoord = gl.getAttribLocation(program, 'vertTexCoord');
    gl.vertexAttribPointer(
        texCoord, // the attribute location
        2, // number of elements per attribute
        gl.FLOAT, // the type of elements
        false,
        2 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
        0 // offset from the beginning of a single vertex to this attribute
    );
    gl.enableVertexAttribArray(texCoord);

    // create texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // load texture with Y flipped (eyes on top now).
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // U = S
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); // V = T
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // makes it not care the image size is not power-of-2
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); // makes it not care the image size is not power-of-2
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.bindTexture(gl.TEXTURE_2D, null);

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

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.activeTexture(gl.TEXTURE0);

        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

        window.requestAnimationFrame(loop);
    }
    window.requestAnimationFrame(loop);
}
