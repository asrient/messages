import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Icon, Switcher, BarButton, Loading } from "./global.js";
import Peer from "./peer.js";

class Contacts extends React.Component {
    constructor(props) {
        super(props);
        this.state = { list: null }
    }
    componentWillUnmount() {
        this.unsub();
    }
    componentDidMount() {
        var st = window.state.getState();
        if (!st.contacts.init) {
            window.state.loadContacts();
        }
        this.parseState();
        this.unsub = window.state.subscribe(() => {
            this.parseState();
        })
    }
    parseState = () => {
        window.state.getContacts((list) => {
            this.setState({ ...this.state, list });
        })
    }
    getList = () => {
        if (this.state.list == null) {
            return (<div style={{ height: '12rem', width: '100%' }} className="center"><Loading /></div>)
        }
        else if (!this.state.list.length) {
            return (<div style={{ height: '12rem', width: '100%' }} className="center size-xs ink-dark">Its lonely here.</div>)
        }
        else {
            var html = [];
            html = this.state.list.map((peer) => {
                return (<Peer uid={peer.uid}
                    host={peer.host}
                    sessionId={peer.sessionId}
                    key={peer.uid + peer.host}
                    username={peer.username}
                    devicename={peer.devicename}
                    icon={peer.icon}
                    isAdded={true} />)
            })
            return html;
        }
    }
    render() {
        return (<div>
            <div className="ink-black size-xl base-bold"
             style={{ padding: '0.8rem 1rem', backgroundColor: '#ececec', position: 'sticky', top: '0px' }}>
                Contacts
                </div>
            <div style={{}}>{this.getList()}</div>
        </div>)
    }
}

export default Contacts;