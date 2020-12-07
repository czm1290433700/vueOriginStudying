/**
 * 解析简单路径
 */
const bailRE = /[^\w.$]/
export function parsePath(path) {
    if(bailRE.test(path)){
        return ;
    }
    const segments = path.split('.');
    return function(obj) {
        for(let i = 0; i < segments.length; i++){
            if(!obj){
                return ;
            }
            obj = obj[segments[i]];
        }
        return obj;
    }
}

export function isUndef (v) {
    return v === undefined || v === null
}
  
export function isDef (v) {
return v !== undefined && v !== null
}