import { $contextMenu } from "@/packages/base-ui/context-menu/ContextMenu"


export function useContextmenu() {
    //5.实现右击每个代码块出现下拉内容菜单
    const blockContextmenu = (e, block) => {
        // 阻止默认的内容菜单弹窗
        e.preventDefault()
        console.log('出现内容菜单')
        $contextMenu({
            el: e.target,//当前元素的真实DOM，菜单栏相对于点击的组件元素进行挂载
            context: () => {
                return <>
                    <ContextItem label="删除组件" icon='icon-shanchu' onClick={() => commands.deleteElement()}></ContextItem>
                    <ContextItem label="置顶组件" icon='icon-top1' onClick={() => commands.top()}></ContextItem>
                    <ContextItem label="置底组件" icon='icon-bottom' onClick={() => commands.bottom()}></ContextItem>
                    <ContextItem label="导出组件" icon='icon-daochu1' onClick={() => {
                        $dialog({
                            title: '组件导出JSON',
                            content: JSON.stringify(block),
                            footer: false,//是否显示底部确认，取消按钮
                        })
                    }}></ContextItem>
                    <ContextItem label="导入组件" icon='icon-daoru' onClick={() => {
                        $dialog({
                            title: '组件导入JSON',
                            content: '',
                            footer: true,//是否显示底部确认，取消按钮
                            // 确认按钮的回调
                            onComfirm: (text) => {
                                // 更新代码块传入旧代码块和新代码块
                                commands.updateBlock(block, JSON.parse(text))
                            }
                        })
                    }}></ContextItem>
                </>
            },
        })

    }

    return {
        blockContextmenu
    }
}