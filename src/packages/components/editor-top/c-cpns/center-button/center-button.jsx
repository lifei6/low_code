import { defineComponent } from "vue";

import styles from './style.module.scss'
import { useButton } from "@/packages/hooks/useButtons";

export default defineComponent({
    name: 'center-button',
    setup() {
        const buttons = useButton()
        return () => {
            return (
                <div class={styles.center}>
                    {
                        buttons.map((btn, idx) => {
                            let label = btn.label()
                            return (
                                <div
                                    class={styles.button}
                                    onClick={e => btn.handler()}
                                    key={label}
                                >
                                    <div class={`iconfont ${btn.icon} ${styles.iconfont}`}></div>
                                    <div class={styles.label}>{label}</div>
                                </div>)
                        })
                    }
                </div>
            )
        }
    }
})