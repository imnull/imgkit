import { useState } from 'react';

import { readAsDataURL, webRebuildImage, webCreateImageByUrl } from '@imnull/imgkit-web';
import { ExifOperator } from '@imnull/exif'
import { getMagicMime } from '@imnull/mime'

import ImageUpload from '~/components/image-upload'
import ImageViewer from '~/components/image-viewer'
import ImageViewerCompare from '~/components/image-viewer-compare'
import Button from '~/components/button'
import ExifList from '~/components/exif-list'

import './app.scss'

export default () => {
    const [origin, setOrigin] = useState('')
    const [fixed, setFixed] = useState('')
    const [exif, setExif] = useState<any>(null)
    return <div className="app-root">
        {!origin ? <>
            <ImageUpload
                onSelected={async file => {

                    const origin = await readAsDataURL(file)
                    setOrigin(origin)

                    const buff = await file.arrayBuffer()

                    const op = new ExifOperator(buff)

                    const mimeType = getMagicMime(new Uint8Array(buff))
                    console.log('detect content type', mimeType)

                    const exif = op.getExif()
                    setExif(exif)

                    const cleanFile = await webRebuildImage(file)
                    const fixed = await readAsDataURL(cleanFile)
                    setFixed(fixed)
                }}
            />
        </> :  <>
            <ImageViewerCompare origin={origin} fixed={fixed} />
            <Button
                type="primary"
                text="清除"
                onTap={() => {
                    setOrigin('')
                    setFixed('')
                    setExif(null)
                }}
            />
            <ExifList exif={exif} />
        </>}
    </div>
}

