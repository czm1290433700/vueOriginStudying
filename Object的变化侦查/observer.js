import Dep from "./dep";
export class Observer {
    constructor(value) {
        this.value = value;
        if(Array.isArray(value)){
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
}

function defineReactive(data, key, val){
    // 新增, 递归子属性
    if(typeof val === 'object'){
        new Observer(val);
    }
    let dep = new Dep();
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get: function() {
            dep.depend();
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