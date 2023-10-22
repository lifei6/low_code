import { defineStore } from 'pinia'
import data from '@/packages/data.json'
import deepcopy from 'deepcopy';
import { v4 as uuidv4 } from 'uuid';
// 历史记录的类型有：changeType = add | delete | update | importJSON ...

const useCommandsStore = defineStore('commands', {
    state: () => ({
        // 容器信息
        container: deepcopy(data.container),
        // 组件信息
        components: deepcopy(data.blocks),
        //当前组件索引
        selectIndex: -1,


        // 历史记录--------------------
        // 最大历史记录个数
        maxHistoryNumber: 5,
        // 历史记录
        histories: [],
        // 游标，用来标记变更的位置
        historyIndex: -1,
        // ---------------------------
    }),
    actions: {
        // 更新历史记录
        updateHistory(historyRecord) {
            if (this.histories.length < this.maxHistoryNumber) {
                this.histories.push(historyRecord);
                this.historyIndex++
            } else {
                this.histories.shift();
                this.histories.push(historyRecord);
            }
        },
        // 撤销
        undo() {
            // 如果撤销到了头部了则直接返回
            if (this.historyIndex === -1) {
                console.log('没有可撤销的历史记录了')
                return;
            }
            const history = this.histories[this.historyIndex];

            switch (history.changeType) {
                case "add":
                    this.components = this.components.filter(
                        (component) => component.id !== history.componentId
                    );
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
                        let cIndex = this.components.findIndex((component) => component.id === id)
                        this.components[cIndex]["top"] = startPos[index]["top"]
                        this.components[cIndex]["left"] = startPos[index]["left"]
                    })
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
                        let cIndex = this.components.findIndex((component) => component.id === id)
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
        },
        // 重做
        redo() {
            // 不能超过尾部历史记录
            if (this.historyIndex >= this.histories.length - 1) {
                console.log('没有可以重做的历史记录了')
                return
            }
            this.historyIndex++
            const history = this.histories[this.historyIndex];
            switch (history.changeType) {
                case "add":
                    this.components.push(history.data);
                    break;
                case "delete":
                    this.components = this.components.filter(
                        (component) => history.componentId.indexOf(component.id) === -1
                    );
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
                        let cIndex = this.components.findIndex((component) => component.id === id)
                        this.components[cIndex]["top"] = endPos[index]["top"]
                        this.components[cIndex]["left"] = endPos[index]["left"]
                    })
                    break;
                }
                case "updateSize": {
                    const { index, data } = history
                    const { newSize } = data
                    this.components[index]['width'] = newSize.width
                    this.components[index]['height'] = newSize.height
                    this.components[index]['top'] = newSize.top
                    this.components[index]['left'] = newSize.left
                    break;
                }
                case "updatezIndex": {
                    const { componentId, data } = history;
                    const { key, newValues } = data
                    componentId.forEach((id, index) => {
                        let cIndex = this.components.findIndex((component) => component.id === id)
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
        // 新增
        addComponent(component) {
            component.id = uuidv4();
            this.components.push(component);
            this.updateHistory({
                id: uuidv4(),//历史记录id
                componentId: component.id,//新增组件id
                changeType: "add",//操作类型
                data: deepcopy(component),//操作数据
            });
        },
        // 更新
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
        // 删除
        deleteComponent() {
            // 获取删除的元素
            const componentData = this.focusData.focus
            // 没有选择元素，不能删除，也不能有历史快照
            if (componentData.length <= 0) return
            // 当前选中元素ids
            let ids = componentData.map((component) => component.id)

            // 获取元素的索引
            const componentIndex = []
            ids.forEach((id) => {
                let index = this.components.findIndex((component) => component.id === id)
                if (index !== -1) {
                    componentIndex.push(index)
                }
            })
            // 过滤出未删除元素
            this.components = this.components.filter(
                (component) => ids.indexOf(component.id) === -1
            );
            this.updateHistory({
                id: uuidv4(),
                componentId: ids,
                changeType: "delete",
                data: componentData,
                index: componentIndex,
            });
        },
        // 置顶
        top() {
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


        // 清空所有选中状态
        clearAllFocus() {
            this.components.forEach(component => {
                component.focus = false
            })
            // 取消选中 索引置为-1
            this.selectIndex = -1
        },
        // 按住shift切换选中状态
        switchFocus(e, id) {
            let component = this.components.find((item) => item.id === id)
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
        // 更新当前元素索引
        updateSelectIndex(index) {
            this.selectIndex = index
        },
        // 更新移动元素的布局
        updateComponentsLayout(dragstate, durY, durX) {
            this.focusData.focus.forEach((component, idx) => {
                component.top = dragstate.startPos[idx].top + durY
                component.left = dragstate.startPos[idx].left + durX
            })
        },
        // 记录鼠标松开后的历史记录
        recordComponentsLayout(startPos) {
            let ids = this.focusData.focus.map((component) => component.id)
            const endPos = this.focusData.focus.map(({ top, left }) => ({ top, left }))
            this.updateHistory({
                id: uuidv4(),
                componentId: ids,
                changeType: 'updatePosition',
                data: { startPos, endPos }
            })
        },
        // 更新元素的大小
        updateComponentSize(oldPos) {
            const oldSize = { width: oldPos.startWidth, height: oldPos.startHeight, top: oldPos.startTop, left: oldPos.startLeft }
            const { width, height, top, left } = this.lastSelectBlock
            const newSize = { width, height, top, left }
            this.updateHistory({
                id: uuidv4(),
                index: this.selectIndex,
                changeType: 'updateSize',
                data: { oldSize, newSize }
            })
        },


        // 更新容器属性
        updateContainerProps(editData) {
            this.container = editData
        },
        // 更新单个组件属性
        updateBlockProps(editData) {
            this.components[this.selectIndex] = editData
        },


        // TODO:测试vuedrag
        // checkIsSub(newValue) {
        //     this.lastSelectBlock.isSub = newValue
        // }
    },
    getters: {
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
            const points = []
            // 2.获取未选中元素A的信息
            state.focusData.unfocus.forEach((block) => {
                let { width: widthA, height: heightA, left: leftA, top: topA } = block
                // 计算左上和右下和中心点
                // 左上
                points.push([leftA, topA])
                // 右下
                points.push([leftA + widthA, topA + heightA])
                // 中心
                points.push([leftA + widthA / 2, topA + heightA / 2])
            })
            return points
        }
        // 选中点的矩形信息
    }
})

export default useCommandsStore