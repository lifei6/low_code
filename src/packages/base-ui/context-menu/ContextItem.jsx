import { defineComponent, inject } from "vue";
// 样式
import styles from './style.module.scss'

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
                <div class={styles.item} onClick={e => hidden()}>
                    <i class={`iconfont ${icon}`}></i>
                    <span>{label}</span>
                </div>
            )
        }
    }
})