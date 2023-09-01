import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { SMDLoader } from '../loaders/SMDLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const GLOBAL = {};

// clock
const clock = new THREE.Clock();

// scene
const scene = new THREE.Scene();
GLOBAL.scene = scene;

// lights
const ambient_light = new THREE.AmbientLight(0xFFFFFF, 3); // soft white light
scene.add(ambient_light);
GLOBAL.ambient_light = ambient_light;

const hemisphere_light = new THREE.HemisphereLight(0xF99221, 0x79440A, 1);
scene.add(hemisphere_light);
GLOBAL.hemisphere_light = hemisphere_light;

const directional_light = new THREE.DirectionalLight(0xFFDEDE, 10);
directional_light.position.set(2, 8, 8);
directional_light.shadow.camera.position.copy(directional_light.position);
scene.add(directional_light);
directional_light.castShadow = true;
directional_light.shadow.mapSize.width = 1024;
directional_light.shadow.mapSize.height = 1024;
directional_light.shadow.focus = 10;
directional_light.shadow.camera.near = 0.5;
directional_light.shadow.camera.far = 30;
directional_light.shadow.camera.fov = 50;
GLOBAL.directional_light = directional_light;

const spot_light = new THREE.SpotLight(0xffffff, 1000, 30, Math.PI / 12);
spot_light.position.set(0, 10, -2);
spot_light.shadow.camera.position.copy(spot_light.position);
spot_light.castShadow = true;
spot_light.shadow.mapSize.width = 1024;
spot_light.shadow.mapSize.height = 1024;
spot_light.shadow.focus = 10;
spot_light.shadow.camera.near = 0.5;
spot_light.shadow.camera.far = 30;
spot_light.shadow.camera.fov = 50;
scene.add(spot_light);
GLOBAL.spot_light = spot_light;

// camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const v = new THREE.Vector3(-2, 2, 3);
v.normalize().multiplyScalar(4.5);
camera.position.copy(v);

// render
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#viewport1'), antialias: true });
renderer.setClearColor(0x000000);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// controls
const orbitcontrols = new OrbitControls(camera, renderer.domElement);
orbitcontrols.minDistance = 4;
orbitcontrols.maxDistance = 50;
orbitcontrols.maxPolarAngle = Math.PI / 2;
orbitcontrols.enableDamping = true;
orbitcontrols.dampingFacto = 0.035;
orbitcontrols.enablePan = false;
GLOBAL.orbitcontrols = orbitcontrols;

// loaders
const texture_loader = new THREE.TextureLoader();
GLOBAL.texture_loader = texture_loader;

const gltf_loader = new GLTFLoader();
GLOBAL.gltf_loader = gltf_loader;

const smd_loader = new SMDLoader();
GLOBAL.smd_loader = smd_loader;

const dealwithModel = async () => {

    GLOBAL.gltf_loader.load('/rock/rock.gltf', (gltf) => {

        // 处理模型
        const rockModel = gltf.scene;
        GLOBAL.rockModel = rockModel;

        rockModel.traverse(child => {
            if (child.isMesh) {
                if (child.material) {
                    // 替换一下材质
                    const oldMat = child.material;
                    const newMat = new THREE.MeshPhysicalMaterial({
                        map: oldMat.map,
                        specularIntensityMap: GLOBAL.texture_loader.load('/rock/badside_rocks001_spec.png'),
                        normalScale: oldMat.normalScale,
                        roughness: oldMat.roughness,
                        metalness: .6,
                        reflectivity: .7,
                    });
                    newMat.generateMipmaps = true;
                    newMat.needsUpdate = true;
                    child.material = newMat;
                    child.receiveShadow = true;
                }
            }
        });

        rockModel.scale.set(.5, .5, .5);
        scene.add(rockModel);
    });


    GLOBAL.gltf_loader.load('/vrfcrack/invoker/invoker.gltf', (gltf) => {

        console.log(gltf);

        // 处理模型
        const heroModel = gltf.scene;
        GLOBAL.heroModel = heroModel;

        // 动画资源
        GLOBAL.animtions = gltf.animations;

        heroModel.scale.set(.4, .4, .4);

        heroModel.traverse(child => {
            if (child.isSkinnedMesh) {
                child.castShadow = true;
                child.receiveShadow = true; // 高质量渲染, 超越Dota2
            }
        });

        scene.add(heroModel);

        // 处理动画
        dealwithAnimations();

        // 处理附加帮助图元
        initHelpers(true);
    });
}

const dealwithAnimations = () => {
    const heroModel = GLOBAL.heroModel;

    const animationMixer = new THREE.AnimationMixer(heroModel);
    GLOBAL.animationMixer = animationMixer;

    const idleClip = GLOBAL.animtions.find(item => item.name === 'idle');
    const idleAction = animationMixer.clipAction(idleClip, heroModel);
    const orbsClip = GLOBAL.animtions.find(item => item.name === '@orbs');

    const orbsAction = animationMixer.clipAction(orbsClip, heroModel);

    idleAction.play();
}

const initHelpers = (active = true) => {

    // grid
    const grid = new THREE.GridHelper(100, 100, 0xffffff, 0xffffff);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    grid.name = 'GridHelper';
    scene.add(grid);
    grid.visible = active;

    // axes
    const axes = new THREE.AxesHelper(500);
    axes.name = 'AxesHelper';
    scene.add(axes);
    axes.visible = active;

    // directional
    if (GLOBAL.directional_light) {
        const directional_light_helper = new THREE.DirectionalLightHelper(GLOBAL.directional_light, 5);
        scene.add(directional_light_helper);
        const directional_light_helper1 = new THREE.CameraHelper(GLOBAL.directional_light.shadow.camera);
        scene.add(directional_light_helper1);

        directional_light_helper.visible = active;
        directional_light_helper1.visible = active;
    }

    // spotLight Helper
    if (GLOBAL.spot_light) {
        const spot_light_helper = new THREE.SpotLightHelper(GLOBAL.spot_light);
        scene.add(spot_light_helper);
        const spot_light_helper1 = new THREE.CameraHelper(GLOBAL.spot_light.shadow.camera);
        scene.add(spot_light_helper1);

        spot_light_helper.visible = active;
        spot_light_helper1.visible = active;
    }

    if (GLOBAL.heroModel) {
        const skeletonHelper = new THREE.SkeletonHelper(GLOBAL.heroModel);
        scene.add(skeletonHelper);

        skeletonHelper.visible = active;
    }
}


// Loop
function animate() {

    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    if (GLOBAL.animationMixer) {
        GLOBAL.animationMixer.update(deltaTime);
    }

    renderer.render(scene, camera);

    if (GLOBAL.orbitcontrols) { orbitcontrols.update(); }

}

window.addEventListener('load', () => {

    animate();

    dealwithModel();
})

export const app = 'dota2 hero invoker - render use threejs(https://threejs.org/) By Lian1998(https://gitee.com/lian_1998)';