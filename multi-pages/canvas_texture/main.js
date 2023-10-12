import * as THREE from 'three';
import { OrbitControls } from 'three_addons/controls/OrbitControls.js';

const width = window.innerWidth;
const height = window.innerHeight;
const pixelRatio = window.pixelRatio;
const el = document.getElementById('viewport');

const scene = new THREE.Scene();
const clock = new THREE.Clock();
const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
camera.position.set(2, 2, 2);

const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(width, height);
renderer.setPixelRatio(pixelRatio);

const orbitcontrols = new OrbitControls(camera, renderer.domElement);

/////////////////////////////// VISIABLE TEXTURE RTT

renderer.autoClear = false;

let rtt_mesh;
const RT_SIZE = 300;
const rtt = new THREE.WebGLRenderTarget(RT_SIZE, RT_SIZE);

const rttscene = new THREE.Scene();
{
    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(0, 1, 1).normalize();
    rttscene.add(light);
}
{
    const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(0.05, 0.05, 0.05);
    rttscene.add(mesh);
    rtt_mesh = mesh;
}

const domel = document.querySelector('#preview');
const ctx2d = domel.getContext('2d');
const buffer = new Uint8Array(4 * RT_SIZE * RT_SIZE); // 装buffer
const pixcelArr = new Uint8ClampedArray(buffer.buffer);

////////////////////////////////
{
    const light = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(light);
}
{
    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(0, 1, 1).normalize();
    scene.add(light);
}
{
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff, map: rtt.texture });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
}

scene.add(new THREE.AxesHelper(3));

///////////////////////////////


const animate = () => {

    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    renderer.clear();

    rtt_mesh.rotation.y += 0.01; // 让rtt动起来

    renderer.setRenderTarget(rtt); // 切换rtt为renderTarget
    renderer.clear(); // 清除rtt上一帧残留的像素
    renderer.render(rttscene, camera);
    renderer.readRenderTargetPixels(rtt, 0, 0, RT_SIZE, RT_SIZE, buffer);
    ctx2d.putImageData(new ImageData(pixcelArr, RT_SIZE, RT_SIZE), 0, 0);

    renderer.setRenderTarget(null); // 切换回来
    renderer.render(scene, camera);

    orbitcontrols.update();
}

animate();