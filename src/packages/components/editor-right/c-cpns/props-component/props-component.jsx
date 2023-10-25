import deepcopy from "deepcopy";
import { ElButton, ElColorPicker, ElForm, ElFormItem, ElInput, ElInputNumber, ElOption, ElSelect } from "element-plus";
import { defineComponent, inject, reactive, watch } from "vue";

import TableEditor from "../table-editor/table-editor"
import useCommandsStore from "@/packages/store/commands/commands";
import { useRightContent } from "@/packages/hooks/useRightContent";

export default defineComponent({
    name: 'props-component',
    setup(props, ctx) {
        const commandsStore = useCommandsStore()
        // 导入组件的配置信息
        const config = inject("config")
        // 正在编辑的组件属性
        const state = reactive({
            editData: {}
        })

        // 重置(回显)方法
        const reset = () => {
            if (!commandsStore.lastSelectBlock) {//没有选中的元素，绑定容器的宽高
                state.editData = deepcopy(commandsStore.container)
            } else {//选中显示元素信息
                state.editData = deepcopy(commandsStore.lastSelectBlock)
            }
        }

        // 应用新属性
        const apply = () => {
            if (!commandsStore.lastSelectBlock) {
                // 更新容器属性
                commandsStore.updateContainerProps(state.editData)
            } else {
                // 更新组件属性
                commandsStore.updateBlockProps(state.editData)
            }
        }

        // 监听选中组件变化，显示对应属性
        watch(() => commandsStore.lastSelectBlock, reset, { immediate: true })


        // 处理右侧点击按钮收集布尔值
        const clickHander = (e, propName) => {
            if (state.editData.props[propName] == undefined) {
                state.editData.props[propName] = true
            } else {
                state.editData.props[propName] = !state.editData.props[propName]
            }
        }
        return () => {
            let block = commandsStore.lastSelectBlock
            let id = block ? block.id : state.editData.id;
            // 显示内容数组
            let content = useRightContent(state, block, config, clickHander)
            return (
                <div>
                    <ElForm labelWidth="80px">
                        {/* 显示id */}
                        <ElFormItem label={'组件id'}>{id}</ElFormItem>
                        {/* 显示内容 */}
                        {content}
                        {/* 底部应用/取消按钮 */}
                        <ElFormItem>
                            <ElButton onClick={e => reset()}>重置</ElButton>
                            <ElButton type="primary" onClick={e => apply()}>应用</ElButton>
                        </ElFormItem>
                    </ElForm>
                </div>
            )
        }
    }
})