import { createStore } from 'redux';
import mimeCodes from "./mimeCodes.js";

const dp = "assets://icons/dp.png"

function code(n = 5) {
    return crypto.randomBytes(n).toString('hex');
}

function parseAirId(airId) {
    var ids = airId.split(':');
    return {
        uid: ids[0],
        host: ids[1],
        sessionId: ids[2]
    }
}

const seperator = ";;";
const sepLen = Buffer.byteLength(seperator);

function parseMessage(msg) {
    var buff = Buffer.from(msg);
    var data = {};
    var offset = buff.indexOf(seperator);
    var body = buff.slice(offset + sepLen);
    var head = buff.slice(0, offset).toString();
    var opts = head.split(";");
    data.body = body;
    opts.forEach((opt, ind) => {
        var key = opt.split('=')[0];
        var val = opt.split('=')[1];
        key = key.trim();
        data[key] = val;
    })
    return data;
}

function buildMessage(obj) {
    var sep = ";";
    var msg = "";
    Object.keys(obj).forEach((item) => {
        if (item != 'body') {
            msg += item + "=" + obj[item] + sep;
        }
    })
    msg += sep;
    var buff = Buffer.from(msg);
    if (obj.body != undefined) {
        if (!Buffer.isBuffer(obj.body)) {
            obj.body = Buffer.from(obj.body);
        }
        return Buffer.concat([buff, obj.body])
    }
    else
        return buff;
}

const dynamic = ['sessionId', 'lastPing', 'isTyping'];

function reducers(state = 0, action) {
    switch (action.type) {
        case 'INIT': {
            var st = ({
                version: '1.0',
                instanceCode: code(8),
                nav: { page: 'recents', relay: null },
                window: { page: null, relay: null },
                info: window.info.get(),
                peers: {},
                recents: { init: false, list: [] },
                localPeers: {},
                contacts: { init: false, list: [] },
                chats: {}
            });
            if (st.info.uid == undefined) {
                st.nav = { page: 'welcome', relay: null }
            }
            return st;
        }
        case 'UPDATE': {
            return action.state
        }
        default:
            return state
    }
}

let store = createStore(reducers);

