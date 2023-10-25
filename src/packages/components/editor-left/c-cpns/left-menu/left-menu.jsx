import { defineComponent, ref } from "vue";

// 样式
import styles from './style.module.scss'
import { RouterLink, useRoute, useRouter } from "vue-router";
import menuInfo from './menuInfo'
import { ElIcon } from "element-plus";
// 左侧菜单栏
export default defineComponent({
    name: 'left-menu',
    setup(props) {
        const iconMap = {
            'document': () => <Document />,
            'base': () => <Aim />,
            'container': () => <FullScreen />
        }
        const router = useRouter()
        // const route = useRoute()
        const itemIndex = ref(1)

        const handlerClick = (url, idx) => {
            // 切换索引
            itemIndex.value = idx
            // 路由跳转
            router.push(url)
        }
        return () => {
            return (
                <div class={styles.menu}>
                    {
                        menuInfo.menu.map((item, idx) => {
                            return (
                                <div key={item.id} class={[styles.item, itemIndex.value == idx && styles.active]} onClick={() => handlerClick(item.path, idx)}>
                                    <ElIcon>
                                        {
                                            iconMap[item.icon]()
                                        }
                                    </ElIcon>
                                    <span>{item.name}</span>
                                </div>
                            )
                        })
                    }
                </div>
            )
        }
    }
})