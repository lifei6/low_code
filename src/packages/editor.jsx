import { computed, defineComponent, inject, ref } from "vue"

// 引入样式
import './editor.scss'

import EditorBlock from './editor-block'

// 引入自定义功能
import {useMenvDragger} from './useMenvDragger'
import deepcopy from "deepcopy"
import { useFocus } from "./useFocus"
import { useBlockDragger } from "./useBlockDragger"

export default defineComponent({
    props: {
        modelValue: { type: Object }
    },
    emits: ['update:modelValue'],
    setup(props, ctx) {
        const data = computed({
            get: () => {
                return props.modelValue
            },
            set: (newVal) => {
                // console.log('设置newValue',newVal)
                ctx.emit('update:modelValue', deepcopy(newVal))
            }
        })

        // console.log(data.value)

        // 计算画布样式
        const containerStyle = computed(() => ({
            width: data.value.container.width + 'px',
            height: data.value.container.height + 'px',
        }))

        // 获取组件映射配置
        const config = inject('config')

        // 1.菜单拖拽
        // 获取目标元素
        const containerRef = ref(null)
        const {dragstart,dragend} = useMenvDragger(containerRef ,data)

        // 2.获取焦点,选中后就可能进行拖拽
        let { blockMousedown, clearAllFocus,focusData,lastSelectBlock} = useFocus(data,(e)=>{
            mousedown(e)
        })


        // 3.多个元素拖拽
        let {mousedown,markLines} =  useBlockDragger(focusData,lastSelectBlock,data)

        return () => (
            <div class="editor">
                <div class="editor-left">
                    {config.componentList.map((component) => {
                        return (
                            <div
                                class="editor-left-item"
                                //开启拖拽绑定回调
                                draggable
                                ondragstart={e => dragstart(e, component)}
                                ondragend={e => dragend(e)}
                            >
                                <span>{component.label}</span>
                                <div>{component.preview()}</div>
                            </div>
                        )
                    })}

                </div>
                <div class="editor-top">顶部</div>
                <div class="editor-right">右侧</div>
                <div class="editor-container">
                    {/* 产生滚动条 */}
                    <div class="editor-container-canvas">
                        {/* 具体内容 */}
                        <div
                            class="editor-container-canvas-content"
                            style={containerStyle.value}
                            ref={containerRef}
                            onMousedown={e=>clearAllFocus()}
                        >
                            {
                                data.value.blocks.map((block,index) => (
                                    <EditorBlock 
                                     class = {block.focus?'editor-block-focus':''}
                                     block={block}
                                     onMousedown={e=>blockMousedown(e,block,index)}
                                    >
                                    </EditorBlock>
                                ))
                            }
                            {/* 纵线 */}
                            {markLines.x!==null&&(<div class="mark-line-x" style={{left:markLines.x+'px'}}></div>)}
                            {/* 横线 */}
                            {markLines.y!==null&&(<div class="mark-line-y" style={{top:markLines.y+'px'}}></div>)}

                        </div>

                    </div>
                </div>
            </div>
        )


    }
})