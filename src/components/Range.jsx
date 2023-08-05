import { defineComponent,computed } from "vue";

export const Range = defineComponent({
    props:{
        start:Number,
        end:Number 
    },
    emits:['update:start','update:end'],
    setup(props,ctx){

        let start = computed({
            get:()=>{
                return props.start
            },
            set:(newValue)=>{
                ctx.emit('update:start',Number(newValue))
            }
        })

        let end = computed({
            get:()=>{
                return props.end
            },
            set:(newValue)=>{
                ctx.emit('update:end',Number(newValue))
            }
        })

        return ()=>{

            return <div class = 'range'>
                <input type="text" v-model={start.value}/>
                <span>~</span>
                <input type="text" v-model={end.value}/>
            </div>
        }
    }
})