import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Icon, Switcher, BarButton } from "./global.js";
import "./quickPannel.css";

class QuickPannel extends React.Component {
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

    }
    render() {
        return (
            <div id="qp_holder">
                <div></div>
                <div id="qp">
                    <div className="qp_sec">
                    <div className="qp_circle"></div>
                    <div className="qp_circle"></div>
                    <div className="qp_circle"></div>
                    </div>
                    <div className="qp_sec">
                        <div className="qp_circle center" onClick={()=>{
                            window.actions('OPEN_ADDPEER');
                        }} ><Icon src="assets://icons/Control_Add.png"/></div>
                        <div className="qp_circle center" onClick={()=>{
                            window.actions('OPEN_CONTACTS');
                        }} ><Icon src="assets://icons/TabBar_Contacts.png"/></div>
                    </div>
                </div>
            </div>
        )
    }
}

export default QuickPannel;