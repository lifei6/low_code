import { defineComponent } from "vue";

// 样式
import styles from './style.module.scss'

// 左侧菜单栏
export default defineComponent({
    name: 'container-components',
    setup(props) {
        return () => {
            return (
                <div>
                    {"container-components"}
                </div>
            )
        }
    }
})