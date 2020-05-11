import mimeCodes from './mimeCodes.js';

function start(cb) {
    electron.remote.dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        buttonLabel: "SEND",
        title: "Send Files",
        defaultPath: dirs.desktop
    }).then(result => {
        if (!result.canceled) {
            result.filePaths.forEach((pth, index) => {
                const stat=fs.statSync(pth);
                const size = stat.size;
                const mime = mimeCodes.getMime(pth);
                console.log("send file", pth, mime);
                const filename = path.basename(pth);
                const fid = resources.register(pth, 2 * 24 * 60 * 60 * 1000);
                cb(fid, mime, filename,size);
            });
        }
    }).catch(err => {
        console.error(err)
    })
}

export default start;