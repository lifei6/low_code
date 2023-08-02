import { events } from "./events";

//物料区拖拽相关
export const useMenvDragger = function(containerRef,data){
        // 记录当前的拖拽元素
        let currentComponent = null;

        //目标元素相关回调
        const dragenter = (e) => {
            e.dataTransfer.dropEffect = "move"
        }
        const dragover = (e) => {
            // 必须阻止默认行为否则无法触发drop
            e.preventDefault()
            // 记录鼠标位置
        }
        const dragleave = (e) => {
            e.dataTransfer.dropEffect = "none"
        }
        const drop = (e) => {
            const block = { key: currentComponent.key, top: e.offsetY, left: e.offsetX, zIndex: 1, alignCenter: true }
            data.value.blocks.push(block)
            currentComponent=null
        }

        //1.开始拖拽
        const dragstart = (e, component) => {
            currentComponent = component
            // 2为目标元素绑定拖拽行为
            // 2.1进入元素触发,添加一个移动标识
            containerRef.value.addEventListener('dragenter', dragenter)
            // 2.2在元素上移动时触发，必须阻止默认行为否则无法触发drop
            containerRef.value.addEventListener('dragover', dragover)
            // 2.3离开元素时触发，增加禁用标识
            containerRef.value.addEventListener('dragleave',dragleave)
            // 2.4松手的时候触发，根据拖拽的物料区预览区组件，生成一个渲染区组件
            containerRef.value.addEventListener('drop', drop)

            // 记录拖拽前信息
            events.emit('start')
        }

        // 3.拖拽结束清理事件
        const dragend = (e) => {
            containerRef.value.removeEventListener('dragenter',dragenter)

            containerRef.value.removeEventListener('dragover',dragover)

            containerRef.value.removeEventListener('dragleave',dragleave)

            containerRef.value.removeEventListener('drop',drop)

            //记录拖拽后信息
            events.emit('end')
        }

        return {
            dragstart,
            dragend
        }
}