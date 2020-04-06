import $ from "jquery";
import React, { Component } from "react";
import "./recents.css";

class Recents extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    componentDidMount() {
        this.parseState();
        this.unsub = window.state.subscribe(() => {
            this.parseState();
        })
    }
    componentWillUnmount() {
        this.unsub();
    }
    parseState = () => {
        var data = window.state.getState();
        this.setState(this.state);
    }
    render() {
        return (<div>
            <div style={{ height: '3rem' }}></div>
            <div id="re_title" className="size-xl ink-black base-bold">Recents</div>
            <div className="center" style={{ height: '10rem' }}>Chats</div>
        </div>)
    }
}

export default Recents;