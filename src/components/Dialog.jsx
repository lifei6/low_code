// 对话框

import { ElButton, ElDialog, ElInput } from "element-plus";
import { createVNode, defineComponent, reactive, ref, render } from "vue";

const DialogComponent = defineComponent({
    props: {
        //初始化的option，只有组件第一次创建时会传入，后面需要更新
        option: Object
    },
    setup(props, ctx) {
        let state = reactive({
            option:props.option, //用户给组件的属性
            isShow:false,
        })

        const comfirmHandler = ()=>{
            state.isShow = false
            state.option.onComfirm && state.option.onComfirm(state.option.content)
        }

        // 向外界暴露一个控制显示和隐藏的方法
        ctx.expose({
            showDialog(option) {
                // 更新option
                state.option = option
                state.isShow = true
            }
        })

        return () => <ElDialog v-model={state.isShow} title={state.option.title}>
            {
                // 传入插槽
                {
                    default:()=><ElInput type="textarea" v-model={state.option.content}></ElInput>,
                    footer:()=>state.option.footer&&<div>
                        <ElButton onClick={e=>{state.isShow=false}}>取消</ElButton>
                        <ElButton onClick={e=>comfirmHandler()} type="primary">确定</ElButton>
                    </div>
                }
            }
        </ElDialog>
    }
})

// 保存dialog虚拟节点
let vm = null;

export function $dialog(option,data) {
    // 需要一个对话框组件
    // 没有才去创建
    if (!vm) {
        // 手动挂载到一个容器
        // 1.先创一个DOM容器
        let el = document.createElement('div')
        // 2.创建虚拟节点
        vm = createVNode(DialogComponent, { option })
        // 3.虚拟节点（组件）挂载到真实DOM容器，DOM挂载到页面上去
        render(vm, el)
        document.body.appendChild(el)
    }
    // 有就直接调方法控制显示和隐藏
    // 获取组件所暴露的方法
    let { showDialog } = vm.component.exposed
    showDialog(option)
}