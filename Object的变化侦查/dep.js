/**
 * 依赖工具类
 */
export default class Dep {
    constructor() {
        this.subs = [];
    }
    // 添加依赖
    addSub(sub){
        this.subs.push(sub);
    }
    // 移除依赖
    removeSub(sub){
        remove(this.subs, sub);
    }
    // 收集依赖
    depend(){
        if(window.target){
            this.addSub(window.target);
        }
    }
    // 向依赖发送通知
    notify(){
        const subs = this.subs.slice();
        for(let sub of subs){
            sub.update(); // 更新状态
        }
    }
}

function remove(arr, item){
    if(arr.length){
        let index = arr.indexOf(item);
        if(index > -1){
            return arr.splice(index, 1);
        }
    }
}