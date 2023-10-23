import * as THREE from 'three';
import { OrbitControls } from 'three_addons/controls/OrbitControls.js';

import { getViewportQuality } from '@src/utils/getViewportQuality.js'

import { invokerGLTFResources } from './invokerResources.js';
import { FrameLoopMachine } from './FrameLoopMachine.js';
import { SpritePlaneBufferGeometry } from './effects/SpritePlaneBufferGeometry.js';
import { OrbAnimationMachine } from './effects/orbs/OrbAnimationMachine.js'
import { TurbShaderMaterial } from './effects/turb/TurbShaderMaterial.js';
import { Ability4HaloShaderMaterial } from './effects/ability4/Ability4HaloShaderMaterial.js';
import { Ability4TurbShaderMaterial } from './effects/ability4/Ability4TurbShaderMaterial.js';

import { logger } from './logger.js';

const INFO = 'Dota2 Hero Invoker - By Lian1998(https://gitee.com/lian_1998) Using ThreeJS(https://threejs.org/)';
logger.error(INFO);

// CONTEXT
export let containerElement;
export let canvasElement;
export let renderer, camera, orbitcontrols;
export let frameloopMachine;
export let rtt;

// SCENE
export let scene;
export let sceneOrb;
export let sceneEffect;
export let sceneEffect1;
export let ambient_light, hemisphere_light, directional_light, spot_light;

// HERO
export let rockModel, heroModel, animationClips, animationMixer1, animationMixer2; // resources
export let orbsSpawnActionL, orbsSpawnActionR, orbsAction; // animation actions
export let wristLSlot, wristRSlot;
export let orbSlot1, orbSlot2, orbSlot3;
export let orbAnimationMachine;

// EFFECTS
export let orbSpawnEffectPlaneL, orbSpawnEffectPlaneR;
export let invokerAbility4HaloPlane, invokerAbility4TurbPlane;

// HELPERS
export let grid_helper, axes_helper; // scene
export let directional_light_helper, directional_light_helper1, spot_light_helper, spot_light_helper1; // lights
export let skeleton_helper; // hero skeleton


const initContext = (canvas) => {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true }); // render
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.autoClear = false;

    rtt = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
        colorSpace: THREE.NoColorSpace,
        format: THREE.RGBAFormat,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        stencilBuffer: false,
    });

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.015625, 128.0); // camera
    const v = new THREE.Vector3(-2.0, 2.0, 4.0);
    v.normalize().multiplyScalar(6.0);
    camera.position.copy(v);

    orbitcontrols = new OrbitControls(camera, canvas); // controls
    orbitcontrols.minDistance = 4.0;
    orbitcontrols.maxDistance = 8.0;
    orbitcontrols.maxPolarAngle = Math.PI / 2.0;
    orbitcontrols.enablePan = false; // 禁止平移
    orbitcontrols.enableDamping = true;
    orbitcontrols.dampingFactor = 0.05;
    orbitcontrols.target.set(0.0, 1.0, 0.0);
}

const initScene = () => {

    // scene
    scene = new THREE.Scene();
    sceneOrb = new THREE.Scene();
    sceneEffect = new THREE.Scene();
    sceneEffect1 = new THREE.Scene();

    // lights
    ambient_light = new THREE.AmbientLight(0xFFFFFF, 1.0); // soft white light
    scene.add(ambient_light);

    hemisphere_light = new THREE.HemisphereLight(0xF99221, 0x79440A, 0.5);
    scene.add(hemisphere_light);

    directional_light = new THREE.DirectionalLight(0xFFDEDE, 5.0);
    directional_light.position.set(2.0, 4.0, 8.0);
    directional_light.shadow.camera.position.copy(directional_light.position);
    scene.add(directional_light);
    directional_light.castShadow = true;
    directional_light.shadow.mapSize.width = 2048;
    directional_light.shadow.mapSize.height = 2048;
    directional_light.shadow.focus = 10.0;
    directional_light.shadow.camera.near = 0.5;
    directional_light.shadow.camera.far = 30.0;
    directional_light.shadow.camera.fov = 50.0;

    spot_light = new THREE.SpotLight(0xffffff, 80.0, 15.0, Math.PI / 6.0);
    spot_light.position.set(0.0, 8.0, -2.0);
    spot_light.shadow.camera.position.copy(spot_light.position);
    spot_light.castShadow = true;
    spot_light.shadow.bias = 0.0008; // 0.0001
    spot_light.shadow.mapSize.width = 2048;
    spot_light.shadow.mapSize.height = 2048;
    spot_light.shadow.focus = 10.0;
    spot_light.shadow.camera.near = 0.5;
    spot_light.shadow.camera.far = 30.0;
    spot_light.shadow.camera.fov = 50.0;
    scene.add(spot_light);
}

