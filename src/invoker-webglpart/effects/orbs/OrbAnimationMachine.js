
import * as THREE from 'three';

import { OrbQuasShaderMaterial, OrbWexShaderMaterial, OrbExortShaderMaterial } from './OrbShaderMaterials.js';
import { SpritePlaneBufferGeometry } from '../SpritePlaneBufferGeometry.js';
import { invokerEventPipe } from '@src/invoker-webglpart/events/invokerEventPipe.js';
import { invokerAbilityEvents } from '@src/invoker-webglpart/events/invokerAbilityEvents.js';

import {
    orbsSpawnActionL, orbsSpawnActionR, orbsAction, // 动画
    wristLSlot, wristRSlot, // 手腕骨骼
    orbSlot1, orbSlot2, orbSlot3, // 元素法球位置插槽骨骼
    orbSpawnEffectPlaneL, orbSpawnEffectPlaneR, // 特效Effector
} from '../../index.js';

const vec3Util = new THREE.Vector3(); // 一个工具v3是线程不安全的
const orbsActionDuration = 2.0;  // 通过访问clip获取剪辑片段的时间 orbsAction._clip.duration
const half_orbsActionDuration = orbsActionDuration / 2.0;
const orbSpawnActionDuration = 0.35; // orbsSpawnActionL._clip.duration
const half_orbSpawnActionDuration = orbSpawnActionDuration / 2.0;
const orbLerpingDuration = 2.0;

/**
 * 根据当前球轨道动画判断离哪个手更近, 以播放召唤元素法球的动画
 * @returns {boolean} isLeft? 是否是从左手位置发出
 */
