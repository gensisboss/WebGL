//初始化着色器
function initShader(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE) {
    //创建着色器
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, VERTEX_SHADER_SOURCE); //指定顶点着色器源码
    gl.shaderSource(fragmentShader, FRAGMENT_SHADER_SOURCE); //指定片元着色器源码

    //编译着色器
    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    //创建一个程序对象
    const program = gl.createProgram();

    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)

    gl.linkProgram(program);
    gl.useProgram(program);

    return program;

}

function getRotateMatrix(deg) {
    return new Float32Array([
        Math.cos(deg), Math.sin(deg), 0.0, 0.0,
        -Math.sin(deg), Math.cos(deg), 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ])
}

function getTranslateMatrix(x = 0.0, y = 0.0, z = 0.0) {
    return new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        x, y, z, 1.0
    ])
}

function getScaleMatrix(scaleX = 1.0, scaleY = 1.0, scaleZ = 1.0) {
    return new Float32Array([
        scaleX, 0.0, 0.0, 0.0,
        0.0, scaleY, 0.0, 0.0,
        0.0, 0.0, scaleZ, 0.0,
        0.0, 0.0, 0.0, 1.0
    ])
}


function getRotateMatrix(deg) {
    return new Float32Array([
        Math.cos(deg), Math.sin(deg), 0.0, 0.0,
        -Math.sin(deg), Math.cos(deg), 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ])
}


function mixMatrix(A, B) {
    const result = new Float32Array(16)

    for (let i = 0; i < 4; i++) {
        result[i] = A[i] * B[0] + A[i + 4] * B[1] + A[i + 8] * B[2] + A[i + 12] * B[3];
        result[i + 4] = A[i] * B[4] + A[i + 4] * B[5] + A[i + 8] * B[6] + A[i + 12] * B[7];
        result[i + 8] = A[i] * B[8] + A[i + 4] * B[9] + A[i + 8] * B[10] + A[i + 12] * B[11];
        result[i + 12] = A[i] * B[12] + A[i + 4] * B[13] + A[i + 8] * B[14] + A[i + 12] * B[15];
    }

    return result;
}

function getImage(gl, src, uSampler, index) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = function () {
            console.log("加载图片", img)
            //创建纹理图像存储纹理数据
            const texture = gl.createTexture();
            //翻转 图片 Y轴
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
            //开启一个纹理单元
            gl.activeTexture(gl[`TEXTURE${index}`]);
            //绑定纹理对象gl.bindTexture(type,texture)

            gl.bindTexture(gl.TEXTURE_2D, texture);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

            gl.uniform1i(uSampler, index)
            resolve()

        }
        img.src = src;
    })

}



function normalized(arr) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
        sum += arr[i] * arr[i];
    }

    const middle = Math.sqrt(sum);

    for (let i = 0; i < arr.length; i++) {
        arr[i] /= middle;
    }
}

function cross(a, b) {
    return new Float32Array([
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ])
}

function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function minus(a, b) {
    return new Float32Array([
        a[0] - b[0],
        a[1] - b[1],
        a[2] - b[2],
    ])
}
//获取视图矩阵
function getViewMatrix(eyex, eyey, eyez, lookAtx, lookAty, lookAtz, upx, upy, upz) {
    //视点
    const eye = new Float32Array([eyex, eyey, eyez]);
    //目标点
    const lookAt = new Float32Array([lookAtx, lookAty, lookAtz]);
    //上方向
    const up = new Float32Array([upx, upy, upz]);

    //确定z轴
    const z = minus(eye, lookAt);

    normalized(z);
    normalized(up);

    const x = cross(z, up);

    normalized(x);

    const y = cross(x, z);

    return new Float32Array([
        x[0], y[0], z[0], 0,
        x[1], y[1], z[1], 0,
        x[2], y[2], z[2], 0,
        -dot(x, eye), -dot(y, eye), -dot(z, eye), 1
    ])
}

//获取正交投影矩阵
function getOrthoicMatrix(l, r, t, b, n, f) {
    return new Float32Array([
        2 / (r - l), 0, 0, 0,
        0, 2 / (t - b), 0, 0,
        0, 0, -2 / (f - n), 0,
        -(r + l) / (r - l), -(t + b) / (t - b), -(f + n) / (f - n), 1
    ])
}


//获取透视投影矩阵
function getPerspectiveMatrix(fov, aspect, far, near) {
    fov = fov * Math.PI / 180;
    return new Float32Array([
        1 / (aspect * Math.tan(fov / 2)), 0, 0, 0,
        0, 1 / (Math.tan(fov / 2)), 0, 0,
        0, 0, -(far + near) / (far - near), -(2 * far * near) / (far - near),
        0, 0, -1, 0,
    ])
}