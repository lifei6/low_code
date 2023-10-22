import { defineComponent } from "vue";

import styles from './style.module.scss'
import HeaderInfo from "./header-info.vue";

export default defineComponent({
    name: 'right-user',
    setup() {
        return () => {
            return (
                <div class={styles.right}>
                    <HeaderInfo></HeaderInfo>
                </div>
            )
        }
    }
})