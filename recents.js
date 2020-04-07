import $ from "jquery";
import React, { Component } from "react";
import "./recents.css";
import { Icon, Switcher, BarButton, Loading } from "./global.js";
import Peer from "./peer.js";

class Recents extends React.Component {
    constructor(props) {
        super(props);
        this.state = {list:null}
    }
    componentDidMount() {
        window.state.loadRecents();
        this.parseState();
        this.unsub = window.state.subscribe(() => {
            this.parseState();
        })
    }
    componentWillUnmount() {
        this.unsub();
    }
    getList = () => {
        if (this.state.list == null) {
            return (<div style={{ height: '12rem', width: '100%' }} className="center"><Loading /></div>)
        }
        else if (!this.state.list.length) {
            return (<div style={{ height: '12rem', width: '100%' }} className="center size-xs ink-dark">Start texting!</div>)
        }
        else {
            var html = [];
            html = this.state.list.map((peer) => {
                return (<Peer uid={peer.uid}
                    host={peer.host}
                    sessionId={peer.sessionId}
                    key={peer.uid+peer.host}
                    username={peer.username}
                    devicename={peer.devicename}
                    icon={peer.icon}
                    isTyping={peer.isTyping}
                    chatStatus={peer.chatStatus}
                    isAdded={true} />)
            })
            return html;
        }
    }
    parseState = () => {
        window.state.getRecents((list) => {
            this.state.list = list;
            this.setState(this.state);
        })
    }
    render() {
        return (<div>
            <div style={{ height: '3rem' }}></div>
            <div id="re_title" className="size-xl ink-black base-bold">Recents</div>
        <div>{this.getList()}</div>
        </div>)
    }
}

export default Recents;