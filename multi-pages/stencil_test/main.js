import * as THREE from 'three';
import { OrbitControls } from 'three_addons/controls/OrbitControls.js';

const width = window.innerWidth;
const height = window.innerHeight;
const pixelRatio = window.pixelRatio;
const el = document.getElementById('viewport');

const scene = new THREE.Scene();
const clock = new THREE.Clock();
const camera = new THREE.PerspectiveCamera(75.0, width / height, 0.1, 1000.0);
camera.position.set(0.0, 0.0, 5.0);

const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(width, height);
renderer.setPixelRatio(pixelRatio);

const orbitcontrols = new OrbitControls(camera, renderer.domElement);
orbitcontrols.minDistance = 5;
orbitcontrols.maxDistance = 100;

////////////////////////////////
const ambient_light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(ambient_light);
const hemisphere_light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1.);
scene.add(hemisphere_light);
const direcitonal_light = new THREE.DirectionalLight(0xffffff, .8);
direcitonal_light.position.set(1., 1., 1.);
scene.add(direcitonal_light);

const geometry = new THREE.BoxGeometry(1., 1., 1.);
const material = new THREE.MeshStandardMaterial({
    transparent: true,
    color: 0xffffff,
    stencilWrite: true,
    stencilRef: 1,
    stencilZPass: THREE.ReplaceStencilOp, // 模板测试过程: 模板buffer替换为该材质的设置的stencilRef
});
const maskMaterial = new THREE.MeshStandardMaterial({
    transparent: true,
    opacity: .8,
    color: 0xff0000,
    stencilWrite: true,
    stencilRef: 1,
    stencilFunc: THREE.NotEqualStencilFunc, // 默认使用的比较函数, 只有模板值不相等才能通过模板测试
});

const mesh = new THREE.Mesh(geometry, material);
const maskMesh = new THREE.Mesh(geometry, maskMaterial);
maskMesh.scale.set(1.1, 1.1, 1.1);
maskMesh.renderOrder = 1;

scene.add(mesh);
scene.add(maskMesh);

///////////////////////////////


const animate = () => {
    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    renderer.render(scene, camera);

    orbitcontrols.update();
}

animate();