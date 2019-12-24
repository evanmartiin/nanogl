import BaseTexture from './texture-base';
import { GLContext } from './types';
export default class Texture extends BaseTexture {
    _target: GLenum;
    constructor(gl: GLContext, format?: GLenum, type?: GLenum, internal?: GLenum);
    fromImage(img: TexImageSource): void;
    fromData(width: number, height: number, data?: ArrayBufferView | null): void;
}
