// 用于控制卡尔大资源的加载, 需要给出一个加载函数和一个回调函数, 回调函数中需要放出

import { logger } from '@src/DevLogger';

import * as THREE from 'three';
const invokerLoadingManager = new THREE.LoadingManager();

let loadedResouces = 0;
let totalResouces = 0;

invokerLoadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
    logger.debug('Started loading file: ' + url, 'Loaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    if (totalResouces < itemsTotal) { totalResouces = itemsTotal; }
};

invokerLoadingManager.onLoad = function () {
    loadedResouces += 1;
    if (loadedResouces >= totalResouces) {
        logger.debug('Loading complete!');
    }
};

invokerLoadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
    // logger.debug('Loading file: ' + url, 'Loaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
};

invokerLoadingManager.onError = function (url) {
    logger.error('There was an error loading ' + url);
};


import { GLTFLoader } from 'three_addons/loaders/GLTFLoader.js';

export const textureLoader = new THREE.TextureLoader();
export const gltfLoader = new GLTFLoader(invokerLoadingManager);

const modelResources = {
    rock: '/rock/rock.gltf',
    invoker: '/vrfcracked/invoker/invoker.gltf',
}
