import { ElButton, ElColorPicker, ElFormItem, ElInput, ElInputNumber, ElOption, ElSelect } from "element-plus";
export function useRightContent(state, block, config, clickHander) {
    let content = []
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

    return content
}