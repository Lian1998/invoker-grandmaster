import * as THREE from 'three';
import invokeHaloV from './halo.vs';
import invokeHaloF from './halo.fs';
import { getJoinedBaseUrl } from '@src/utils/getJoinedBaseUrl.js';

const textureLoader = new THREE.TextureLoader();
const invokeColorT = textureLoader.load(getJoinedBaseUrl('/invoker-textures/invoke/invoke_color.png'));

export const Ability4HaloShaderMaterial = () => new THREE.ShaderMaterial({
    uniforms: {
        uLifeTime: { value: 0.0 }, // 切球时间
        uMap: { value: invokeColorT },
        uType: { value: 0.1 },
        uColor1: { value: new THREE.Color(0x4A7EDB) },
        uColor2: { value: new THREE.Color(0xD582D9) },
        uColor3: { value: new THREE.Color(0xFB9039) },
    },
    blending: THREE.NormalBlending,
    vertexShader: invokeHaloV,
    fragmentShader: invokeHaloF,
    depthWrite: false,
    depthTest: false,
    transparent: true,
    opacity: 1.0
});