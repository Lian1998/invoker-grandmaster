
import * as THREE from 'three';

import { OrbQuasShaderMaterial, OrbWexShaderMaterial, OrbExortShaderMaterial } from './OrbShaderMaterials.js';
import { SpritePlaneBufferGeometry } from '../SpritePlaneBufferGeometry.js';

const vec3Util = new THREE.Vector3();

/**
 * 球体更新机
 * 一个球体更新机包含了三个添加到场景里的球体模型
 * 
 * @param {THREE.Bone} orbSlot 球体的插槽
 * @returns {{ 
 *  orbsMap: {quas: THREE.Mesh, wex: THREE.Mesh, exort: THREE.Mesh, activeP: undefined | THREE.Mesh },
 *  callingOrb: (name: 'quas'|'wex'|'exort') => void, frameLoop: (elapsedTime: number, deltaTime: number,
 *  deltaTimeRatio60: number) => {}
 * }} 球体更新机闭包
 */
export const SingleSlotOrbMachine = (orbSlot, scene) => {

    const orbSlotP = orbSlot;

    const quas = new THREE.Mesh(SpritePlaneBufferGeometry(), OrbQuasShaderMaterial());
    const wex = new THREE.Mesh(SpritePlaneBufferGeometry(), OrbWexShaderMaterial());
    const exort = new THREE.Mesh(SpritePlaneBufferGeometry(), OrbExortShaderMaterial());
    quas.visible = false;
    wex.visible = false;
    exort.visible = false;
    scene.add(quas);
    scene.add(wex);
    scene.add(exort);
    const orbsMap = { quas, wex, exort, activeP: undefined };

    const callingOrb = (name) => {
        if (name === undefined) return;

        quas.visible = false;
        wex.visible = false;
        exort.visible = false;

        const orb = orbsMap[name];
        if (!orb) return;
        orbsMap.activeP = orb;
        orb.visible = true;
        orb.material.uniforms.uLifeTime.value = 0.;
    }

    const frameLoop = (elapsedTime, deltaTime, deltaTimeRatio60) => {

        if (!orbSlotP) { return; } // 球体插槽骨骼
        const orb = orbsMap.activeP; // 当前球体
        if (!orb) { return; }

        orbSlotP.getWorldPosition(vec3Util);
        orb.position.lerp(vec3Util, 1.);
        orb.material.uniforms.uTime.value = elapsedTime;
        orb.material.uniforms.uRandDinamic.value = Math.random();
        orb.material.uniforms.uLifeTime.value += deltaTimeRatio60;
    }


    return { orbsMap, callingOrb, frameLoop }
}