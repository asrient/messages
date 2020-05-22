import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Icon, Switcher, BarButton } from "./global.js";
import AddPeer from "./addPeer.js";
import Settings from "./settings.js";
import Preview from "./preview.js";
import Contacts from "./contacts.js";
import "./window.css";
class Window extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    componentWillUnmount() {
        this.unsub();
    }
    componentDidMount() {
        this.parseState();
        window.state.subscribe(() => {
            this.parseState();
        })
    }
    parseState() {
        var st = window.state.getState();
        this.setState({ ...this.state, ...st.window });
    }
    content() {
        if (this.state.page == 'addPeer') {
            return (<div className="win_sheet"><AddPeer /></div>)
        }
        else if (this.state.page == 'settings') {
            return (<div className="win_sheet"><Settings /></div>)
        }
        else if (this.state.page == 'contacts') {
            return (<div className="win_sheet"><Contacts /></div>)
        }
        else if (this.state.page == 'preview') {
            return (<div className="win_sheet"><Preview /></div>)
        }
    }
    render() {
        if (this.state.page != null) {
            return (
                <div id="win_holder" className="center">
                    <div id="win_bg" onClick={() => {
                        window.actions("CLOSE_WINDOW");
                    }}></div>
                    <div id="win">{this.content()}</div>
                </div>
            )
        }

        else
            return (<div></div>)
    }
}

export default Window;