import './index.scss'
export default (props: {
    onTap?: () => void;
    text?: string;
    type?: 'primary' | 'default';
}) => {
    const {
        onTap,
        text = 'Button',
        type = 'default'
    } = props
    return <button className={`custom-button-entity ${type}`} onClick={onTap}>{text}</button>
}