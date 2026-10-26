export function el(tag, text = '', className = '') {
    const node = document.createElement(tag);
    node.textContent = text;
    node.className = className;
    return node;
}
export function button(text, action, className = '') {
    const node = el('button', text, className);
    node.type = 'button';
    node.addEventListener('click', action);
    return node;
}
export function byId(id) { return document.getElementById(id); }
