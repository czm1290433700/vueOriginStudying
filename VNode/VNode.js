export default class VNode {
    constructor(tag, data, children, text, elm, context, componentOptions, asyncFactory) {
        this.tag = tag; // 节点的名称，例如p, ul, li和div等
        this.data = data;   // 节点上的数据，比如attrs，class和style等
        this.children = children;   // 当前节点的子节点列表
        this.text = text;
        this.elm = elm;
        this.ns = undefined;
        this.context = context; // 组件的Vue.js实例
        this.functionalContext = undefined; 
        this.functionalOptions = undefined;
        this.functionalScopeId = undefined; // 函数式组件独有的属性
        this.key = data && data.key;
        this.componentOptions = componentOptions;   // 组件节点的选项参数，其中包含propsData, tag和children等信息
        this.componentInstance = undefined; // 组件的实例，在Vue.js中，每个组件都是一个Vue.js实例
        this.parent = undefined;
        this.raw = false;
        this.isStatic = false;
        this.isRootInsert = true;
        this.isComment = false;
        this.isOnce = false;
        this.asyncFactory = asyncFactory;
        this.asyncMeta = undefined;
        this.isAsyncPlaceholder = false;
    }

    getChild() {
        return this.componentInstance;
    }
}

/**
 * 创建注释节点（有效属性text和isComment）
 * @param {*} text 
 */
export const createEmptyVnode = text => {
    const node = new VNode();
    node.text = text;
    node.isComment = true;
    return node;
}

/**
 * 创建文本节点（有效属性text）
 * @param {*} val 
 */
export function createTextVNode(val) {
    return new VNode(undefined, undefined, undefined, String(val));
}

/**
 * 创建克隆节点
 * @param {*} vnode 
 * @param {*} deep 
 */
export function cloneVNode(vnode, deep) {
    const cloned = new VNode(
        vnode.tag,
        vnode.data,
        vnode.children,
        vnode.text,
        vnode.elm,
        vnode.context,
        vnode.componentOptions,
        vnode.asyncFactory
    );
    cloned.ns = vnode.ns;
    cloned.isStatic = vnode.isStatic;
    cloned.key = vnode.key;
    cloned.isComment = vnode.isComment;
    cloned.isCloned = true; // 与被克隆节点唯一的区别
    if(deep && vnode.children) {
        cloned.children = cloneVNodes(vnode.children);
    }
    return cloned;
}