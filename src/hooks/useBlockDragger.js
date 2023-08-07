import { reactive } from 'vue'
import { events } from './events'
export function useBlockDragger(focusData, lastSelectBlock,data) {
    let dragstate = {
        startX: 0,
        startY: 0,
        dragging:false,//记录是否在拖拽
    }
    // 记录辅助线
    const markLines = reactive({
        x: null,
        y: null,
    })

    // 鼠标按下触发的回调
    const mousedown = (e) => {
        // 鼠标按下默认没有拖拽
        dragstate.dragging =false

        // console.log(lastSelectBlock.value)
        // 获取辅助线信息函数
        const recordLines = () => {
            // 初始化辅助线
            const lines = { x: [], y: [] }
            // let x = [] //纵线
            // let y = [] //横线
            // 1.获取当前拖拽元素B的信息
            const { width: widthB, height: heightB } = lastSelectBlock.value
            let arr = [...(focusData.value.unfocus),
                // 增加全局居中
                {
                    top:0,
                    left:0,
                    width:data.value.container.width,
                    height:data.value.container.height,
                }
            ]
            // 2.获取未选中元素A的信息
            arr.forEach((block)=>{
                let { width: widthA, height: heightA, left: leftA, top: topA } = block
                // 3.计算辅助线的信息
                // 计算横线情况
                // 底对顶
                lines.y.push({ showTop: topA, top: topA - heightB })
                // 顶对顶
                lines.y.push({ showTop: topA, top: topA })
                // 中对中
                lines.y.push({ showTop: topA + heightA / 2, top: topA + heightA / 2 - heightB / 2 })
                // 底对底
                lines.y.push({ showTop: topA + heightA, top: topA + heightA - heightB })
                // 顶对底
                lines.y.push({ showTop: topA + heightA, top: topA + heightA })

                // 计算纵线
                lines.x.push({ showLeft: leftA, left: leftA - widthB })
                // 顶对顶
                lines.x.push({ showLeft: leftA, left: leftA })
                // 中对中
                lines.x.push({ showLeft: leftA + widthA / 2, left: leftA + widthA / 2 - widthB / 2 })
                // 底对底
                lines.x.push({ showLeft: leftA + widthA, left: leftA + widthA - widthB })
                // 顶对底
                lines.x.push({ showLeft: leftA + widthA, left: leftA + widthA })
            }) 


            return lines
        }

        // 初始化拖拽状态
        dragstate = {
            startX: e.clientX,
            startY: e.clientY,
            // 点击才记录不然lastSelectBlock为空
            startLeft: lastSelectBlock.value.left,
            startTop: lastSelectBlock.value.top,
            // 记录每一个选中元素的开始位置[(top,left),(top,left)]
            startPos: focusData.value.focus.map(({ top, left }) => ({ top, left })),
            // 记录未选中元素可能产生的所有对齐线
            lines: recordLines()
        }


        document.addEventListener('mousemove', mousemove)
        document.addEventListener('mouseup', mouseup)
    }

    const mousemove = (e) => {
        // 鼠标移动设置为拖拽状态
        if(!dragstate.dragging){
            dragstate.dragging = true
            //记录移动前状态
            events.emit('start')
        }

        // 记录当前的位置
        let { clientX: endX, clientY: endY } = e
        // 计算元素最新的top和left（实际还没更新，只是可以通过计算出来）
        let top = endY - dragstate.startY + dragstate.startTop
        let left = endX - dragstate.startX + dragstate.startLeft
        // 记录需要显示的辅助线
        let x = null;
        let y = null;
        // 判断是否进行快速贴近
        // 小于5px进行快速贴近
        for (let i = 0; i < dragstate.lines.x.length; i++) {
            const { showLeft: s, left: l } = dragstate.lines.x[i]
            if (Math.abs(left - l) < 5) {
                // 线要实现的位置
                x = s
                // 实现快速贴边
                // 计算需要移动到的终点坐标=起点+要移动的距离
                endX = dragstate.startX + l - dragstate.startLeft
                // 找到一根跳出
                break;
            }
        }
        for (let i = 0; i < dragstate.lines.y.length; i++) {
            const { showTop: s, top: t } = dragstate.lines.y[i]
            if (Math.abs(top - t) < 5) {
                // 线要实现的位置
                y = s
                // 实现快速贴边
                // 计算需要移动的终点=起点+要移动的距离
                endY = dragstate.startY + t - dragstate.startTop
                // 找到一根跳出
                break;
            }
        }
        // 辅助线有了去更新视图
        markLines.x = x
        markLines.y = y


        // 计算移动的距离
        let durX = endX - dragstate.startX
        let durY = endY - dragstate.startY

        // 重新赋值选中元素的位置
        focusData.value.focus.forEach((block, idx) => {
            block.top = dragstate.startPos[idx].top + durY
            block.left = dragstate.startPos[idx].left + durX
        })
    }
    const mouseup = (e) => {
        // 鼠标松开后记录最新的状态
        if(dragstate.dragging){
            events.emit('end')
            dragstate.dragging = false
        }
        // 放下后辅助线消失
        markLines.x = null
        markLines.y = null
        document.removeEventListener('mousemove', mousemove)
        document.removeEventListener('mouseup', mouseup)
    }


    return {
        mousedown,
        markLines
    }
}