const playOrbSpawnAnimation = () => {
    if (!orbsSpawnActionL || !orbsSpawnActionR) { return; } // 判断参数
    const isLeft = Math.random() <= 0.5 ? false : true; // 随机生成左右 

    // 计算采用的动画的指针
    let orbSpawnAction = null;
    if (isLeft) { orbSpawnAction = orbsSpawnActionL; }
    else { orbSpawnAction = orbsSpawnActionR; }

    // 如果这个动画还没有播放过, 无脑播放它
    if (orbSpawnAction.time <= 0.0) {
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
    else if (orbSpawnAction.time >= half_orbSpawnActionDuration) {
        // clamp一下以免出现bug
        orbSpawnAction.time = half_orbSpawnActionDuration - (orbSpawnActionDuration - orbSpawnAction.time);
        return isLeft;
    }
}

/**
 * 单个祈求者元素法球球体
 * 一个祈求者的元素法球球体包含了三个平面精灵, 分别对应了 冰/雷/火(Quas/Wex/Exort)
 * 
 * @param {THREE.Bone} orbSlot 当前元素法球体所对应的插槽
 * @returns {{ 
 *  meshesMap: { quas: THREE.Mesh, wex: THREE.Mesh, exort: THREE.Mesh, activeP: undefined | THREE.Mesh },
 *  fadeToAnotherMesh: (name: 'Quas'|'Wex'|'Exort') => void,
 *  frameLoop: (elapsedTime: number, deltaTime: number) => void,
 * }} 元素法球球体更新机闭包
 */
export const SingleOrbObject = (orbSlot, scene) => {
    const singleOrbSlotP = orbSlot; // 记录插槽的指针

    // 生成三个元素法球的Mesh, 添加到场景中
    const quas = new THREE.Mesh(SpritePlaneBufferGeometry(), OrbQuasShaderMaterial());
    const wex = new THREE.Mesh(SpritePlaneBufferGeometry(), OrbWexShaderMaterial());
    const exort = new THREE.Mesh(SpritePlaneBufferGeometry(), OrbExortShaderMaterial());
    quas.visible = false;
    wex.visible = false;
    exort.visible = false;
    scene.add(quas);
    scene.add(wex);
    scene.add(exort);

    // 指针保存对象
    const meshesMap = { 'Quas': { status: false, mesh: quas }, 'Wex': { status: false, mesh: wex }, 'Exort': { status: false, mesh: exort } };
    const othersMap = { 'Quas': ['Wex', 'Exort'], 'Wex': ['Quas', 'Exort'], 'Exort': ['Quas', 'Wex'] };
    const totalNameArr = ['Quas', 'Wex', 'Exort'];

    // 过渡动画曲线取值
    let singleOrbFaddingFactor = 0.0;
    const vec3Util1 = new THREE.Vector3();

    /** 此位点的元素法球切换显示 */
    const fadeToAnotherMesh = (name) => {
        if (name !== 'Quas' && name !== 'Wex' && name !== 'Exort') { return; } // 判断参数
        const isLeft = playOrbSpawnAnimation(); // 判断左右手

        // 先把另外两个球注销掉
        othersMap[name].forEach(name => {
            meshesMap[name].status = false;
            meshesMap[name].mesh.material.uniforms.uLifeTime.value = 0.2;
        });

        // 把这个球显示出来
        // total      : 2.0
        // right Spawn: 1.0 < orbsAction.time < 1.5
        // left  Spawn: 0.8 < orbsAction.time < 1.3
        let animationtick_duration = 0.0;
        if (orbsAction.time < 0.4) { animationtick_duration = (0.4 - orbsAction.time) * 1000; }
        if (orbsAction.time > 1.8) { animationtick_duration = (((2.0 - 1.8) + 0.4) - orbsAction.time) * 1000; }
        setTimeout(() => {
            singleOrbFaddingFactor = 0.0; // 设置过渡动画
            meshesMap[name].status = true;
            meshesMap[name].mesh.visible = true; // 设置可见性
            meshesMap[name].mesh.material.uniforms.uLifeTime.value = 0.0;
            if (isLeft) { wristLSlot.getWorldPosition(vec3Util1); } // 射出位置
            else { wristRSlot.getWorldPosition(vec3Util1); }
            meshesMap[name].mesh.position.copy(vec3Util1);
            if (orbSpawnEffectPlaneL && orbSpawnEffectPlaneR) { // 涡轮扰动效果
                if (isLeft) { orbSpawnEffectPlaneL.material.uniforms.uLifeTime.value = 0.0; }
                else { orbSpawnEffectPlaneR.material.uniforms.uLifeTime.value = 0.0; }
            }
        }, animationtick_duration);

    }

    /** 帧更新函数 */
    const frameLoop = (elapsedTime, deltaTime) => {
        if (!singleOrbSlotP) { return; } // 骨骼判断

        singleOrbFaddingFactor += deltaTime;

        totalNameArr.forEach(name => {
            meshesMap[name].mesh.material.uniforms.uTime.value = elapsedTime;
            meshesMap[name].mesh.material.uniforms.uRandDinamic.value = Math.random();

            // status
            if (meshesMap[name].status === true) {
                meshesMap[name].mesh.material.uniforms.uLifeTime.value += deltaTime;
                // 更新到插槽位置
                singleOrbSlotP.getWorldPosition(vec3Util);
                const factor = THREE.MathUtils.smoothstep(singleOrbFaddingFactor, 0.0, orbLerpingDuration);
                meshesMap[name].mesh.position.y += (1.0 - factor) * deltaTime * 4.5; // 向上提供一些射出去的感觉
                meshesMap[name].mesh.position.lerp(vec3Util, factor);
                return;
            }

            // !status
            if (meshesMap[name].mesh.visible === true) {
                meshesMap[name].mesh.material.uniforms.uLifeTime.value -= deltaTime;
                if (meshesMap[name].mesh.material.uniforms.uLifeTime.value < 0.0) {
                    meshesMap[name].mesh.visible = false;
                }
            }
        });
    }

    return { meshesMap, fadeToAnotherMesh, frameLoop };
}

/**
 * 球体状态更新机
 * @returns {{frameLoop: (elapsedTime: number, deltaTime: number) => void}}
 */
export const OrbAnimationMachine = (scene) => {

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

    /** 帧更新函数 */
    const frameLoop = (elapsedTime, deltaTime) => {

        // 更新 SingleOrbObject
        orb1.frameLoop(elapsedTime, deltaTime);
        orb2.frameLoop(elapsedTime, deltaTime);
        orb3.frameLoop(elapsedTime, deltaTime);
    }

    return { frameLoop };
}