var api = {
    DP: dp,
    getState: store.getState,
    subscribe: store.subscribe,
    parseAirId,
    init: function () {
        store.dispatch({ type: 'INIT' })
        var info = window.info.get();
        if (info.uid != undefined && info.host != undefined) {
            airPeer.start(info.uid, info.host, 'messages', info.username + ':' + info.devicename)
        }
    },
    openPage: function (page, relay) {
        var data = store.getState();
        data.window.page = null;
        data.window.relay = null;
        data.nav.page = page;
        data.nav.relay = relay;
        store.dispatch({ type: 'UPDATE', state: data });
    },
    openWindow: function (page, relay) {
        var data = store.getState();
        data.window.page = page;
        data.window.relay = relay;
        store.dispatch({ type: 'UPDATE', state: data });
    },
    closeWindow: function () {
        var data = store.getState();
        data.window.page = null;
        data.window.relay = null;
        store.dispatch({ type: 'UPDATE', state: data });
    },
    getPeer: function (peerId, cb) {
        var st = store.getState();
        if (st.peers[peerId] != undefined) {
            cb(st.peers[peerId]);
            this.init2(peerId, false, st.peers[peerId]);
        }
        else {
            var id = parseAirId(peerId);
            window.peers.findOne({ uid: id.uid, host: id.host }, (err, peer) => {
                if (peer != null) {
                    peer.sessionId = null;
                    peer.lastPing = 0;
                    peer.isTyping = false;
                    st.peers[peerId] = peer;
                    store.dispatch({ type: 'UPDATE', state: st });
                    cb(peer);
                    this.init2(peerId, false, st.peers[peerId]);
                }
                else {
                    cb(null)
                }
            })
        }
    },
    addPeer: function (peer, cb = function () { }) {
        var peerId = peer.uid + ':' + peer.host;
        this.getPeer(peerId, (exists) => {
            if (exists == null) {
                var rec = {};
                Object.keys(peer).forEach((item) => {
                    if (!dynamic.includes(item)) {
                        rec[item] = peer[item];
                    }
                })
                window.peers.insert(rec, () => {
                    //put it on lists
                    var st = store.getState();
                    st.peers[peerId] = peer;
                    //put it on recents
                    if (st.recents.init) {
                        st.recents.list.splice(0, 0, peerId);
                    }
                    if (st.contacts.init) {
                        //TODO: sort it.
                        st.contacts.list.splice(0, 0, peerId);
                    }
                    store.dispatch({ type: 'UPDATE', state: st });
                    cb(true);
                    this.getIcon(peerId + ':' + peer.sessionId, peer.iconKey);
                })
            }
            else {
                cb(false)
            }
        })
    },
    setMyIcon: function (src) {
        var filename = code(8) + '.png';
        var loc = filesDir + '/dp/' + filename;
        if (!fs.existsSync(filesDir + '/dp')) {
            fs.mkdirSync(filesDir + '/dp', { recursive: true });
        }
        sharp(src).resize({ width: 200, height: 200 }).png().toFile(loc, (err, info) => {
            const fid = resources.register(loc);
            window.info.set('icon', fid);
            var st = store.getState();
            st.info.icon = fid;
            store.dispatch({ type: 'UPDATE', state: st });
            console.log('new DP set!');
            //TODO: delete prev DP
        })
    },
    myIcon: function () {
        var st = store.getState();
        if (st.info.icon == 'default' || st.info.icon == undefined) {
            return dp;
        }
        else {
            return resources.getPath(st.info.icon);
        }
    },
    getIcon: function (airId, iconKey) {
        if (iconKey != 'default') {
            var req = {
                type: 'RESOURCE',
                url: iconKey
            }
            airPeer.request(airId, buildMessage(req), (res) => {
                var data = res.body;
                var filename = code(8) + '.png';
                var pth = filesDir + '/dp/' + filename;
                var url = 'files://dp/' + filename;
                if (!fs.existsSync(filesDir + '/dp')) {
                    fs.mkdirSync(filesDir + '/dp', { recursive: true });
                }
                fs.writeFile(pth, data, (err) => {
                    console.warn("DP updated!", pth, err);
                    this.updatePeer(airId.split(':')[0] + ':' + airId.split(':')[1], { icon: url });
                    //TODO: remove prev icon
                })
            })
        }
        else {
            this.updatePeer(airId.split(':')[0] + ':' + airId.split(':')[1], { icon: dp });
        }
    },
    updatePeer: function (peerId, prop, peerObj) {
        var idObj = parseAirId(peerId);
        var rec = {};
        var getInfo = (cb) => {
            if (peerObj == undefined) {
                this.getPeer(peerId, cb);
            }
            else {
                cb(peerObj);
            }
        }
        var willSave = false;
        var save = (cb) => {
            if (willSave) {
                //console.log("saving..");
                window.peers.update({ uid: idObj.uid, host: idObj.host }, { $set: rec }, {}, () => {
                    cb();
                })
            }
            else {
                //console.warn("not saving");
                cb();
            }
        }
        getInfo((peer) => {
            Object.keys(peer).forEach((key) => {
                var changed = false;
                if (prop[key] != undefined) {
                    if (peer[key] != prop[key]) {
                        changed = true;
                    }
                    peer[key] = prop[key];
                }
                if (!dynamic.includes(key)) {
                    rec[key] = peer[key];
                    if (prop[key] != undefined && changed) {
                        willSave = true;
                        //console.log("will save for", key);
                    }
                }
            })
            save(() => {
                var st = store.getState();
                st.peers[peerId] = peer;
                if (prop.lastContact != undefined) {
                    //need to update recents;
                    if (st.recents.init) {
                        var removeInd = st.recents.list.findIndex((id) => {
                            return id == peerId;
                        })
                        if (removeInd >= 0) {
                            st.recents.list.splice(removeInd, 1);
                        }
                        st.recents.list.splice(0, 0, peerId);
                    }
                }
                store.dispatch({ type: 'UPDATE', state: st });
            })
        })
    },
    loadContacts: function () {
        var list = [];
        window.peers.find({}).sort({ name: 1 }).limit(500).exec((err, recs) => {
            recs.forEach((rec) => {
                var peerId = rec.uid + ':' + rec.host;
                var exists = list.includes(peerId);
                if (!exists) {
                    list.push(peerId);
                }
            })
            var st = store.getState();
            st.contacts.init = true;
            st.contacts.list = list;
            store.dispatch({ type: 'UPDATE', state: st });
        })
    },
    getContacts: function (cb) {
        var st = store.getState();
        var len = st.contacts.list.length;
        var list = [];
        st.contacts.list.forEach((peerId, ind) => {
            this.getPeer(peerId, (peer) => {
                if (peer != null) {
                    list.push(peer);
                }
                if (ind >= (len - 1)) {
                    cb(list);
                }
            })
        })
        if (!len) {
            cb([]);
        }
    },
    loadRecents: function () {
        var list = [];
        window.peers.find({}).sort({ lastContact: -1 }).limit(50).exec((err, recs) => {
            recs.forEach((rec) => {
                var peerId = rec.uid + ':' + rec.host;
                var exists = list.includes(peerId);
                if (!exists) {
                    list.push(peerId);
                }
            })
            var st = store.getState();
            st.recents.init = true;
            st.recents.list = list;
            store.dispatch({ type: 'UPDATE', state: st });
        })
    },
    getRecents: function (cb) {
        var st = store.getState();
        var len = st.recents.list.length;
        var list = [];
        st.recents.list.forEach((peerId, ind) => {
            this.getPeer(peerId, (peer) => {
                if (peer != null) {
                    list.push(peer);
                }
                if (ind >= (len - 1)) {
                    cb(list);
                }
            })
        })
        if (!len) {
            cb([]);
        }
    },
    init0: function (dat) {
        if (dat.icon == undefined) {
            dat.icon = 'default'
        }
        if (dat.username == undefined) {
            dat.username = 'user'
        }
        if (dat.devicename == undefined) {
            dat.devicename = 'device'
        }
        window.info.set('uid', dat.uid);
        window.info.set('host', dat.host);
        window.info.set('username', dat.username);
        window.info.set('devicename', dat.devicename);
        window.info.set('icon', dat.icon);
        store.dispatch({ type: 'INIT' });
        if (dat.uid != undefined && dat.host != undefined) {
            airPeer.start(dat.uid, dat.host, 'messages', dat.username + ':' + dat.devicename)
        }
    },
    init1: function (airId) {
        console.log("REQUESTING INIT1...");
        var secret = code();
        var uid = airId.split(':')[0];
        var host = airId.split(':')[1];
        var sessionId = airId.split(':')[2];
        window.peers.findOne({ uid, host }, (err, rec) => {
            if (rec == null) {
                var st = store.getState();
                var req = {
                    type: 'INIT1',
                    username: st.info.username,
                    devicename: st.info.devicename,
                    icon: st.info.icon,
                    instanceCode: st.info.instanceCode,
                    secret
                };
                airPeer.request(airId, buildMessage(req), (ress) => {
                    var res = parseMessage(ress.body);
                    var dt = new Date;
                    var time = dt.getTime();
                    var peer = {
                        uid,
                        host,
                        secret,
                        username: res.devicename,
                        devicename: res.devicename,
                        iconKey: res.icon,
                        icon: dp,
                        chatStatus: 'SAYHI',
                        sessionId,
                        isTyping: false,
                        addedOn: time,
                        lastPing: time,
                        lastContact: time,
                        lastRead: 0
                    }
                    this.addPeer(peer);
                })
            }
            else {
                console.error("INIT1 blocked, peer already exists.");
            }
        })
    },
    handleInit1: function (airId, req, respond) {
        console.log("HANDLING INIT1 REQUEST");
        var idObj = parseAirId(airId);
        window.peers.findOne({ uid: idObj.uid, host: idObj.host }, (err, rec) => {
            if (rec == null) {
                var dt = new Date;
                var time = dt.getTime();
                var peer = {
                    uid: idObj.uid,
                    host: idObj.host,
                    secret: req.secret,
                    username: req.devicename,
                    devicename: req.devicename,
                    iconKey: req.icon,
                    icon: dp,
                    chatStatus: 'SAYHI',
                    sessionId: idObj.sessionId,
                    isTyping: false,
                    addedOn: time,
                    lastPing: time,
                    lastContact: time,
                    lastRead: 0
                }
                this.addPeer(peer);
                var st = store.getState();
                var reply = {
                    username: st.info.username,
                    devicename: st.info.devicename,
                    icon: st.info.icon,
                    instanceCode: st.info.instanceCode
                }
                respond(200, buildMessage(reply));
            }
            else {
                console.error("handle INIT1 blocked, peer already exists.");
            }
        })
    },
    init2: function (peerId, force = false, peerObj = null, onlySessionId = null) {
        var getInfo = (cb) => {
            if (peerObj == null) {
                this.getPeer(peerId, cb);
            }
            else {
                cb(peerObj);
            }
        }
        getInfo((peer) => {
            var dt = new Date;
            var time = dt.getTime();
            if (peer != null) {
                if ((peer.lastPing + 1000 * 60 * 1.5) < time) {
                    //Its about 5 mins since we got auth.. consider the peer offline
                    this.updatePeer(peerId, { sessionId: null, lastPing: time }, peer);
                }
                if (((peer.lastPing + 1000 * 40) < time) || force || peer.sessionId == null) {
                    var secret = peer.secret;
                    var data = code();
                    var enc = data;//
                    //encrypt here
                    var reqId = peerId;
                    if (onlySessionId != null) {
                        reqId += ':' + onlySessionId;
                    }
                    airPeer.request(reqId, buildMessage({ type: 'INIT2', encdata: enc }), (ress) => {
                        if (ress.status == 200) {
                            var res = parseMessage(ress.body);
                            var airId = ress.from;
                            var sessionId = ress.from.split(':')[2];
                            var dec = res.decdata;//
                            //decrypt here
                            if (dec == data) {
                                //authorized!
                                dt = new Date;
                                time = dt.getTime();
                                var update = { sessionId, lastPing: time }
                                if (res.devicename != undefined) {
                                    update.devicename = res.devicename;
                                }
                                if (res.username != undefined) {
                                    update.username = res.username;
                                }
                                if (res.icon != undefined) {
                                    update.iconKey = res.icon;
                                    if (peer.iconKey != res.icon) {
                                        //get icon nd update recs later
                                        console.warn("getting icon", peer.iconKey, res.icon);
                                        this.getIcon(airId, res.icon);
                                    }
                                }
                                this.updatePeer(peerId, update, peer);
                            }
                            else {
                                console.error("INIT2 BLOCKED: hash did not match!");
                            }
                        }
                        //TODO: If it keeps unauthorizing.. find a way to UNINIT1 the peer
                    })
                }
                else {
                    //console.log("skipping INIT2..");
                }
            }
            else {
                console.error("Cannot INIT2: peerId not in records.")
            }
        })
    },
    handleInit2: function (airId, encdata, respond) {
        var peerId = airId.split(':')[0] + ':' + airId.split(':')[1];
        var sessionId = airId.split(':')[2];
        this.getPeer(peerId, (peer) => {
            if (peer != null) {
                var prev = null;
                if (peer.sessionId != null) {
                    prev = peer.sessionId.split('.')[0]
                }
                var next = sessionId.split('.')[0];
                var dt = new Date();
                var timeDiff = dt.getTime() - peer.lastPing;
                var willDo = true;
                if (next != 'local' && prev == 'local') {
                    if (timeDiff < 12 * 1000) {
                        willDo = false;
                        //console.error("Not handling INIT2 cuz req sessionId is global nd time diff is short");
                    }
                }
                if (willDo) {
                    var secret = peer.secret;
                    //decrypt data here;
                    var dec = encdata;//
                    var st = store.getState();
                    respond(200, buildMessage({
                        decdata: dec,
                        devicename: st.info.devicename,
                        username: st.info.username,
                        icon: st.info.icon
                    }));
                    if (peer.sessionId != sessionId) {
                        this.init2(peerId, true, peer, sessionId);
                        //console.log("handle INIT2: new sessionId, force INIT2 ing..");
                    }
                }
                else {
                    respond(300, buildMessage({ decdata: 'none' }));
                }
            }
            else {
                respond(300, buildMessage({ decdata: 'none' }));
                console.error("Failed to respond to INIT2: peer not found.");
            }
        })
    },
    reveal: function (airId, cb) {
        airPeer.request(airId, buildMessage({ type: 'reveal' }), (ress) => {
            var res = parseMessage(ress.body);
            cb(ress.from, res);
        })
    },
    addLocalPeer: function (peer) {
        var airId = peer.uid + ':' + peer.host + ':' + peer.sessionId;
        this.init2(peer.uid + ':' + peer.host);
        var st = store.getState();
        if (airId != airPeer.getMyAirIds().local) {
            st.localPeers[airId] = {
                username: peer.name.split(':')[0],
                devicename: peer.name.split(':')[1],
                uid: peer.uid,
                host: peer.host,
                sessionId: peer.sessionId,
                icon: peer.icon
            }
            store.dispatch({ type: 'UPDATE', state: st });
        }
    },
    removeLocalPeer: function (peer) {
        var airId = peer.uid + ':' + peer.host + ':' + peer.sessionId;
        this.init2(peer.uid + ':' + peer.host);
        var st = store.getState();
        delete st.localPeers[airId];
        store.dispatch({ type: 'UPDATE', state: st });
    },
    getLocalPeers: function (cb) {
        var st = store.getState();
        var list = [];
        var len = Object.keys(st.localPeers).length;
        var counter = 0;
        Object.keys(st.localPeers).forEach((airId) => {
            var ids = parseAirId(airId);
            this.getPeer(ids.uid + ':' + ids.host, (peer) => {
                var data = {
                    uid: st.localPeers[airId].uid,
                    host: st.localPeers[airId].host,
                    sessionId: st.localPeers[airId].sessionId,
                    icon: st.localPeers[airId].icon,
                    username: st.localPeers[airId].username,
                    devicename: st.localPeers[airId].devicename,
                    isAdded: true
                }
                if (peer == null) {
                    //new unknown device
                    data.isAdded = false;
                }
                else {
                    data.icon = peer.icon;
                }
                list.push(data);
                counter++;
                if (counter >= len) {
                    cb(list);
                }
            })
        })
        if (!len) {
            cb([]);
        }
    },
    initChat: function (peerId, cb = function () { }) {
        var st = store.getState();
        if (st.chats[peerId] == undefined) {
            var dt = new Date();
            var time = dt.getTime();
            st.chats[peerId] = { upto: time, allLoaded: false, skip: 0, list: [] };
            store.dispatch({ type: 'UPDATE', state: st });
            this.loadChat(peerId, cb);
        }
    },
    loadChat: function (peerId, cb = function () { }) {
        var st = store.getState();
        var chat = st.chats[peerId];
        if (chats != undefined) {
            window.chats.find({ peerId, deliveredOn: { '$lt': chat.upto } }).skip(chat.skip).sort({ sentOn: -1 }).limit(15).exec((err, recs) => {
                if (recs != null) {
                    st = store.getState();
                    recs.reverse();
                    if (st.chats[peerId].skip == chat.skip) {
                        var list = recs.concat(st.chats[peerId].list);
                        st.chats[peerId].skip = chat.skip + recs.length;
                        console.log('next skip', st.chats[peerId].skip);
                        st.chats[peerId].list = list;
                        if (!recs.length) {
                            st.chats[peerId].allLoaded = true;
                        }
                        store.dispatch({ type: 'UPDATE', state: st });
                        cb();
                    }
                    else {
                        console.error("LOADCHAT: list updated before completion");
                    }
                }
            })
        }
    },
    logChat: function (peerId, chat) {
        var st = store.getState();
        chat.peerId = peerId;
        chat.key = code(10);
        if (st.chats[peerId] != undefined) {
            st.chats[peerId].list.push(chat);
        }
        window.chats.insert(chat);
        store.dispatch({ type: 'UPDATE', state: st });
    },
    sendChat: function (peerId, chat) {
        this.getPeer(peerId, (peer) => {
            if (peer != null) {
                if (peer.sessionId != null) {
                    var dt = new Date();
                    var time = dt.getTime();
                    chat.sentOn = time;
                    var airId = peerId + ':' + peer.sessionId;
                    airPeer.request(airId, buildMessage({ type: 'CHAT', chat: JSON.stringify(chat) }), (res) => {
                        if (res.status == 200) {
                            var ress = parseMessage(res.body);
                            chat.via = 'web';
                            if (peer.sessionId.split('.')[0] == 'local') {
                                chat.via = 'local';
                            }
                            if (ress.isRead == 'true') {
                                ress.isRead = true;
                            }
                            else
                                ress.isRead = false;
                            chat.isDelivered = true;
                            var chatStatus = 'DELIVERED';
                            chat.deliveredOn = parseInt(ress.deliveredOn);
                            if (ress.isRead) {
                                chatStatus = 'OPENED';
                            }
                            var st = store.getState();
                            chat.from = st.info.uid + ':' + st.info.host;
                            chat.to = peerId;
                            //console.log('chat sent!',chat,ress);
                            this.logChat(peerId, chat);
                            dt = new Date();
                            time = dt.getTime();
                            var update = { chatStatus, lastContact: time, lastPing: time }
                            if (ress.isRead) {
                                update.lastRead = time;
                            }
                            this.updatePeer(peerId, update, peer);
                        }
                        else {
                            console.error("chat: got wrong status code");
                        }
                    })
                }
                else {
                    console.error("Cant send chat: sessionId is not known");
                    //TODO: show an Alert that peer is offline
                }
            }
            else {
                console.error("Cant send chat: unknown peerId");
            }
        })
    },
    receiveChat: function (airId, chat, respond) {
        chat = JSON.parse(chat);
        var ids = parseAirId(airId);
        var peerId = ids.uid + ':' + ids.host;
        var sessionId = ids.sessionId;
        this.getPeer(peerId, (peer) => {
            if (peer != null) {
                if (peer.sessionId != null) {
                    var dt = new Date();
                    var time = dt.getTime();
                    if (ids.sessionId == peer.sessionId) {
                        chat.via = 'web';
                        if (peer.sessionId.split('.')[0] == 'local') {
                            chat.via = 'local';
                        }
                        var ress = {};
                        chat.isDelivered = true;
                        var chatStatus = 'UNREAD';
                        ress.deliveredOn = time;
                        chat.deliveredOn = time;
                        var st = store.getState();
                        if (st.nav.page == 'chat' && st.nav.relay == peerId) {
                            ress.isRead = true;
                            chatStatus = 'RECEIVED';
                        }
                        chat.to = st.info.uid + ':' + st.info.host;
                        chat.from = peerId;
                        //console.log('chat received..',chat);
                        //console.log('chat receive response',ress);
                        respond(200, buildMessage(ress));
                        this.logChat(peerId, chat);
                        dt = new Date();
                        time = dt.getTime();
                        var update = { chatStatus, lastContact: time, lastPing: time }
                        if (ress.isRead) {
                            update.lastRead = time;
                        }
                        this.updatePeer(peerId, update, peer);
                    }
                    else {
                        console.error("received chat: unauthorized sessionId");
                        respond(300, 'UNAUTHORIZED');
                        this.init2(peerId, true, peer, sessionId);
                    }
                }
                else {
                    console.error("Cant receive chat: sessionId is not known");
                    respond(300, 'INIT2 REQUIRED');
                    this.init2(peerId, true, peer, sessionId);
                }
            }
            else {
                console.error("Cant receive chat: unknown peerId");
                respond(300, 'INIT1 REQUIRED');
            }
        })
    },
    getResource: function (airId, fid, cb) {
        var req = {
            type: 'RESOURCE',
            url: fid
        }
        airPeer.request(airId, buildMessage(req), (res) => {
            var data = res.body;
            if (res.status >= 200 && res.status <= 300) {
                const mime = mimeCodes.getMimeByCode(res.status);
                cb(mime, data);
            }
            else {
                cb(null);
            }
        })
    },
    downloadResource: function (airId, fid, filename, size) {
        //////// show save dialog here
        electron.remote.dialog.showSaveDialog({
            properties: ['createDirectory'],
            buttonLabel: "SAVE",
            title: "Save file",
            defaultPath: dirs.desktop + '/' + filename
        })
            .then(result => {
                if (!result.canceled) {
                    const pth = result.filePath;
                    this.getResource(airId, fid, (mime, data) => {
                        if (mime != null && mime != undefined) {
                            fs.writeFile(pth, data, (e) => {
                                console.log("FILE DOWNLOADED!", e);
                            })
                        }
                    })
                }
            })
            .catch(err => {
                console.error(err)
            })
    },
    resourceHandler: function (airId, pth, respond) {
        var loc = resources.getPath(pth);
        if (loc == null) {
            respond(404, "Not Found");
        }
        else {
            fs.readFile(loc, (err, data) => {
                if (data != null) {
                    respond(200, data);
                }
            })
        }
    }
}

