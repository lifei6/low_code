//物料区拖拽hook
export const useMenvDragger = function (containerRef, commandsStore) {
    // 记录当前的拖拽元素
    let currentComponent = null;

    //目标元素相关回调
    const dragenter = (e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
    }
    const dragover = (e) => {
        // 必须阻止默认行为否则无法触发drop
        e.preventDefault()
    }
    const dragleave = (e) => {
        e.dataTransfer.dropEffect = "none"
    }
    const drop = (e) => {
        // 新增普通组件
        const block = {
            key: currentComponent.key,
            top: e.offsetY,
            left: e.offsetX,
            zIndex: 1,
            alignCenter: true,
            focus: true,//默认新增为选中状态
            props: {},
            model: {}
        }
        commandsStore.addComponent(block)
        currentComponent = null
    }

    //1.开始拖拽
    const dragstart = (e, component) => {
        // 设置为移动标识(默认是有个加号标识copy)
        e.dataTransfer.effectAllowed = 'move'

        currentComponent = component
        // 2为目标元素绑定拖拽行为
        // 2.1进入元素触发,添加一个移动标识
        containerRef.value.addEventListener('dragenter', dragenter)
        // 2.2在元素上移动时触发，必须阻止默认行为否则无法触发drop
        containerRef.value.addEventListener('dragover', dragover)
        // 2.3离开元素时触发，增加禁用标识
        containerRef.value.addEventListener('dragleave', dragleave)
        // 2.4松手的时候触发，根据拖拽的物料区预览区组件，生成一个渲染区组件
        containerRef.value.addEventListener('drop', drop)
    }

    // 3.拖拽结束清理事件
    const dragend = (e) => {
        containerRef.value.removeEventListener('dragenter', dragenter)

        containerRef.value.removeEventListener('dragover', dragover)

        containerRef.value.removeEventListener('dragleave', dragleave)

        containerRef.value.removeEventListener('drop', drop)
    }

    return {
        dragstart,
        dragend
    }
}