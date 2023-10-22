// 菜单按钮配置
import { $dialog } from "@/packages/base-ui/dialog/Dialog"
import useCommandsStore from "@/packages/store/commands/commands"
import useSystemStore from "@/packages/store/system/system"

// 添加按钮和回调
export function useButton() {
    const commandsStore = useCommandsStore()
    const systemStore = useSystemStore()
    const buttons = [
        { label: () => '撤销', icon: 'icon-shangyibu', handler: commandsStore.undo },
        { label: () => '重做', icon: 'icon-xiayibu', handler: commandsStore.redo },
        {
            label: () => '导入JSON', icon: 'icon-daoru', handler: () => {
                // 弹出一个对话框
                $dialog({
                    title: 'JSON数据导入',
                    content: '',
                    footer: true,//是否显示底部确认，取消按钮
                    onComfirm(text) {
                        commandsStore.updateContainer(JSON.parse(text))
                        // data.value = JSON.parse(text)//刷新后导入无法保留历史记录
                    },//确认按钮的回调
                })
            }
        },
        {
            label: () => '导出JSON', icon: 'icon-daochu1', handler: () => {
                // 弹出一个对话框
                $dialog({
                    title: 'JSON数据导出',
                    content: JSON.stringify({ container: commandsStore.container, blocks: commandsStore.components }),
                    footer: false,//是否显示底部确认，取消按钮
                })
            }
        },
        { label: () => '置顶', icon: 'icon-top1', handler: commandsStore.top },
        { label: () => '置底', icon: 'icon-bottom', handler: commandsStore.bottom },
        { label: () => '删除', icon: 'icon-shanchu', handler: commandsStore.deleteComponent },
        {
            label: () => systemStore.preview ? '编辑' : '预览', icon: 'icon-yulan', handler: () => {
                // 点击能切换预览模式
                systemStore.switchPreview()
                commandsStore.clearAllFocus()
                // 如果当前是预览模式则去除遮罩
            }
        },
        {
            label: () => '关闭', icon: 'icon-guanbi1', handler: () => {
                systemStore.switchEditor(false)
            }
        },
        // {
        //     label: () => '切换拖拽', icon: 'icon-shanchu', handler: () => {
        //         systemStore.switchVuedrag()
        //     }
        // }

    ]


    return buttons
}


