import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const getClientRect = () => {
    const el = document.querySelector('#viewport');
    const parentNode = el.parentNode;
    const { width, height } = parentNode.getBoundingClientRect();;
    return { el, width, height };
}

const { el, width, height } = getClientRect();

const scene = new THREE.Scene();
const clock = new THREE.Clock();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true });
renderer.setClearColor(0x000000);
renderer.setSize(width, height);
renderer.shadowMap.enabled = true;

const onResize = () => {
    const { el, width, height } = getClientRect();
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}
window.addEventListener('resize', onResize);

const orbitcontrols = new OrbitControls(camera, renderer.domElement);
orbitcontrols.maxPolarAngle = Math.PI / 2;

const textureLoader = new THREE.TextureLoader();


// 工具函数

/**
 * 取随机数
 * @param {*} min 范围最小值
 * @param {*} max 范围最大值
 * @param {*} precision 精度
 * @returns 
 */
const random = (min, max, precision) => {
    var p = Math.pow(10, precision);
    return Math.round((min + Math.random() * (max - min)) * p) / p;
}


// 变量
const _axisx = new THREE.Vector3(1, 0, 0);
const _axisy = new THREE.Vector3(0, 1, 0);
const _axisz = new THREE.Vector3(0, 0, 1);
const _quat = new THREE.Quaternion();
const _quat_1 = new THREE.Quaternion();

// 背景
const t_rock = textureLoader.load('/flame/rock.jpg');
t_rock.colorSpace = THREE.SRGBColorSpace;
const bgMesh = new THREE.Mesh(
    new THREE.BoxGeometry(4, 4, 4),
    new THREE.MeshBasicMaterial({ side: THREE.BackSide, map: t_rock })
);
scene.add(bgMesh);

// // 精灵
// const sprite = new THREE.Sprite(
//     new THREE.SpriteMaterial({ map: textureLoader.load('/flame/sprite.jpg') })
// );
// sprite.position.set(0, 5, 0);
// scene.add(sprite);

// // 精灵1(shaderMaterial)
// import mySpriteVert from './mySpriteVert.glsl?raw';
// import mySpriteFrag from './mySpriteFrag.glsl?raw';
// const planeGeom = new THREE.PlaneGeometry(1., 1.);
// console.log(planeGeom);
// const mySpriteMaterial = new THREE.ShaderMaterial({
//     uniforms: {
//         map: { value: textureLoader.load('/flame/sprite.jpg') },
//         scale: { value: new THREE.Vector2(1, 1) },
//     },
//     vertexShader: mySpriteVert,
//     fragmentShader: mySpriteFrag,
//     side: THREE.DoubleSide
// });
// const sprite1 = new THREE.Mesh(planeGeom, mySpriteMaterial);
// // const sprite1 = new THREE.Mesh(planeGeom, new THREE.MeshBasicMaterial({ color: 0xffffff }));
// sprite1.position.set(0, 10, 0);
// scene.add(sprite1);

// 火焰
import flameVert from './flameVert.glsl?raw'
import flameFrag from './flameFrag.glsl?raw'
const t_flame = textureLoader.load('/flame/flame.png');
t_flame.colorSpace = THREE.SRGBColorSpace;
let flame = {};
{
    const vertex_num = 12;
    flame.vertex_num = vertex_num;

    const _geometry = new THREE.InstancedBufferGeometry();
    _geometry.instanceCount = vertex_num;

    const planeGeom = new THREE.PlaneGeometry(1, 1);
    planeGeom.translate(0, .4, 0); // 平移顶点在buffer中的位置, 这个数值涉及到帧图片每帧的重心

    // attributes
    _geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(planeGeom.attributes.position.array), 3)
    );
    _geometry.setAttribute(
        'uv',
        new THREE.BufferAttribute(new Float32Array(planeGeom.attributes.uv.array), 2)
    );
    _geometry.setAttribute(
        'normal',
        new THREE.BufferAttribute(new Float32Array(planeGeom.attributes.normal.array), 3)
    );
    _geometry.setIndex(
        new THREE.BufferAttribute(new Uint16Array(planeGeom.index.array), 1)
    );

    // attributes1
    const lifeArr = [];
    const orientationArr = [];
    for (let i = 0; i < vertex_num; i++) {
        lifeArr[i] = i / vertex_num + 1;
        orientationArr[4 * i] = 0;
        orientationArr[4 * i + 1] = 0;
        orientationArr[4 * i + 2] = 0;
        orientationArr[4 * i + 3] = 1;
    }
    _geometry.setAttribute(
        'orientation',
        new THREE.InstancedBufferAttribute(new Float32Array(orientationArr), 4)
    );
    _geometry.setAttribute(
        'life',
        new THREE.InstancedBufferAttribute(new Float32Array(lifeArr), 1)
    );
    flame.geometry = _geometry;

    const _material = new THREE.ShaderMaterial({
        uniforms: {
            uMap: { value: t_flame },
            uColor1: { value: new THREE.Color(0x961800) }, // red
            uColor2: { value: new THREE.Color(0x4b5828) }, // yellow
            uTime: { value: 0 },
        },
        vertexShader: flameVert,
        fragmentShader: flameFrag,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
    });
    flame.material = _material;

    const _mesh = new THREE.Mesh(_geometry, _material);
    _mesh.frustumCulled = false;
    flame.mesh = _mesh;

    scene.add(_mesh);
}

