import { arrayMethods } from "../Array的变化侦测/array";
import Dep from './dep';
// const hasProto = '__proto__' in {};
// const arrayKeys = Object.getOwnPropertyNames(arrayMethods);

// 侦测类
export class Observer {
    constructor(value) {
        this.value = value; // 侦测的对象
        this.dep = new Dep(); // 新增dep, 存放依赖
        def(value, '__ob__', this); // __ob__属性用来标识是否是响应式的, 并且这样就可以通过__ob__直接访问Observer实例
        if(Array.isArray(value)){
            // value.__proto__ = arrayMethods; // 新增对数组的处理
            // 修改
            // hasProto ? protoAugment(value, arrayMethods, arrayKeys) : copyAugment(value, arrayMethods, arrayKeys);
            this.observeArray(value);
        }else{
            this.walk(value);
        }
    }

    /**
     * 将每个属性转换成getter / setter的形式来侦测变化
     */
    walk(obj) {
        const keys = Object.keys(obj);
        for(let i = 0; i < keys.length; i++){
            defineReactive(obj, keys[i], obj[keys[i]]);
        }
    }

    /**
     * 侦测Array中的每一项
     */
    observeArray(items) {
        for(let i = 0, l = items.length; i < l; i++){
            observe(items[i]);
        }
    }
}

/**
 * 变化侦测
 * @param {Object} data 要侦查的对象
 * @param {String} key 要侦查的对象属性
 * @param {Object} val 要侦查的对象属性对应的值
 */
function defineReactive(data, key, val){
    // // 新增, 递归子属性
    // if(typeof val === 'object'){
    //     new Observer(val);
    // }
    let childob = observe(val); // 避免重复侦查
    let dep = new Dep();
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get: function() {
            dep.depend();
            // 这里收集Array的依赖
            if(childob){
                childob.dep.depend(); // 把dep搜集到Observer实例中
            }
            return val;
        },
        set: function(newVal) {
            if(val === newVal){
                return ;
            }
            val = newVal;
            dep.notify();
        }
    })
}

// /**
//  * 浏览器支持__proto__的拦截器挂载方法
//  * @param {string} target 
//  * @param {object} src 
//  * @param {array} keys 
//  */
// function protoAugment(target, src, keys){
//     target.__proto__ = src;
// }

// /**
//  * 浏览器不支持__proto__的拦截器挂载方法
//  * @param {string} target 
//  * @param {object} src 
//  * @param {array} keys 
//  */
// function copyAugment(target, src, keys){
//     for(let i = 0, l = keys.length; i < l; i++){
//         const key = keys[i];
//         def(target, src, keys);
//     }
// }

/**
 * 尝试为value直接创建一个Observer实例，如果已经存在则直接返回
 * @param {*} value 
 * @param {*} asRootData 
 */
function observe(value, asRootData) {
    if(!isObject(value)){
        return ;
    }
    let ob;
    if(hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
        ob = value.__ob__;
    }else {
        ob = new Observer(value);
    }
    return ob;
}

/**
 * 工具函数, 定义对象属性
 * @param {*} obj 
 * @param {*} key 
 * @param {*} val 
 * @param {*} enumerable 
 */
export function def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable,
        writable: true,
        configurable: true
    })
}

/**
 * vm.$set的方法，用于解决observer不能侦查object新增属性的问题
 * @param {*} target 
 * @param {*} key 目标数组对象索引值
 * @param {*} val 
 */
export function set(target, key, val) {
    // 数组情况
    if(Array.isArray(target) && isValidArrayIndex(key)) {
        target.length = Math.max(target.length, key); // 如果传递的索引值大于数组length，就取传递索引值
        target.splice(key, 1, val); // splice是已经被处理的原型方法，会自动把这个数据处理成响应式的
        return val;
    }
    // key已经存在于target中的情况
    if(key in target && !(key in Object.prototype)) {
        // 修改数据本来就会被侦测到，直接修改即可
        target[key] = val;
        return val;
    }
    // object类型新增key
    const ob = target.__ob__;
    // target._isVue 用来判断target是否是Vue.js实例对象，ob.vmCount判断是否是根数据（this.$data）
    if(target._isVue || (ob && ob.vmCount)) {
        // target 不能是Vue.js实例或Vue.js实例的根数据对象
        process.env.NODE_ENV !== 'production' && warn(
            'Avoid adding reactive properies to a Vue instance or its root $data' + 'at runtime - declare it upfront in the data option.'
        )
        return val
    }
    // target不是响应式数据, 所以不需要响应式key，直接赋值即可
    if(!ob) {
        target[key] = val;
        return val;
    }
    // 在响应式数据上新增了一个key
    defineReactive(ob.value, key, val);
    ob.dep.notify();
    return val;
}

/**
 * 删除object属性，并且通知vue触发消息
 * @param {*} target 删除目标属性的对象
 * @param {*} key 删除的目标属性
 */
export function del(target, key){
    // 处理数组的情况
    if(Array.isArray(target) && isValidArrayIndex(key)) {
        target.splice(key, 1);
        return ;
    }
    const ob = target.__ob__;
    if(target._isVue || (ob && ob.vmCount)) {
        // target 不能是Vue.js实例或Vue.js实例的根数据对象
        process.env.NODE_ENV !== 'production' && warn(
            'Avoid deleting properties on a Vue instance or its root $data' + '- just set it to null.'
        )
        return val
    }
    // 如果key 不是target自身的属性，则终止程序继续执行
    if(!hasOwn(target, key)) {
        return ;
    }
    delete target[key];
    // 如果ob不存在，说明不是响应式数据，删除即可不需要发送通知
    if(!ob) {
        return ;
    }
    ob.dep.notify();
}