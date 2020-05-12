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
const mimes = {
    'application/octet-stream':'file.png',

    "text/plain":'txt.png',
    'text/html':'html.png',
    'text/javascript':'js.png',
    'text/css':'css.png',
    'text/csv':'csv.png',
    'application/json':'json.png',
    'application/ld+json':'json.png',
    'application/rtf':'txt.png',
    'text/xml':'xml.png',
    'application/xml':'xml.png',
    'application/xhtml+xml':'xml.png',
    'text/calendar':'file2.png',

    'image/jpeg':'image.png',
    'image/jpg':'image.png',
    'image/png':'image.png',
    'image/webp':'image.png',
    'image/bmp':'image.png',
    'image/tiff':'image.png',
    'image/svg+xml':'image.png',
    'image/image/vnd.microsoft.icon':'image.png',

    'audio/aac':'audio.png',
    'audio/midi':'audio.png',
    'audio/x-midi':'audio.png',
    'audio/mpeg':'audio.png',
    'audio/ogg':'audio.png',
    'audio/opus':'audio.png',
    'audio/wav':'audio.png',
    'audio/webm':'audio.png',
    'audio/3gpp2':'audio.png',
    'audio/3gpp':'audio.png',

    'video/mpeg':'video.png',
    'video/mp4':'video.png',
    'video/x-msvideo':'video.png',
    'video/ogg':'video.png',
    'video/mp2t':'video.png',
    'video/webm':'video.png',
    'video/3gpp':'video.png',
    'video/3gpp2':'video.png',
    'application/ogg':'video.png',

    'font/otf':'font.png',
    'font/ttf':'font.png',
    'font/woff':'font.png',
    'font/woff2':'font.png',
    'application/vnd.ms-fontobject':'font.png',

    'application/msword':'doc.png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':'doc.png',
    'application/vnd.oasis.opendocument.text':'doc.png',

    'application/vnd.ms-powerpoint':'ppt.png',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation':'ppt.png',
    'application/vnd.oasis.opendocument.presentation':'ppt.png',

    'application/vnd.ms-excel':'excel.png',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'excel.png',
    'application/vnd.oasis.opendocument.spreadsheet':'excel.png',

    'application/pdf':'pdf.png',
    'application/epub+zip':'epub.png',
    'application/vnd.amazon.ebook':'book.png',

    'application/zip':'zip.png',
    'application/x-bzip':'zip.png',
    'application/x-bzip':'zip.png',
    'application/x-tar':'zip.png',
    'application/gzip':'zip.png',
    'application/vnd.rar':'zip.png',
    'application/x-7z-compressed':'zip.png',

    'application/x-csh':'code.png',
    'application/x-sh':'code.png',

    'application/x-httpd-php':'code.png',
    'application/java-archive':'file2.png',
    'application/vnd.apple.installer+xml':'file2.png',
    'application/vnd.android.package-archive':'file2.png',
}

const types=Object.keys(mimes);

const api = {
    getFileIconFromMime:function(mime){
        if(mimes[mime]!=undefined)
        return mimes[mime];
        else return 'file.png';
    },
    getFileIconFromCode:function(code){
        const mime=this.getMimeByCode(code);
        return getFileIconFromMime(mime);
    },
    getCode: function (filePath) {
        const mime = this.getMime(filePath);
        return this.getCodeByMime(mime);
    },
    getCodeByMime: function (mime) {
        const ind = types.findIndex((type) => { return mime == type });
        if (ind == -1)
            return 200;
        return 200 + ind;
    },
    getMimeByCode: function (code) {
        const ind = code - 200;
        if (ind >= 0) {
            const mime = types[ind];
            if (mime != undefined)
                return mime;
            else
                return 'application/octet-stream';
        }
        else
            return 'application/octet-stream';
    },
    getMime: function (pth) {
        return (MIME.lookup(filesDir + '/' + pth));
    }
}

export default api;