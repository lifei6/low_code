// 大小拖拽组件

import deepcopy from "deepcopy";
import { defineComponent, inject } from "vue";


export default defineComponent({
    props: {
        resize: Object,
        block: Object,
    },
    setup(props, ctx) {
        // 注入保存历史记录的方法
        const updateBlockPropsByIndex = inject('updateBlockPropsByIndex')
        // 记录拖拽前的block
        let oddBlock = {}
        // 记录开始状态
        let startState = {}

        // 记录元素最新状态(不需要了)
        // let endState = {}
        const mousemove = (e)=>{
            let {startX,startY,startTop,startLeft,startHeight,startWidth,direction} = startState
            // 方向限制
            // 1.如果左右拖拽则高度不变
            if(direction.vertical=="center"){
                startY = e.clientY
            }
            // 2.如果上下拖拽则宽度不变
            if(direction.horizontal=="center"){
                startX = e.clientX
            }

            // 计算拖拽长度
            let durX = e.clientX - startX
            let durY = e.clientY - startY

            let top = startTop
            let left = startLeft
            // 3.如果返向拖拽则需要设置位置
            if(direction.vertical=='start'){
                // 设置位置
                top = startTop+ durY
                durY = -durY
            }
            if(direction.horizontal=="start"){
                left = startLeft +durX
                durX = -durX
            }

            // 计算宽高变化
            let width = startWidth + durX
            let height = startHeight + durY
            props.block.width = width
            props.block.height = height
            props.block.top = top
            props.block.left = left
            // 标识是否可以更改大小
            props.block.hasResize = true

            // 更改为最新状态用于历史记录
            // endState={width,height,top,left}
        }
        const mouseup = (e)=>{
            // 抬起后记录当前元素的最终宽高,并且发起一个历史记录
            // console.log("endState",endState)
            updateBlockPropsByIndex(oddBlock,props.block)
            document.removeEventListener('mousemove',mousemove)
            document.removeEventListener('mouseup',mouseup)
        }

        const dotMousedown = (e,direction) => {
            // 阻止事件冒泡
            e.preventDefault()
            e.stopPropagation()
            // 记录拖拽前的状态
            oddBlock = deepcopy(props.block)
            let {clientX,clientY}=e
            // 记录点击状态
            startState = {
                startX:clientX,
                startY:clientY,
                startTop:props.block.top,
                startLeft:props.block.left,
                startHeight:props.block.height,
                startWidth:props.block.width,   
                direction
            }
            // 廷加拖拽事件
            document.addEventListener('mousemove',mousemove)
            document.addEventListener('mouseup',mouseup)
        }

        return () => {
            let { width, height } = props.resize
            let dots = []
            // 横向可拖
            if (width) {
                dots.push(<>
                    <div class="dot start-center" onMousedown={e => dotMousedown(e,{horizontal:'start',vertical:'center'})}></div>
                    <div class="dot end-center" onMousedown={e => dotMousedown(e,{horizontal:'end',vertical:'center'})}></div>
                </>)
            }
            // 纵向可拖
            if (height) {
                dots.push(<>
                    <div class="dot center-start" onMousedown={e => dotMousedown(e,{horizontal:'center',vertical:'start'})}></div>
                    <div class="dot center-end" onMousedown={e => dotMousedown(e,{horizontal:'center',vertical:'end'})}></div>
                </>)
            }
            // 横纵都可
            if (width && height) {
                dots.push(<>
                    <div class="dot start-start" onMousedown={e => dotMousedown(e,{horizontal:'start',vertical:'start'})}></div>
                    <div class="dot end-start" onMousedown={e => dotMousedown(e,{horizontal:'end',vertical:'start'})}></div>
                    <div class="dot start-end" onMousedown={e => dotMousedown(e,{horizontal:'start',vertical:'end'})}></div>
                    <div class="dot end-end" onMousedown={e => dotMousedown(e,{horizontal:'end',vertical:'end'})}></div>
                </>)
            }
            return <>
                {dots}
            </>
        }
    }
})