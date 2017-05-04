// 创建星环号
G.StarRing = {
    speed: 0,
    maxSpeed: 50,
    acc: 0.06,  //加速度
    direction: null, // object x axis
    yAxis: null, // object y axis
    zAxis: null, // object z axis
    cameraDir: null,
    timers: [],
    init: function() {
        var manager = new THREE.LoadingManager();
	    manager.onProgress = function ( item, loaded, total ) {
	    	console.log( item, loaded, total );
	    };
	    var texture = new THREE.Texture();

        var loader = new THREE.ImageLoader( manager );
	    loader.load( 'texture/star_ring.jpg', function ( image ) {
	    	texture.image = image;
	    	texture.needsUpdate = true;
	    } );

        var loader = new THREE.OBJLoader(manager);
        loader.load('model/star_ring.obj', function(object) {
            G.StarRing.mesh = object;
            G.StarRing.mesh.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    child.material.map = texture;
                    // child.material.transparent = true;
                }
            });
            // G.StarRing.mesh.setSize(0.5, 0.5, 0.5);
            G.StarRing.mesh.name = '星环号';
            G.StarRing.mesh.position.set(5000,0,5000);

            //星环号灯光系统 start failure
            // var slight = new THREE.PointLight(0x306aba, 1, 100);
            // for (var i = 0; i < 9; i++) {
            //     slight.add(G.StarRing.mesh.children[i]);
            // }
            G.scene.add(G.StarRing.mesh);
        });

        
        // 参数初始化
        this.direction = new THREE.Vector3(-1, 0, 0);
        this.yAxis = new THREE.Vector3(0, 0, 1);
        this.zAxis = new THREE.Vector3(0, 1, 0);
        this.cameraDir = new THREE.Vector3(550, 200, 0);
    },
    // 跟踪第一人称视角位置
    getBackCameraPosition: function() {
        var ship = this;
        var pos = {};
        pos.x = ship.mesh.position.x + this.cameraDir.x;
        pos.y = ship.mesh.position.y + this.cameraDir.y;
        pos.z = ship.mesh.position.z + this.cameraDir.z;
        return pos;
    },
    // 飞船航行
    moveForward: function() {
        var ship = this;
        if (ship.timers[0]) {
            return;
        }
        ship.timers[0] = setInterval(function() {
            var cosx = ship.direction.x.toFixed(2);
            var cosy = ship.direction.y.toFixed(2);
            var cosz = ship.direction.z.toFixed(2);
            ship.mesh.position.x += ship.speed * cosx;
            ship.mesh.position.y += ship.speed * cosy;
            ship.mesh.position.z += ship.speed * cosz;
            if (ship.speed <= ship.maxSpeed) {
                ship.speed += ship.acc;
            }
        }, 50/3);
    },
    // 停止某项活动
    holdAction: function(timer_id) {
        // 星环号有几个控制timer，0为航行，1为转向，2为侧身，3为抬升下降, -1停止所有活动，待命
        var ship = this;
        if (!timer_id) {
            ship.timers.forEach(function(t, index) {
                if (t) {
                    clearInterval(t);
                }
            });
            ship.timers = [];        
        } else if (timer_id == 1) {
            clearInterval(ship.timers[1]);
            ship.timers[1] = undefined;
        } else if (timer_id == 2) {
            clearInterval(ship.timers[2]);
            ship.timers[2] = undefined;
        } else if (timer_id == 3) {
            clearInterval(ship.timers[3]);
            ship.timers[3] = undefined;
        }
    },
    turnLeft: function() {
        var ship = this;
        if (ship.timers[1]) {
            return;
        }

        ship.timers[1] = setInterval(function() {
            rotateAroundWorldAxis(ship.mesh, ship.zAxis, 0.02);
            ship.direction.applyAxisAngle(ship.zAxis, 0.02).normalize();
            ship.yAxis.applyAxisAngle(ship.zAxis, 0.02).normalize();
            ship.cameraDir.applyAxisAngle(ship.zAxis, 0.02);     
        }, 50/3);
    },
    turnRight: function() {
        var ship = this;
        if (ship.timers[1]) {
            return;
        }
        ship.timers[1] = setInterval(function() {
            rotateAroundWorldAxis(ship.mesh, ship.zAxis, -0.02);
            ship.direction.applyAxisAngle(ship.zAxis, -0.02).normalize();
            ship.yAxis.applyAxisAngle(ship.zAxis, -0.02).normalize();
            ship.cameraDir.applyAxisAngle(ship.zAxis, -0.02);     
            
        }, 50/3);
    },
    leanLeft: function() {
        var ship = this;
        if (ship.timers[2]) {
            return;
        }
        ship.timers[2] = setInterval(function() {
            rotateAroundWorldAxis(ship.mesh, ship.direction, -0.03);
            ship.zAxis.applyAxisAngle(ship.direction, -0.03).normalize();
            ship.yAxis.applyAxisAngle(ship.direction, -0.03).normalize();
            // ship.cameraDir.applyAxisAngle(ship.direction, -0.03);     
            
        }, 50/3);
    },
    leanRight: function() {
        var ship = this;
        if (ship.timers[2]) {
            return;
        }
        ship.timers[2] = setInterval(function() {
            rotateAroundWorldAxis(ship.mesh, ship.direction, 0.03);
            rotateAroundWorldAxis(G.camera, ship.direction,  0.03);

            ship.zAxis.applyAxisAngle(ship.direction, 0.03).normalize();           
            ship.yAxis.applyAxisAngle(ship.direction, 0.03).normalize();  
            // ship.cameraDir.applyAxisAngle(ship.direction, 0.03);     
                     
        }, 50/3);
    },
    rise: function() {
        var ship = this;
        if (ship.timers[3]) {
            return;
        }
        ship.timers[3] = setInterval(function() {
            rotateAroundWorldAxis(ship.mesh, ship.yAxis, -0.02);
            ship.direction.applyAxisAngle(ship.yAxis, -0.02);        
            ship.zAxis.applyAxisAngle(ship.yAxis, -0.02);
            ship.cameraDir.applyAxisAngle(ship.yAxis, -0.02);     
                  
        }, 50/3);
    },
    fall: function() {
        var ship = this;
        if (ship.timers[3]) {
            return;
        }
        ship.timers[3] = setInterval(function() {
            rotateAroundWorldAxis(ship.mesh, ship.yAxis, 0.02);
            ship.direction.applyAxisAngle(ship.yAxis, 0.02);        
            ship.zAxis.applyAxisAngle(ship.yAxis, 0.02);  
            ship.cameraDir.applyAxisAngle(ship.yAxis, 0.02);     
                  
        }, 50/3);
    },
    laserAttack: function() {
        var ship = this;
        var laserGeo = new THREE.CylinderGeometry(2, 2, 300, 10, 1);
        var laser = new THREE.Mesh(laserGeo, new THREE.MeshLambertMaterial({
            color: 0xff0000,
            emissive: 0xff0000
        }));

        laser.position.set(ship.mesh.position.x, ship.mesh.position.y, ship.mesh.position.z);
        laser.rotation.x = ship.mesh.rotation.x;
        laser.rotation.y = ship.mesh.rotation.y;
        laser.rotation.z = ship.mesh.rotation.z;
        laser.rotation.z += Math.PI / 2;        
        G.scene.add(laser);
        // 激光发射
        var cosx = ship.direction.x.toFixed(2);
        var cosy = ship.direction.y.toFixed(2);
        var cosz = ship.direction.z.toFixed(2);

        var laserTimer = setInterval(function() {
            laser.position.x += 80 * cosx;
            laser.position.y += 80 * cosy;
            laser.position.z += 80 * cosz;
            for (var i = 0; i < G.enermys.length; i++) {
                if (G.enermys[i] && calDistance(G.enermys[i].position, laser.position) <= 300) {
                    G.score++;
                    console.log('score: ', G.score);
                    $('#game-score').html('score: ' + G.score);
                    freeMemory(laser);
                    freeMemory(G.enermys[i]);
                    clearInterval(laserTimer);
                }
            }
            if (laser.position.x >= 110000 ||
                laser.position.y >= 110000 ||
                laser.position.z >= 110000) {
                    freeMemory(laser);
                    clearInterval(laserTimer);
            }
        }, 50/3);
    }
};


