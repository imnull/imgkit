import { genSvgCode, TIconNames } from './icon'

export const genSvgDataURL = (name: TIconNames, color: string = '#000000') => {
    const svg = genSvgCode(name, color)
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export default (props: {
    name: TIconNames;
    size?: number;
    color?: string;
}) => {
    const { name, size = 48, color = '#000' } = props
    return <img className="custom-icon-entity" style={{ width: size, height: size }} src={genSvgDataURL(name)} />
}

