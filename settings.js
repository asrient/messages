import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Icon, Switcher, BarButton } from "./global.js";

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = { dp: window.state.DP }
    }
    componentWillUnmount() {
        this.unsub();
    }
    componentDidMount() {
        this.parseState();
        this.unsub = window.state.subscribe(() => {
            this.parseState();
        })
    }
    parseState() {
        var dp = window.state.myIcon();
        this.setState({ ...this.state, dp });
    }
    render() {
        return (<div>
            <div className="ink-black size-xl base-bold"
                style={{ padding: '0.8rem 1rem', backgroundColor: '#ececec', position: 'sticky', top: '0px' }}>
                Settings
                </div>
            <br />
            <div className="center-col">
                <div><Icon style={{ fontSize: '4rem', borderRadius: '100%' }} src={this.state.dp} /></div>
                <div className="ink-blue base-semilight" style={{ padding: '0.3rem', fontSize: '0.9rem' }}>Change</div>
            </div>
        </div>)
    }
}

export default Settings;