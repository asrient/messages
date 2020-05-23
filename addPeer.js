import $ from "jquery";
import React, { Component } from "react";
import "./addPeer.css";
import { Icon, Switcher, BarButton, Loading } from "./global.js";
import Peer from "./peer.js";


function code(n = 10) {
    return crypto.randomBytes(n).toString('hex');
}


class Nearby extends React.Component {
    constructor(props) {
        super(props);
        this.state = { list: null }
    }
    parseState = () => {
        window.state.getLocalPeers((list) => {
            this.state.list = list;
            this.setState(this.state);
        })
    }
    componentWillUnmount = () => {
        this.unsub();
    }
    componentDidMount = () => {
        this.parseState();
        this.unsub = window.state.subscribe(() => {
            this.parseState();
        })
    }
    getList = () => {
        if (this.state.list == null) {
            return (<div style={{ height: '6rem', width: '100%' }} className="center"><Loading /></div>)
        }
        else if (!this.state.list.length) {
            return (<div style={{ height: '6rem', width: '100%' }} className="center size-xs ink-dark">No nearby devices found</div>)
        }
        else {
            var html = [];
            html = this.state.list.map((peer) => {
                return (<Peer uid={peer.uid}
                    host={peer.host}
                    sessionId={peer.sessionId}
                    key={peer.uid + peer.host + peer.sessionId}
                    username={peer.username}
                    devicename={peer.devicename}
                    icon={peer.icon}
                    isAdded={peer.isAdded} />)
            })
            return html;
        }
    }
    render() {
        return (<div id="nb">
            <div id="nb_head" className="ink-dark base-light">
                NEARBY
            </div>
            <div>
                {this.getList()}
            </div>
        </div>)
    }
}

class AddByCode extends React.Component {
    constructor(props) {
        super(props);
        this.state = { airId: '', showDoneButton: false, peers: {}, peer: null }
    }
    componentDidMount() {
    }
    done = () => {
        this.state.showDoneButton=false;
        this.state.peer = null;
        this.state.peers = {};
        this.setState(this.state);
        var qids = window.state.parseAirId(this.state.airId);
        window.state.getPeer(qids.uid + ':' + qids.host, (peer) => {
            if (peer == null) {
                window.state.reveal(this.state.airId, (airId, info) => {
                    var ids = window.state.parseAirId(airId);
                    if (ids.uid == this.state.airId.split(':')[0] && ids.host == this.state.airId.split(':')[1]) {
                        this.state.peer = null;
                        this.state.peers[airId] = {
                            uid: ids.uid,
                            host: ids.host,
                            sessionId: ids.sessionId,
                            username: info.username,
                            devicename: info.devicename,
                            icon: info.icon,
                            isAdded: false
                        }
                        this.setState(this.state);
                    }
                    else {
                        console.error("REVEAL airId not same as the one looking for");
                    }
                })
            }
            else {
                this.state.peer = peer;
                this.setState(this.state);
            }
        })

    }
    getList() {
        var html = [];
        if (this.state.peer != null) {
            var peer = this.state.peer;
            return (<div>
                <Peer uid={peer.uid}
                    host={peer.host}
                    sessionId={peer.sessionId}
                    key={peer.uid + peer.host + peer.sessionId}
                    username={peer.username}
                    devicename={peer.devicename}
                    icon={peer.icon}
                    isAdded={true} />
            </div>)
        }
        else {
            Object.keys(this.state.peers).forEach((peerId) => {
                var peer=this.state.peers[peerId];
                html.push(<Peer uid={peer.uid}
                    host={peer.host}
                    sessionId={peer.sessionId}
                    key={peer.uid + peer.host + peer.sessionId}
                    username={peer.username}
                    devicename={peer.devicename}
                    icon={peer.icon}
                    isAdded={false} />)
            })
            if(html.length){
                return html;
            }
            else{
                return(<div></div>)
            }
        }
    }
    change = (event) => {
        this.state.peer = null;
        this.state.peers = {};
        this.state.airId = event.target.value.trim();
        var txt = this.state.airId;
        this.state.showDoneButton = false;
        if (txt.split('').includes(':')) {
            if (txt.split(':')[0].length && txt.split(':')[1].length) {
                this.state.showDoneButton = true;
            }
        }
        this.setState(this.state);
    }
    getDoneButton() {
        if (this.state.showDoneButton) {
            return (<div id="ac_doneHolder"><button onClick={this.done}>Search</button></div>)
        }
    }
    render() {
        return (<div id="ac">
            <div id="ac_head" className="ink-dark base-light">
                ADD CODE
            </div>
            <div className="center">
                <input placeholder="Air ID" type="text" className="wel_input" value={this.state.airId} onChange={this.change} />
            </div>
            {this.getDoneButton()}
            {this.getList()}
        </div>)
    }
}

class AddPeer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    componentDidMount() {
    }
    showIds(){
        var ids=airPeer.getMyAirIds();
        return(<div className="ink-light size-xs base-light" style={{textAlign:'left',padding:'0.5rem'}}>
            <div className="ink-light size-xs base-bold center">Share this code with others</div>
            <div><span className="ink-dark base-regular">WEB</span> &nbsp;&nbsp; <span className="text-selectable">{ids.global}</span></div>
            <div><span className="ink-dark base-regular">LOCAL</span> &nbsp;&nbsp;<span className="text-selectable">{ids.local}</span></div>
        </div>)
    }
    render() {
        return (<div>
            <div id="ap_top">
                <div id="ap_handle">
                    <div></div>
                    <div className="handle"></div>
                </div>
                <div id="ap_head">
                    <div className="handle"></div>
                    <div className="center ink-black base-semibold size-s handle">
                        Add someone
                        </div>
                    <div className="center">
                        <div className="size-xs ink-blue base-semilight" onClick={() => {
                            window.actions('CLOSE_WINDOW');
                        }}>Done
                      </div>
                    </div>
                </div>
            </div>
            <div style={{ textAlign: "left" }}>
                {this.showIds()}
                <div>
                    <Nearby />
                </div>
                <div>
                    <AddByCode />
                </div>
            </div>
        </div>)


    }
}

export default AddPeer;