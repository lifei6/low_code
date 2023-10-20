import deepcopy from "deepcopy";
import { ElButton, ElColorPicker, ElForm, ElFormItem, ElInput, ElInputNumber, ElOption, ElSelect } from "element-plus";
import { defineComponent, inject, reactive, watch } from "vue";


import TableEditor from "./table-editor"
import useCommandsStore from "@/store/commands/commands";

export default defineComponent({
    name: 'editor-right',
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
            // console.log( config.componentMap[block.value.key])
            // 显示内容数组
            let content = []
            // 1.判断有无元素选中
            if (!block) {
                // 无选择元素显示容器宽高
                content.push(
                    <>
                        <ElFormItem label="容器宽度">
                            <ElInputNumber v-model={state.editData.width}></ElInputNumber>
                        </ElFormItem>
                        <ElFormItem label="容器高度">
                            <ElInputNumber v-model={state.editData.height}></ElInputNumber>
                        </ElFormItem>
                    </>
                )
            } else {
                // 有元素显示相应的表单
                let component = config.componentMap[block.key]
                // 根据属性props渲染
                if (component && component.props) {  //{text:{type:,label}}
                    content.push(Object.entries(component.props).map(([propName, propConfig]) => {
                        return <ElFormItem label={propConfig.label}>
                            {/* 不同的type属性渲染不同的组件 */}
                            {{
                                button: () => <ElButton onClick={e => clickHander(e, propName)}>{!state.editData.props[propName] ? '切换为圆形按钮' : '切换为方型按钮'}</ElButton>,//按钮
                                input: () => <ElInput v-model={state.editData.props[propName]}></ElInput>, //输入框情况
                                color: () => <ElColorPicker v-model={state.editData.props[propName]}></ElColorPicker>,//颜色选择器
                                select: () => <ElSelect v-model={state.editData.props[propName]}>
                                    {
                                        propConfig.options.map(opt => {
                                            return <ElOption label={opt.label} value={opt.value}></ElOption>
                                        })
                                    }
                                </ElSelect>,//选择框
                                table: () => <TableEditor
                                    propConfig={propConfig}
                                    v-model={state.editData.props[propName]} //{props:{options:''},top,left}
                                ></TableEditor>,//表格
                            }[propConfig.type]()}

                        </ElFormItem>
                    }))
                }
                //根据model渲染
                if (component && component.model) {
                    content.push(Object.entries(component.model).map(([modelName, label]) => {
                        return <ElFormItem label={label}>
                            {/* model=>{default:输入值例如username} */}
                            <ElInput v-model={state.editData.model[modelName]}></ElInput>
                        </ElFormItem>
                    }))
                }
            }
            return (
                <ElForm labelPosition="top" style="padding:30px">
                    {/* 显示内容 */}
                    {content}
                    {/* 底部应用/取消按钮 */}
                    <ElFormItem>
                        <ElButton onClick={e => reset()}>重置</ElButton>
                        <ElButton type="primary" onClick={e => apply()}>应用</ElButton>
                    </ElFormItem>
                </ElForm>
            )
        }
    }
})