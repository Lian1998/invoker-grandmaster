import * as THREE from 'three';

import { invokerGLTFResources } from './invokerResources.js';
import { FrameLoopMachine } from './FrameLoopMachine.js';

import { OrbAnimationMachine } from './effects/orbs/OrbAnimationMachine.js'
import { OrbitControls } from 'three_addons/controls/OrbitControls.js';

export const INFO = 'dota2 hero invoker - render use threejs(https://threejs.org/) By Lian1998(https://gitee.com/lian_1998)';

// CONTEXT
export let renderer, camera, orbitcontrols;
export let frameloopMachine;

// SCENE
export let scene;
export let ambient_light, hemisphere_light, directional_light, spot_light;

// HERO
export let rockModel, heroModel, animationClips, animationMixer1, animationMixer2; // resources
export let orbsSpawnActionL, orbsSpawnActionR, orbsAction; // animation actions
export let wristL, wristR;
export let orbSlot1, orbSlot2, orbSlot3;
export let orbAnimationMachine;

// HELPERS
export let grid_helper, axes_helper; // scene
export let directional_light_helper, directional_light_helper1, spot_light_helper, spot_light_helper1; // lights
export let skeleton_helper; // hero skeleton

const initContext = (domElement) => {

    // render
    renderer = new THREE.WebGLRenderer({ canvas: domElement, antialias: true });
    renderer.setClearColor(0x000000);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, .1, 1000.);
    const v = new THREE.Vector3(-2, 2, 3);
    v.normalize().multiplyScalar(6);
    camera.position.copy(v);

    // controls
    orbitcontrols = new OrbitControls(camera, renderer.domElement);
    orbitcontrols.minDistance = 3.;
    orbitcontrols.maxDistance = 7.;
    orbitcontrols.maxPolarAngle = Math.PI / 2.;
    orbitcontrols.enablePan = false; // 禁止平移
    orbitcontrols.enableDamping = true;
    orbitcontrols.dampingFactor = .05;
    orbitcontrols.target.set(0., 1., 0.);
}

const initScene = () => {

    // scene
    scene = new THREE.Scene();

    // lights
    ambient_light = new THREE.AmbientLight(0xFFFFFF, 1.); // soft white light
    scene.add(ambient_light);

    hemisphere_light = new THREE.HemisphereLight(0xF99221, 0x79440A, .5);
    scene.add(hemisphere_light);

    directional_light = new THREE.DirectionalLight(0xFFDEDE, 5.);
    directional_light.position.set(2., 4., 8.);
    directional_light.shadow.camera.position.copy(directional_light.position);
    scene.add(directional_light);
    directional_light.castShadow = true;
    directional_light.shadow.mapSize.width = 4096;
    directional_light.shadow.mapSize.height = 4096;
    directional_light.shadow.focus = 10.;
    directional_light.shadow.camera.near = .5;
    directional_light.shadow.camera.far = 30.;
    directional_light.shadow.camera.fov = 50.;

    spot_light = new THREE.SpotLight(0xffffff, 80., 15., Math.PI / 6.);
    spot_light.position.set(0., 8., -2.);
    spot_light.shadow.camera.position.copy(spot_light.position);
    spot_light.castShadow = true;
    spot_light.shadow.bias = .0008; // 0.0001
    spot_light.shadow.mapSize.width = 4096;
    spot_light.shadow.mapSize.height = 4096;
    spot_light.shadow.focus = 10.;
    spot_light.shadow.camera.near = .5;
    spot_light.shadow.camera.far = 30.;
    spot_light.shadow.camera.fov = 50.;
    scene.add(spot_light);
}


