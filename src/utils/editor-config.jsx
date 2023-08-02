// json数据的key和物料区组件和实例组件的映射关系
// {preview:,render:,key:}

import { ElButton, ElInput } from "element-plus";

function createEditorConfig(){
    // 组件列表
    const componentList = []
    // 映射列表
    const componentMap = {}

    // 放回一个注册方法和注册了的组件列表
    return {
        componentList,
        componentMap,
        register:(component)=>{
            componentList.push(component)
            componentMap[component['key']] = component
        }
    }
}


// 注册组件
export let registerConfig =  createEditorConfig();


registerConfig.register({
    label:'文本',
    key:'text',
    preview:()=>'预览文本',
    render:()=>'渲染文本',
})

registerConfig.register({
    label:'按钮',
    key:'button',
    preview:()=><ElButton>预览按钮</ElButton>,
    render:()=><ElButton>渲染按钮</ElButton>,
})

registerConfig.register({
    label:'输入框',
    key:'input',
    preview:()=><ElInput placeholder="预览按钮" />,
    render:()=><ElInput placeholder="渲染按钮" />,
})