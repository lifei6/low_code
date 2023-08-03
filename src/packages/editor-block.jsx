import { inject, computed, defineComponent, onMounted, ref } from "vue";

export default defineComponent({
    props: {
        block: Object
    },
    setup(props) {
        // 1.计算代码块位置-----------------样式
        const blockStyle = computed(() => ({
            top: props.block.top + 'px',
            left: props.block.left + 'px',
            zIndex:props.block.zIndex,
        }))


        // 2.获取需要渲染的组件-------------------组件类型
        const config = inject('config')
        // 必须写成函数：原因就是key改变后，组件重新更新
        // 但是component如果是确定了（非函数写法）：页面上该组件的样式会更新（因为是计算属性），而组件的类型不会变（丢失响应式）
        // 因此需要写成函数，每次更新页面都会重新执行，基于最新的key去获得component
        const component = ()=>{
            return config.componentMap[props.block.key].render()
        }
        // console.log(config)

        // 3.挂载后判断是否需要居中---------拖拽挂载后居中
        const blockRef = ref(null)
        onMounted(() => {
            let { offsetWidth, offsetHeight } = blockRef.value
            if (props.block.alignCenter) {
                // 原则上数据单向流
                props.block.top = props.block.top - offsetHeight / 2
                props.block.left = props.block.left - offsetWidth / 2
                props.block.alignCenter = false
            }
            // 计算宽高
            props.block.width = offsetWidth
            props.block.height = offsetHeight

        })
        return () => {
            return (
                <div class="editor-block" style={blockStyle.value} ref={blockRef}>
                    {component()}
                </div>
            )
        }
    }
})