import { SSR_ATTR } from '../config';
import { isUndef, isDef } from '../Object的变化侦查/utils'
export function patch(oldVnode, vnode, hydrating, removeOnly) {
    // 新节点不存在，老节点存在, 直接移除老节点
    if(isUndef(vnode)) {
        if(isDef(oldVnode)){
            invokeDestoryHook(oldVnode);
        }
        return ;
    }

    let isInitialPatch = false;
    const insertedVnodeQueue = [];

    if(isUndef(oldVnode)) {
        // empty mount (likely as component), create new root element
        isInitialPatch = true;
        // 新节点存在，老节点不存在，就增该节点
        createElm(vnode, insertedVnodeQueue);
    }else {
        // 判断是否是真实DOM, 用于区分是否是初始化逻辑
        const isRealElement = isDef(oldVnode, nodeType);
        // 不是真实DOM，并且是相同的Vnode元素
        if(!isRealElement && sameVnode(oldVnode, vnode)) {
            // 更新操作
            patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly);
        }else {
            // 真实DOM，即初始化逻辑
            if(isRealElement) {
                if(oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)){
                    // 当旧的VNode是服务器端渲染的元素，hydrating记为true
                    oldVnode.removeAttribute(SSR_ATTR);
                    hydrating = true;
                }
                if(isTrue(hydrating)) {
                    // 需要合并服务器渲染的页面到真实DOM上
                    if(hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                        invokeInsertHook(vnode, insertedVnodeQueue, true);
                        return oldVnode;
                    }
                }
                // 不是服务器端渲染节点，或者服务器端渲染合并到真实DOM失败，返回一个空节点
                oldVnode = emptyNodeAt(oldVnode);
            }
            // 取代现有元素
            const oldElm = oldVnode.elm;
            const parentElm = nodeOps.parentNode(oldElm);

            // 生成真实DOM
            createElm(
                vnode,
                insertedVnodeQueue,
                oldElm._leaveCb ? null : parentElm, // 指定父节点
                nodeOps.nextSibling(oldElm) // 指定插入位置：现有元素的旁边
            )
            if(isDef(parentElm)){
                removeVnodes([oldVnode], 0, 0);
            }else if(isDef(oldVnode.tag)){
                invokeDestoryHook(oldVnode);
            }
        }
    }
    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
    return vnode.elm;
}

/**
 * 判断两个VNode节点是否是同一个节点，需要满足以下条件：
 * key相同
 * tag（当前节点的标签名）相同
 * isComment(是否为注释节点) 相同
 * 是否data(当前节点对应的对象，包含了具体的一些数据信息，是一个VNodeData类型，可以参数VNodeData类型中的数据信息)都有定义
 * 当标签是input的时候,type必须相同
 * @param {*} a 
 * @param {*} b 
 */
function sameVnode(a, b){
    return (
        a.key === b.key && (
            (
                a.tag === a.tag && 
                a.isComment === b.isComment &&
                isDef(a.data) === isDef(d.data) &&
                sameInputType(a, b)
            ) || (
                isTrue(a.isAsyncPlaceholder) && 
                a.asyncFactory === b.asyncFactory &&
                isUndef(b.asyncFactory.error)
            )
        )
    )
}

/**
 * 判断当标签是<input>的时候，type是否相同
 * 某些浏览器不支持动态修改<input>的类型，所以他们被视为不同类型
 * @param {*} a 
 * @param {*} b 
 */
function sameInputType(a, b) {
    if(a.tag !== 'input'){
        return true;
    }
    let i;
    const typeA = isDef(i == a.data) && isDef(i == i.attrs) && i.type;
    const typeB = isDef(i == b.data) && isDef(i == i.attrs) && i.type;
    return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB);
}


/**
 * 1.如果新旧VNode都是静态的，同时它们的key相同（代表同一节点），并且新的VNode是clone或者是标记了once（标记v-once属性，只渲染一次）
 * ，那么只需要替换elm以及componentInstance即可。
 * 2.新老节点均有children子节点，则对子节点进行diff操作，调用updateChildren，这个updateChildren也是diff的核心。
 * 3.如果老节点没有子节点而新节点存在子节点，先清空老节点DOM的文本内容，然后为当前DOM节点加入子节点。
 * 4.当新节点没有子节点而老节点有子节点的时候，则移除该DOM节点的所有子节点。
 * 5.当新老节点都无子节点的时候，只是文本的替换。
 * @param {*} oldVnode 
 * @param {*} vnode 
 * @param {*} insertedVnodeQueue 
 * @param {*} ownerArray 
 * @param {*} index 
 * @param {*} removeOnly 
 */
