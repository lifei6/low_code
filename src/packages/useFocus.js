import { computed, ref } from 'vue'
export function useFocus(data, previewRef, callback) {
    // 记录最后点击的组件索引
    const selectIndex = ref(-1)//-1表示没有选中
    // 1.记录最后点击元素
    const lastSelectBlock = computed(() => {
        return data.value.blocks[selectIndex.value]
    })


    // 2.情空所有的选中状态
    const clearAllFocus = () => {
        data.value.blocks.forEach(block => {
            block.focus = false
        })
        // 取消选中索引置为-1
        selectIndex.value = -1
    }
    // 3. 计算当前所有 选中的元素列表 和 未选中元素列表
    const focusData = computed(() => {
        let focus = []
        let unfocus = []
        data.value.blocks.forEach((block) => {
            block.focus ? focus.push(block) : unfocus.push(block)
        })

        return {
            focus,
            unfocus
        }
    })

    // 4.点击渲染区的组件块的回调
    const blockMousedown = (e, block, index) => {
        // 预览模式直接退出
        if (previewRef.value) return
        // 阻止默认行为和事件冒泡
        e.preventDefault()
        e.stopPropagation()
        // block维护一个状态focus表示是否获取焦点了
        //如果按住shiftKey
        if (e.shiftKey) {
            // 如果只有一个就别切换了，一直选中
            if (focusData.value.focus.length <= 1) {
                block.focus = true
            } else {
                block.focus = !block.focus
            }

        } else {
            if (!block.focus) {
                // 每次点击前清空其他的选中聚焦
                clearAllFocus()
                block.focus = true
            }
        }
        // 当前选中元素的索引
        selectIndex.value = index
        callback(e)

    }

    return {
        blockMousedown,
        clearAllFocus,
        focusData,
        lastSelectBlock
    }
}