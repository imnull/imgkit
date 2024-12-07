export type TSize = {
    width: number;
    height: number;
}

export type TPostion = {
    left: number;
    top: number;
}

export type TRect = TSize & TPostion & {
    right: number;
    bottom: number;
}

export type TPoint = {
    x: number;
    y: number;
}