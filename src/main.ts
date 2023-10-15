import 'normalize.css'

import { invokerResourcesPretreat } from './invoker-webglpart/invokerResources.js';
import { invokerInitialize3D, INFO, frameloopMachine } from './invoker-webglpart/invoker.js';

import { toggleHelper } from './invoker-webglpart/toggleHelper.js';
import { toogleLoopState } from './invoker-webglpart/toogleLoopState.js';
import { invokerInitializeKeyListening } from './invoker-webglpart/events/invokerEventPipe.js';

console.log(INFO);

window.addEventListener('load', () => {

    // 请求资源
    invokerResourcesPretreat().then(() => {

        // 初始化事件监听
        invokerInitializeKeyListening();

        // 挂载3D资源
        const viewport1el = document.querySelector('#viewport1');
        invokerInitialize3D(viewport1el).then(() => {

            // 显示/关闭 帮助对象
            if (import.meta.env.MODE === 'development') { toggleHelper(true); }
            else { toggleHelper(false); }

            // 开启渲染循环
            frameloopMachine.startLoop();

            // 注册事件
            window.addEventListener('keydown', (e) => {
                if (e.code === 'F9') { toogleLoopState(); }
                else if (e.code === 'KeyH') { toggleHelper(); }
            });
        });
    })

});

