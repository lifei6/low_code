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
// 属性输入需要什么框----采用工厂函数进行构造
const createInputProp = (label)=>({type:'input',label})
const createColorProp = (label)=>({type:'color',label})
const createSelcetProp = (label,options)=>({type:'select',label,options})
registerConfig.register({
    label:'文本',
    key:'text',
    preview:()=>'预览文本',
    render:({props})=><span style={{color:props.color,fontSize:props.fontSize}}>{props.text||'渲染文本'}</span>,
    props:{
        text:createInputProp('文本内容'),
        color:createColorProp('字体颜色'),
        fontSize:createSelcetProp('字体大小',[
            // {用户看到的,实际的取值}
            {label:'14px',value:'14px'},
            {label:'20px',value:'20px'},
            {label:'24px',value:'24px'},
        ])
    },
})

registerConfig.register({
    label:'按钮',
    key:'button',
    preview:()=><ElButton>预览按钮</ElButton>,
    render:({props})=><ElButton type={props.type} size={props.size}>{props.text||"渲染按钮"}</ElButton>,
    props:{
        text:createInputProp('按钮内容'),
        type:createSelcetProp('按钮类型',[
            // {用户看到的,实际的值}
            {label:'基础按钮',value:'primary'},
            {label:'成功按钮',value:'success'},
            {label:'警告按钮',value:'warning'},
            {label:'危险按钮',value:'danger'},
            {label:'文本按钮',value:'text'},
        ]),
        size:createSelcetProp('按钮大小',[
            // {用户看到的,实际的值}
            {label:'默认',value:''},
            {label:'大',value:'large'},
            {label:'中等',value:'medium'},
            {label:'小',value:'samll'},
        ]),

    },
})

registerConfig.register({
    label:'输入框',
    key:'input',
    preview:()=><ElInput placeholder="预览按钮" />,
    render:({props})=><ElInput placeholder={props.text||"渲染按钮"} />,
    props:{

    }
})