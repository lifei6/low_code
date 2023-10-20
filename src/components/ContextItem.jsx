import { defineComponent, inject } from "vue";


export const ContextItem = defineComponent({
    props: {
        label: String,
        icon: String,
    },
    setup(props, ctx) {
        const hidden = inject('hidden')
        return () => {
            let { icon, label } = props
            return (
                <div class='block-menu-item' onClick={e => hidden()}>
                    <i class={`iconfont ${icon}`}></i>
                    <span>{label}</span>
                </div>
            )
        }
    }
})