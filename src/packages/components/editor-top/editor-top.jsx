// 顶部
import { defineComponent } from "vue";
import styles from './style.module.scss'
import LeftLogo from "./c-cpns/left-logo/left-logo";
import CenterButton from "./c-cpns/center-button/center-button";
import RightUser from "./c-cpns/right-user/right-user";

export default defineComponent({
    name: 'editor-top',
    setup() {
        return () => {
            return (
                <div class={styles.top}>
                    <LeftLogo></LeftLogo>
                    <CenterButton></CenterButton>
                    <RightUser></RightUser>
                </div>
            )
        }
    }
})