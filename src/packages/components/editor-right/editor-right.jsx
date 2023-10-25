import deepcopy from "deepcopy";
import { ElTabs, ElTabPane, ElButton, ElColorPicker, ElForm, ElFormItem, ElInput, ElInputNumber, ElOption, ElSelect } from "element-plus";
import { defineComponent, ref, inject, reactive, watch } from "vue";

import './style.scss'
import PropsComponent from "./c-cpns/props-component/props-component";
import AnimationComponents from "./c-cpns/animation-component/animation-components";
import EventComponent from "./c-cpns/event-component/event-component";
import PageComponent from "./c-cpns/page-component/page-component";

export default defineComponent({
    name: 'editor-right',
    setup(props, ctx) {

        const activeName = ref('props')

        const handleClick = (tab, event) => {
            console.log(tab, event)
        }
        return () => {

            return (
                <ElTabs
                    v-model={activeName.value}
                    class="demo-tabs"
                    type="border-card"
                    stretch={true}
                    onTabClick={handleClick}
                >
                    <ElTabPane label="属性" name="props">
                        <PropsComponent></PropsComponent>
                    </ElTabPane>
                    <ElTabPane label="动画" name="animation">
                        <AnimationComponents></AnimationComponents>
                    </ElTabPane>
                    <ElTabPane label="事件" name="event">
                        <EventComponent></EventComponent>
                    </ElTabPane>
                    <ElTabPane label="页面" name="page">
                        <PageComponent></PageComponent>
                    </ElTabPane>
                </ElTabs>
            )
        }
    }
})