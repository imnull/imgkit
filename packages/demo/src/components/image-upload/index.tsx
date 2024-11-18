import { useState } from 'react';
import './index.scss'
import { genSvgDataURL } from '~/components/icon'

export default (props: {
    onSelected?: (file: File) => void;
}) => {
    const { onSelected } = props
    const [input, setInput] = useState<HTMLInputElement | null>(null)
    const [backgroundImage] = useState(genSvgDataURL('upload-circle', '#ddd'))
    return <div
        className="image-upload-wrapper"
        style={{ backgroundImage: `url("${backgroundImage}")` }}
        onClick={() => {
            if (!input) {
                return
            }
            input.click()
        }}
    >
        <input
            className='file'
            type="file"
            accept="image/*"
            multiple={false}
            ref={setInput}
            onChange={e => {
                if (typeof onSelected !== 'function') {
                    return
                }
                if (!e.target.files || e.target.files.length < 1) {
                    return
                }
                const file = e.target.files[0]
                onSelected(file)
            }}
        />
    </div>
}