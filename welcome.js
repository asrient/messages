import $ from "jquery";
import React, { Component } from "react";
import "./welcome.css";
import { Icon, Switcher, BarButton } from "./global.js";


function code(n = 10) {
    return crypto.randomBytes(n).toString('hex');
}

class Welcome extends React.Component {
    constructor(props) {
        super(props);
        this.state = { page: 0, username: '', devicename: '', host: 'airbroker.herokuapp.com',showHost:false }
    }
    componentDidMount() {
    }
    usernameChange = (event) => {
        this.state.username = event.target.value;
        this.setState(this.state);
    }
    devicenameChange = (event) => {
        this.state.devicename = event.target.value;
        this.setState(this.state);
    }
    hostChange = (event) => {
        this.state.host = event.target.value.trim();
        this.setState(this.state);
    }
    getPage1 = () => {
        return (<div id="wel_bdy">
            <div id="wel_head1">
                <div></div>
                <div style={{ paddingTop: '0.5rem' }}><BarButton icon="Control_GoBack" onClick={() => {
                    this.state.page = 0;
                    this.setState(this.state);
                }} /></div>
                <div className="handle center"><Icon src="assets://icon.png" className="size-xl" /></div>
                <div className="handle"></div>
            </div>
            <div style={{ marginTop: '3rem', padding: '1rem' }}>
                <div className="size-xl ink-black base-light center">Welcome</div>
                <div className="center-col" style={{ height: '70vh' }}>
                    <div className="center">
                        <input placeholder="Your name" type="text" className="wel_input" value={this.state.username} onChange={this.usernameChange} />
                    </div>
                    <div className="center">
                        <input placeholder="Device name" type="text" className="wel_input" value={this.state.devicename} onChange={this.devicenameChange} />
                    </div>
                </div>
            </div>
            <div className="center size-s" style={{ height: '15vh', position: 'fixed', bottom: '0px', left: '0px', width: '100%' }}>
                <div className="center ink-white wel_continue" onClick={() => {
                    var st = this.state;
                    st.devicename=st.devicename.trim();
                    st.username=st.username.trim();
                    if(st.devicename.length&&st.username.length){
                        var uid=code();
                        window.state.init0({username:st.username,devicename:st.devicename,host:st.host,uid})
                    }
                }} >
                    Done
                </div>
            </div>
        </div>)
    }
    getHostField=()=>{
        var show=this.state.showHost;
        if(show){
            return(
                <div className="center-col" style={{ height: '20vh' }}>
                    <div className="ink-black base-regular size-xs" onClick={()=>{
                        this.state.showHost=false;
                        this.setState(this.state);
                    }}>Host server</div>
                    <input placeholder="Host domain" type="text" className="wel_input" value={this.state.host} onChange={this.hostChange} />
                </div>
            )

        }
    }
    getHostOpt=()=>{
        if(!this.state.showHost){
          return(<div className="center" style={{height:'2vh'}}>
                   <div className="ink-blue base-semilight size-xs" onClick={()=>{
                        this.state.showHost=true;
                        this.setState(this.state);
                    }}>Configure host server</div>
          </div>)
        }
    }
    render() {
        var bannerHt='78vh';
        if(this.state.showHost){
            bannerHt='60vh';
        }
        if (!this.state.page) {
            return (<div id="wel_bdy">
                <div id="wel_head"><div></div><div className="handle"></div></div>
                <div className="center-col handle" style={{ height: bannerHt}}>
                    <div><Icon className="wel_icon" src="assets://icons/icon-shadow.png" /></div>
                    <div className="size-l ink-black base-light" style={{ paddingTop: '1rem' }}>Messages</div>
                </div>
                {this.getHostOpt()}
                {this.getHostField()}
                <div className="center size-s" style={{ height: '15vh' }}>
                    <div className="center ink-white wel_continue" onClick={() => {
                        var host = this.state.host
                        if (host.length > 2) {
                            if (host.split('.').length >= 2) {
                                this.state.page = 1;
                                this.setState(this.state);
                            }
                        }
                    }} >
                        Continue
                </div>
                </div>
            </div>)
        }
        else {
            return this.getPage1();
        }

    }
}

export default Welcome;