// Rotate an object around an arbitrary axis in object space
var rotObjectMatrix;
function rotateAroundObjectAxis(object, axis, radians) {
    rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);

    // old code for Three.JS pre r54:
    // object.matrix.multiplySelf(rotObjectMatrix);      // post-multiply
    // new code for Three.JS r55+:
    object.matrix.multiply(rotObjectMatrix);

    // old code for Three.js pre r49:
    // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
    // old code for Three.js r50-r58:
    // object.rotation.setEulerFromRotationMatrix(object.matrix);
    // new code for Three.js r59+:
    object.rotation.setFromRotationMatrix(object.matrix);
}

var rotWorldMatrix;
// Rotate an object around an arbitrary axis in world space       
function rotateAroundWorldAxis(object, axis, radians) {
    rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);

    // old code for Three.JS pre r54:
    //  rotWorldMatrix.multiply(object.matrix);
    // new code for Three.JS r55+:
    rotWorldMatrix.multiply(object.matrix);                // pre-multiply

    object.matrix = rotWorldMatrix;

    // old code for Three.js pre r49:
    // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
    // old code for Three.js pre r59:
    // object.rotation.setEulerFromRotationMatrix(object.matrix);
    // code for r59+:
    object.rotation.setFromRotationMatrix(object.matrix);
}


