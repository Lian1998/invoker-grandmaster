import * as THREE from 'three';
import invokeHaloV from './invoke-halo.vs';
import invokeHaloF from './invoke-halo.fs';
import { getJoinedBaseUrl } from '@src/utils/getJoinedBaseUrl.js';

const textureLoader = new THREE.TextureLoader();
const invokeColorT = textureLoader.load(getJoinedBaseUrl('/invoker-textures/invoke/invoke_color.png'));

export const InvokeHaloShaderMaterial = () => new THREE.ShaderMaterial({
    uniforms: {
        uLifeTime: { value: 0.0 }, // 切球时间
        uMap: { value: invokeColorT },
        uColor: { value: new THREE.Color(0xFB9039) }
    },
    blending: THREE.NormalBlending,
    vertexShader: invokeHaloV,
    fragmentShader: invokeHaloF,
    depthWrite: false,
    depthTest: true,
    transparent: true,
});