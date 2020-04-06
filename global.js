import $ from "jquery";
import React, { Component } from "react";
import Switch from 'react-ios-switch';

import "./global.css"

class BarButton extends React.Component {
    /** @props : openPage, param, preview, setBar
     ** 
     **/
    constructor(props) {
        super(props);
        this.state = {}
    }
    getContent = () => {
        if (this.props.icon != undefined) {
            return (<div className="bar_butt_icon"
                style={{ backgroundImage: 'url(common://icons/' + this.props.icon + '.png)' }}></div>)
        }
    }
    render() {
        var style = {};
        if (this.props.rounded) {
            style.borderRadius = '0.8rem';
        }
        var cls = "center bar_butt";
        if (this.props.selected) {
            cls += ' bar_butt_selected';
        }
        return (
            <div className={cls} style={style} onClick={() => {
                if (this.props.onClick != undefined) {
                    this.props.onClick();
                }
            }}>{this.getContent()}</div>
        )
    }
}
class Loading extends React.Component {
    /** @props : openPage, param, preview, setBar
     ** 
     **/
    constructor(props) {
        super(props);
        var dt = new Date();
        this.state = { id: "spinner" + dt.getTime() }
    }
    componentDidMount() {
        if (this.props.onVisible != undefined) {
            var observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting === true)
                    this.props.onVisible();
            }, { threshold: [1] });

            observer.observe(document.querySelector('#' + this.state.id))
        }
    }
    render() {
        var cls = "ispinner gray animating";
        if (this.props.size == 'l') {
            cls = cls + " large"
        }
        return (
            <div className={cls} id={this.state.id}  >

                <div className="ispinner-blade" key="1" ></div>

                <div className="ispinner-blade" key="2" ></div>

                <div className="ispinner-blade" key="3" ></div>

                <div className="ispinner-blade" key="4" ></div>

                <div className="ispinner-blade" key="5" ></div>

                <div className="ispinner-blade" key="6" ></div>

                <div className="ispinner-blade" key="7" ></div>

                <div className="ispinner-blade" key="8" ></div>

                <div className="ispinner-blade" key="9" ></div>

                <div className="ispinner-blade" key="10" ></div>

                <div className="ispinner-blade" key="11" ></div>

                <div className="ispinner-blade" key="12" ></div>

            </div>

        )
    }
}

class Icon extends React.Component {
    render() {
        return (
            <img src={this.props.src} className={"icon " + this.props.className} style={this.props.style} />
        )
    }
}

Icon.defaultProps = {
    src: "common://icons/TabBar_Favorites.png", style: { background: "transperent" }, className: " "
}

class Switcher extends React.Component {
    /** @props : change, selected
 **/
    constructor(props) {
        super(props);
        this.state = {}
    }
    change = (pg) => {
        if (this.props.selected != pg) {
            this.props.onChange(pg)
        }
    }
    getSwitch = (id, name) => {
        if (id == this.props.selected) {
            return (<div key={id} className="switch center active_switch">{name}</div>)
        }
        else {
            return (<div key={id} className="switch center" onClick={() => { this.change(id) }}>{name}</div>)
        }
    }
    getSwitches=()=>{
        var html=[];
        if(this.props.opts){
           html= Object.keys(this.props.opts).map((opt)=>{
               return this.getSwitch(this.props.opts[opt], opt);
           })
        }
        return html;
    }
    render() {
        return (
            <div className="switches ink-black">
                {this.getSwitches()}
            </div>
        )
    }
}


export { BarButton, Loading, Icon, Switch, Switcher }