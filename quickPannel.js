import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Icon, Switcher, BarButton } from "./global.js";
import "./quickPannel.css";

class QuickPannel extends React.Component {
    constructor(props) {
        super(props);
        this.state = { recents: [], activePeer: null }
    }
    componentWillUnmount() {
        this.unsub();
    }
    componentDidMount() {
        if (!window.state.getState().recents.init) {
            window.state.loadRecents();
        }
        this.parseState();
        window.state.subscribe(() => {
            this.parseState();
        })
    }
    parseState() {
        var st = window.state.getState();
        var activePeer = null;
        if (st.nav.page == 'chat') {
            activePeer = st.nav.relay;
            //console.log("setting activePeer",activePeer);
        }
        window.state.getRecents((list) => {
            this.setState({ ...this.state, ...{ recents: list, activePeer } });
        })
    }
    showRecents() {
        var list = this.state.recents;
        var html = [];
        list.forEach((peer) => {
            if (html.length < 6) {
                var peerId = peer.uid + ':' + peer.host;
                var cls = "qp_circle center";
                if (this.state.activePeer==peerId){
                    cls+=" qp_circle_active";
                }
                    html.push(<div key={peerId} onClick={() => {
                        //console.log("opening chat",peerId)
                        window.actions('OPEN_CHAT', peerId);
                    }} className={cls}>
                        <Icon src={peer.icon} style={{ height: "max-content" }} />
                    </div>)
            }

        })
        return (<div className="qp_sec">{html}</div>)
    }
    render() {
        return (
            <div id="qp_holder">
                <div></div>
                <div id="qp">
                    {this.showRecents()}
                    <div className="qp_sec">
                        <div className="qp_circle center" onClick={() => {
                            window.actions('OPEN_ADDPEER');
                        }} ><Icon src="assets://icons/Control_Add.png" /></div>
                        <div className="qp_circle center" onClick={() => {
                            window.actions('OPEN_CONTACTS');
                        }} ><Icon src="assets://icons/TabBar_Contacts.png" /></div>
                        <div className="qp_circle center" onClick={() => {
                            window.actions('OPEN_SETTINGS');
                        }} ><Icon src="assets://icons/settings.png" /></div>
                    </div>
                </div>
            </div>
        )
    }
}

export default QuickPannel;