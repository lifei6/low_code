# 前端低代码平台开发



# 技术栈

>vue3+jsx+scss+element-plus



# 功能

## 1.整体框架

### 分为四个区：

- 左侧物料区
- 顶部菜单栏
- 右侧属性编辑区
- 中间的渲染区

### 初始JSON数据结构

```json
{
    "container":{
        "width":550,
        "height":550
    },
    "blocks":[
        {"top":100,"left":100,"zIndex":1,"key":"text"},
        {"top":200,"left":200,"zIndex":1,"key":"button"},
        {"top":300,"left":300,"zIndex":1,"key":"input"}
    ]
}
```



### 注册菜单栏组件componet的数据结构

```js	
component:{
    name:'输入框',//组件名
    key:'input',//标签名
    preview:()=><CustomComponent/>,//预览组件
    render:()=><CustomComponent/>,//渲染组件
    props:{
        
    },//属性
}
```

属性props的数据结构：

```js
props:{
    text:
    color:
    size:
    type:
}
```



### 注册命令的数据结构command

```js
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
                historyState.commands.drag()
            }
            events.on('start', start)
            events.on('end', end)
            // 组件销毁需要解绑事件，返回一个解绑事件的函数
            return () => {
                events.off('start', start)
                events.off('end', end)
            }
        },//初始化方法，默认就会执行,会进行事件订阅
        execute() {
            //!!!闭包，重点块级作用域，都会产生一个作用域记录前后两个状态
            let historyState = {
                // 之前的状态
                before: this.before,
                // 最新的状态
                after: data.value.blocks
            }
            // 每次执行拖拽结束，只要触发了end就会执行这个函数，
            return { //historyState.commands.drag()
                // 所有命令都会执行mustdo方法
                mustdo() {
                    // 默认为最新的数据
                    data.value = { ...data.value, blocks: historyState.after }
                },
                undo() {
                    // 如果撤销则使用之前的状态
                    data.value = { ...data.value, blocks: historyState.before }
                }

            }
        },//执行器
    });
```





## 2.实现注册组件和json代码块中key的映射关系

- 维护了一张映射表componentMap={key,component}

## 3.实现物料区组件的注册

- 采用闭包实现一个createEditorConfig函数返回内部的映射表和注册组件的方法register(component)
- component的数据结构为：{lable,preview,render,key} = {显示的标签，预览的组件渲染函数，需要渲染的组件渲染函数，类型}

## 4.实现初始页面状态的渲染

- 读取初始化的json数据，维护成一个响应式的转态state,根据state里面的blocks初始化渲染区
- 数据是双向绑定的修改state页面重新渲染，只要把我们物料区的东西拖拽过去，增加state中blocks的项目，会进行重新渲染更新页面，从而显示的是包含我们拖拽过去的组件的页面

## 5.实现物料区组件拖拽并在渲染区渲染

- 对物料区组件拖拽功能进行封装为一个useMenvDragger API：采用了h5的draggable

- 具体逻辑：

  1. 获取目标元素真实DOM

  2. 开始拖拽dragstart

  3. 拖拽期间效果(在dragstart事件里面设置)

     - dragenter进入元素触发,添加一个移动标识

       ```js
       e.dataTransfer.dropEffect = "move"
       ```

     - dragover在元素上移动时触发，必须阻止默认行为否则无法触发drop

       ```js
       e.preventDefault()
       ```

     - drapleave离开元素时触发，添加禁用标识

       ```js
       e.dataTransfer.dropEffect = "none"
       ```

     - drop执行放置，在放置目标上触发

       放置了元素生成拖拽元素真实DOM

  4. 拖拽结束dragend,清除拖拽效果的监听器

  5. 因为放置的位置是元素的左上角没有居中，拖拽完成后才生成了拖拽元素真实DOM，需要在挂载完成onMounted去设置放置居中效果

  > dragstart和dragend是在**拖拽元素**触发，dragenter/dragmove/dragleave/drop是在**目标元素**触发

## 6.实现渲染区组件的拖拽移动

- 先对渲染区组件的选中功能进行一个封装useFocus API 记录组件有哪些选中，哪些没有选中，记录选中的组件，可以单选也可以多选
- 对渲染区组件的拖拽进行一个封装useBlockDragger API
- 选中组件计算出当前的所有选中组件的位置{top,left}，根据这个去执行拖拽功能，以回调的形式执行

## 7.实现渲染区组件移动时的对齐辅助线

- 点击时先记录未选中的组件可能产生辅助线的所有情况
- 记录辅助线数据和这时的拖拽元素的位置{showTop,top}/{showLeft,left}
- 移动时根据距离辅助线是否小于5px进行快速贴近

## 8.实现菜单栏撤销与重做

> 主要思想采用消息订阅与发布，在初始化命令时进行发布start和end事件（发布）
>
> 在拖拽前触发start进行之前状态的记录，在拖拽后触发end事件（订阅）
>
> - 一方面记录拖拽后的状态
> - 一方面执行drag命令的执行函数，进行状态队列记录的增加
>
> 撤销与移动只需要在维护的状态队列中进行指针的移动，执行对应的记录状态的函数{mustdo:之前的状态，undo:之后的状态}就可以更新data,重新渲染页面，回到对应的之前的状态

- 实现物料区组件拖拽的撤销和重做
- 实现渲染区组件拖拽的撤销和重做

## 9.实现快捷键撤销与重做

- 在最开始就进行键盘事件的监听，事件触发时计算出当前按下的是字符串ctrl+z还是ctrl+y,接着遍历所有指令看是否有匹配的快捷键，有则执行对应的执行函数

## 10.实现菜单栏导入导出JSON

