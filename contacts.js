import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Icon, Switcher, BarButton } from "./global.js";

class Contacts extends React.Component {
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
    parseState(){
        
    }
    render() {
        return (<div className="center">CONTACTS</div>)
    }
}

export default Contacts;