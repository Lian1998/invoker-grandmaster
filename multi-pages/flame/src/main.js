import * as THREE from 'three';
import { OrbitControls } from 'three_addons/controls/OrbitControls.js';

import fireVertexShader from './fireVert.glsl?raw'
import fireFragmentShader from './fireFrag.glsl?raw'
import embersVertexShader from './emberVert.glsl?raw'
import embersFragmentShader from './emberFrag.glsl?raw'
import hazeVertexShader from './hazeVert.glsl?raw'
import hazeFragmentShader from './hazeFrag.glsl?raw'


(function () {
    var _renderer, _scene, _camera, _controls, _rtt, _fire;
    var _width, _height;

    window.onload = init;

    function init() {
        initWorld();
        initScene();
    }

    //=====// Utils //========================================//     

    function random(min, max, precision) {
        var p = Math.pow(10, precision);
        return Math.round((min + Math.random() * (max - min)) * p) / p;
    }

    //=====// World //========================================//     

    function initWorld() {
        _renderer = new THREE.WebGLRenderer();
        _renderer.setPixelRatio(2);
        _renderer.setSize(window.innerWidth, window.innerHeight);
        _renderer.setClearColor(0x000000);
        document.body.appendChild(_renderer.domElement);

        _scene = new THREE.Scene();

        _camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        _camera.position.set(0, 0, 4);
        _camera.target = new THREE.Vector3();
        _camera.lookAt(_camera.target);

        _controls = new OrbitControls(_camera, _renderer.domElement);
        _controls.enableDamping = true;
        // _controls.dampingFactor = 0.1;
        // _controls.rotateSpeed = 0.1;

        window.addEventListener('resize', resize, false);
        resize();
        requestAnimationFrame(render);
    }

    function resize() {
        _width = window.innerWidth;
        _height = window.innerHeight;
        _renderer.setSize(_width, _height);
        _camera.aspect = _width / _height;
        _camera.updateProjectionMatrix();
        resetRT();
    }

    function resetRT() {
        var _parameters = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBuffer: false
        };
        if (_rtt) _rtt.dispose();
        _rtt = new THREE.WebGLRenderTarget(_width * 0.5, _height * 0.5, _parameters);
        _rtt.texture.colorSpace = THREE.SRGBColorSpace;
    }

    function render() {
        requestAnimationFrame(render);
        if (_controls) _controls.update();
        _renderer.setRenderTarget(null)
        _renderer.render(_scene, _camera);
    }

    //=====// Scene //========================================//     

    function initScene() {
        initBackground();
        initFire();
        initEmbers();
        initHaze();
    }

    function initBackground() {
        var background = new THREE.Mesh(
            new THREE.BoxGeometry(4, 4, 4),
            new THREE.MeshBasicMaterial({
                side: THREE.BackSide
            })
        );
        _scene.add(background);

        var textureLoader = new THREE.TextureLoader();
        textureLoader.load('./resources/rock.jpg', t => {
            t.colorSpace = THREE.SRGBColorSpace;
            background.material.map = t;
            background.material.needsUpdate = true;
        });
    }

    //=====// Fire //========================================//     

    function initFire() {
        var _geometry, _shader, _mesh, _group;
        var _num = 12;

        var _x = new THREE.Vector3(1, 0, 0);
        var _y = new THREE.Vector3(0, 1, 0);
        var _z = new THREE.Vector3(0, 0, 1);

        var _tipTarget = new THREE.Vector3();
        var _tip = new THREE.Vector3();
        var _diff = new THREE.Vector3();

        var _quat = new THREE.Quaternion();
        var _quat2 = new THREE.Quaternion();

        (function () {
            initGeometry();
            initInstances();
            initShader();
            initMesh();
            requestAnimationFrame(loop);
        })();

        function initGeometry() {
            _geometry = new THREE.InstancedBufferGeometry();
            _geometry.maxInstancedCount = _num;

            var shape = new THREE.PlaneGeometry(1, 1);

            shape.translate(0, 0.4, 0); // 平移
            var data = shape.attributes;

            _geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(data.position.array), 3));
            _geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(data.uv.array), 2));
            _geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(data.normal.array), 3));
            _geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(shape.index.array), 1));
            shape.dispose();
        }

        function initInstances() {
            var orientation = new THREE.InstancedBufferAttribute(new Float32Array(_num * 4), 4);
            var randoms = new THREE.InstancedBufferAttribute(new Float32Array(_num), 1);
            var scale = new THREE.InstancedBufferAttribute(new Float32Array(_num * 2), 2);
            var life = new THREE.InstancedBufferAttribute(new Float32Array(_num), 1);

            for (let i = 0; i < _num; i++) {
                orientation.setXYZW(i, 0, 0, 0, 1);
                life.setX(i, i / _num + 1);
            }

            _geometry.setAttribute('orientation', orientation);
            _geometry.setAttribute('scale', scale);
            _geometry.setAttribute('life', life);
            _geometry.setAttribute('random', randoms);
        }

        function initShader() {
            var uniforms = {
                uMap: {
                    type: 't',
                    value: null
                },
                uColor1: {
                    type: 'c',
                    value: new THREE.Color(0x961800)
                }, // red
                uColor2: {
                    type: 'c',
                    value: new THREE.Color(0x4b5828)
                }, // yellow
                uTime: {
                    type: 'f',
                    value: 0
                },
            };

            _shader = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: fireVertexShader,
                fragmentShader: fireFragmentShader,
                blending: THREE.AdditiveBlending,
                transparent: true,
                depthWrite: false,
                side: THREE.DoubleSide,
            });

            var textureLoader = new THREE.TextureLoader();
            textureLoader.load('./resources/flame.png', t => {
                t.colorSpace = THREE.SRGBColorSpace;
                _shader.uniforms.uMap.value = t;
            });
        }

        function initMesh() {
            _group = new THREE.Group();
            _mesh = new THREE.Mesh(_geometry, _shader);
            _mesh.frustumCulled = false;
            _group.add(_mesh);
            _scene.add(_group);
            _fire = _group;
        }

        function loop(e) {
            requestAnimationFrame(loop);
            _shader.uniforms.uTime.value = e * 0.001;

            var life = _geometry.attributes.life;
            var orientation = _geometry.attributes.orientation;
            var scale = _geometry.attributes.scale;
            var randoms = _geometry.attributes.random;

            for (let i = 0; i < _num; i++) {
                var value = life.array[i];
                value += 0.04;

                if (value > 1) {
                    value -= 1;

                    _quat.setFromAxisAngle(_y, random(0, 3.14, 3));
                    _quat2.setFromAxisAngle(_x, random(-1, 1, 2) * 0.1);
                    _quat.multiply(_quat2);
                    _quat2.setFromAxisAngle(_z, random(-1, 1, 2) * 0.3);
                    _quat.multiply(_quat2);
                    orientation.setXYZW(i, _quat.x, _quat.y, _quat.z, _quat.w);

                    scale.setXY(i, random(0.8, 1.2, 3), random(0.8, 1.2, 3));
                    randoms.setX(i, random(0, 1, 3));
                }

                life.setX(i, value);
            }
            life.needsUpdate = true;
            orientation.needsUpdate = true;
            scale.needsUpdate = true;
            randoms.needsUpdate = true;

            _group.position.x = Math.sin(e * 0.002) * 1.4;
            _group.position.y = Math.cos(e * 0.0014) * 0.2;
            _group.position.z = Math.cos(e * 0.0014) * 0.5;

            let tipOffset = 0.4;
            _tipTarget.copy(_group.position);
            _tipTarget.y += tipOffset;
            _tip.lerp(_tipTarget, 0.1);

            _diff.copy(_tip);
            _diff.sub(_group.position);
            let length = _diff.length();
            _group.scale.y = (length / tipOffset - 1) * 0.4 + 1;

            _group.quaternion.setFromUnitVectors(_y, _diff.normalize());
        }
    }

    //=====// Embers //========================================//     

    function initEmbers() {
        var _geometry, _shader, _points;
        var _num = 8;

        (function () {
            initGeometry();
            initShader();
            initMesh();
            requestAnimationFrame(loop);
        })();

        function initGeometry() {
            _geometry = new THREE.BufferGeometry();
            _geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(_num * 3), 3));
            _geometry.setAttribute('offset', new THREE.BufferAttribute(new Float32Array(_num * 3), 3));
            _geometry.setAttribute('size', new THREE.BufferAttribute(new Float32Array(_num), 1));
            _geometry.setAttribute('life', new THREE.BufferAttribute(new Float32Array(_num), 1));

            for (var i = 0; i < _num; i++) {
                _geometry.attributes.life.setX(i, random(0, 1, 3) + 1);
            }
        }

        function initShader() {
            var uniforms = {
                uMap: {
                    type: 't',
                    value: null
                },
                uColor: {
                    type: 'c',
                    value: new THREE.Color(0xffe61e)
                },
            };

            _shader = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: embersVertexShader,
                fragmentShader: embersFragmentShader,
                blending: THREE.AdditiveBlending,
                transparent: true,
                depthTest: false,
            });

            var textureLoader = new THREE.TextureLoader();
            textureLoader.load('./resources/ember.png', t => {
                t.colorSpace = THREE.SRGBColorSpace;
                _shader.uniforms.uMap.value = t;
            });
        }

        function initMesh() {
            _points = new THREE.Points(_geometry, _shader);
            _points.frustumCulled = false;
            _scene.add(_points);
        }

        function loop() {
            requestAnimationFrame(loop);
            var life = _geometry.attributes.life;
            var position = _geometry.attributes.position;
            var size = _geometry.attributes.size;
            var offset = _geometry.attributes.offset;
            for (let i = 0; i < _num; i++) {
                var value = life.array[i];
                value += 0.02;

                if (value > 1) {
                    value -= 1;

                    position.setXYZ(i, _fire.position.x, _fire.position.y + 0.1, _fire.position.z);
                    offset.setXYZ(i,
                        random(-0.2, 0.2, 3),
                        random(0.7, 1.2, 3),
                        random(-0.2, 0.2, 3)
                    );
                    size.setX(i, random(0.2, 0.5, 3));
                }

                life.setX(i, value);
            }

            life.needsUpdate = true;
            position.needsUpdate = true;
            size.needsUpdate = true;
            offset.needsUpdate = true;
        }
    }

    //=====// Haze //========================================//     

    function initHaze() {
        var _geometry, _shader, _mesh;

        var _num = 4;

        var _z = new THREE.Vector3(0, 0, 1);
        var _quat = new THREE.Quaternion();
        var _quat2 = new THREE.Quaternion();

        (function () {
            initGeometry();
            initInstances();
            initShader();
            initMesh();
            window.addEventListener('resize', resizeHaze, false);
            resizeHaze();
            requestAnimationFrame(loop);
        })();

        function initGeometry() {
            _geometry = new THREE.InstancedBufferGeometry();
            _geometry.maxInstancedCount = _num;

            var shape = new THREE.PlaneGeometry(2, 2);
            var data = shape.attributes;

            _geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(data.position.array), 3));
            _geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(data.uv.array), 2));
            _geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(data.normal.array), 3));
            _geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(shape.index.array), 1));
            shape.dispose();
        }

        function initInstances() {
            var base = new THREE.InstancedBufferAttribute(new Float32Array(_num * 3), 3);
            var offset = new THREE.InstancedBufferAttribute(new Float32Array(_num * 3), 3);
            var orientation = new THREE.InstancedBufferAttribute(new Float32Array(_num * 4), 4);
            var scale = new THREE.InstancedBufferAttribute(new Float32Array(_num * 2), 2);
            var rotation = new THREE.InstancedBufferAttribute(new Float32Array(_num), 1);
            var life = new THREE.InstancedBufferAttribute(new Float32Array(_num), 1);

            for (let i = 0; i < _num; i++) {
                orientation.setXYZW(i, 0, 0, 0, 1);
                life.setX(i, i / _num + 1);
            }

            _geometry.setAttribute('base', base);
            _geometry.setAttribute('offset', offset);
            _geometry.setAttribute('orientation', orientation);
            _geometry.setAttribute('scale', scale);
            _geometry.setAttribute('rotation', rotation);
            _geometry.setAttribute('life', life);
        }

        function initShader() {
            let dpr = _renderer.getPixelRatio();
            var uniforms = {
                uMap: {
                    type: 't',
                    value: null
                },
                uMask: {
                    type: 't',
                    value: null
                },
                uResolution: {
                    type: 'v2',
                    value: new THREE.Vector2(_width * dpr, _height * dpr)
                },
            };

            _shader = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: hazeVertexShader,
                fragmentShader: hazeFragmentShader,
                transparent: true,
                depthTest: false,
            });

            var textureLoader = new THREE.TextureLoader();
            textureLoader.load('./resources/haze.png', t => {
                t.colorSpace = THREE.SRGBColorSpace;
                _shader.uniforms.uMask.value = t;
            });
        }

        function initMesh() {
            _mesh = new THREE.Mesh(_geometry, _shader);
            _mesh.frustumCulled = false;
            _scene.add(_mesh);
        }

        function resizeHaze() {
            let dpr = _renderer.getPixelRatio();
            _shader.uniforms.uMap.value = _rtt.texture;
            _shader.uniforms.uResolution.value.set(_width * dpr, _height * dpr);
        }

        function loop(e) {
            requestAnimationFrame(loop);

            _mesh.visible = false;
            _renderer.setRenderTarget(_rtt);
            _renderer.render(_scene, _camera);
            _mesh.visible = true;

            var life = _geometry.attributes.life;
            var base = _geometry.attributes.base;
            var offset = _geometry.attributes.offset;
            var scale = _geometry.attributes.scale;
            var orientation = _geometry.attributes.orientation;
            var rotation = _geometry.attributes.rotation;
            for (let i = 0; i < _num; i++) {
                var value = life.array[i];
                value += 0.008;

                if (value > 1) {
                    value -= 1;

                    rotation.setX(i, random(0, 3.14, 3));

                    base.setXYZ(i, _fire.position.x, _fire.position.y + 0.1, _fire.position.z);
                    offset.setXYZ(i,
                        random(-0.2, 0.2, 3),
                        random(2.5, 3.0, 3),
                        0
                    );
                    scale.setXY(i, random(0.6, 1.2, 3), random(0.6, 1.2, 3));
                }

                _quat.copy(_camera.quaternion);
                _quat2.setFromAxisAngle(_z, rotation.array[i]);
                _quat.multiply(_quat2);
                orientation.setXYZW(i, _quat.x, _quat.y, _quat.z, _quat.w);

                life.setX(i, value);
            }

            life.needsUpdate = true;
            base.needsUpdate = true;
            scale.needsUpdate = true;
            offset.needsUpdate = true;
            orientation.needsUpdate = true;
        }
    }

})();