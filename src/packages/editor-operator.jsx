import deepcopy from "deepcopy";
import { ElButton, ElColorPicker, ElForm, ElFormItem, ElInput, ElInputNumber, ElOption, ElSelect } from "element-plus";
import { defineComponent, inject, reactive, watch } from "vue";


export default defineComponent({
    props:{
        block:Object,
        data:Object,
        updateContainerProps:Function,
        updateBlockProps:Function,
    },
    setup(props,ctx){
        // 导入组件的配置信息
        const config = inject("config")
        const state = reactive({
            editData:{}
        })
        // 重置方法
        const reset = ()=>{
            if(!props.block){//没有选中的元素，绑定容器的宽高
                state.editData = deepcopy(props.data.container)
            }else{//选中显示元素信息
                state.editData = deepcopy(props.block)
            }
        }

        // 应用方法
        const apply = ()=>{
            if(!props.block){
                props.updateContainerProps(state.editData)
            }else{
                props.updateBlockProps(state.editData)
            }
        }

        watch(()=>props.block,reset,{immediate:true})
        return ()=>{
            let {block,data} = props
            // console.log( config.componentMap[block.value.key])
            // 显示内容数组
            let content = []
            // 1.判断有无元素选中
            if(!block){
                // 无选择元素显示容器宽高
                content.push(
                    <>
                        <ElFormItem label="容器宽度">
                            <ElInputNumber v-model={ state.editData.height}></ElInputNumber>
                        </ElFormItem>
                        <ElFormItem label="容器高度">
                            <ElInputNumber v-model={ state.editData.width}></ElInputNumber>
                        </ElFormItem>
                    </>
                )
            }else{
                // 有元素显示相应的表单
                let component = config.componentMap[block.key]
                // 根据属性渲染
                if(component&&component.props){  //{text:{type:,label}}
                    content =  Object.entries(component.props).map(([propName,propConfig])=>{
                        return <ElFormItem label={propConfig.label}>
                            {{
                                input:()=><ElInput v-model={state.editData.props[propName]}></ElInput>, //输入框情况
                                color:()=><ElColorPicker v-model={state.editData.props[propName]}></ElColorPicker>,//颜色选择器
                                select:()=><ElSelect v-model={state.editData.props[propName]}>
                                    {
                                        propConfig.options.map(opt=>{
                                            return <ElOption label={opt.label} value={opt.value}></ElOption>
                                        })
                                    }
                                </ElSelect>
                            }[propConfig.type]()}

                        </ElFormItem>
                    })  
                }
                //根据model渲染
                if(component&&component.model){
                    content.push(Object.entries(component.model).map(([modelName,label])=>{
                        return <ElFormItem label={label}>
                            {/* model=>{default:输入值例如username} */}
                            <ElInput v-model={state.editData.model[modelName]}></ElInput>
                        </ElFormItem>
                    }))
                }
            }
            return (
                <ElForm labelPosition="top" style = "padding:30px">
                    {/* 显示内容 */}
                    {content}
                    {/* 底部应用/取消按钮 */}
                    <ElFormItem>
                        <ElButton onClick={e=>reset()}>重置</ElButton>
                        <ElButton type="primary" onClick={e=>apply()}>应用</ElButton>
                    </ElFormItem>
                </ElForm>
            )
        }
    }
})