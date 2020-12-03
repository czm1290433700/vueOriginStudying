const seenObjects = new Set();

/**
 * 递归val所有子值来触发他们收集依赖的功能
 * @param {*} val 
 */
export function traverse(val) {
    _traverse(val, seenObjects);
    seenObjects.clear();
}

function _traverse(val, seen) {
    let i, keys;
    const isA = Array.isArray(val);
    if((!isA && isObject(val)) || Object.isFrozen(val)){
        return ;
    }
    if(val.__ob__) {
        const depId = val.__ob__.dep.id; // 用这个id来保证不会重复收集依赖
        if(seen.has(depId)) {
            return ;
        }
        seen.add(depId);
    }
    if(isA) {
        i = val.length;
        while(i--) {
            // 在数组每一项递归调用_traverse()
            _traverse(val[i], seen);
        }
    }else{
        keys = Object.keys(val);
        i = keys.length;
        while(i--) {
            _traverse(val[keys[i]], seen);
        }
    }
}