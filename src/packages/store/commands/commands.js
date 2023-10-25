import { defineStore } from 'pinia'
import data from '@/packages/data.json'
import deepcopy from 'deepcopy';
import { v4 as uuidv4 } from 'uuid';
import { useGridSearch } from '@/packages/hooks/useGridSearch';
// 历史记录的类型有：changeType = add | delete | update | importJSON ...

const useCommandsStore = defineStore('commands', {
    state: () => ({
        // 容器信息
        container: deepcopy(data.container),
        // 组件信息
        components: deepcopy(data.blocks),


        // 历史记录--------------------
        // 最大历史记录个数
        maxHistoryNumber: 5,
        // 历史记录
        histories: [],
        // 游标，用来标记变更的位置
        historyIndex: -1,
        // ---------------------------

        // 网格算法------------------
        gridSize: 50,

    }),
    actions: {
        // 更新历史记录
        updateHistory(historyRecord) {
            // 操作后选中状态的记录，用于撤销
            const preFocusId = this.focusData.focus.map(({ id }) => id)
            historyRecord.preFocusId = preFocusId
            if (this.historyIndex + 1 < this.maxHistoryNumber) {
                // 未超过最大记录值
                this.histories[++this.historyIndex] = historyRecord
            } else {
                // 超过最大记录值
                this.histories.shift();
                this.histories.push(historyRecord);
            }
        },
        // 撤销
        // 撤销的状态记录链表用preFocusId记录
        undo() {
            // 如果撤销到了头部了则直接返回
            if (this.historyIndex === -1) {
                console.log('没有可撤销的历史记录了')
                return;
            }
            // 获取当前历史记录进行方向操作
            const history = this.histories[this.historyIndex];

            // 记录用于重做的聚焦状态记录(即撤销之前，现在所处于的状态)
            const nowFocusId = this.focusData.focus.map(({ id }) => id)
            history.nowFocusId = nowFocusId

            switch (history.changeType) {
                case "add":
                    // 获取新增元素的索引
                    const componentIndex = this.idToMapIndex[history.componentId]
                    // 进行删除
                    this.components.splice(componentIndex, 1)
                    break;
                case "delete": {
                    history.data.forEach((component, index) => {
                        this.components.splice(history.index[index], 0, component)
                    })
                    break;
                }
                case "modify": {
                    const { componentId, data } = history;
                    const { key, oldValue } = data
                    const updatedComponent = this.component.find(component => component.id === componentId)
                    if (updatedComponent) {
                        updatedComponent.props[key] = oldValue
                    }
                    break;
                }
                case "updatePosition": {
                    const { componentId, data } = history
                    const { startPos } = data
                    componentId.forEach((id, index) => {
                        let cIndex = this.idToMapIndex[id]
                        this.components[cIndex]["top"] = startPos[index]["top"]
                        this.components[cIndex]["left"] = startPos[index]["left"]
                    })
                    // 清理非更新位置元素的状态
                    // this.focusData.focus.forEach((component, idx) => {
                    //     if (!componentId.includes(component.id)) {
                    //         component.focus = false
                    //     }
                    // })
                    break;
                }
                case "updateSize": {
                    const { index, data } = history
                    const { oldSize } = data
                    this.components[index]['width'] = oldSize.width
                    this.components[index]['height'] = oldSize.height
                    this.components[index]['top'] = oldSize.top
                    this.components[index]['left'] = oldSize.left
                    break;
                }
                case "updatezIndex": {
                    const { componentId, data } = history
                    const { key, oldValues } = data
                    componentId.forEach((id, index) => {
                        let cIndex = this.idToMapIndex[id]
                        this.components[cIndex][key] = oldValues[index]
                    })
                    break;
                }
                case "importJSON": {
                    const { data } = history;
                    this.container = data.before.container
                    this.components = data.before.blocks
                    break;
                }
                default:
                    break;
            }
            this.historyIndex--


            // 清理所有聚焦
            this.clearAllFocus()
            // 选中状态的回退前一个历史记录的聚集状态
            if (this.historyIndex >= 0) {
                const preHistory = this.histories[this.historyIndex]
                const preFocusId = preHistory.preFocusId
                // 把记录的聚焦状态恢复
                this.components.forEach((component, idx) => {
                    if (preFocusId.includes(component.id)) {
                        component.focus = true
                    }
                })
            }

        },
        // 重做
        // 重做的状态记录链表用nowFocusId记录
        redo() {
            // 不能超过尾部历史记录
            if (this.historyIndex >= this.histories.length - 1) {
                console.log('没有可以重做的历史记录了')
                return
            }

            // 操作当前历史记录
            // 记录用于重做的聚焦状态记录(即撤销之前，现在所处于的状态)
            // 撤销后进行了选中更新，因此更新撤销操作之后的一系列状态(用于撤销)
            if (this.historyIndex >= 0) {
                const preFocusId = this.focusData.focus.map(({ id }) => id)
                this.histories[this.historyIndex].preFocusId = preFocusId
            }

            // 指向后一个历史记录
            this.historyIndex++
            const history = this.histories[this.historyIndex];
            switch (history.changeType) {
                case "add":
                    this.components.push(history.data);
                    break;
                case "delete":
                    // 删除可能一次性删除多个哦
                    this.components = this.components.filter((component, idx) => {
                        return !history.index.includes(idx)
                    })
                    break;
                case "modify": {
                    const { componentId, data } = history;
                    const { key, newValue } = data
                    const updatedComponent = this.component.find(component => component.id === componentId)
                    if (updatedComponent) {
                        updatedComponent.props[key] = newValue
                    }
                    break;
                }
                case "updatePosition": {
                    const { componentId, data } = history
                    const { endPos } = data
                    componentId.forEach((id, index) => {
                        let cIndex = this.idToMapIndex[id]
                        this.components[cIndex]["top"] = endPos[index]["top"]
                        this.components[cIndex]["left"] = endPos[index]["left"]
                    })
                    break;
                }
                case "updateSize": {
                    const { index, data } = history
                    const { newSize } = data
                    const component = this.components[index]
                    component.width = newSize.width
                    component.height = newSize.height
                    component.top = newSize.top
                    component.left = newSize.left
                    // 有bug,数据变了页面不更新
                    // 强制更新
                    // this.$patch()
                    break;
                }
                case "updatezIndex": {
                    const { componentId, data } = history;
                    const { key, newValues } = data
                    componentId.forEach((id, index) => {
                        let cIndex = this.idToMapIndex[id]
                        this.components[cIndex][key] = newValues[index]
                    })
                    break;
                }
                case "importJSON": {
                    const { data } = history;
                    this.container = data.after.container
                    this.components = data.after.blocks
                    break;
                }
                default:
                    break;
            }

            // 清理所有聚焦
            this.clearAllFocus()
            // 还需要把记录的聚焦状态恢复
            this.components.forEach((component, idx) => {
                if (history.nowFocusId.includes(component.id)) {
                    component.focus = true
                }
            })
        },

        // 导入页面的JSON
        updateContainer(newData) {
            let beforeData = { container: deepcopy(this.container), blocks: deepcopy(this.components) }
            // 更新容器大小
            this.container = newData.container ? newData.container : this.container
            // 更新代码块
            this.components = newData.blocks ? newData.blocks : this.components
            // 历史记录
            this.updateHistory({
                id: uuidv4(),
                changeType: "importJSON",
                data: { before: beforeData, after: newData }
            })
        },
        // 导入一个组件的JSON
        updateComponentJSON(oldCpn, newCpn) {
            let oldIndex = this.components.findIndex((component) => component.id === oldCpn.id)
            this.components[oldIndex] = newCpn
            this.updateHistory({
                id: uuidv4,
                changeType: 'updateBlockJSON',
                index: oldIndex,
                data: { oldCpn, newCpn }
            })
        },
        // 新增组件
        addComponent(component) {
            // 新增需要清除其他组件的选中状态
            this.clearAllFocus()
            component.id = uuidv4();
            this.components.push(component);
            this.updateHistory({
                id: uuidv4(),//历史记录id
                componentId: component.id,//新增组件id
                changeType: "add",//操作类型
                data: deepcopy(component),//操作数据
            });
        },
        // 更新组件
        updateComponent({ id, key, value, isProps }) {
            const updatedComponent = this.components.find(
                (component) => component.id === (id || this.currentElement)
            );
            if (updatedComponent) {
                // 更新内容样式属性
                if (isProps) {
                    const oldValue = updatedComponent.props[key]
                    updatedComponent.props[key] = value;
                    this.updateHistory({
                        id: uuidv4(),
                        componentId: id || state.currentElement,
                        changeType: "modify",
                        data: { oldValue, newValue: value, key },
                    });
                } else {
                    // 更新位置属性
                    updatedComponent[key] = value;
                }

            }

        },
        // 删除组件
        deleteComponent() {
            // 删除操作之前需记录当前聚焦状态，用于撤销
            this.updatePreFocusId()

            // 获取删除的元素
            const componentData = this.focusData.focus
            // 没有选择元素，不能删除，也不能有历史快照
            if (componentData.length <= 0) return
            // 当前删除元素ids
            let ids = componentData.map((component) => component.id)
            // 获取删除元素的索引
            const componentIndex = []
            ids.forEach((id) => {
                componentIndex.push(this.idToMapIndex[id])
            })
            // 过滤出未删除元素
            this.components = this.components.filter(
                (component, idx) => !componentIndex.includes(idx)
            );
            this.updateHistory({
                id: uuidv4(),
                changeType: "delete",
                index: componentIndex,//删除的组件索引列表
                data: componentData,//删除的组件列表
            });
        },
        // 置顶
        top() {
            this.updatePreFocusId()

            if (this.focusData.focus.length <= 0) return
            // 找到没有获取焦点元素的最高层，将选中元素在此基础上加1
            let maxIndex = this.focusData.unfocus.reduce((pre, component) => {
                return Math.max(pre, component.zIndex)
            }, -Infinity)
            // 记录更改了的元素id，旧值和属性
            const ids = []
            const oldValues = []
            const newValues = []
            this.focusData.focus.forEach((component) => {
                ids.push(component.id)
                oldValues.push(component.zIndex)
                newValues.push(maxIndex + 1)
                component.zIndex = maxIndex + 1
            })
            this.updateHistory({
                id: uuidv4(),
                componentId: ids,
                changeType: 'updatezIndex',
                data: { oldValues, newValues, key: 'zIndex' }
            })
        },
        // 置底
        bottom() {
            this.updatePreFocusId()
            if (this.focusData.focus.length <= 0) return
            // 找到没有获取焦点元素的最底层，将选中元素在此基础上加-1
            let minIndex = this.focusData.unfocus.reduce((pre, component) => {
                return Math.min(pre, component.zIndex)
            }, Infinity) - 1

            // 记录更改了的元素id，旧值和属性
            const ids = []
            const oldValues = []
            const newValues = []
            // 不能直接-1，因为index不能为负值，负值直接看不到组件了
            // 如果小于0则让未选中的都加上dur=负zIndex与0的差距
            if (minIndex < 0) {
                const dur = Math.abs(minIndex);
                minIndex = 0;
                this.focusData.unfocus.forEach((component) => {
                    ids.push(component.id)
                    oldValues.push(component.zIndex)
                    newValues.push(component.zIndex + dur)
                    component.zIndex = component.zIndex + dur
                })
            }
            // 负的Z索引直接为0
            this.focusData.focus.forEach((component) => {
                ids.push(component.id)
                oldValues.push(component.zIndex)
                newValues.push(minIndex)
                component.zIndex = minIndex
            })
            this.updateHistory({
                id: uuidv4(),
                componentId: ids,
                changeType: 'updatezIndex',
                data: { oldValues, newValues, key: 'zIndex' }
            })
        },


        // 聚集状态相关-------------------
        // 更新当前历史记录的preFocusID
        updatePreFocusId() {
            const preFocusId = this.focusData.focus.map(({ id }) => id)
            this.histories[this.historyIndex].preFocusId = preFocusId
        },
        // 清空所有选中状态
        clearAllFocus() {
            this.focusData.focus.forEach(component => {
                component.focus = false
            })
        },
        // 按住shift切换选中状态
        switchFocus(e, id) {
            const index = this.idToMapIndex[id]
            const component = this.components[index]
            if (e.shiftKey) {
                // 如果只有一个就别切换了，一直选中
                if (this.focusData.focus.length <= 1) {
                    component.focus = true
                } else {
                    component.focus = !component.focus
                }

            } else {
                if (!component.focus) {
                    // 每次点击前清空其他的选中聚焦
                    this.clearAllFocus()
                    component.focus = true
                }
            }
        },
        // -------------------------------


        // 渲染区拖拽更新相关---------------
        // 更新移动元素的布局
        updateComponentsLayout(dragstate, durY, durX) {
            this.focusData.focus.forEach((component, idx) => {
                component.top = dragstate.startPos[idx].top + durY
                component.left = dragstate.startPos[idx].left + durX
            })
        },
        // 更新组件位置
        recordComponentsLayout(startPos) {
            // 更新一下聚焦状态记录
            this.updatePreFocusId()

            let ids = this.focusData.focus.map((component) => component.id)
            const endPos = this.focusData.focus.map(({ top, left }) => ({ top, left }))
            this.updateHistory({
                id: uuidv4(),
                componentId: ids,
                changeType: 'updatePosition',
                data: { startPos, endPos }//开始位置、结束位置
            })
        },
        // 更新组件大小
        updateComponentSize(oldPos) {
            const oldSize = { width: oldPos.startWidth, height: oldPos.startHeight, top: oldPos.startTop, left: oldPos.startLeft }
            const { width, height, top, left } = this.lastSelectBlock
            const newSize = { width, height, top, left }
            this.updateHistory({
                id: uuidv4(),
                index: this.selectIndex,
                changeType: 'updateSize',
                data: Object.freeze({ oldSize, newSize })
            })
        },
        // ---------------------------------

        // 右侧属性编辑的历史快照---------------
        // 更新单个组件属性
        updateBlockProps(editData) {
            this.components[this.selectIndex] = editData
        },
        // ---------------------------------

        // 不具有历史记录的操作------------
        // 更新容器属性
        updateContainerProps(editData) {
            this.container = editData
        },



        // TODO:测试vuedrag
        // checkIsSub(newValue) {
        //     this.lastSelectBlock.isSub = newValue
        // }
    },
    getters: {
        // 组件id及其位置关系映射表
        idToMapIndex: (state) => {
            const map = state.components.reduce((pre, cur, index) => {
                pre[cur.id] = index
                return pre
            }, {})
            return map
        },
        // 当前组件索引
        // 更新选中元素索引
        selectIndex: (state) => {
            let index = -1;
            // 有选中一个或多个元素，则聚焦的最后一个就是当前选中元素
            let len = state.focusData.focus.length
            if (len) {
                let id = state.focusData.focus[len - 1].id
                index = state.idToMapIndex[id]
            }
            return index
        },
        // 最后选择的元素
        lastSelectBlock: (state) => {
            return state.components[state.selectIndex]
        },
        // 选择元素和未选择元素列表
        focusData: (state) => {
            let focus = []
            let unfocus = []
            state.components.forEach((component) => {
                component.focus ? focus.push(component) : unfocus.push(component)
            })

            return {
                focus,
                unfocus
            }
        },
        // 辅助线：未选择元素的关键点
        points: (state) => {
            // 存储未选中的点
            const unSelectoints = []
            // 1.获取画布中心点
            const { width: widthC, height: heightC } = state.container
            unSelectoints.push([heightC / 2, widthC / 2, 'center'])
            // 2.获取未选中元素A的信息
            state.focusData.unfocus.forEach((block) => {
                let { width: widthA, height: heightA, left: leftA, top: topA } = block
                // 计算左上和右下和中心点
                // 左上
                unSelectoints.push([topA, leftA])
                // 右下
                unSelectoints.push([topA + heightA, leftA + widthA])
                // 中心
                unSelectoints.push([topA + heightA / 2, leftA + widthA / 2, 'center'])
            })
            return unSelectoints
        },
        // 选中点的矩形信息
        // 网格实例存储未选中点
        gridSearch: (state) => {
            return useGridSearch(state.points, state.container.height, state.container.width, state.gridSize)
        }
    }
})

export default useCommandsStore