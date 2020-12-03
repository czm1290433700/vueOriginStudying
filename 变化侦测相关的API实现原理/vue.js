import Watcher from '../object的变化侦查/watch';
import { set, del } from '../Object的变化侦查/observer';

export class Vue{

}

// vm.$watch
Vue.prototype.$watch = function(expOrFn, cb, options) {
    const vm = this;
    options = options || {};
    const watcher = new Watcher(vm, expOrFn, cb, options);
    if(options.immediate) {
        cb.call(vm, watcher.value);
    }
    /**
     * 清除监视函数
     */
    return function unwatchFn(){
        watcher.teardown();
    }
}

// vm.$set
Vue.prototype.$set = set;

// vm.$delete
Vue.prototype.$delete = del;