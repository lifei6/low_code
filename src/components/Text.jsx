// 文本组件封装
// 目标：实现文字居中，大小暴露出去

import { defineComponent } from "vue";

export const Text =defineComponent({
    props:{
        width:{
            type:String,
            default:'100px',
        },
        height:{
            type:String,
            default:'40px',
        },
        color:{
            type:String,
            default:"black",
        },
        fontSize:{
            type:String,
            default:"14px",
        },
    },
    setup(props,ctx){
        return ()=>{
            const {width,height,color,fontSize}=props
            return  <div style={{width,height,color,fontSize,display:"flex",justifyContent:"center",alignItems:"center",overflow:"hidden" }}>{ctx.slots.default()}</div>
        }
    }
})