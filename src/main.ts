import 'normalize.css'
import { initialize3D, INFO } from './hero_loading/invoker';

console.log(INFO);

window.addEventListener('load', () => {

    initialize3D(document.querySelector('#viewport1'));

});

