import { defineComponent, inject } from "vue";
import useCommandsStore from "@/packages/store/commands/commands"
import { useMenvDragger } from "@/packages/hooks/useMenvDragger";
// 样式
import styles from './style.module.scss'

// 左侧菜单栏
export default defineComponent({
    name: 'base-components',
    setup(props) {
        const commandsStore = useCommandsStore()
        const config = inject('config')
        const containerRef = inject('containerRef')
        // 菜单（物料区的组件菜单）拖拽
        // 获取目标元素-------判断拖拽元素与目标元素的位置关系：刚进入，在上面移动，出目标元素
        const { dragstart, dragend } = useMenvDragger(containerRef, commandsStore)
        return () => {
            return (
                <div class={styles.list}>
                    {config.componentList.map((component, idx) => {
                        return (
                            <div
                                class={styles.item}
                                //开启拖拽绑定回调
                                draggable
                                ondragstart={e => dragstart(e, component)}
                                ondragend={e => dragend(e)}
                                key={idx}
                            >
                                <span>{component.label}</span>
                                <div>{component.preview()}</div>
                            </div>
                        )
                    })}
                </div>
            )
        }
    }
})