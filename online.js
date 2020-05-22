import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Icon, Switcher, BarButton, Loading } from "./global.js";
import Peer from "./peer.js";
import "./online.css";

class Online extends React.Component {
    constructor(props) {
        super(props);
        this.state = {nearby:[],online:[]}
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
    parseState() {
        window.state.getLocalPeers((_list) => {
            var nearby = [];
            nearby = _list.filter((peer) => {
                return peer.isAdded;
            });
            this.setState({ ...this.state, nearby });
        })
        window.state.getContacts((_list) => {
            var online=[];
            online=_list.filter((peer) => {
                return (peer.sessionId!=null&&peer.sessionId!=undefined);
            });
            this.setState({ ...this.state, online });
        })  
    }
    nearbyList(){
        var list=this.state.nearby;
        if(list.length){
            var html=[];
            list.forEach((peer)=>{
               html.push(<Peer uid={peer.uid}
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
        else{
            return(<div className="center ink-dark base-semilight size-xs">No one's nearby</div>)
        }
    }
    onlineList(){
        var list=this.state.online;
        if(list.length){
            var html=[];
            list.forEach((peer)=>{
               html.push(<Peer uid={peer.uid}
                    host={peer.host}
                    sessionId={peer.sessionId}
                    key={peer.uid + peer.host + peer.sessionId}
                    username={peer.username}
                    devicename={peer.devicename}
                    icon={peer.icon}
                    isAdded={true} />)
            })
            return html;
        }
        else{
            return(<div className="center ink-dark base-semilight size-xs">No one's online</div>)
        }
    }
    render() {
        return (<div id="onl">
            <div className="center handle size-xs ink-dark base-semibold onl_title">Near by</div>
            <div>{this.nearbyList()}</div>
            <br/>
            <div className="center size-xs ink-dark base-semibold onl_title">Online</div>
            <div>{this.onlineList()}</div>
        </div>)
    }
}

export default Online;