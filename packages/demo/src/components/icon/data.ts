export type TDataItem = {
    type: string;
    props?: Record<string, string>;
    children?: TDataItem[];
}
export type TItem = {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    data: TDataItem[]
}

export default {
    upload: {
        x: 0,
        y: 0,
        width: 256,
        height: 256,
        data: [
            {
                type: 'path',
                props: {
                    d: 'M123.5,28.3c-0.8,0.3-2,1-2.9,1.4c-0.8,0.4-13.7,13.1-28.7,28.1L64.7,85l4.9,4.9l4.9,4.9l23.1-23.1C110.3,59,120.8,48.6,121,48.6c0.2,0,0.4,27.7,0.4,61.6v61.6h6.7h6.7v-61.6c0-33.9,0.1-61.6,0.3-61.6c0.2,0,10.8,10.4,23.5,23.1l23.1,23.1l4.9-4.9l4.9-4.9l-27.7-27.6c-18.7-18.6-28.4-27.9-29.6-28.5C131.6,27.8,125.6,27.4,123.5,28.3z',
                }
            },
            {
                type: 'path',
                props: {
                    d: 'M10,185.4c0,30.6,0,31.7,1,34.2c1.1,3,3.8,5.9,6.8,7.5l2,1.1H128h108.2l2-1.1c2.9-1.5,5.7-4.7,6.8-7.6c0.9-2.5,1-3.8,1-34.2v-31.6h-6.9h-6.9v30.5v30.5H128H23.8v-30.5v-30.5h-6.9H10V185.4z'
                }
            }
        ]
    } as TItem
}