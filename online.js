import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Icon, Switcher, BarButton } from "./global.js";
import "./online.css";

class Online extends React.Component {
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
        return (<div id="onl">
            <div id="onl_title" className="center handle size-s ink-dark base-semilight">Online</div>
        </div>)
    }
}

export default Online;