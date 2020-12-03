import { parsePath } from './utils';
/**
 * 依赖类
 */
export default class Watcher {
    /**
     * Watcher构造函数
     * @param {*} vm 监听的对象
     * @param {*} expOrFn 监听的属性表达式或函数
     * @param {*} cb 更新状态时候使用的回调函数，有newVal和oldValue两个参数
     * @param {*} options 
     */
    constructor(vm, expOrFn, cb, options) {
        this.vm = vm;
        if(options) {
            this.deep = !!options.deep; // 加两次感叹号确定可以转换成Bool型
        }else{
            this.deep = false;
        }
        // expOrFn参数支持函数
        if(typeof expOrFn === 'function') {
            this.getter = expOrFn;
        }else{
            this.getter = parsePath(expOrFn);
        }
        this.deps = []; // 记录订阅了哪些依赖
        this.depIds = new Set(); // 记录依赖的id
        // this.getter = parsePath(expOrFn);
        this.cb = cb;
        this.value = this.get();
    }

    addDep(dep) {
        const id = dep.id;
        if(!this.depIds.has(id)) {
            this.depIds.add(id);
            this.deps.push(dep);
            dep.addSub(this);
        }
    }

    get() {
        window.target = this;
        let value = this.getter.call(this.vm, this.vm); // 触发收集依赖，存入
        if(this.deep) {
            traverse(value);
        } // 一定要在window.target被清空前执行
        window.target = undefined;  // 依赖初始化
        return value;
    }

    update() {
        const oldValue = this.value;
        this.value = this.get();
        this.cb.call(this.vm, this.value, oldValue);
    }

    /**
     * 从所有依赖项的Dep列表中将自己移除
     */
    teardown() {
        let i = this.deps.length;
        while(i--) {
            this.deps[i].removeSub(this);
        }
    }
}                                                                                                                                                                                                                                                                                                                                                           