// define all global variables
window.G = {};

window.onload = (function() {
    gameInit();
    console.log(G);

    // render loop
    renderLoop();
});

// 游戏初始化
function gameInit() {
    G.stats = initStats();
    G.scene = new THREE.Scene();

    G.renderer = new THREE.WebGLRenderer();
    G.renderer.shadowMap.enabled = true;
    G.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // camera
    G.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 500000);
    G.camera.position.set(0, 50000, 0);
    G.camera.lookAt(G.scene.position);

    var controls = new THREE.OrbitControls(G.camera, G.renderer.domElement);

    G.renderer.setClearColor(0x101010, true);
    G.DPR = window.devicePixelRatio ? window.devicePixelRatio : 1;
    G.WW = window.innerWidth;
    G.WH = window.innerHeight;

    G.renderer.setPixelRatio(G.DPR);
    G.renderer.setSize(G.WW, G.WH);

    var axes = new THREE.AxisHelper(5000);
    // z -> blue
    // y -> green
    // x -> red
    // G.scene.add(axes);
    G.StarRing.init();
    G.gameView = 3;
    G.score = 0;
    G.enermys = [];
    G.stars = [];
    addLightToGame();
    addEnermy();
    

    document.getElementById('webgl-output').appendChild(G.renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);
}

// 渲染主循环
function renderLoop() {
    requestAnimationFrame(renderLoop);
    // 第一人称视角
    if (G.StarRing.mesh && G.gameView == 1) {
        var s_pos = G.StarRing.getBackCameraPosition();
        G.camera.position.x = s_pos.x;
        G.camera.position.y = s_pos.y;
        G.camera.position.z = s_pos.z;
        G.camera.lookAt(G.StarRing.mesh.position);
    }
    if (G.StarRing.mesh && G.gameView == 3) {
        G.camera.lookAt(G.StarRing.mesh.position);
    }
    G.stats.update();
    updateStar();
    updateEnermy();
    G.renderer.render(G.scene, G.camera); 
}

function onWindowResize() {
    G.camera.aspect = window.innerWidth / window.innerHeight;
    G.camera.updateProjectionMatrix();
    G.renderer.setSize(window.innerWidth, window.innerHeight);
}

// 游戏光照效果（天体）
function addLightToGame() {
    // Environment Light
    var ambient = new THREE.AmbientLight( 0x233333 );
	G.scene.add( ambient );

    // 太阳
    var loader = new THREE.TextureLoader();
    loader.load('./texture/sun.jpg', function(texture) {
        var sunGeo = new THREE.SphereGeometry(3000, 50, 50);
        var sunLight = new THREE.PointLight(0x666666, 10, 200000);
        var sun = new THREE.Mesh(sunGeo, new THREE.MeshLambertMaterial({
            // color: 0xff3300,
            emissive: 0xff3300,
            map: texture
        }));
        sunLight.add(sun);
        G.sun = sun;
        sunLight.position.set(0,0,0);
        G.scene.add(sunLight);
    });
    var Mercury = createStar('Mercury', 'rgb(124,131,203)', 5000, 200);
    var Venus = createStar('Venus', 'rgb(190,138,44)', 12000, 350);
    loader.load('./texture/earth.bmp', function(texture) {
        var Earth = createStar('Earth', 'rgb(46,69,119)', 25000, 400, texture);  
    });
    loader.load('./texture/mars.jpeg', function(texture) {
        var Mars = createStar('Mars', 'rgb(210,81,16)', 35000, 300, texture); 
    });
    loader.load('./texture/jupiter.jpeg', function(texture) {
        var Jupiter = createStar('Jupiter', 'rgb(254,208,101)', 55000, 1800, texture);    
    });
    loader.load('./texture/saturn.jpg', function(texture) {
        var Saturn = createStar('Saturn', 'rgb(210,140,39)', 75000, 1500, texture);
    });
    var Uranus = createStar('Uranus', 'rgb(49,168,218)', 85000, 800);
    var Neptune = createStar('Neptune', 'rgb(84,125,204)', 105000, 700);


    // 星海
    var particles = 50000;
    var bufferGeometry = new THREE.BufferGeometry();
    var positions = new Float32Array(particles * 3);
    var colors = new Float32Array( particles * 3 );
    var color = new THREE.Color();

    var areaL = 70000;
    for ( let i = 0; i < positions.length; i += 3 ) {
        positions[i] = RandomPos(areaL);
        positions[i+1] = RandomPos(areaL);
        positions[i+2] = RandomPos(areaL);

        color.setRGB(1, 1, 1);
        colors[i] = color.r;
        colors[i+1] = color.g;
        colors[i+2] = color.b;
    }

    bufferGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    bufferGeometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
    bufferGeometry.computeBoundingSphere();

    /*星星的material*/
    let material = new THREE.PointsMaterial( { size: 50, vertexColors: THREE.VertexColors } );
    var particleSystem = new THREE.Points( bufferGeometry, material );
    G.scene.add( particleSystem );

}

