/**
 * @text 200
 * @image 201
 * @video 202
 * @audio 203
 * @doc 204
 * @pdf 205
 * @ppt 206
 * @exel 207
 * @json 208
 * @xml 209
 * @file 210
 */
const types = [
    "text/plain",
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/bmp',
    'image/image/vnd.microsoft.icon',
]
const api = {
    getCode: function (filePath) {
        const mime = this.getMime(filePath);
        return this.getCodeByMime(mime);
    },
    getCodeByMime: function (mime) {
        const ind = types.findIndex((type) => { return mime == type });
        return 200 + ind;
    },
    getMimeByCode: function (code) {
        const ind = code - 200;
        if (ind >= 0) {
            return types[ind];
        }
        else
            return null;
    },
    getMime: function (pth) {
        return (MIME.lookup(filesDir + '/' + pth));
    }
}

export default api;