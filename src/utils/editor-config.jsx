// json数据的key和  物料区组件 和 实例组件 以及 属性操作栏预设属性配置框 的映射关系
// key====>{preview:,render:,key:,props:,model:}

import { Range } from "@/components/Range";
import { ElButton, ElInput, ElOption, ElSelect } from "element-plus";

function createEditorConfig() {
    // 组件列表
    const componentList = []
    // 映射列表
    const componentMap = {}

    // 返回一个 注册组件的方法 和 注册了的组件列表 和 映射关系表
    return {
        componentList,
        componentMap,
        register: (component) => {
            componentList.push(component)
            componentMap[component['key']] = component
        }
    }
}


// 注册组件
export let registerConfig = createEditorConfig();
// 属性输入需要什么框----采用工厂函数进行构造
const createInputProp = (label) => ({ type: 'input', label })
const createColorProp = (label) => ({ type: 'color', label })
const createSelcetProp = (label, options) => ({ type: 'select', label, options })
const createTableProp = (label, table) => ({ type: 'table', label, table })


// 1.文本框
registerConfig.register({
    label: '文本',
    key: 'text',
    resize:{
        width:true,
        height:true
    },
    preview: () => '预览文本',
    render: ({ size,props }) => <div style={{...size, color: props.color, fontSize: props.fontSize,display:"flex",justifyContent:"center",alignItems:"center" }}>{props.text || '渲染文本'}</div>,
    props: {
        text: createInputProp('文本内容'),
        color: createColorProp('字体颜色'),
        fontSize: createSelcetProp('字体大小', [
            // {用户看到的,实际的取值}
            { label: '14px', value: '14px' },
            { label: '20px', value: '20px' },
            { label: '24px', value: '24px' },
        ])
    },
})

// 2.按钮
registerConfig.register({
    label: '按钮',
    key: 'button',
    resize:{
        width:true,
        height:true,
    },
    preview: () => <ElButton>预览按钮</ElButton>,
    render: ({ size,props }) => <ElButton style={{width:size.width,height:size.height}} type={props.type} size={props.size}>{props.text || "渲染按钮"}</ElButton>,
    props: {
        text: createInputProp('按钮内容'),
        type: createSelcetProp('按钮类型', [
            // {用户看到的,实际的值}
            { label: '基础按钮', value: 'primary' },
            { label: '成功按钮', value: 'success' },
            { label: '警告按钮', value: 'warning' },
            { label: '危险按钮', value: 'danger' },
            { label: '文本按钮', value: 'text' },
        ]),
        size: createSelcetProp('按钮大小', [
            // {用户看到的,实际的值}
            { label: '默认', value: '' },
            { label: '大', value: 'large' },
            { label: '中等', value: 'medium' },
            { label: '小', value: 'samll' },
        ]),

    },
})


// 3.输入框
registerConfig.register({
    label: '输入框',
    key: 'input',
    resize:{
        width:true,
        height:false,
    },
    preview: () => <ElInput placeholder="预览输入框" />,
    render: ({ size,props, model }) => {
        // console.log("model",model)
        //modelValue:输入值 "onUpdate:modelValue":更新函数
        return <ElInput style={{width:size.width}} placeholder={props.text || "渲染输入框"} {...model.default} />
    },
    props: {

    },
    model: {//输入框才有的双向绑定字段
        default: "绑定字段",
    }
})

// 4.范围框
registerConfig.register({
    label: '范围框',
    key: 'range',
    preview: () => <Range></Range>,
    render: ({ props, model }) => {
        // console.log("model",model)
        return <Range {...{
            start: model.start.modelValue,
            end: model.end.modelValue,
            "onUpdate:start": model.start["onUpdate:modelValue"],
            "onUpdate:end": model.end["onUpdate:modelValue"]
        }}></Range>
    },
    model: {
        start: '开始范围字段',
        end: '结束范围字段'
    }
})


// 5.下拉框
registerConfig.register({
    label: '下拉框',
    key: 'select',
    preview: () => <ElSelect></ElSelect>,
    render: ({ props,model }) => (<ElSelect {...model.default}>
        {
            (props.options || []).map((opt, idx) => {
                return <ElOption label={opt.label} value={opt.value} key={idx}></ElOption>
            })
        }
    </ElSelect>),
    props: {//table=[{label:a,value:1},{label:b,value2}...]
        options: createTableProp('下拉选项', {
            options: [
                { label: '显示值', field: "label" }, //一列
                { label: '绑定值', field: "value" }, //一列
            ],
            tag: "label",//显示给用户的值是属性值label，还是实际值value
        }),
    },
    model:{
        default:"绑定字段",//选择框选择的值
    }
})