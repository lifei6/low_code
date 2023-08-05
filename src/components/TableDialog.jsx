import deepcopy from "deepcopy";
import { ElButton, ElDialog, ElInput, ElTable, ElTableColumn } from "element-plus";
import { createVNode, defineComponent, reactive, render } from "vue";


const TableDialog = defineComponent({
    props:{
        options:Object
    },
    setup(props,ctx){
        let state = reactive({
            options:props.options,//初始化数据
            isShow:false,//默认不显示
            newData:[] //编辑数据
        })

        // 暴露显示和更新的方法
        ctx.expose({
            show(options){
                state.options = options
                state.isShow = true
                state.newData = deepcopy(options.data)
            }
        })


        // 1.执行确定回调更新外部数据
        const updateData = ()=>{
            state.options.onConfirm&&state.options.onConfirm(state.newData)
            // 关闭弹窗
            state.isShow = false
        }

        // 2.添加按钮回调
        const addItem = ()=>{
            // console.log(state.newData)
            state.newData.push({})
        }

        return ()=>{
            return <ElDialog v-model={state.isShow} title={state.options.config.label}>
                {{
                    default:()=>(<div>
                        <div><ElButton onClick={e=>addItem()}>添加</ElButton><ElButton>重置</ElButton></div>
                        <ElTable data={state.newData}>
                            <ElTableColumn type="index"></ElTableColumn>
                            {state.options.config.table.options.map((item)=>{
                                return <ElTableColumn label={item.label}>
                                    {{
                                        default:({row})=>{
                                            // console.log(row)
                                            return <ElInput v-model={row[item.field]}></ElInput>
                                        }
                                    }}
                                </ElTableColumn>
                            })}
                            <ElTableColumn label="操作">
                                <ElButton type="danger" >删除</ElButton>
                            </ElTableColumn>
                        </ElTable>
                    </div>),
                    footer:()=>(<div>
                        <ElButton onClick={e=>state.isShow = false}>取消</ElButton><ElButton type="primary" onClick={e=>updateData()}>确定</ElButton>
                    </div>)
                }}
            </ElDialog>
        }
    }
})

let vm=null;
export const $tableDialog = (options)=>{
    if(!vm){
        let el = document.createElement('div')
        vm = createVNode(TableDialog,{options})
        render(vm,el)
        document.body.appendChild(el)
    }

    // 获取更新数据和显示的ff
    let {show} = vm.component.exposed
    show(options)
}