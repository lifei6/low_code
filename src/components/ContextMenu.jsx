// 内容菜单框
import { computed, createVNode, defineComponent, onBeforeUnmount, onMounted, reactive, render, ref, provide } from "vue";

const ContextMenuComponent = defineComponent({
    props: {
        //初始化的option，只有组件第一次创建时会传入，后面需要更新
        option: Object,
    },
    setup(props, ctx) {
        let state = reactive({
            option: props.option, //用户给组件的属性
            isShow: false,
            left: 0,
            top: 0,
        })

        // 计算菜单的位置
        const menuStyle = computed(() => {
            return { top: state.top + 'px', left: state.left + 'px' }
        })

        // 点击页面隐藏菜单栏
        let el = ref(null)
        const reset = (e) => {
            // 获取到真实DOM才执行回调,因为这个组件ContextMenu是没有卸载的，只是里面返回了一个空的节点
            if (!el.value) return;
            // 点击的不是菜单里面菜隐藏
            if (!el.value.contains(e.target)) {
                state.isShow = false
            }
        }
        onMounted(() => {
            // console.log('挂载完成')
            document.addEventListener('mousedown', reset, true)
        })
        onBeforeUnmount(() => {
            // console.log('卸载完成')
            document.removeEventListener('mousedown', reset)
        })

        // 向外界暴露一个控制显示和更新状态的方法
        ctx.expose({
            // 显示菜单
            showContextMenu(option) {
                // 更新option
                state.option = option
                state.isShow = true
                // 根据当前点击元素的位置定位菜单栏
                let { height, top, left } = option.el.getBoundingClientRect()
                state.top = top + height
                state.left = left
            },
        })
        // 隐藏菜单
        const hidden = () => {
            state.isShow = false
        }
        provide('hidden', hidden)


        return () => {
            return state.isShow && (
                <div class='block-menu' style={menuStyle.value} ref={el}>
                    {
                        state.option.context()
                    }
                </div>
            )
        }
    }
})



let vm = null;
export function $contextMenu(option) {

    // 需要一个内容菜单组件，手动挂载到传入的容器

    if (!vm) {
        // 1.先创一个DOM容器
        let el = document.createElement('div')
        // 测试一下销毁组件
        // const destroyVm = () => {
        //     render(null, el)
        // }
        // 2.创建虚拟节点
        vm = createVNode(ContextMenuComponent, { option })
        // 3.虚拟节点（组件）挂载到真实DOM容器，DOM挂载到页面上去
        render(vm, el)
        document.body.appendChild(el)
    }


    // 获取组件所暴露的更新和显示组件的方法
    let { showContextMenu } = vm.component.exposed
    showContextMenu(option)



}