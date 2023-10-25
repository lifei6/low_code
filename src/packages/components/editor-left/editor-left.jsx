import { defineComponent } from "vue";


// 样式
import styles from './style.module.scss'
import LeftMenu from "./c-cpns/left-menu/left-menu";
import { RouterView } from "vue-router";

// 左侧菜单栏
export default defineComponent({
    name: 'editor-left',
    setup(props) {

        return () => {
            return (
                <div class={styles.wrapper}>
                    <div class={styles.menu}>
                        <LeftMenu></LeftMenu>
                    </div>
                    <div class={styles.content}>
                        <RouterView></RouterView>
                    </div>
                </div>
            )
        }
    }
})