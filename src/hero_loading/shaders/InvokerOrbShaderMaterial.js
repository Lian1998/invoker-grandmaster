import * as THREE from 'three'
import iceorb_vert from './ice.orb.vert.glsl?raw';
import iceorb_frag from './ice.orb.frag.glsl?raw';

const textureLoader = new THREE.TextureLoader();

const orbTintable = textureLoader.load('/vrfcrack/particle/orb_tintable.png');
const orbEnergyTintable = textureLoader.load('/vrfcrack/particle/orb_energy_tintable.png');

const iceOrbShaderMaterial = () => new THREE.ShaderMaterial({

    uniforms: {

        uRand: { value: Math.random() }, // 静态随机值
        uRandDinamic: { value: Math.random() }, // 动态随机值
        uTime: { value: 0.0 }, // 渲染时间
        uLifeTime: { value: 0.0 }, // 切球时间

        // 球状着色图
        uMap1: { value: orbTintable },

        // 能量球着色图
        uMap2: { value: orbEnergyTintable },

        // 冰球
        uColor1: { value: new THREE.Color(0x83D5FE) },
        uColor2: { value: new THREE.Color(0x64AEFF) },
        uColor3: { value: new THREE.Color(0x4A76D3) },

        // 电球
        uColor4: { value: new THREE.Color(0xFDF5FB) },
        uColor5: { value: new THREE.Color(0x916594) },

        // 火球
        uColor6: { value: new THREE.Color(0xFFFFFF) },
        uColor7: { value: new THREE.Color(0xFFF665) },
        uColor8: { value: new THREE.Color(0xEC9F48) },

    },

    vertexShader: iceorb_vert,

    fragmentShader: iceorb_frag,

    transparent: true,

    // blending: THREE.AdditiveBlending,
    blending: THREE.NormalBlending,

    opacity: 1.,

});

const energyOrbShaderMaterial = () => new THREE.ShaderMaterial({

    uniforms: {

        uRand: { value: Math.random() }, // 静态随机值
        uRandDinamic: { value: Math.random() }, // 动态随机值
        uTime: { value: 0.0 }, // 渲染时间
        uLifeTime: { value: 0.0 }, // 切球时间

        // 球状着色图
        uMap1: { value: orbTintable },

        // 能量球着色图
        uMap2: { value: orbEnergyTintable },

        // 冰球
        uColor1: { value: new THREE.Color(0x83D5FE) },
        uColor2: { value: new THREE.Color(0x64AEFF) },
        uColor3: { value: new THREE.Color(0x4A76D3) },

        // 电球
        uColor4: { value: new THREE.Color(0xFDF5FB) },
        uColor5: { value: new THREE.Color(0x916594) },

        // 火球
        uColor6: { value: new THREE.Color(0xFFFFFF) },
        uColor7: { value: new THREE.Color(0xFFF665) },
        uColor8: { value: new THREE.Color(0xEC9F48) },



    },

    vertexShader: iceorb_vert,

    fragmentShader: iceorb_frag,

    transparent: true,

    // blending: THREE.AdditiveBlending,
    blending: THREE.NormalBlending,

    opacity: 1.,

});

const fireOrbShaderMaterial = () => new THREE.ShaderMaterial({

    uniforms: {

        uRand: { value: Math.random() }, // 静态随机值
        uRandDinamic: { value: Math.random() }, // 动态随机值
        uTime: { value: 0.0 }, // 渲染时间
        uLifeTime: { value: 0.0 }, // 切球时间

        // 球状着色图
        uMap1: { value: orbTintable },

        // 能量球着色图
        uMap2: { value: orbEnergyTintable },

        // 冰球
        uColor1: { value: new THREE.Color(0x83D5FE) },
        uColor2: { value: new THREE.Color(0x64AEFF) },
        uColor3: { value: new THREE.Color(0x4A76D3) },

        // 电球
        uColor4: { value: new THREE.Color(0xFDF5FB) },
        uColor5: { value: new THREE.Color(0x916594) },

        // 火球
        uColor6: { value: new THREE.Color(0xFFFFFF) },
        uColor7: { value: new THREE.Color(0xFFF665) },
        uColor8: { value: new THREE.Color(0xEC9F48) },



    },

    vertexShader: iceorb_vert,

    fragmentShader: iceorb_frag,

    transparent: true,

    // blending: THREE.AdditiveBlending,
    blending: THREE.NormalBlending,

    opacity: 1.,

});



export { iceOrbShaderMaterial, energyOrbShaderMaterial, fireOrbShaderMaterial };