// 灰烬点
import emberVert from './emberVert.glsl?raw'
import emberFrag from './emberFrag.glsl?raw'
const t_ember = textureLoader.load('/flame/ember.png');
let ember = {}
{
    const vertex_num = 4;
    ember.vertex_num = vertex_num;

    const _geometry = new THREE.BufferGeometry();
    _geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertex_num * 3), 3));
    _geometry.setAttribute('life', new THREE.BufferAttribute(new Float32Array(vertex_num), 1));
    _geometry.setAttribute('random', new THREE.BufferAttribute(new Float32Array(vertex_num), 1));
    _geometry.setAttribute('offset', new THREE.BufferAttribute(new Float32Array(vertex_num * 3), 3));
    ember.geometry = _geometry;

    for (let i = 0; i < vertex_num; i++) {
        _geometry.attributes.life.array[i] += i / vertex_num;
    }
    _geometry.attributes.life.needsUpdate = true;

    const _material = new THREE.ShaderMaterial({
        uniforms: {
            uMap: { value: t_ember },
            uColor: { value: new THREE.Color(0xffe61e) },
        },
        vertexShader: emberVert,
        fragmentShader: emberFrag,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthTest: false,
    });
    ember.material = _material;

    const _mesh = new THREE.Points(_geometry, _material);
    _mesh.frustumCulled = false;
    ember.mesh = _mesh;

    scene.add(_mesh);
}



const animate = () => {

    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // flame
    if (flame.geometry && flame.material) {
        const aLife = flame.geometry.attributes.life;
        const aOrientation = flame.geometry.attributes.orientation;
        for (let i = 0; i < flame.vertex_num; i++) {
            let life_val = aLife.array[i];
            life_val += 0.08;
            if (life_val > 1) {
                life_val -= 1;
                _quat.setFromAxisAngle(_axisy, random(0, 3.14, 3)); // y轴变化
                _quat_1.setFromAxisAngle(_axisx, random(-1, 1, 2) * 0.1); // x轴变化
                _quat.multiply(_quat_1);
                _quat_1.setFromAxisAngle(_axisz, random(-1, 1, 2) * 0.3); // z轴变化
                _quat.multiply(_quat_1);
                aOrientation.setXYZW(i, _quat.x, _quat.y, _quat.z, _quat.w);
            }
            aLife.setX(i, life_val);
        }
        aOrientation.needsUpdate = true;
        aLife.needsUpdate = true;

        const uTime = flame.material.uniforms.uTime;
        uTime.value = elapsedTime;
    }


    // ember
    if (ember.geometry && ember.material) {
        const aLife = ember.geometry.attributes.life;
        const aPosition = ember.geometry.attributes.position;
        const aOffset = ember.geometry.attributes.offset;
        const aRandom = ember.geometry.attributes.random;
        for (let i = 0; i < ember.vertex_num; i++) {
            let life_val = aLife.array[i];
            life_val += 0.015 + 0.005 * random(0., 1., 3);
            if (life_val > 1) {
                life_val -= 1;
                if (!flame.mesh) continue;
                aPosition.setXYZ(i, flame.mesh.position.x, flame.mesh.position.y + 0.1, flame.mesh.position.z);
                aOffset.setXYZ(i, random(-0.3, 0.3, 3), random(0.6, 1.4, 3), random(-0.3, 0.3, 3));
            }
            aLife.setX(i, life_val);
            aRandom.setX(i, random(0., 1., 3));
        }
        aLife.needsUpdate = true;
        aPosition.needsUpdate = true;
        aOffset.needsUpdate = true;
        aRandom.needsUpdate = true;
    }

    renderer.render(scene, camera);
    orbitcontrols.update();
}

animate();