function initDemo() {
    console.log('This is working.');

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
        //X    Y    R    G    B
        0.0, 0.5, 1.0, 1.0, 0.0,
        -0.5, -0.5, 0.7, 0.0, 1.0,
        0.5, -0.5, 0.1, 1.0, 0.6
    ];

    // chunk of memory on gpu
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // opengl expects it to be 32 bits instead of js 64 bits floats.
    // STATIC_DRAW - go from cpu memory to gpu memory just once and done.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const vertPosition = gl.getAttribLocation(program, 'vertPosition');
    const vertColor = gl.getAttribLocation(program, 'vertColor');

    gl.vertexAttribPointer(
        vertPosition, // the attribute location
        2, // number of elements per attribute
        gl.FLOAT, // the type of elements
        false,
        5 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
        0 // offset from the beginning of a single vertex to this attribute
    );

    gl.vertexAttribPointer(
        vertColor, // the attribute location
        3, // number of elements per attribute
        gl.FLOAT, // the type of elements
        false,
        5 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
        2 * Float32Array.BYTES_PER_ELEMENT // offset from the beginning of a single vertex to this attribute
    );

    gl.enableVertexAttribArray(vertPosition);
    gl.enableVertexAttribArray(vertColor);

    // main render loop
    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}