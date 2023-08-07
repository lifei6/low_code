import { inject, computed, defineComponent, onMounted, ref } from "vue";
import BlockResize from "./block-resize";

export default defineComponent({
    props: {
        block: Object,
        formData: Object,
        preview:Boolean,
    },
    setup(props) {
        // 1.计算代码块位置-----------------样式
        const blockPosition = computed(() => ({
            top: props.block.top + 'px',
            left: props.block.left + 'px',
            zIndex: props.block.zIndex,
        }))
        

        // 2.获取需要渲染的组件-------------------组件类型
        const config = inject('config')
        // 必须写成函数：原因就是key改变后，组件重新更新
        // 但是component如果是确定了（非函数写法）：页面上该组件的样式会更新（因为是计算属性），而组件的类型不会变（丢失响应式）
        // 因此需要写成函数，每次更新页面都会重新执行，基于最新的key去获得component
        //!!!还有一种写法就是写渲染函数里面即reture ()=>{ component =  config.componentMap[props.block.key].render() return <div></div>}
        // 方式1
        // const component = ()=>{
        //     return config.componentMap[props.block.key].render()
        // }

        // 3.挂载后判断是否需要居中---------拖拽挂载后居中
        const blockRef = ref(null)
        // 记录宽高，修改宽高后通知editor进行记录
        // const blockSize = reactive({
        //     width:'',
        //     height:'',
        // })
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
            // block
        })

        // console.log(props.block.props)
        return () => {
            // 方式2
            const component = config.componentMap[props.block.key]
            // props.block.model = {default：输入的字段例如username}      
            let option = {
                size: props.block.hasResize?{
                    width: props.block.width+'px',
                    height: props.block.height+'px',
                }:{},
                props: props.block.props,
                model: Object.keys(component.model || {}).reduce((prev, modelName) => {
                    let propName = props.block.model[modelName]  //输入的字段例如username
                    // console.log("propName",propName)
                    prev[modelName] = {          // {default:{modelValue:lifei,"onUpdate:modelValue":huxuan=>lifei=huxuan}}
                        modelValue: props.formData[propName],
                        "onUpdate:modelValue": v => {
                            // console.log('值更新执行了',v)
                            props.formData[propName] = v //如果是属性操作区绑定新输入字段则会添加一个属性到formData，渲染区输入框的值会给这个属性
                        }
                    }
                    return prev
                }, {})
            }
            const RenderComponent = component.render(option)
            const { width, height } = component.resize || {}
            return (
                <div class="editor-block" style={blockPosition.value} ref={blockRef}>
                    {RenderComponent}
                    {props.block.focus && !props.preview && (width || height)
                        && <BlockResize resize={component.resize || {}} block={props.block}></BlockResize>}
                </div>
            )
        }
    }
})