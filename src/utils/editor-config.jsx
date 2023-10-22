// json数据的key和  物料区组件 和 实例组件 以及 属性操作栏预设属性配置框 的映射关系
// key====>{preview:,render:,key:,props:,model:}

import { Range } from "@/components/base-components/Range";
import { Text } from "@/components/base-components/Text";
import { ElButton, ElInput, ElOption, ElSelect } from "element-plus";


// 组件注册中心
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


// 属性输入需要渲染什么类型的框----------------------采用工厂函数进行构造
const createInputProp = (label) => ({ type: 'input', label })
const createColorProp = (label) => ({ type: 'color', label })
const createSelcetProp = (label, options) => ({ type: 'select', label, options })
const createTableProp = (label, table) => ({ type: 'table', label, table })
const createButtonProp = (label) => ({ type: 'button', label })

// 注册组件
export let registerConfig = createEditorConfig();

// 1.文本框
registerConfig.register({
    label: '文本',
    key: 'text',
    resize: {
        width: true,
        height: true
    },
    preview: () => <Text>预览文本</Text>,
    render: ({ size, props }) => <Text {...size} color={props.color} fontSize={props.fontSize}>{props.text || "渲染文本"}</Text>,
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
    resize: {
        width: true,
        height: true,
    },
    preview: () => <ElButton>预览按钮</ElButton>,
    render: ({ size, props }) => <ElButton style={{ width: size.width, height: size.height }} type={props.type} size={props.size} round={props.round}>{props.text || "渲染按钮"}</ElButton>,
    props: {
        text: createInputProp('按钮内容'),
        type: createSelcetProp('按钮类型', [
            // {用户看到的,实际的值}
            { label: '默认按钮', value: '' },
            { label: '主题按钮', value: 'primary' },
            { label: '成功按钮', value: 'success' },
            { label: '警告按钮', value: 'warning' },
            { label: '危险按钮', value: 'danger' },
            { label: '信息按钮', value: 'info' },
        ]),
        size: createSelcetProp('按钮大小', [
            // {用户看到的,实际的值}
            { label: '默认', value: '' },
            { label: '大', value: 'large' },
            { label: '小', value: 'small' },
        ]),
        round: createButtonProp('圆形按钮')
    },
})


// 3.输入框
registerConfig.register({
    label: '输入框',
    key: 'input',
    resize: {
        width: true,
        height: false,
    },
    preview: () => <ElInput placeholder="预览输入框" />,
    render: ({ size, props, model }) => {
        // console.log("model",model)
        //modelValue:输入值 "onUpdate:modelValue":更新函数
        return <ElInput style={{ width: size.width }} placeholder={props.text || "渲染输入框"} {...model.default} />
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
    resize: {
        width: true,
        height: true
    },
    preview: () => <Range></Range>,
    render: ({ size, props, model }) => {
        return <Range
            // 实现多个属性双绑
            {...{
                start: model.start.modelValue,
                end: model.end.modelValue,
                "onUpdate:start": model.start["onUpdate:modelValue"],
                "onUpdate:end": model.end["onUpdate:modelValue"]
            }}
            // 样式属性传递
            style={size}
        ></Range>
    },
    model: {
        start: '绑定开始范围字段',
        end: '绑定结束范围字段'
    }
})


// 5.下拉框
registerConfig.register({
    label: '下拉框',
    key: 'select',
    resize: {
        width: true,
        height: false
    },
    preview: () => <ElSelect placeholder='预览下拉框'></ElSelect>,
    render: ({ size, props, model }) => (<ElSelect {...model.default} placeholder='渲染下拉框' style={{ width: size.width, minWidth: '100px' }}>
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
    model: {
        default: "绑定字段",//选择框选择的值
    }
})


