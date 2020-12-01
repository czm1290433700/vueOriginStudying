import { arrayMethods } from "../Array的变化侦测/array";
import Dep from './dep';
const hasProto = '__proto__' in {};
const arrayKeys = Object.getOwnPropertyNames(arrayMethods);

// 侦测类
export class Observer {
    constructor(value) {
        this.value = value;
        this.dep = new Dep(); // 新增dep, 存放array的依赖
        def(value, '__ob__', this); // __ob__属性用来标识是否是响应式的
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
 * @param {Object} data 
 * @param {String} key 
 * @param {Object} val 
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