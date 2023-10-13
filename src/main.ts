import 'normalize.css'

import { invokerResourcePretreat } from './invoker-webglpart/invokerResourcePretreat.js';
import { invokerInitialize3D, INFO } from './invoker-webglpart/invoker.js';

console.log(INFO);

window.addEventListener('load', () => {

    invokerResourcePretreat().then(res => {
        invokerInitialize3D(document.querySelector('#viewport1'));
    })

});

