import parsePath from './utils';
/**
 * 依赖类
 */
export default class Watcher {
    constructor(vm, expOrFn, cb) {
        this.vm = vm;
        this.getter = parsePath(expOrFn);
        this.cb = cb;
        this.value = this.get();
    }

    get() {
        window.target = this;
        let value = this.getter.call(this.vm, this.vm); // 触发收集依赖，存入
        window.target = undefined;  // 依赖初始化
        return value;
    }

    update() {
        const oldValue = this.value;
        this.value = this.get();
        this.cb.call(this.vm, this.value, oldValue);
    }
}                                                                                                                                                                                                                                                                                                                                                           