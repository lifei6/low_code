import { inject, computed, defineComponent, onMounted, ref } from "vue";

export default defineComponent({
    props: {
        block: Object
    },
    setup(props) {
        // 计算代码块位置
        const blockStyle = computed(() => ({
            top: props.block.top + 'px',
            left: props.block.left + 'px',
        }))


        //获取需要渲染的组件
        const config = inject('config')
        const component = config.componentMap[props.block.key].render()
        // console.log(config)

        //挂载后判断是否需要居中
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
                    {component}
                </div>
            )
        }
    }
})