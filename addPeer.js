import $ from "jquery";
import React, { Component } from "react";
import "./addPeer.css";
import { Icon, Switcher, BarButton, Loading } from "./global.js";

var crypto = pine.include('crypto');

function code(n = 10) {
    return crypto.randomBytes(n).toString('hex');
}


class Peer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    componentDidMount() {
    }
    getButton() {
        if (this.props.isAdded) {
            return (<div className="pr_actionButton" style={{ backgroundColor: '#007cff' }} onClick={() => {
                if (this.props.uid != undefined && this.props.host != undefined) {
                    var peerId = this.props.uid + ':' + this.props.host 
                    window.actions('OPEN_CHAT', peerId);
                }
            }}>Chat</div>)
        }
        else {
            return (<div className="pr_actionButton" style={{ backgroundColor: '#00c12f' }} onClick={() => {
                if (this.props.uid != undefined && this.props.host != undefined && this.props.sessionId != undefined) {
                    var airId = this.props.uid + ':' + this.props.host + ':' + this.props.sessionId
                    window.actions('ADD_PEER', airId);
                }
            }}>Add</div>)
        }
    }
    render() {
        return (<div className="pr">
            <div className="center"><Icon className="size-m" src="common://icons/QuickActions_Contact.png" /></div>
            <div>
                <div className="ink-black base-semibold size-xs">{this.props.username}</div>
                <div className="ink-dark base-light size-xs" style={{ fontSize: '0.8rem' }}>{this.props.devicename}</div>
            </div>
            <div className="center">{this.getButton()}</div>
        </div>)
    }
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
                    key={peer.uid}
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
        this.state = {}
    }
    componentDidMount() {
    }

    render() {
        return (<div>
            Add By Code
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
                        New message
                        </div>
                    <div className="center">
                        <div className="size-xs ink-red base-semilight" onClick={() => {
                            window.actions('OPEN_RECENTS');
                        }}>Cancel
                      </div>
                    </div>
                </div>
            </div>
            <div style={{ paddingTop: '4.5rem' }}>
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