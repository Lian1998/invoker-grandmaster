import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const containerDiv = document.querySelector('#viewport-cotnainer');
containerDiv.style.width = '100%';
containerDiv.style.height = '100vh';

const clientQualityMap = {};
const getClientQuality = (queryString = '#viewport') => {
    let el = null;
    if (clientQualityMap[queryString]) { el = clientQualityMap[queryString]; }
    else { el = document.querySelector(queryString); }
    if (!el) { throw new Error(`getClientQuality(queryString): could not find '${queryString}'`); }
    const parentNode = el.parentNode;
    const { width, height } = parentNode.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio ? window.devicePixelRatio : 1;
    const width_pixcel_num = width * pixelRatio;
    const height_pixcel_num = height * pixelRatio;
    return { el, width, height, pixelRatio, width_pixcel_num, height_pixcel_num };
}

const { el, width, height, pixelRatio, width_pixcel_num, height_pixcel_num } = getClientQuality();

const scene = new THREE.Scene();
const clock = new THREE.Clock();
const camera = new THREE.PerspectiveCamera(75, width_pixcel_num / height_pixcel_num, 0.1, 1000);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, stencil: false });
renderer.setSize(width_pixcel_num, height_pixcel_num);
renderer.setPixelRatio(pixelRatio);
renderer.setClearColor(0x000000);

const rtt = new THREE.WebGLRenderTarget(width_pixcel_num, height_pixcel_num);
rtt.texture.colorSpace = THREE.SRGBColorSpace;

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

// 倒影平面
const invert_group = new THREE.Group();
const invert_plane_geom = new THREE.PlaneGeometry(5., 5.);
const invert_plane = new THREE.Mesh(invert_plane_geom, new THREE.MeshBasicMaterial({ color: 0xffffff }));
invert_group.add(invert_plane);

const invert_frame_geom = new THREE.BufferGeometry();
const planeAttributes = invert_plane_geom.attributes.position;
invert_frame_geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(4 * 3), 3));
const indexes = [0, 1, 3, 2];
for (let i = 0; i < indexes.length; i++) {
    invert_frame_geom.attributes.position.setXYZ(
        i,
        planeAttributes.getX(indexes[i]),
        planeAttributes.getY(indexes[i]),
        planeAttributes.getZ(indexes[i])
    );
}
invert_frame_geom.attributes.position.needsUpdate = true;
const invert_frame = new THREE.LineLoop(invert_frame_geom, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1 }));
invert_group.add(invert_frame);

scene.add(invert_group);
invert_group.rotateX(-Math.PI / 2);
invert_group.position.set(0, -5, 0);

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
    planeGeom.dispose();

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
t_ember.colorSpace = THREE.SRGBColorSpace;
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

// 热效应
import hazeVert from './hazeVert.glsl?raw'
import hazeFrag from './hazeFrag.glsl?raw'
const t_haze = textureLoader.load('/flame/haze.png');
t_haze.colorSpace = THREE.SRGBColorSpace;
let haze = {};
{
    const vertex_num = 12;
    haze.vertex_num = vertex_num;

    const _geometry = new THREE.InstancedBufferGeometry();
    _geometry.instanceCount = vertex_num;
    haze.geometry = _geometry;

    const planeGeom = new THREE.PlaneGeometry(2, 2);
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
    planeGeom.dispose();


    const base = new THREE.InstancedBufferAttribute(new Float32Array(vertex_num * 3), 3);
    const offset = new THREE.InstancedBufferAttribute(new Float32Array(vertex_num * 3), 3);
    const orientation = new THREE.InstancedBufferAttribute(new Float32Array(vertex_num * 4), 4);
    const scale = new THREE.InstancedBufferAttribute(new Float32Array(vertex_num * 2), 2);
    const rotation = new THREE.InstancedBufferAttribute(new Float32Array(vertex_num), 1);
    const life = new THREE.InstancedBufferAttribute(new Float32Array(vertex_num), 1);

    for (let i = 0; i < vertex_num; i++) {
        orientation.setXYZW(i, 0, 0, 0, 1);
        life.setX(i, i / vertex_num + 1);
    }

    _geometry.setAttribute('base', base);
    _geometry.setAttribute('offset', offset);
    _geometry.setAttribute('orientation', orientation);
    _geometry.setAttribute('scale', scale);
    _geometry.setAttribute('rotation', rotation);
    _geometry.setAttribute('life', life);

    const _material = new THREE.ShaderMaterial({
        uniforms: {
            uMap: { value: rtt.texture },
            uMask: { value: t_haze },
            uResolution: { value: new THREE.Vector2(width_pixcel_num, height_pixcel_num) },
        },
        vertexShader: hazeVert,
        fragmentShader: hazeFrag,
        transparent: true,
        depthTest: false,
    });
    haze.material = _material;

    const _mesh = new THREE.Mesh(_geometry, _material);
    _mesh.frustumCulled = false;
    scene.add(_mesh);
    haze.mesh = _mesh;


}


