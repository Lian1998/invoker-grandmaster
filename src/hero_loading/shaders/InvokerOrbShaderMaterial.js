import * as THREE from 'three'
import orbVert from './orb.vert.glsl?raw';
import orbFrag from './orb.frag.glsl?raw';

const textureLoader = new THREE.TextureLoader();

const orbTintable = textureLoader.load('/vrfcrack/particle/orb_tintable.png');
const orbEnergyTintable = textureLoader.load('/vrfcrack/particle/orb_energy_tintable.png');

const invokerOrbShaderMaterial = () => new THREE.ShaderMaterial({

    uniforms: {

        // 球状着色图
        uMap1: { value: orbTintable },

        // 冰球过度色
        uColor1: { value: new THREE.Color(0x83D5FE) },
        uColor2: { value: new THREE.Color(0x4B7EFC) },

        // 电球着色图
        uMap2: { value: orbEnergyTintable },

        // 电球色

        // 火球色

        // 切球时间
        uLifeTime: { value: 0.0 },

        // 渲染时间
        uTime: { value: 0.0 },
    },

    vertexShader: orbVert,

    fragmentShader: orbFrag,

    transparent: true,

    blending: THREE.AdditiveBlending,

    opacity: 1.,

});



export { invokerOrbShaderMaterial };