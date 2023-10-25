// 元素点击聚焦
export function useFocus(commandsStore, preview, callback) {
    // 点击渲染区的组件块的回调
    const blockMousedown = (e, id) => {
        // 阻止默认行为和事件冒泡
        e.preventDefault()
        e.stopPropagation()
        // block维护一个状态focus表示是否获取焦点了
        //如果按住shiftKey
        commandsStore.switchFocus(e, id)
        // 预览模式直接退出
        if (preview) return;
        callback(e)
    }

    return {
        blockMousedown
    }
}