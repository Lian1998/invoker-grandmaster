import * as THREE from 'three';

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
    return { el, width, height, pixelRatio };
}

const { el, width, height, pixelRatio } = getClientQuality();


const Camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
Camera.position.x = 2;
Camera.position.y = 2;
Camera.position.z = 2;
Camera.lookAt(0, 0, 0);


const RT_SIZE = 300;
const rtt = new THREE.WebGLRenderTarget(RT_SIZE, RT_SIZE);

// scene for renderTarget
const scene_renderTarget = new THREE.Scene();
const light_renderTarget_dir = new THREE.DirectionalLight(0xffffff, 1.5);
light_renderTarget_dir.position.set(0, 1, 1).normalize();
scene_renderTarget.add(light_renderTarget_dir);
const geometryTorus = new THREE.TorusGeometry(10, 3, 16, 100);
const materialTorus = new THREE.MeshPhongMaterial({ color: 0xff0000 });
const torusMesh = new THREE.Mesh(geometryTorus, materialTorus);
torusMesh.scale.set(0.05, 0.05, 0.05);
scene_renderTarget.add(torusMesh);


// scene
const scene = new THREE.Scene();
const light_amb = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(light_amb);
const light_dir = new THREE.DirectionalLight(0xffffff, 1.5);
light_dir.position.set(0, 1, 1).normalize();
scene.add(light_dir);
const geometryBox = new THREE.BoxGeometry(1, 1, 1);
const materialBox = new THREE.MeshStandardMaterial({ color: 0xff9300, map: rtt.texture });
const boxMesh = new THREE.Mesh(geometryBox, materialBox);
scene.add(boxMesh);
scene.add(new THREE.AxesHelper(3));


const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true });
renderer.setClearColor(0xffffff, 1.0);
renderer.setPixelRatio(pixelRatio);
renderer.setSize(width, height);

const preview = document.querySelector('#preview');
const ctx_preview = preview.getContext('2d');
const screenBuffer = new Uint8Array(4 * RT_SIZE * RT_SIZE); // 装buffer
const clampedScreenBuffer = new Uint8ClampedArray(screenBuffer.buffer);

const animation = () => {

    renderer.clear();

    torusMesh.rotation.y += 0.01;
    boxMesh.rotation.y += 0.01;

    renderer.setRenderTarget(rtt);
    renderer.render(scene_renderTarget, Camera);
    renderer.readRenderTargetPixels(rtt, 0, 0, RT_SIZE, RT_SIZE, screenBuffer);
    ctx_preview.putImageData(new ImageData(clampedScreenBuffer, RT_SIZE, RT_SIZE), 0, 0);

    renderer.setRenderTarget(null);
    renderer.render(scene, Camera);

    requestAnimationFrame(animation);
}

animation();