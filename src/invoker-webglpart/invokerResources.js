// 用于控制卡尔大资源的加载, 需要给出一个加载函数和一个回调函数, 回调函数中需要放出
import { maskel, loadedel, requiredel } from '@src/dompart/index.js';
import { logger } from './logger';

import * as THREE from 'three';
import { GLTFLoader } from 'three_addons/loaders/GLTFLoader.js';
import { getJoinedBaseUrl } from '@src/utils/getJoinedBaseUrl.js';

/**
 * 抛出给外部用于获取GLTF模型
 */
export const invokerGLTFResources = (() => {

    // gltf资源映射, 这个项目的模型资源我应该都会用gltf进行操作
    const gltfMap = {
        rock: { url: getJoinedBaseUrl('/badside_rocks006_b/badside_rocks006_b.gltf'), resolved: undefined, },
        invoker: { url: getJoinedBaseUrl('/vrfcracked/invoker/invoker.gltf'), resolved: undefined, },
    }

    const get = (keyInput) => {
        if (gltfMap[keyInput]) { return gltfMap[keyInput].resolved; }

        let threejsResolvedResouce = undefined;
        Object.keys(gltfMap).map(key => { // 遍历资源对象
            if (gltfMap[key].url.indexOf(keyInput) !== -1) {
                threejsResolvedResouce = gltfMap[key].resolved;
            }
        });
        if (threejsResolvedResouce) { return threejsResolvedResouce; }
        else {
            logger.error('GLTFResources.gltfMap Have no resolved resouce named ' + keyInput);
            return undefined;
        }
    }

    const set = (keyInput, resolvedInput) => {
        if (gltfMap[keyInput]) {
            gltfMap[keyInput].resolved = resolvedInput;
        }
    }

    return { gltfMap, set, get };
})();

/**
 * 用于标记资源是否加载完毕
 * @returns {Promise<boolean>} Promise函数
 */
export const invokerResourcesPretreat = () => {

    let ALL = 0;
    let LOADED = 0;
    let ALL_loaded = 0; // 当前已经加载的资源
    let ALL_required = 0; // 所有需要加载的资源

    return new Promise((resolve, reject) => {

        const resouceskeys = Object.keys(invokerGLTFResources.gltfMap); // keys
        ALL = resouceskeys.length;
        for (let i = 0; i < resouceskeys.length; i++) { // key
            const key = resouceskeys[i];
            const resourceObj = invokerGLTFResources.gltfMap[key];
            const invokerLoadingManager = new THREE.LoadingManager();

            invokerLoadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
                logger.debug('Started loading file: ' + url, 'Loaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
            };

            invokerLoadingManager.onLoad = function () {
                LOADED += 1;
                if (LOADED >= ALL) { // 这里代表资源完全加载完毕了
                    logger.warn('Loading complete!', invokerGLTFResources.gltfMap);
                    maskel.classList.add('fadeout'); // 去除loadingMask
                    resolve(true);
                }
            };

            let thisLoaded = 0;
            let thisTotal = 0;
            invokerLoadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
                logger.debug('Loading file: ' + url, 'Loaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
                if (thisTotal < itemsTotal) {
                    ALL_required -= thisTotal;
                    thisTotal = itemsTotal;
                    ALL_required += thisTotal;
                }
                if (thisLoaded < itemsLoaded) {
                    ALL_loaded -= thisLoaded;
                    thisLoaded = itemsLoaded;
                    ALL_loaded += thisLoaded;
                }
                loadedel.innerHTML = ALL_loaded;
                requiredel.innerHTML = ALL_required;
            };

            invokerLoadingManager.onError = function (url) {
                logger.error('There was an error loading ' + url);
            };

            const gltfLoader = new GLTFLoader(invokerLoadingManager);
            gltfLoader.load(resourceObj.url, (gltf) => { invokerGLTFResources.set(key, gltf); });
        }
    })
}




