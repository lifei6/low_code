import { defineComponent, computed } from "vue";

export const Range = defineComponent({
    name: 'range',
    props: {
        start: Number,
        end: Number,
        style: {
            type: Object,
            default: { height: '30px', width: '200px' }
        }
    },
    emits: ['update:start', 'update:end'],
    setup(props, ctx) {

        let start = computed({
            get: () => {
                return props.start
            },
            set: (newValue) => {
                ctx.emit('update:start', Number(newValue))
            }
        })

        let end = computed({
            get: () => {
                return props.end
            },
            set: (newValue) => {
                ctx.emit('update:end', Number(newValue))
            }
        })

        return () => {
            return <div class='range' style={props.style}>
                <input type="text" v-model={start.value} placeholder="开始范围" />
                <span>~</span>
                <input type="text" v-model={end.value} placeholder="结束范围" />
            </div>
        }
    }
})