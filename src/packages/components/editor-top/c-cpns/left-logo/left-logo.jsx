import { defineComponent } from "vue";

import styles from './style.module.scss'


export default defineComponent({
    name: 'left-logo',
    setup() {
        return () => {
            return (
                <div class={styles.left}>
                    <div class={styles.logo}></div>
                    <h3 class="font-semibold">小猫低代码</h3>
                </div>
            )
        }
    }
})