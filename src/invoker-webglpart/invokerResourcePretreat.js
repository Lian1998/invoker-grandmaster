// 用于控制卡尔大资源的加载, 需要给出一个加载函数和一个回调函数, 回调函数中需要放出

import { logger } from '@src/DevLogger';

import * as THREE from 'three';
import { GLTFLoader } from 'three_addons/loaders/GLTFLoader.js';

const invokerLoadingManager = new THREE.LoadingManager();
const gltfLoader = new GLTFLoader(invokerLoadingManager);

/**
 * 抛出给外部用于获取GLTF模型
 */
export const invokerGLTFResources = (() => {

    // gltf资源映射, 这个项目的模型资源我应该都会用gltf进行操作
    const gltfMap = {
        rock: {
            url: '/rock/rock.gltf',
            resolved: undefined,
        },
        invoker: {
            url: '/vrfcracked/invoker/invoker.gltf',
            resolved: undefined,
        },
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

    const hasResource = () => {
        return Object.keys(gltfMap).length;
    }

    return { gltfMap, set, get, hasResource }
})();

/**
 * 用于标记资源是否加载完毕
 * @returns {Promise<boolean>} Promise函数
 */
export const invokerResourcePretreat = () => {

    let loadedResouces = 0; // 当前已经加载的资源
    let totalResouces = 0; // 所有需要加载的资源
    let loadFinished = false;

    return new Promise((resolve, reject) => {

        // 定义loadingManager的回调处理方法

        invokerLoadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
            logger.debug('Started loading file: ' + url, 'Loaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');

            if (totalResouces < itemsTotal) { // 记录总资源数
                totalResouces = itemsTotal;
            }
        };

        invokerLoadingManager.onLoad = function () {
            loadedResouces += 1;
            if (loadedResouces >= totalResouces) { // 这里代表资源完全加载完毕了
                logger.warn('Loading complete!', invokerGLTFResources.gltfMap);
                loadFinished = true;
                resolve(true);
            }
        };

        invokerLoadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
            // logger.debug('Loading file: ' + url, 'Loaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');

            // 这里代表资源加载的进度, 需要结合dom给出提示

        };

        invokerLoadingManager.onError = function (url) {
            logger.error('There was an error loading ' + url);

        };

        // 开始对资源进行请求

        if (invokerGLTFResources.hasResource()) {
            const resouceskeys = Object.keys(invokerGLTFResources.gltfMap);
            for (let i = 0; i < resouceskeys.length; i++) {
                const key = resouceskeys[i];
                const resourceObj = invokerGLTFResources.gltfMap[key];

                gltfLoader.load(resourceObj.url, (gltf) => {
                    invokerGLTFResources.set(key, gltf);
                });
            }
        }
        else {
            logger.warn('No need to resolve resources!');
            resolve(true);
        }

    })
}
