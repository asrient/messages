
function code(n = 5) {
    return crypto.randomBytes(n).toString('hex');
}

function actions(act, data) {
    if (act == 'OPEN_RECENTS') {
        window.state.openPage('recents', data);
    }
    else if (act == 'OPEN_ALLPEERS') {
        window.state.openPage('allPeers', data);
    }
    else if (act == 'OPEN_ADDPEER') {
        window.state.openPage('addPeer', data);
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
}

export default actions;