import DATA, { TDataItem } from './data'
export type TIconNames = keyof typeof DATA

const parseDataItem = (item: TDataItem, color: string): string => {
    const { type, props = {}, children = [] } = item
    const arr: string[] = []
    Object.keys(props).forEach(key => {
        arr.push(`${key}="${props[key]}"`)
    })
    if(Array.isArray(children) && children.length > 0) {
        return `<${type} fill="${color}" ${arr.join(' ')}>${children.map(it => parseDataItem(it, color)).join('')}</${type}>`
    } else {
        return `<${type} fill="${color}" ${arr.join(' ')} />`
    }
}

export const genSvgCode = (name: TIconNames, color: string = '#000000') => {
    const icon = DATA[name]
    if(!icon) {
        return ''
    }

    const { x = 0, y = 0, width = 256, height = 256, data } = icon
    return `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${width} ${height}"><g>${data.map(it => parseDataItem(it, color)).join('')}</g></svg>`
}