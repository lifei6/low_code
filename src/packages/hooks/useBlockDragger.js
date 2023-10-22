import { reactive } from 'vue'
import deepcopy from 'deepcopy'
import { useGridSearch } from './useGridSearch'
import { useBinarySearch } from './useBinarySearch'

// 渲染组组件拖拽
export function useBlockDragger(commandsStore) {
    // 记录点击时状态
    let dragstate = {
        startX: 0,
        startY: 0,
        dragging: false,//记录是否在拖拽
    }
    // 记录辅助线
    const markLines = reactive({
        x: null,
        y: null,
    })

    // 鼠标按下触发的回调
    const mousedown = (e) => {
        // 鼠标按下默认没有拖拽
        dragstate.dragging = false
        // 一、收集未选中节点信息和选中元素信息------------
        // 1.获取中心点
        const { width: widthC, height: heightC } = commandsStore.container
        // 2.未选择的点
        const getPoints = () => {
            const points = []
            // 获取未选中元素A的信息
            commandsStore.focusData.unfocus.forEach((block) => {
                let { width: widthA, height: heightA, left: leftA, top: topA } = block
                // 计算左上和右下和中心点
                // 左上
                points.push([topA, leftA])
                // 右下
                points.push([topA + heightA, leftA + widthA])
                // 中心
                points.push([topA + heightA / 2, leftA + widthA / 2, 'center'])
            })
            // 添加画布中心对称点
            points.push([heightC / 2, widthC / 2, 'center'])
            return points
        }
        // 3.实例化网格算法存储这些点
        const gridSize = 50
        const points = getPoints()
        const gridSearch = useGridSearch(points, heightC, widthC, gridSize)

        // 4.初始化拖拽状态
        dragstate = {
            startX: e.clientX,
            startY: e.clientY,
            // 点击才记录不然lastSelectBlock为空
            startLeft: commandsStore.lastSelectBlock.left,
            startTop: commandsStore.lastSelectBlock.top,
            // 记录每一个选中元素的开始位置[(top,left),(top,left)]
            startPos: deepcopy(commandsStore.focusData.focus.map(({ top, left }) => ({ top, left }))),
            // 已经记录所有需要搜索点的网格算法实例
            gridSearch
        }


        document.addEventListener('mousemove', mousemove)
        document.addEventListener('mouseup', mouseup)
    }

    const mousemove = (e) => {
        // 鼠标移动设置为拖拽状态
        if (!dragstate.dragging) {
            dragstate.dragging = true
        }

        // 记录当前的位置
        let { clientX: endX, clientY: endY } = e
        // 计算元素最新的top和left（实际还没更新，只是可以通过计算出来）
        let top = endY - dragstate.startY + dragstate.startTop
        let left = endX - dragstate.startX + dragstate.startLeft

        // 二、网格搜索------------------------------------------
        const { width: widthB, height: heightB } = commandsStore.lastSelectBlock
        // 1.获取当前矩形
        // 1.1横向矩形
        let rectangleX = { x1: top - 6, y1: 0, x2: top + heightB + 6, y2: commandsStore.container.width - 1 }
        // 1.2纵向矩形
        let rectangleY = { x1: 0, y1: left - 6, x2: commandsStore.container.height - 1, y2: left + widthB + 6 }
        // console.log(rectangleX)
        // console.log(rectangleY)
        // 2.求解矩形所包含的所有点
        let pointX = dragstate.gridSearch.searchRect(rectangleX)
        let pointY = dragstate.gridSearch.searchRect(rectangleY)
        // 3.横纵分开计算
        // 获取横向x
        let arrX = []
        // 获取总线y
        let arrY = []
        // 获取中心线
        let arrCenterX = []
        let arrCenterY = []
        pointX.forEach((point) => {
            // 中心线
            if (point.length == 3) {
                arrCenterX.push(point[0])
            } else {
                // 横线
                arrX.push(point[0])
            }
        })
        pointY.forEach((point) => {
            // 中心线
            if (point.length == 3) {
                arrCenterY.push(point[1])
            } else {
                // 横线
                arrY.push(point[1])
            }
        })
        // 对这些线进行从小到大排序
        arrX.sort()
        arrY.sort()
        arrCenterX.sort()
        arrCenterY.sort()
        // 4.记录需要显示的辅助线
        let x = null;
        let y = null;
        let searchX = [top, top + heightB]
        let searchY = [left, left + widthB]
        let searchCenterX = [top + heightB / 2]
        let searchCenterY = [left + widthB / 2]
        let resX = useBinarySearch(arrX, searchX)
        let resY = useBinarySearch(arrY, searchY)
        let resCenterX = useBinarySearch(arrCenterX, searchCenterX)
        let resCenterY = useBinarySearch(arrCenterY, searchCenterY)

        // 4.1横向
        if (resX) {
            // 判断是显示中心线还是边界线（距离小的显示）
            if (resCenterX && resCenterX[0] <= resX[0]) {
                // 辅助线位置
                y = resCenterX[2]
                // 实现快速贴边
                // 计算需要移动到的终点坐标=起点+要移动的距离
                if (resCenterX[0] < 5) {
                    if (resCenterX[1] == 0) {
                        // 正的
                        endY += resCenterX[0]
                    } else {
                        endY -= resCenterX[0]
                    }
                }
            } else {
                // 没有中心线或距离没有横线短显示横线
                y = resX[2]
                if (resX[0] < 5) {
                    if (resX[1] == 0) {
                        // 正的
                        endY += resX[0]
                    } else {
                        endY -= resX[0]
                    }
                }
            }
        }
        // 4.2纵向
        if (resY) {
            // 判断是显示中心线还是边界线（距离小的显示）
            if (resCenterY && resCenterY[0] <= resY[0]) {
                x = resCenterY[2]
                // 实现快速贴边
                // 计算需要移动到的终点坐标=起点+要移动的距离
                if (resCenterY[0] < 5) {
                    if (resCenterY[1] == 0) {
                        // 正的
                        endX += resCenterY[0]
                    } else {
                        endX -= resCenterY[0]
                    }
                }
            } else {
                // 没有中心线或距离没有纵线短显示纵线
                x = resY[2]
                if (resY[0] < 5) {
                    if (resY[1] == 0) {
                        // 正的
                        endX += resY[0]
                    } else {
                        endX -= resY[0]
                    }
                }
            }
        }
        //-------------------------------------------------------------
        // 辅助线有了去更新视图
        markLines.x = x
        markLines.y = y

        // 计算移动的距离
        let durX = endX - dragstate.startX
        let durY = endY - dragstate.startY

        // 重新赋值选中元素的位置
        commandsStore.updateComponentsLayout(dragstate, durY, durX)
    }
    const mouseup = (e) => {
        document.removeEventListener('mousemove', mousemove)
        document.removeEventListener('mouseup', mouseup)
        // 鼠标松开后记录最新的状态
        if (dragstate.dragging) {
            dragstate.dragging = false
            commandsStore.recordComponentsLayout(dragstate.startPos)
        }
        // 放下后辅助线消失
        markLines.x = null
        markLines.y = null
    }


    return {
        mousedown,
        markLines
    }
}