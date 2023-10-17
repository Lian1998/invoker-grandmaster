
import * as THREE from 'three';

import { OrbQuasShaderMaterial, OrbWexShaderMaterial, OrbExortShaderMaterial } from './OrbShaderMaterials.js';
import { SpritePlaneBufferGeometry } from '../SpritePlaneBufferGeometry.js';
import { invokerEventPipe } from '@src/invoker-webglpart/events/invokerEventPipe.js';
import { invokerAbilityEvents } from '@src/invoker-webglpart/events/invokerAbilityEvents.js';

import { TurbShaderMaterial } from '../TurbShaderMaterial.js';

import {
    orbsSpawnActionL, orbsSpawnActionR, orbsAction, // 动画
    wristL, wristR, // 手腕骨骼
    orbSlot1, orbSlot2, orbSlot3, // 球骨骼
    scene, // 场景
} from '../../invoker.js';

const vec3Util = new THREE.Vector3(); // 一个工具v3是线程不安全的
const orbsActionDuration = 2.;  // 通过访问clip获取剪辑片段的时间 orbsAction._clip.duration
const orbSpawnActionDuration = .35; // orbsSpawnActionL._clip.duration

/**
 * 根据当前球轨道动画判断离哪个手更近, 以播放召唤法球的动画
 * @returns {boolean} isLeft? 是否是从左手位置发出
 */
const playOrbSpawnAnimation = () => {
    if (!orbsSpawnActionL || !orbsSpawnActionR) { return; }

    const isLeft = Math.random() <= .5 ? false : true; // 产出球的位置 
    // if (orbsAction.time > 1. && orbsAction.time < 1.5) { console.log(1); } // right
    // if (orbsAction.time > .8 && orbsAction.time < 1.3) { console.log(2); } // left

    let orbSpawnAction = null;
    if (isLeft) { orbSpawnAction = orbsSpawnActionL; }
    else { orbSpawnAction = orbsSpawnActionR; }

    // 如果这个动画还没有播放过, 无脑播放它
    if (orbSpawnAction.time <= 0.) {
        orbSpawnAction.play();
        return isLeft;
    }

    // 如果动画已经播放过且播放完毕, 无脑重置并重新播放
    else if (orbSpawnAction.time >= orbSpawnActionDuration) {
        orbSpawnAction.reset();
        orbSpawnAction.play();
        return isLeft;
    }

    // 如果当前动画其实正在进行中, 且动画当前处于手往下运动的阶段, 那么需要映射到同样位置其向上运动的time, 让手重新抬起
    else if (orbSpawnAction.time >= orbSpawnActionDuration / 2.) {
        // clamp一下以免出现bug
        orbSpawnAction.time = THREE.MathUtils.clamp(orbSpawnActionDuration / 2. - (orbSpawnActionDuration - orbSpawnAction.time), 0., 1.);
        return isLeft;
    }
}

/**
 * 单个祈求者球体
 * 一个祈求者的球体包含了三个平面精灵, 分别对应了 冰/雷/火(Quas/Wex/Exort) 球体
 * 
 * @param {THREE.Bone} orbSlot 当前球体所对应的插槽
 * @returns {{ 
 *  meshesMap: { quas: THREE.Mesh, wex: THREE.Mesh, exort: THREE.Mesh, activeP: undefined | THREE.Mesh },
 *  fadeToAnotherMesh: (name: 'Quas'|'Wex'|'Exort') => void,
 *  frameLoop: (elapsedTime: number, deltaTime: number) => void,
 * }} 球体更新机闭包
 */
