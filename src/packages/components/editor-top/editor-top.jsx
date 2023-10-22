// 顶部按钮
import { useButton } from "@/packages/hooks/useButtons";
import { defineComponent } from "vue";

export default defineComponent({
    name: 'editor-top',
    setup() {
        const buttons = useButton()
        return () => {
            return (
                <>
                    {
                        buttons.map((btn, idx) => {
                            let label = btn.label()
                            return (
                                <div
                                    class='editor-top-button'
                                    onClick={e => btn.handler()}
                                    key={label}
                                >
                                    <div class={`iconfont ${btn.icon}`}></div>
                                    <div class='btn-label'>{label}</div>
                                </div>)
                        })
                    }
                </>
            )
        }
    }
})