airPeer.on('request', (req) => {
    var data = parseMessage(req.body);
    if (data.type == 'reveal') {
        var st = store.getState();
        var reply = {
            username: st.info.username,
            devicename: st.info.devicename,
            icon: st.info.icon,
            instanceCode: st.info.instanceCode
        }
        req.respond(200, buildMessage(reply));
    }
    else if (data.type == 'INIT1') {
        api.handleInit1(req.from, data, req.respond);
    }
    else if (data.type == 'INIT2') {
        api.handleInit2(req.from, data.encdata, req.respond);
    }
    else if (data.type == 'CHAT') {
        api.receiveChat(req.from, data.chat, req.respond);
    }
    else if (data.type == 'RESOURCE') {
        api.resourceHandler(req.from, data.url, req.respond);
    }
})

airPeer.on('connection', (airId) => {
    airId = parseAirId(airId);
    var data = store.getState();
    data.info.sessionId = airId.sessionId;
    store.dispatch({ type: 'UPDATE', state: data });
})

airPeer.on('localPeerFound', (peer) => {
    if (peer.app == 'messages')
        api.addLocalPeer(peer);
})

airPeer.on('localPeerRemoved', (peer) => {
    if (peer.app == 'messages')
        api.removeLocalPeer(peer);
})

export default api;