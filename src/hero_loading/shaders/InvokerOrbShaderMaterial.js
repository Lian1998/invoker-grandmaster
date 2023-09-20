import * as THREE from 'three'
import orbVert from './orb.vert.glsl?raw';
import orbFrag from './orb.frag.glsl?raw';

const textureLoader = new THREE.TextureLoader();

const orbTintable = textureLoader.load('/vrfcrack/particle/orb_tintable.png');
const orbEnergyTintable = textureLoader.load('/vrfcrack/particle/orb_energy_tintable.png');

const invokerOrbShaderMaterial = () => new THREE.ShaderMaterial({

    uniforms: {
        uMap1: { value: orbTintable },
        uMap2: { value: orbEnergyTintable },
        uColor1: { value: new THREE.Color(0xA3FFFE) },
        uColor2: { value: new THREE.Color(0x578DFA) },
        uTime: { value: 0.0 },
    },

    vertexShader: orbVert,

    fragmentShader: orbFrag,

    transparent: true,

    blending: THREE.AdditiveBlending,

    opacity: 1.,

});



export { invokerOrbShaderMaterial };