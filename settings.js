import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Icon, Switcher, BarButton } from "./global.js";

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
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

    }
    render() {
        return (<div className="center">SETTINGS</div>)
    }
}

export default Settings;