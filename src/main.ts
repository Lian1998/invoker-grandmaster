import 'normalize.css'
import './css/main.scss'

import { invokerResourcesPretreat } from './invoker-webglpart/invokerResources.js';
import { invokerInitialize3D, INFO, frameloopMachine } from './invoker-webglpart/invoker.js';

import { toggleHelper } from './invoker-webglpart/toggleHelper.js';
import { toggleLoopState } from './invoker-webglpart/toggleLoopState.js';
import { invokerInitializeKeyListening } from './invoker-webglpart/events/invokerEventPipe.js';

import './invoker-dompart.js';


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
            if (import.meta.env.MODE === 'development') { toggleHelper(false); }
            else { toggleHelper(false); }

            // 开启渲染循环
            frameloopMachine.startLoop();

            // 注册事件
            window.addEventListener('keydown', (e) => {
                if (e.code === 'F9') { toggleLoopState(); }
                else if (e.code === 'KeyH') { toggleHelper(); }
            });
        });
    })

});

