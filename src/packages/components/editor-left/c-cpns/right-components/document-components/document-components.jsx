import { defineComponent } from "vue";

// 样式
import styles from './style.module.scss'

// 左侧菜单栏
export default defineComponent({
    name: 'document-components',
    setup(props) {
        return () => {
            return (
                <div>
                    {'document-components'}
                </div>
            )
        }
    }
})