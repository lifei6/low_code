import deepcopy from "deepcopy"
import { events } from "./events"
import { onUnmounted } from "vue"

// 定义命令和操作的映射关系
export function useCommand(data) {
    console.log('useCommand调用了')
    // 维护状态
    const state = {
        // 1.需要前进后退的指针
        current: -1,//默认没有
        queue: [],//存放所有操作命令的状态对象{redo:存放新的状态，undo:存放之前的状态}
        commands: {},//命令和执行操作的一个映射表 undo:()=>{}
        commandArray: [],//存放所有注册命令
        destroyArray:[],//销毁列表，存放所有需要的取消订阅的函数
    }


    // 命令注册函数
    const registry = (command) => {
        // 添加命令
        state.commandArray.push(command)
        // 记录映射
        state.commands[command.name] = (...args) => {//命令对应的执行函数（对execute包装了一层便于传参）
            const { mustdo,undo } = command.execute(...args)
            mustdo()

            // 判断是否需要放队列
            if(command.pushFlag){
                // 判断队列之前是否有元素了，可能中间撤销了几次，需要基于最新（撤销后的索引去存放元素）
                if(state.queue.length>0){
                    state.queue = state.queue.slice(0,state.current+1)
                }

                state.queue.push({mustdo,undo})
                state.current = state.current+1

                console.log("state.queue",state.queue)
                console.log('current',state.current)
            }
        }

    }


    // 注册一些命令
    //1.前进(重做)
    registry({
        name: 'redo',//名称
        keyboard: 'ctrl+y',//快捷键
        execute() {
            return {
                // 所有命令都会执行mustdo方法
                mustdo() {
                    // console.log('重做') 
                    let item = state.queue[state.current+1]
                    if(item){
                        item.mustdo&&item.mustdo()
                        state.current++
                    }
                }
            }
        },//执行器

    })

    //2.后退(撤销)
    registry({
        name: 'undo',//名称
        keyboard: 'ctrl+z',//快捷键
        execute() {
            return {
                // 所有命令都会执行redo方法
                mustdo() {
                    // console.log('撤销')
                    if(state.current>-1){
                        let item = state.queue[state.current]
                        if(item){
                            item.undo&&item.undo()
                            state.current--
                        }
                    }
                }
            }
        },//执行器

    })

    // 3.注册一个拖拽命令
    registry({
        name: 'drag',
        pushFlag: true,//标识操作需要放队列中
        init() {
            // 初始化记录之前的状态   this-->就是这个注册的指令对象
            this.before = null
            // 发布消息
            const start = () => {
                // 拖拽前记录之前的状态
                this.before = deepcopy(data.value.blocks)
            }
            const end = () => {
                // 拖拽后触发对应指令
                state.commands.drag()
            }
            events.on('start', start)
            events.on('end', end)


            // 组件销毁需要解绑事件，放回一个解绑事件的函数
            return () => {
                events.off('start', start)
                events.off('end', end)
            }
        },//初始化方法，默认就会执行,会进行事件订阅
        execute() {
            //!!!重点块级作用域，都会产生一个作用域记录前后两个状态
            // 之前的状态
            let before = this.before
            // 最新的状态
            let after = data.value.blocks
            // 每次执行拖拽结束，只要触发了end就会执行这个函数，
            return { //state.commands.drag()
                // 所有命令都会执行mustdo方法
                mustdo() {
                    // 默认为最新的数据
                    data.value = {...data.value,blocks:after}
                },
                undo() {
                    // 如果撤销则使用之前的状态
                    data.value = {...data.value,blocks:before}
                }

            }
        },//执行器
    });


    // 4.导入JSON保留历史记录
    registry({
        name:'update',
        pushFlag:true,
        execute(newData){
            let state = {
                before:data.value,
                after:newData
            }

            return {
                mustdo(){
                    data.value = state.after
                },
                undo(){
                    data.value= state.before
                }
            }
        }
    })

    // 快捷键监听
    const keyboardEvent = (()=>{
        // 记录按钮的keycode和按钮映射关系
        const keyCodes = {
            90:'z',
            89:'y'
        }

        const onKeydown = (e)=>{
            const {ctrlKey,keyCode} = e
            let keyString = [];//记录按了哪几个键
            if(ctrlKey)keyString.push('ctrl')
            keyString.push(keyCodes[keyCode])
            keyString = keyString.join('+')

            // 遍历所有指令，找到有快捷键的，看是否匹配，匹配则调对应的执行函数
            state.commandArray.forEach(({keyboard,name})=>{
                if(keyboard==keyString){
                    state.commands[name]()
                    e.preventDefault();
                }
            })
        }

        const init  = ()=>{//初始化键盘事件
            // 绑定键盘事件
            window.addEventListener('keydown',onKeydown)

            // 返回一个解绑事件的函数
            return ()=>{
                // 解绑事件
                window.removeEventListener('keydown',onKeydown)
            }
        }
        return init
    })();

    // 立即执行有初始化的指令的初始化操作
    (()=>{
        // 初始化键盘事件
        state.destroyArray.push(keyboardEvent())

        state.commandArray.forEach((command)=>{
            command.init&&state.destroyArray.push(command.init())
        })
    })()

    // 销毁执行取消事件订阅
    onUnmounted(()=>{
        state.destroyArray.forEach(fn=>fn&&fn())
    })

    return state
}