const addInvokerModels = () => {
    const rockGLTF = invokerGLTFResources.get('rock');
    rockModel = rockGLTF.scene;
    rockModel.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    rockModel.rotateY(Math.PI / 2.);
    rockModel.scale.set(.8, 1., .8);
    scene.add(rockModel);

    const invokerGLTF = invokerGLTFResources.get('invoker');
    animationClips = invokerGLTF.animations; // 动画资源
    heroModel = invokerGLTF.scene;
    heroModel.traverse(child => {
        // 绑定orbSloter指针
        if (child.name === 'orb1') { orbSlot1 = child; }
        else if (child.name === 'orb2') { orbSlot2 = child; }
        else if (child.name === 'orb3') { orbSlot3 = child; }
        else if (child.name === 'wrist_L') { wristL = child; }
        else if (child.name === 'wrist_R') { wristR = child; }

        if (child.isSkinnedMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    heroModel.scale.set(.5, .5, .5);
    heroModel.position.set(0., .5, 0.);
    scene.add(heroModel);
}

const addInvokerAnimations = () => {

    animationMixer1 = new THREE.AnimationMixer(heroModel);
    animationMixer2 = new THREE.AnimationMixer(heroModel);

    // 去除idle切片中的球运动
    const idleClip = animationClips.find(item => item.name === 'idle');
    const idleClip1Tracks = [];
    idleClip.tracks.forEach(item => { if (item.name.indexOf('orb') === -1) { idleClip1Tracks.push(item); } });
    const idleClip1 = new THREE.AnimationClip('idle', -1, idleClip1Tracks);
    const idleAction = animationMixer1.clipAction(idleClip1, heroModel);
    idleAction.play();

    // 添加球运动动画
    const orbsClip = animationClips.find(item => item.name === '@orbs');
    const orbsClip1Tracks = [];
    orbsClip.tracks.forEach(item => { if (item.name.indexOf('orb') !== -1) { orbsClip1Tracks.push(item); } });
    const orbsClip1 = new THREE.AnimationClip('orbs', -1, orbsClip1Tracks);
    orbsAction = animationMixer1.clipAction(orbsClip1, heroModel);
    orbsAction.blendMode = THREE.NormalAnimationBlendMode;
    orbsAction.play();

    // 从 `@orb_spawn_lf` 片段分出左/右手切球动画
    const orbsSpawnClip = animationClips.find(item => item.name === '@orb_spawn_lf');
    const orbsSpawnClipL_Tracks = [];
    const orbsSpawnClipR_Tracks = [];
    orbsSpawnClip.tracks.forEach(item => {
        const trackName = item.name;
        if (trackName.toLowerCase().indexOf('orb') !== -1) { return; }
        else if (trackName.toLowerCase().indexOf('root') !== -1) { return; }
        else if (trackName.toLowerCase().indexOf('spine') !== -1) { return; }
        else if (trackName.toLowerCase().indexOf('head') !== -1) { return; }
        else if (trackName.toLowerCase().indexOf('shoulder') !== -1) { return; }
        else if (trackName.toLowerCase().indexOf('clavicle') !== -1) { return; }
        else if (trackName.toLowerCase().indexOf('thigh') !== -1) { return; }
        else if (trackName.toLowerCase().indexOf('knee') !== -1) { return; }
        else if (trackName.toLowerCase().indexOf('ankle') !== -1) { return; }
        else if (trackName.toLowerCase().indexOf('toe') !== -1) { return; }
        else if (trackName.toLowerCase().indexOf('tobase') !== -1) { return; }
        else if (trackName.toLowerCase().indexOf('cape') !== -1) { return; }
        else if (trackName.toLowerCase().indexOf('belt') !== -1) { return; }
        else if (trackName.toLowerCase().indexOf('manskirt') !== -1) { return; }
        else {
            if (trackName.indexOf('_L.') !== -1) { orbsSpawnClipL_Tracks.push(item); }
            if (trackName.indexOf('_R.') !== -1) { orbsSpawnClipR_Tracks.push(item); }
        }
    });
    const orbsSpawnClipL = new THREE.AnimationClip('orbsSpawnL', -1, orbsSpawnClipL_Tracks);
    const orbsSpawnClipR = new THREE.AnimationClip('orbsSpawnR', -1, orbsSpawnClipR_Tracks);
    orbsSpawnActionL = animationMixer2.clipAction(orbsSpawnClipL, heroModel);
    orbsSpawnActionR = animationMixer2.clipAction(orbsSpawnClipR, heroModel);
    orbsSpawnActionL.blendMode = THREE.NormalAnimationBlendMode;
    orbsSpawnActionL.loop = THREE.LoopOnce;
    orbsSpawnActionR.blendMode = THREE.NormalAnimationBlendMode;
    orbsSpawnActionR.loop = THREE.LoopOnce;
}

const addInvokerOrbs = () => {
    // 使用白模查看动画是否加载完成
    // const sphere1 = new THREE.Mesh(new THREE.SphereGeometry(.1, 20, 20), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    // orbSlot1.attach(sphere1);

    // 使用平面精灵以及自制的ShaderMaterial
    orbAnimationMachine = OrbAnimationMachine();
}

const addHelpers = () => {
    // 网格
    grid_helper = new THREE.GridHelper(100., 100., 0xffffff, 0xffffff);
    grid_helper.material.opacity = .2;
    grid_helper.material.transparent = true;
    grid_helper.name = 'GridHelper';
    scene.add(grid_helper);

    // 轴向
    axes_helper = new THREE.AxesHelper(500.);
    axes_helper.name = 'AxesHelper';
    scene.add(axes_helper);

    // 直射光
    if (directional_light) {
        directional_light_helper = new THREE.DirectionalLightHelper(directional_light, 5.);
        scene.add(directional_light_helper);
        directional_light_helper1 = new THREE.CameraHelper(directional_light.shadow.camera);
        scene.add(directional_light_helper1);
    }

    // 点光
    if (spot_light) {
        spot_light_helper = new THREE.SpotLightHelper(spot_light);
        scene.add(spot_light_helper);
        spot_light_helper1 = new THREE.CameraHelper(directional_light.shadow.camera);
        scene.add(spot_light_helper1);
    }

    // 骨骼
    if (heroModel) {
        skeleton_helper = new THREE.SkeletonHelper(heroModel);
        scene.add(skeleton_helper);
    }
}


/**
 * 初始化三维画面, 绑定三维画面到浏览器DOM
 * @param {*} domElement 挂载到的dom元素
 * @returns 
 */
export const invokerInitialize3D = (domElement) => {

    return new Promise((resolve, reject) => {

        initContext(domElement);
        initScene();

        // Add Features
        addInvokerModels(); // 模型
        addInvokerAnimations(); // 动画处理
        addInvokerOrbs(); // 卡尔法球特效

        // Add Helpers
        addHelpers();

        // 渲染循环机
        frameloopMachine = FrameLoopMachine((elapsedTime, deltaTime) => {

            // oribitControl damp
            if (orbitcontrols && orbitcontrols.enabled) { orbitcontrols.update(deltaTime); }

            // 动画Layer1
            if (animationMixer1) { animationMixer1.update(deltaTime); }

            // 动画Layer2 手部动画覆盖
            if (animationMixer2) { animationMixer2.update(deltaTime); }

            // 卡尔的球
            orbAnimationMachine.frameLoop(elapsedTime, deltaTime);

            // 更新场景
            renderer.render(scene, camera);
        });

        resolve(true);
    })
}