export const SingleOrbObject = (orbSlot, scene) => {
    const orbSlotPointer = orbSlot; // 记录插槽的指针

    // 生成三个球的Mesh
    const quas = new THREE.Mesh(SpritePlaneBufferGeometry(), OrbQuasShaderMaterial());
    const wex = new THREE.Mesh(SpritePlaneBufferGeometry(), OrbWexShaderMaterial());
    const exort = new THREE.Mesh(SpritePlaneBufferGeometry(), OrbExortShaderMaterial());

    // 添加到场景中
    quas.visible = false;
    wex.visible = false;
    exort.visible = false;
    scene.add(quas);
    scene.add(wex);
    scene.add(exort);

    // 用于保存对象
    const meshesMap = { 'Quas': quas, 'Wex': wex, 'Exort': exort, active: undefined, previous: undefined };

    // 过渡动画曲线取值
    let faddingPositionFactor = 0.;
    const vec3Util1 = new THREE.Vector3();

    /** 此位点的球切换显示 */
    const fadeToAnotherMesh = (name) => {
        if (name !== 'Quas' && name !== 'Wex' && name !== 'Exort') { return; } // 判断参数

        // 播放手部召唤法球的动画
        const isLeft = playOrbSpawnAnimation();
        let waitingTime = 0.;
        if (orbsAction.time < .9) { waitingTime = orbSpawnActionDuration / 2. * 1000; }

        // 如果这次切球就是上一次的球, 那么直接更新位置
        if (meshesMap.active && meshesMap.active === meshesMap[name]) {
            meshesMap.previous = undefined;
            // 设置过渡动画
            faddingPositionFactor = 0;
            meshesMap.active.material.uniforms.uLifeTime.value = 0.;
            // 从手部位置发出
            if (isLeft) { wristL.getWorldPosition(vec3Util1); }
            else { wristR.getWorldPosition(vec3Util1); }
            vec3Util1.y += .15;
            meshesMap.active.position.copy(vec3Util1);
            return;
        }

        // 如果这次切球不是上一次的球
        // 置换/设置指针
        meshesMap.previous = meshesMap.active;
        meshesMap.active = meshesMap[name];
        const meshPrevious = meshesMap.previous; // 上一个球
        const meshActive = meshesMap.active;  // 这一个球
        if (meshPrevious) { meshPrevious.material.uniforms.uLifeTime.value = orbSpawnActionDuration / 2.; } // 设置过渡动画
        setTimeout(() => {
            if (meshPrevious) { meshPrevious.visible = false; } // 老球不显示
            meshActive.visible = true; // 新球显示
            // 设置过渡动画
            faddingPositionFactor = 0;
            meshActive.material.uniforms.uLifeTime.value = 0.;
            // 从手部位置发出
            if (isLeft) { wristL.getWorldPosition(vec3Util1); }
            else { wristR.getWorldPosition(vec3Util1); }
            vec3Util1.y += .15;
            meshActive.position.copy(vec3Util1);
        }, waitingTime);

    }

    /** 帧更新函数 */
    const frameLoop = (elapsedTime, deltaTime) => {

        if (!orbSlotPointer) { return; } // 球体插槽骨骼

        // 上一次切换球体
        const meshPrevious = meshesMap.previous;
        if (meshPrevious) {
            meshPrevious.material.uniforms.uTime.value = elapsedTime;
            meshPrevious.material.uniforms.uRandDinamic.value = Math.random();
            meshPrevious.material.uniforms.uLifeTime.value -= deltaTime;
        }

        // 当前球体
        const meshActive = meshesMap.active;
        if (meshActive) {
            meshActive.material.uniforms.uTime.value = elapsedTime;
            meshActive.material.uniforms.uRandDinamic.value = Math.random();
            meshActive.material.uniforms.uLifeTime.value += deltaTime;

            // 目标球的位置应该不断插值到Slot位置
            faddingPositionFactor += deltaTime;
            orbSlotPointer.getWorldPosition(vec3Util);
            const smoothstepFactor = THREE.MathUtils.smoothstep(faddingPositionFactor, 0., orbsActionDuration / 2.);
            meshActive.position.lerp(vec3Util, smoothstepFactor);
        }
    }

    return { meshesMap, fadeToAnotherMesh, frameLoop };
}

/**
 * 球体状态更新机
 * @returns {{frameLoop: (elapsedTime: number, deltaTime: number) => void}}
 */
export const OrbAnimationMachine = () => {

    let index = 0;
    const orb1 = SingleOrbObject(orbSlot1, scene);
    const orb2 = SingleOrbObject(orbSlot2, scene);
    const orb3 = SingleOrbObject(orbSlot3, scene);

    const orbsMap = [orb1, orb2, orb3];
    const abilityNameArr = ['Quas', 'Wex', 'Exort']; // 切球事件
    abilityNameArr.forEach(abilityName => {
        const abilityEvent = invokerAbilityEvents.get(abilityName);
        invokerEventPipe.addEventListener(abilityEvent.type, (e) => { // 监听切球事件
            if (index + 1 > 2) { index = 0; }
            else { index += 1; }

            // 使用API调用 SingleOrbObject 更新球的显示状态过渡到另一个球
            const currentSingleOrbObject = orbsMap[index]; // 根据缓存的index找到SingleOrbObject
            currentSingleOrbObject.fadeToAnotherMesh(abilityName);
        });

    });

    const testplane1 = new THREE.Mesh(new THREE.PlaneGeometry(1.), TurbShaderMaterial());
    testplane1.visible = false;
    scene.add(testplane1);

    const testplane2 = new THREE.Mesh(new THREE.PlaneGeometry(1.), TurbShaderMaterial());
    testplane2.visible = false;
    scene.add(testplane2);

    /** 帧更新函数 */
    const frameLoop = (elapsedTime, deltaTime) => {

        // 更新 SingleOrbObject
        orb1.frameLoop(elapsedTime, deltaTime);
        orb2.frameLoop(elapsedTime, deltaTime);
        orb3.frameLoop(elapsedTime, deltaTime);

        wristL.getWorldPosition(vec3Util);
        testplane1.position.lerp(vec3Util, 1.);
        wristR.getWorldPosition(vec3Util);
        testplane2.position.lerp(vec3Util, 1.);
    }

    return { frameLoop };
}