/**
 * 创建行星天体
 * @param {*} name 行星名字
 * @param {*} color 星表颜色
 * @param {*} distance 与太阳的距离
 * @param {*} radius 星体半径
 */
function createStar(name, color, distance, radius, texture) {
    if (texture) {
        color = null;
    }
    var geo = new THREE.SphereGeometry(radius, 50, 50);
    var mat = new THREE.MeshLambertMaterial({
        color: color,
        emissive: color,
        map: texture
    });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.name = name;
    mesh.position.z = distance;
    var star = {
        name: name,
        mesh: mesh,
        distance: distance,
        r: radius
    };
    // 为土星添加星环
    if (name == 'Saturn') {
        var ringGeo = new THREE.RingGeometry(radius + 500, radius + 800, 64, 1);
        G.ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide,
            map: texture
        }));
        G.ring.position.z = distance;
        G.ring.rotation.x = Math.PI / 4;
        G.scene.add(G.ring);
    }
    //星轨
    var track = new THREE.Mesh(new THREE.RingGeometry(distance-10, distance+10, 50, 1),
        new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide } )
    );
    track.rotation.x = - Math.PI / 2;
    G.scene.add(track);
    G.stars.push(star);
    G.scene.add(mesh);
    return star;
}

// 行星运动
function updateStar() {
    var time = Date.now() * 0.0001;
    for (var i = 0; i < G.stars.length; i++) {
        var c = G.stars[i];
        c.mesh.position.set(c.distance * Math.cos(time / (i + 1)), 0, c.distance * Math.sin(time / (i + 1)));
        if (c.name == 'Saturn') {
            G.ring.position.set(c.distance * Math.cos(time / (i + 1)), 0, c.distance * Math.sin(time / (i + 1)));
        }
        c.mesh.rotation.y += 0.01;
    }
}

// 添加敌人
function addEnermy(num) {
    if (!num){
        num = 300
    };
    var areaL = 10000;
    // 四面体飞行器
    var enermyGeo = new THREE.TetrahedronGeometry(100, 0);
    for (var i = 0; i < num; i++) {
        var enermy = new THREE.Mesh(enermyGeo, new THREE.MeshLambertMaterial({
            color: 0x01a1ba,
            emissive: 0xff0000
        }));
        enermy.position.set(RandomPos(areaL), RandomPos(areaL), RandomPos(areaL));
        G.scene.add(enermy);
        G.enermys.push(enermy);
    }
}

// 敌方飞行器运动
function updateEnermy() {
    var time = Date.now() * 0.0001;
    for(var i = 0; i < G.enermys.length; i++) {
        var e = G.enermys[i];
        // var r = Math.sqrt(e.position.x * e.position.x + e.position.z * e.position.z);
        e.position.x += i * Math.sin(time*3 + i);
        e.position.z += i * Math.cos(time*3 + i);
    }
}

// 从场景中彻底删除obj
function freeMemory(Obj) {
    if (Obj.geometry) {
        Obj.geometry.dispose();
    }
    if (Obj.material) {
        Obj.material.dispose();
    }
    G.scene.remove(Obj);
    Obj = null;
}

// 位置点随机函数
function RandomPos(area) {
    return Math.pow(-1, Math.round(Math.random())) * Math.floor(Math.random() * area);
}

// 计算距离
function calDistance(pos1, pos2) {
    return Math.sqrt(Math.pow((pos1.x - pos2.x), 2) + Math.pow((pos1.y - pos2.y), 2) + Math.pow((pos1.z - pos2.z), 2));
}