function patchVnode (
    oldVnode,
    vnode,
    insertedVnodeQueue,
    ownerArray,
    index,
    removeOnly
  ) {
    //两个VNode节点相同则直接返回
    if (oldVnode === vnode) {
      return
    }
    
    const elm = vnode.elm = oldVnode.elm
    /*
    如果新旧VNode都是静态的，同时它们的key相同（代表同一节点），
    并且新的VNode是clone或者是标记了once（标记v-once属性，只渲染一次），
    那么只需要替换componentInstance即可。
    */
    if (isTrue(vnode.isStatic) &&
      isTrue(oldVnode.isStatic) &&
      vnode.key === oldVnode.key &&
      (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
    ) {
      vnode.componentInstance = oldVnode.componentInstance
      return
    }

    let i
    const data = vnode.data
    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      //i = data.hook.prepatch，如果存在，见"./create-component componentVNodeHooks"
      i(oldVnode, vnode)
    }

    const oldCh = oldVnode.children
    const ch = vnode.children
    if (isDef(data) && isPatchable(vnode)) {
        //调用update回调以及update钩子
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
      if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
    }
    //vnode的text属性与children属性是互斥关系，若没有text属性，必有children
    if (isUndef(vnode.text)) {
      
      if (isDef(oldCh) && isDef(ch)) {
        //老的有子节点，新的也有子节点，对子节点进行diff操作
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
      } else if (isDef(ch)) {
        //新的有子节点，老的没有子节点，先清空老节点的text内容
        if (process.env.NODE_ENV !== 'production') {
          checkDuplicateKeys(ch)
        }
        if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
        //再增加新节点
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
      } else if (isDef(oldCh)) {
        //老的有子节点，新的没有子节点，移除老节点
        removeVnodes(oldCh, 0, oldCh.length - 1)
      } else if (isDef(oldVnode.text)) {
        nodeOps.setTextContent(elm, '')
      }
    } else if (oldVnode.text !== vnode.text) {
      //两个都没有子节点，那么替换文本内容
      nodeOps.setTextContent(elm, vnode.text)
    }
    if (isDef(data)) {
      //i = data.hook.postpatch，如果存在，见"./create-component componentVNodeHooks"
      if (isDef(i = data.hook) && isDef(i = i.postpatch)) i(oldVnode, vnode)
    }
}

function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    let oldStartIdx = 0
    let newStartIdx = 0
    let oldEndIdx = oldCh.length - 1
    let oldStartVnode = oldCh[0]
    let oldEndVnode = oldCh[oldEndIdx]
    let newEndIdx = newCh.length - 1
    let newStartVnode = newCh[0]
    let newEndVnode = newCh[newEndIdx]
    let oldKeyToIdx, idxInOld, vnodeToMove, refElm

    // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions
    const canMove = !removeOnly

    if (process.env.NODE_ENV !== 'production') {
      checkDuplicateKeys(newCh)
    }

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx]
      /*
      前四种情况其实是指定key的时候，判定为同一个VNode，则直接patchVnode即可
      分别比较oldCh以及newCh的两头节点2*2=4种情况
      */
      } else if (sameVnode(oldStartVnode, newStartVnode)) { //头头相同
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
        
      } else if (sameVnode(oldEndVnode, newEndVnode)) {     //尾尾相同
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldStartVnode, newEndVnode)) {   //头尾相同
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
        //挪动oldStartVnode到oldEndVnode前面
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldEndVnode, newStartVnode)) {   //尾头相同
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
        //挪动oldEndVnode到oldStartVnode前面
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      } else {
        //在OldCh中，创建一张key<==>idx对应的map表，可加快查找newStartVnode是否在OldCh中
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
        idxInOld = isDef(newStartVnode.key)
          ? oldKeyToIdx[newStartVnode.key]
          : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
        if (isUndef(idxInOld)) { //如果不存在OldCh中，那么认定newStartVnode是新元素，创建
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
        } else {
          vnodeToMove = oldCh[idxInOld]
          /*
          对比OldCh中找到的【相同key】的Vnode与newStartVnode，是否是相同的节点
          判断是否是相同节点，除了key相同外，还有：
            tag（当前节点的标签名）相同
            isComment（是否为注释节点）相同
            是否data都有定义
            当标签是<input>的时候，type必须相同
          */
          if (sameVnode(vnodeToMove, newStartVnode)) {
            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
            oldCh[idxInOld] = undefined
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
          } else {
            // 如果key相同，但是其他不同，那么认为这是新元素，创建
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
          }
        }
        newStartVnode = newCh[++newStartIdx]
      }
    }
    if (oldStartIdx > oldEndIdx) {
      //如果oldCh数组已经遍历完，newCh数组还有元素，那么将剩余元素都创建
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
    } else if (newStartIdx > newEndIdx) {
      //如果newCh数组已经遍历完，oldCh数组还有元素，那么将剩余元素都删除
      removeVnodes(oldCh, oldStartIdx, oldEndIdx)
    }
}

