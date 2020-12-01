import { def } from '../Object的变化侦查/observer'
const arrayProto = Array.prototype;
export const arrayMethods = Object.create(arrayProto);
[
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
].forEach(function(method) {
    // 缓存原始方法
    const original =  arrayProto[method];
    // Object.defineProperty(arrayMethods, method, {
    //     value: function mutator(...args){
    //         const ob = this.__ob__; // 新增
    //         ob.dep.notify(); // 向依赖发送消息
    //         return original.apply(this, args);
    //     },
    //     enumerable: false,
    //     writable: true,
    //     configurable: true
    // })
    def(arrayMethods, method, function mutator(...args) {
        const result = original.apply(this, args);
        const ob = this.__ob__;
        let inserted;
        switch(method) {
            case 'push':
            case 'unshift':
                inserted = args;
                break;
            case 'splice':
                inserted = args.slice(2);
                break;
        }
        if(inserted){
            ob.observeArray(inserted); // 新增
        }
        ob.dep.notify();
        return result;
    })
})