const addInvokerStage = (scene) => {
    const rockGLTF = invokerGLTFResources.get('rock');
    rockModel = rockGLTF.scene;
    rockModel.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    rockModel.rotateY(Math.PI / 2.0);
    rockModel.scale.set(0.8, 1.0, 0.8);
    scene.add(rockModel);
}

const addInvokerModels = (scene) => {
    const invokerGLTF = invokerGLTFResources.get('invoker');
    heroModel = invokerGLTF.scene;
    heroModel.traverse(child => {
        // 绑定orbSloter指针
        if (child.name === 'orb1') { orbSlot1 = child; }
        else if (child.name === 'orb2') { orbSlot2 = child; }
        else if (child.name === 'orb3') { orbSlot3 = child; }
        else if (child.name === 'wrist_L') { wristLSlot = child; }
        else if (child.name === 'wrist_R') { wristRSlot = child; }
        if (child.isSkinnedMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    heroModel.scale.set(0.5, 0.5, 0.5);
    heroModel.position.set(0.0, 0.5, 0.0);
    scene.add(heroModel);
}

const handleInvokerAnimations = () => {

    const invokerGLTF = invokerGLTFResources.get('invoker');
    animationClips = invokerGLTF.animations; // 动画资源

    animationMixer1 = new THREE.AnimationMixer(heroModel);
    animationMixer2 = new THREE.AnimationMixer(heroModel);

    // 去除 idle 中的 orbs 轨道
    const idleClip = animationClips.find(item => item.name === 'idle');
    const idleClip1Tracks = [];
    idleClip.tracks.forEach(item => { if (item.name.indexOf('orb') === -1) { idleClip1Tracks.push(item); } });
    const idleClip1 = new THREE.AnimationClip('idle', -1, idleClip1Tracks);
    const idleAction = animationMixer1.clipAction(idleClip1, heroModel);
    idleAction.play();

    // 元素法球动画
    const orbsClip = animationClips.find(item => item.name === '@orbs');
    const orbsClip1Tracks = [];
    orbsClip.tracks.forEach(item => { if (item.name.indexOf('orb') !== -1) { orbsClip1Tracks.push(item); } });
    const orbsClip1 = new THREE.AnimationClip('orbs', -1, orbsClip1Tracks);
    orbsAction = animationMixer1.clipAction(orbsClip1, heroModel);
    orbsAction.blendMode = THREE.NormalAnimationBlendMode;
    orbsAction.play();

    // 左/右手切球动画
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

const addInvokerOrbs = (scene) => {

    // 使用白模查看动画是否加载完成
    // const sphere1 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20.0, 20.0), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    // orbSlot1.attach(sphere1);

    // 使用平面精灵以及自制的ShaderMaterial
    orbAnimationMachine = OrbAnimationMachine(scene);
}

const addInvokerOrbSpawnEffect = (scene) => {

    orbSpawnEffectPlaneL = new THREE.Mesh(SpritePlaneBufferGeometry(), TurbShaderMaterial());
    orbSpawnEffectPlaneL.renderOrder = 1;
    scene.add(orbSpawnEffectPlaneL);

    orbSpawnEffectPlaneR = new THREE.Mesh(SpritePlaneBufferGeometry(), TurbShaderMaterial());
    orbSpawnEffectPlaneR.renderOrder = 1;
    scene.add(orbSpawnEffectPlaneR);
}

const addInvokerAbility5Effect = (sceneEffect) => {
    invokerAbility4HaloPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.), Ability4HaloShaderMaterial());
    invokerAbility4HaloPlane.rotateX(- Math.PI / 2.0);
    invokerAbility4HaloPlane.scale.set(7.5, 7.5, 7.5);
    heroModel.add(invokerAbility4HaloPlane);

    invokerAbility4TurbPlane = new THREE.Mesh(SpritePlaneBufferGeometry(), Ability4TurbShaderMaterial());
    invokerAbility4TurbPlane.position.set(0, 1.0, 0);
    sceneEffect.add(invokerAbility4TurbPlane);

}

const addHelpers = () => {
    // 网格
    grid_helper = new THREE.GridHelper(100.0, 100.0, 0xffffff, 0xffffff);
    grid_helper.material.opacity = 0.2;
    grid_helper.material.transparent = true;
    grid_helper.name = 'GridHelper';
    scene.add(grid_helper);

    // 轴向
    axes_helper = new THREE.AxesHelper(500.0);
    axes_helper.name = 'AxesHelper';
    scene.add(axes_helper);

    // 直射光
    if (directional_light) {
        directional_light_helper = new THREE.DirectionalLightHelper(directional_light, 5.0);
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

const resizeViewport = (event) => {
    const { pixelRatio, width, height } = getViewportQuality(containerElement);
    logger.info(`pixelRatio: ${pixelRatio}, width: ${width}, height: ${height}`);

    const _width = width * pixelRatio;
    const _height = height * pixelRatio;

    if (renderer) {
        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(width, height);
    }
    if (camera) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
    if (rtt) { rtt.setSize(width, height); }
    if (orbSpawnEffectPlaneL) { orbSpawnEffectPlaneL.material.uniforms.uResolution.value.set(_width, _height); }
    if (orbSpawnEffectPlaneR) { orbSpawnEffectPlaneR.material.uniforms.uResolution.value.set(_width, _height); }
}

/**
 * 初始化三维画面, 绑定三维画面到浏览器DOM
 * @param {*} domElement 挂载到的dom元素
 * @returns 
 */
export const invokerInitialize3d = (viewportContainer, viewport) => {

    containerElement = viewportContainer;
    canvasElement = viewport;

    return new Promise((resolve, reject) => {

        initContext(canvasElement);
        initScene();

        // Add Features
        addInvokerStage(scene)
        addInvokerModels(scene);
        addInvokerOrbs(sceneOrb);
        addInvokerOrbSpawnEffect(sceneEffect1);
        addInvokerAbility5Effect(sceneEffect);
        addHelpers();

        handleInvokerAnimations();

        // 渲染循环机  
        // ps: ThreeJs 现在都有缓存的, 所以可以直接这么用
        frameloopMachine = FrameLoopMachine((elapsedTime, deltaTime) => {

            // oribitControl damp
            if (orbitcontrols && orbitcontrols.enabled) { orbitcontrols.update(deltaTime); }

            // 动画Layer1
            if (animationMixer1) { animationMixer1.update(deltaTime); }

            // 动画Layer2 手部动画覆盖
            if (animationMixer2) { animationMixer2.update(deltaTime); }

            // 卡尔的元素法球位置更新
            orbAnimationMachine.frameLoop(elapsedTime, deltaTime);
            // 切球特效
            if (wristLSlot && orbSpawnEffectPlaneL) {
                orbSpawnEffectPlaneL.material.uniforms.uLifeTime.value += deltaTime;
                wristLSlot.getWorldPosition(orbSpawnEffectPlaneL.position);
                orbSpawnEffectPlaneL.position.y += 0.15;
            }
            if (wristRSlot && orbSpawnEffectPlaneR) {
                orbSpawnEffectPlaneR.material.uniforms.uLifeTime.value += deltaTime;
                wristRSlot.getWorldPosition(orbSpawnEffectPlaneR.position);
                orbSpawnEffectPlaneR.position.y += 0.15;
            }
            // invoke技能特效
            if (invokerAbility4HaloPlane) { invokerAbility4HaloPlane.material.uniforms.uLifeTime.value += deltaTime; }
            if (invokerAbility4TurbPlane) { invokerAbility4TurbPlane.material.uniforms.uLifeTime.value += deltaTime; }

            // 设置rtt为输出目标
            renderer.setRenderTarget(rtt);
            renderer.clear();
            if (invokerAbility4HaloPlane) { invokerAbility4HaloPlane.visible = false; }
            renderer.render(scene, camera);

            // 设置画布为输出目标
            renderer.setRenderTarget(null);
            renderer.clear();
            if (invokerAbility4HaloPlane) { invokerAbility4HaloPlane.visible = true; }
            renderer.render(scene, camera);
            renderer.render(sceneOrb, camera);
            // 元素祈唤技能特效 sceneEffect
            renderer.render(sceneEffect, camera);
            // 渲染到canvas
            renderer.render(sceneEffect1, camera);
        });

        resolve({ resizeViewport, frameloopMachine });
    });
}





