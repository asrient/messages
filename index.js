import $ from "jquery";
import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./styles.css";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

import state from "./state.js";
import actions from "./actions.js";

import Recents from "./recents.js";
import Welcome from "./welcome.js";
import AddPeer from "./AddPeer.js";
import { Icon, Switcher,BarButton } from "./global.js";

window.peers=pine.data.store('peers.json');
window.info = pine.data.dictionary('info.json');
state.init();
window.state = state;
window.actions = actions;

class Nav extends React.Component {
    constructor(props) {
        super(props);
        this.state = { currentPage: 'recents', relayToPage: null }
    }
    componentDidMount() {
        this.parseState();
        window.state.subscribe(() => {
            this.parseState();
        })
    }

    parseState = () => {
        var data = window.state.getState();
        var page = data.nav.page;
        var relay = data.nav.relay;
        this.state.currentPage = page;
        if (relay == undefined) {
            relay = null;
        }
        this.state.relayToPage = relay;
        this.setState(this.state);
    }
    getPage = () => {
        if (this.state.currentPage == 'recents') {
            return (<Recents relay={this.state.relayToPage} />)
        }
        if (this.state.currentPage == 'welcome') {
            return (<Welcome relay={this.state.relayToPage} />)
        }
        if (this.state.currentPage == 'addPeer') {
            return (<AddPeer relay={this.state.relayToPage} />)
        }
        else {
            return (<div className="center" style={{ height: '16rem' }}>🚧</div>)
        }
    }
    getSwitcher = () => {
        if (this.state.currentPage == 'recents' || this.state.currentPage == 'allPeers') {
            return (<div id="home_head">
                <div></div>
                <div id="home_h1">
                    <div className="handle"></div>
                    <div className="center">
                        <Switcher opts={{ 'Recents': 'recents', 'All': 'allPeers' }}
                     selected={this.state.currentPage}
                     onChange={(opt)=>{
                if(opt=='recents'){
                    window.actions('OPEN_RECENTS');
                }
                else{
                    window.actions('OPEN_ALLPEERS');
                }
            }} /></div>
                     <div className="handle"></div> 
                </div>
           
             <div className="center">
                 <BarButton icon="Control_Add" onClick={()=>{
                      window.actions('OPEN_ADDPEER');
                 }} />
             </div>
            </div>)
        }
        else{
            return (<div></div>)
        }
    }
    render() {
        return (
            <div>
                {this.getSwitcher()}
                {this.getPage()}
            </div>
        )
    }
}

ReactDOM.render(
    <div>
        <Nav />
    </div>
    , document.getElementById('root')
);

