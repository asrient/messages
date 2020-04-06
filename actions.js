var crypto = pine.include('crypto');

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
    else if (act == 'ADD_PEER') {
        window.state.init1(data);
    }
}

export default actions;