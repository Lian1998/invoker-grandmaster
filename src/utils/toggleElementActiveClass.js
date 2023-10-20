/**
 * 短暂的给某个元素添加activeClass
 * @param {Element} element 
 */
export const toggleElementActiveClass = (element) => {
    if (!element | !element.classList) { return; }
    element.classList.add('active');
    setTimeout(() => { element.classList.remove('active'); }, 120);
}