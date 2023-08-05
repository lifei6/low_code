import { $tableDialog } from "@/components/TableDialog";
import deepcopy from "deepcopy";
import { ElButton, ElTag } from "element-plus";
import { computed, defineComponent } from "vue";



export default defineComponent({
    props:{
                                                                // [{label,field}] 
        propConfig:Object, // {type:'table',label:'下拉框',{options:[],key,'label'}}
        modelValue:Array
    },
    emits:['update:modelValue'],
    setup(props,ctx){
        // 获取响应式的modelValue
        const optionsData = computed({
            get(){
                return props.modelValue || []
            },
            set(newValue){
                // console.log(typeof newValue)
                // if(typeof newValue !== Array){
                //     console.log("类型错误，应该为数组")
                // }
                ctx.emit('update:modelValue',deepcopy(newValue))
            }
        })

        const jumpDilog = (e)=>{
            // 弹出一个弹出层
            $tableDialog({
                config:props.propConfig,
                data:optionsData.value,
                onConfirm(newData){
                    optionsData.value = newData
                }
            })
        }

        return ()=>{
            return <div>
                {/* 此下拉框没有任何数据显示按钮即可 */}
                {(!optionsData.value || optionsData.value.length == 0)&&<ElButton onClick={e=>jumpDilog(e)}>添加</ElButton>}
                {/* 有数据进行显示可选标签 */}
                {(optionsData.value || []).map(item=>{
                    return <ElTag onClick={e=>jumpDilog()}>{item[props.propConfig.table.tag]}</ElTag>
                })}
            </div>
        }
    }
})