import { isValidNumber } from '@imnull/imgkit'
import { TExif, TExifForce } from '@imnull/exif'

export const exifHasSize = (exif: TExif) => {
    return (
        (isValidNumber(exif.ImageWidth) && (isValidNumber(exif.ImageLength) || isValidNumber(exif.ImageHeight)))
        || (isValidNumber(exif.PixelXDimension) && isValidNumber(exif.PixelYDimension))
    )
}

export const exifHasOrientation = (exif: TExif) => {
    return isValidNumber(exif.Orientation)
}

export const needRebuild = (exif: TExif): exif is TExifForce => {
    return exifHasOrientation(exif) && exifHasSize(exif) && exif.Orientation! > 1
}

export const getExifSize = (exif: TExif): [number, number] => {
    if (isValidNumber(exif.ImageWidth) && (isValidNumber(exif.ImageLength) || isValidNumber(exif.ImageHeight))) {
        return [exif.ImageWidth, isValidNumber(exif.ImageLength) ? exif.ImageLength : exif.ImageHeight] as [number, number]
    } else if (isValidNumber(exif.PixelXDimension) && isValidNumber(exif.PixelYDimension)) {
        return [exif.PixelXDimension, exif.PixelYDimension]
    } else {
        throw 'The EXIF has no size infomations.'
    }
}

export const adjustSub = (val: number, min: number = 1.1, max: number = 1.4) => {
    return Math.max(min, Math.min(max, val))
}