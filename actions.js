const dev='desktop';

function code(n = 5) {
    return crypto.randomBytes(n).toString('hex');
}

function actions(act, data) {
    if (act == 'OPEN_RECENTS') {
        window.state.openPage('recents', data);
    }
    else if (act == 'OPEN_CONTACTS') {
        if(dev=='desktop'){
            window.state.openWindow('contacts', data);
        }
        else
        window.state.openPage('contacts', data);
    }
    else if (act == 'OPEN_SETTINGS') {
        if(dev=='desktop'){
            window.state.openWindow('settings', data);
        }
        else
        window.state.openPage('settings', data);
    }
    else if (act == 'OPEN_PREVIEW') {
        window.state.openWindow('preview', data);
    }
    else if (act == 'OPEN_ADDPEER') {
        window.state.openWindow('addPeer', data);
    }
    else if (act == 'CLOSE_WINDOW') {
        window.state.closeWindow();
    }
    else if (act == 'OPEN_CHAT') {
        window.state.openPage('chat', data);
    }
    else if (act == 'ADD_PEER') {
        window.state.init1(data);
    }
    else if (act == 'SEND_CHAT') {
        window.state.sendChat(data.peerId, data.chat);
    }
    else if (act == 'SAVE_FILE') {
        window.state.downloadResource(data.airId, data.fileid, data.filename,data.size);
    }
}

export default actions;