import { defineComponent, computed } from "vue";
// 数据
import useCommandsStore from "@/packages/store/commands/commands"
import useSystemStore from "@/packages/store/system/system"
// 聚焦拖拽
import { useFocus } from "@/packages/hooks/useFocus";
import { useBlockDragger } from "@/packages/hooks/useBlockDragger";
// 单个组件
import EditorBlock from "./c-cpns/editor-block/editor-block";
import { useContextmenu } from "@/packages/hooks/useBlockContextmenu";

// 样式
import styles from './style.module.scss'

export default defineComponent({
    name: 'editor-container',
    props: {
        containerRef: Object,
    },
    setup(props) {
        // 1.全局响应式数据--------------更新组件列表更新整个页面
        const commandsStore = useCommandsStore()
        const systemStore = useSystemStore()

        // 2.计算画布样式-----------------容器样式
        const containerStyle = computed(() => ({
            width: commandsStore.container.width + 'px',
            height: commandsStore.container.height + 'px',
        }))

        // 3.获取焦点,选中后就可能进行拖拽
        let { blockMousedown } = useFocus(
            commandsStore,
            systemStore.preview,
            (e) => {
                mousedown(e);
            }
        );

        // 4.多个元素拖拽和辅助线
        let { mousedown, markLines } = useBlockDragger(commandsStore);

        //5.实现右击每个代码块出现下拉内容菜单
        const { blockContextmenu } = useContextmenu(commandsStore)

        return () => {
            return (
                <>
                    {/* 产生滚动条 */}
                    <div class="editor-container-canvas">
                        {/* 具体内容 */}
                        <div
                            class="editor-container-canvas-content"
                            style={containerStyle.value}
                            ref={props.containerRef}
                            // 未点击到外壳直接清除全部选中
                            onMousedown={e => commandsStore.clearAllFocus(e)}
                        >
                            {
                                commandsStore.components.map((block, index) => (
                                    <EditorBlock
                                        class={[block.focus ? styles.focus : '', systemStore.preview ? styles.preview : '']}
                                        block={block}
                                        // 点击拖拽或者点击聚焦
                                        onMousedown={e => blockMousedown(e, block.id, index)}
                                        // 元素右击菜单事件
                                        onContextmenu={e => blockContextmenu(e, block)}
                                        //预览模式
                                        preview={systemStore.preview}
                                        key={block.id}
                                    >
                                    </EditorBlock>
                                ))
                            }
                            {/* 纵线 */}
                            {markLines.x !== null && (<div class={styles.lineX} style={{ left: markLines.x + 'px' }}></div>)}
                            {/* 横线 */}
                            {markLines.y !== null && (<div class={styles.lineY} style={{ top: markLines.y + 'px' }}></div>)}

                        </div>

                    </div>
                </>
            )
        }
    }
})