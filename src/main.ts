import 'normalize.css'

import { invokerResourcesPretreat } from './invoker-webglpart/invokerResources.js';
import { invokerInitialize3d } from './invoker-webglpart/index.js';

import { toggleHelper } from './invoker-webglpart/toggleHelper.js';
import { toggleLoopState } from './invoker-webglpart/toggleLoopState.js';
import { invokerInitializeKeyListening } from './invoker-webglpart/events/invokerEventPipe.js';

import './dompart/index.js';

window.addEventListener('load', () => {

    // 请求资源
    invokerResourcesPretreat().then(() => {

        invokerInitializeKeyListening(); // 初始化事件监听

        // 挂载3D资源
        const viewportContainer = document.querySelector('#viewport-container');
        const viewport1 = document.querySelector('#viewport1');
        invokerInitialize3d(viewportContainer, viewport1).then(({ resizeViewport, frameloopMachine }) => {

            // 初始化视口大小
            resizeViewport();
            window.addEventListener('resize', resizeViewport);

            // 显示/关闭 帮助对象
            if (import.meta.env.MODE === 'development') { toggleHelper(false); }
            else { toggleHelper(false); }

            // 开启渲染循环
            frameloopMachine.startLoop();

            // 注册事件
            window.addEventListener('keydown', (e) => {
                if (e.code === 'F9') { toggleLoopState(); } // 暂停/启动
                else if (e.code === 'KeyH') { toggleHelper(); } // 开启/关闭可视助手
            });

        });
    })

});

