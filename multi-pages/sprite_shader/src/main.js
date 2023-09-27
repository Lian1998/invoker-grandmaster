import * as THREE from 'three';
import { OrbitControls } from 'three_addons/controls/OrbitControls';

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

const orbitcontrols = new OrbitControls(camera, renderer.domElement);
orbitcontrols.maxPolarAngle = Math.PI / 2;

const textureLoader = new THREE.TextureLoader();


// 背景
const t_rock = textureLoader.load('/flame/resources/rock.jpg');
t_rock.colorSpace = THREE.SRGBColorSpace;
const bgMesh = new THREE.Mesh(
    new THREE.BoxGeometry(4, 4, 4),
    new THREE.MeshBasicMaterial({ side: THREE.BackSide, map: t_rock })
);
scene.add(bgMesh);

// 精灵
const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: textureLoader.load('/fortest/sprite.jpg') })
);
sprite.position.set(0, 0, 0);
scene.add(sprite);

// 精灵1(shaderMaterial)
import mySpriteVert from './mySpriteVert.glsl?raw';
import mySpriteFrag from './mySpriteFrag.glsl?raw';
const planeGeom = new THREE.PlaneGeometry(1., 1.);
const mySpriteMaterial = new THREE.ShaderMaterial({
    uniforms: {
        map: { value: textureLoader.load('/fortest/sprite.jpg') },
        scale: { value: new THREE.Vector2(1, 1) },
    },
    vertexShader: mySpriteVert,
    fragmentShader: mySpriteFrag,
    side: THREE.DoubleSide
});
const sprite1 = new THREE.Mesh(planeGeom, mySpriteMaterial);
// const sprite1 = new THREE.Mesh(planeGeom, new THREE.MeshBasicMaterial({ color: 0xffffff }));
sprite1.position.set(0, 5, 0);
scene.add(sprite1);

const animate = () => {

    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

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