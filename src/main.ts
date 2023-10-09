import 'normalize.css'
import { initialize3D, INFO } from './invoker-webglpart/invoker';

console.log(INFO);

window.addEventListener('load', () => {

    initialize3D(document.querySelector('#viewport1'));

});