const animate = () => {

    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // 进行一次离屏渲染
    flame.mesh.visible = false;
    ember.mesh.visible = false;
    invert_group.visible = false;
    haze.mesh.visible = false;
    renderer.setRenderTarget(rtt);
    renderer.render(scene, camera);

    // flame
    flame.mesh.visible = true;
    if (flame.geometry && flame.material) {
        const a_life = flame.geometry.attributes.life;
        const a_orientation = flame.geometry.attributes.orientation;
        for (let i = 0; i < flame.vertex_num; i++) {
            let life_val = a_life.array[i];
            life_val += 0.08;
            if (life_val > 1) {
                life_val -= 1;
                _quat.setFromAxisAngle(_axisy, random(0, 3.14, 3)); // y轴变化
                _quat_1.setFromAxisAngle(_axisx, random(-1, 1, 2) * 0.1); // x轴变化
                _quat.multiply(_quat_1);
                _quat_1.setFromAxisAngle(_axisz, random(-1, 1, 2) * 0.3); // z轴变化
                _quat.multiply(_quat_1);
                a_orientation.setXYZW(i, _quat.x, _quat.y, _quat.z, _quat.w);
            }
            a_life.setX(i, life_val);
        }
        a_life.needsUpdate = true;
        a_orientation.needsUpdate = true;

        const u_time = flame.material.uniforms.uTime;
        u_time.value = elapsedTime;
    }

    // ember
    ember.mesh.visible = true;
    if (ember.geometry && ember.material) {
        const a_life = ember.geometry.attributes.life;
        const a_position = ember.geometry.attributes.position;
        const a_offset = ember.geometry.attributes.offset;
        const a_random = ember.geometry.attributes.random;
        for (let i = 0; i < ember.vertex_num; i++) {
            let life_val = a_life.array[i];
            life_val += 0.015 + 0.005 * random(0., 1., 3);
            if (life_val > 1) {
                life_val -= 1;
                if (!flame.mesh) continue;
                a_position.setXYZ(i, flame.mesh.position.x, flame.mesh.position.y + 0.1, flame.mesh.position.z);
                a_offset.setXYZ(i, random(-0.3, 0.3, 3), random(0.6, 1.4, 3), random(-0.3, 0.3, 3));
            }
            a_life.setX(i, life_val);
            a_random.setX(i, random(0., 1., 3));
        }
        a_life.needsUpdate = true;
        a_position.needsUpdate = true;
        a_offset.needsUpdate = true;
        a_random.needsUpdate = true;
    }


    // invert
    invert_group.visible = true;
    invert_plane.material.map = rtt.texture;

    // haze
    haze.mesh.visible = true;
    if (haze.geometry && haze.material) {
        const a_life = haze.geometry.attributes.life;
        const a_base = haze.geometry.attributes.base;
        const a_offset = haze.geometry.attributes.offset;
        const a_scale = haze.geometry.attributes.scale;
        const a_orientation = haze.geometry.attributes.orientation;
        const a_rotation = haze.geometry.attributes.rotation;

        for (let i = 0; i < haze.vertex_num; i++) {
            let value = a_life.array[i];
            value += 0.008;

            if (value > 1) {
                value -= 1;
                a_rotation.setX(i, random(0, 3.14, 3));
                a_base.setXYZ(i, flame.mesh.position.x, flame.mesh.position.y + 0.1, flame.mesh.position.z);
                a_offset.setXYZ(i, random(-0.2, 0.2, 3), random(2.5, 3.0, 3), 0);
                a_scale.setXY(i, random(0.6, 1.2, 3), random(0.6, 1.2, 3));
            }

            _quat.copy(camera.quaternion);
            _quat_1.setFromAxisAngle(_axisz, a_rotation.array[i]);
            _quat.multiply(_quat_1);
            a_orientation.setXYZW(i, _quat.x, _quat.y, _quat.z, _quat.w);

            a_life.setX(i, value);
        }

        a_life.needsUpdate = true;
        a_base.needsUpdate = true;
        a_offset.needsUpdate = true;
        a_scale.needsUpdate = true;
        a_orientation.needsUpdate = true;
        a_rotation.needsUpdate = true;

        const u_map = haze.material.uniforms.uMap;
        u_map.value = rtt.texture;
    }

    // 最终渲染到canvas#viewport
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);

    orbitcontrols.update();
}



const onResize = () => {
    const { el, width, height, pixelRatio, width_pixcel_num, height_pixcel_num } = getClientQuality();

    // pixel ratio
    renderer.setSize(width_pixcel_num, height_pixcel_num);
    renderer.setPixelRatio(pixelRatio);

    // camera
    camera.aspect = width_pixcel_num / height_pixcel_num;
    camera.updateProjectionMatrix();

    // rtt
    haze.material.uniforms.uResolution.value.set(width_pixcel_num, height_pixcel_num);
}
window.addEventListener('resize', onResize);

animate();