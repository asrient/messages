import $ from "jquery";
import React, { Component } from "react";
import { Icon, Loading } from "./global.js";

class Peer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    componentDidMount() {
    }
    getButton() {
        if (this.props.isAdded) {
            var color = '#007cff';//blue
            if (this.props.sessionId != null) {
                if (this.props.sessionId.split('.')[0] == 'local') {
                    color = '#A200FF';//purple
                }
            }
            else {
                color = '#8e8e93';//grey
            }
            return (<div className="pr_actionButton" style={{ backgroundColor: color }} onClick={() => {
                if (this.props.uid != undefined && this.props.host != undefined) {
                    var peerId = this.props.uid + ':' + this.props.host
                    window.actions('OPEN_CHAT', peerId);
                }
            }}>Chat</div>)
        }
        else {
            if (this.props.sessionId != null) {
                var color = '#00c12f';//green
                if (this.props.sessionId.split('.')[0] == 'local') {
                    color = 'rgb(255, 195, 0)';//orange
                }
            }
            return (<div className="pr_actionButton" style={{ backgroundColor: color }} onClick={() => {
                if (this.props.uid != undefined && this.props.host != undefined && this.props.sessionId != undefined) {
                    var airId = this.props.uid + ':' + this.props.host + ':' + this.props.sessionId
                    window.actions('ADD_PEER', airId);
                }
            }}>Add</div>)
        }
    }
    getStatus() {
        function html(name) {
            return (<div><Icon style={{ fontSize: '0.8rem' }} src={"assets://icons/" + name + ".png"} />&nbsp;</div>)
        }
        if (this.props.chatStatus != undefined) {
            var status = this.props.chatStatus;
            if (status == 'UNREAD') {
                return (html('unread'))
            }
            else if (status == 'OPENED') {
                return (html('opened'))
            }
            else if (status == 'RECEIVED') {
                return (html('received'))
            }
            else if (status == 'DELIVERED') {
                return (html('delivered'))
            }
            else if (status == 'SAYHI') {
                return (html('sayhi'))
            }
        }
    }
    render() {
        var icn = this.props.icon;
        if (icn == null || icn == 'default') {
            icn = window.state.DP;
        }
        return (<div className="pr">
            <div className="center"><Icon className="size-l" style={{borderRadius:'100%',margin:'0px'}} src={icn} /></div>
            <div>
                <div className="ink-black base-regular size-xs">{this.props.username}</div>
                <div className="ink-dark base-light size-xs" style={{ fontSize: '0.8rem', display: 'flex' }}>
                    {this.getStatus()}
                    {this.props.devicename}
                </div>
            </div>
            <div className="center">{this.getButton()}</div>
        </div>)
    }
}

export default Peer;