- 主要设计一个弹出框进行内容的导入和导出
- 0.定义一个Dialog组件
- 1.先创建一个容器el
- 2.将组件编译为虚拟dom   vm = createVNode(Dialog,props:(options))
- 3.将vm渲染到容器el   render(vm,el)
- 4.将容器添加到页面body下

> 对于导入需要定义能进入队列的指令，保留历史记录，而且修改数据是以回调函数完成的

## 11.实现菜单栏置顶置底功能

- 置顶就是找到所有未选中元素的最大zIndex,在此基础上为选中元素zIndex+1
- 置底就是相反，不过注意不能减为负数，会直接消失，可以整体加一个相对于0的值，从而保证这种边界情况满足

## 12.实现菜单栏删除功能

- 使用过滤器过滤出未选中的元素即可

## 13.实现菜单栏预览功能

- 维护一个字段，判断是否为预览模式
- 如果是预览模式：
  1. 元素不能拖动====点击后不继续触发拖拽操作直接返回
  2. 清空所有元素之前因点击而加上的红色边框====clearAllfocus()
  3. 去除元素上面的遮罩使元素能编辑======添加一个样式

## 14.实现菜单栏关闭功能

- 维护一个字段判断是否退出
- 退出就进入只有内容区的页面

## 15.实现右侧属性栏渲染内容与注册组件的props、model对应

- container渲染
- props渲染
- model渲染

## 16.实现内容区渲染组件的属性初始化（使用data中的props）

   data=>渲染页面

- 将参数传递给render函数进行绑定即可

## 17.实现右侧属性操作栏与内容区的同步

右侧属性栏维护editorData这个状态：记录当前右侧显示的是容器的属性，还是组件的属性

   兄弟组件通信方式：右侧属性栏=====通过父组件editor===>渲染内容区   

- 如果是**容器**则在点击应用按钮后调用 父组件editor 传过来的方法（updateContainerProps）将我们的新的editorData={container：{width,height}}抛出去，父组件方法（updateContainerProps）接收到这个新的容器属性，会使用注册的**updateContainer指令（会有历史记录）**去更新data，重新渲染页面
- 如果是**组件**则在点击应用按钮后调用 父组件editor 传过来的方法(updateBlockProps)将我们的新的editorData= deepcop(block)={props,model,key,top,....}抛出去，父组件方法(updateBlockProps)接收到这个新的组件属性，会使用注册的**updateBlock指令（会有历史记录）**去更新data，重新渲染页面

### 1.文本和按钮

- 使用上面的单向通信即可


### 2.输入框和范围框

- 需要实现双向绑定：表单收集容器formData = {}与组件内input框的双向绑定，formData = {}里面的属性则由右侧菜单栏绑定字段

  1. 右侧属性栏可以绑定字段（就是最后表单数据的属性名称）              

     - 输入框：editorData={model:{default:'绑定的字段'}}
     - 范围框：editorData={model:{start:'绑定的字段',end:'绑定的字段'}}

  2. 通过上述方法抛出绑定字段后的组件到父组件editor，父组件props通知内容区的组件（ElInput/Range）的v-model={我们绑定的字段} （理论上这样就行了）

  3. 但是我们可能需要给每个组件绑定多个响应式的属性，如范围框的start和end，而jsx的写法v-model只能默认展开为{modelValue:我们绑定的字段  onUpdate:modelValue = v=>我们绑定的字段=v}，**缺点：**

     - 需要组件内部去实现接收modelValue还有当值修改后触发update:modelValue，我们可能不想要这个名字（组件实现的话无法改名）
     - 当有多个属性是双向绑定的时候，我们v-model无能为力（无法绑定多个不同名属性）

  4. ```js
     //组件渲染前：调用注册的render（）函数前
     //所以我们在进行属性绑定前，需要将属性
     model={start:'绑定的字段1',end:'绑定的字段2'}
      //==映射====>
     model= {
         start:{
               modelValue:'绑定的字段1',
               "onUpdate:modelValue":'输入框的newValue'=>表单数据容器['绑定的字段1']=newvalue}
     		},
         end:{
               modelValue:'绑定的字段2',
               "onUpdate:modelValue":'输入框的newValue'=>表单数据容器['绑定的字段2']=newvalue}
         }
     ```

  5. 上面就是实际的解决办法：

     ```js
     //绑定时：调用注册的render()函数时
     //Range组件内部已经声明实现了start,end,"update:start","update:end"属性和方法
         render:({props,model})=>{
            return <Range {...{
             start:model.start.modelValue,
             end:model.end.modelValue,
             "onUpdate:start":model.start["onUpdate:modelValue"],
             "onUpdate:end":model.end["onUpdate:modelValue"]
            }}></Range>
     ```

     

### 3.下拉选择框

逻辑：

- 最后的结果为存储为props：{options:[{label:,value:}]}

- 根据这个设计注册组件时的映射关系为：

  ```js
      props: {//options最终得到：[{label:a,value:1},{label:b,value2}...]
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
  ```

- 先是编辑右侧属性编辑框，通过弹出一个具有表格配置的弹出层，进行下拉框预先配置好每个选项的标签和实际值，将这个配置存储在data里对应的props中

- 通过绑定字段，表示把选择的值绑定到对应的绑定字段，收集表单数据

## 18.实现渲染区大小拖拽

- 通过预设resize字段，给对应的元素设置可拖拽的边，例如对于按钮是宽高都能拖，对于输入框只能拖拽宽度

- 如果能横向拖拽则实现横向两个拖拽点

- 如果能纵向拖拽则实现纵项两个拖拽点

- 如果横纵都能拖拽而外增加四个角的拖拽点

- 还需要有一个方向的判断，如果是往上和左拖则还需要设置top和left

  