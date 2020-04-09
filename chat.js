import $ from "jquery";
import TextareaAutosize from 'react-textarea-autosize';
import React, { Component } from "react";
import "./chat.css";
import { Icon, Switcher, BarButton, Loading } from "./global.js";

class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.state = { list: [], text: '', peer: null, me: null, allLoaded: false, listLength: 0 };
        this.isLoading = false;
        this.bottomAnchor = true;
        this.lastScrollHt = 0;
        this.listUpdated = false;
    }
    componentWillUnmount() {
        this.unsub();
    }
    loadMore() {
        if (!this.state.allLoaded && !this.isLoading) {
            //console.warn('loading..',this.state.allLoaded,this.isLoading);
            this.isLoading = true;
            window.setTimeout(() => {
                window.state.loadChat(this.props.relay, () => {
                    this.isLoading = false;
                });
            }, 20);
        }
    }
    parseState() {
        var st = window.state.getState();
        var state = {};
        if (st.chats[this.props.relay] != undefined) {
            state.list = st.chats[this.props.relay].list;
            state.listLength = state.list.length;
            if (state.listLength != this.state.listLength)
                this.listUpdated = true;
            state.allLoaded = st.chats[this.props.relay].allLoaded;
        }
        window.state.getPeer(this.props.relay, (peer) => {
            state.peer = peer;
            state.me = st.info;
            this.setState({ ...this.state, ...state });
        })
    }
    componentDidUpdate(pervProp, prevState) {

        if (prevState.listLength != this.state.listLength) {
            if (this.bottomAnchor) {
                this.scrollToBottom();
            }
        }
    }
    componentDidMount() {
        window.state.initChat(this.props.relay);
        this.parseState();
        this.unsub = window.state.subscribe(() => {
            this.parseState();
        })
    }
    handleScroll = e => {
        if (e.target.scrollTop < 170) {
            this.loadMore();
        }
        let scrollAmt = e.target.scrollTop + e.target.clientHeight;
        // if the user scrolled far enough (<100px to the end)
        if (scrollAmt < e.target.scrollHeight - 250) {
            this.bottomAnchor = false;
            if ((this.lastScrollHt != e.target.scrollHeight) && this.listUpdated) {
                this.listUpdated = true;
                var scrollDiff = e.target.scrollHeight - this.lastScrollHt;
                e.target.scrollTop = e.target.scrollTop + scrollDiff;
            }
        }
        else {
            this.bottomAnchor = true;
        }
        this.lastScrollHt = e.target.scrollHeight;
    }
    scrollToBottom() {
        var txts = document.getElementsByClassName("cht_text");
        if (txts.length) {
            txts[txts.length - 1].scrollIntoView();
        }
    }
    getTextHtml(chat,next) {
        var timeStamp=()=>{
            if(next!=null){
                if(Math.abs(next.deliveredOn-chat.deliveredOn)>30*60*1000){
                    var dt= new Date(next.deliveredOn);
                    var str=dt.toDateString();
                    var hrs=dt.getHours();
                    var suff='AM'
                    if(hrs>12){
                      suff='PM';
                      hrs=hrs-12;
                    }
                    var min=dt.getMinutes();
                    if(min<10){
                        min='0'+min;
                    }
                    str=str.split(' ')[0]+' '+str.split(' ')[2]+' '+str.split(' ')[1]+' '+hrs+':'+min+' '+suff;
                return(<div className="center base-semilight ink-dark" style={{fontSize:'0.8rem',paddingBottom:'0.02rem',paddingTop:'0.5rem'}}>
                    {str}</div>)
                }
            }
        }
        var dir = 'flex-start';
        var bgcolor = '#ccc';//light grey
        var txtcolor = 'black';
        var space='0.7rem';
        var myPeerId=this.state.me.uid + ':' + this.state.me.host;
        if (chat.from == myPeerId) {
            dir = 'flex-end';
            txtcolor = 'white';
            bgcolor = 'linear-gradient(100deg,rgb(0, 184, 255),rgb(0, 78, 255))';//blue
            if (chat.via == 'local') {
                bgcolor = 'linear-gradient(100deg,rgb(228, 0, 255),#9100ff)';//purple
            }
        }
        if(next!=null){
          if (chat.from == next.from) {
           if(Math.abs(next.deliveredOn-chat.deliveredOn)<60*1000){
               space='0.07rem';
           }
        }  
        }
        
        return (<div key={chat.key + chat.sentOn}>
        <div className="cht_textHolder" style={{ justifyContent: dir }}>
            <div className="cht_text base-light" style={{ background: bgcolor, color: txtcolor,marginBottom:space }} >{chat.text}</div>
        </div>
        {timeStamp()}
        </div>)
    }
    showChat() {
        var list = this.state.list;
        var html = [];
        if (!list.length) {
            return (<div className="ink-dark base-regular center" style={{ height: '16rem' }}>No messages</div>)
        }
        else {
            list.forEach((chat,ind) => {
                var next=list[ind+1];
                if(next==undefined){
                    next=null;
                }
                html.push(this.getTextHtml(chat,next));
            })
            return html;
        }
    }
    send = () => {
        var txt = this.state.text.trim();
        var chat = {
            text: txt,
            type: 'text'
        }
        if (txt != '') {
            window.actions('SEND_CHAT', { peerId: this.props.relay, chat });
            this.bottomAnchor = true;
            this.setState({ ...this.state, text: '' });
        }
    }
    change = (event) => {
        var text = event.target.value;
        this.setState({ ...this.state, text });
    }
    showLoading() {
        return (
            <div className="center" style={{ height: '100vh' }}>
                <div id="cht_head">
                    <div></div>
                    <div className="center">
                        <BarButton icon="Control_GoBack" onClick={() => {
                            window.actions('OPEN_RECENTS');
                        }} />
                    </div>
                    <div className="handle"></div>
                </div>
                <div><Loading /></div>
            </div>
        )
    }
    getSendButton() {
        var color = '#007cff';//blue
        if (this.state.peer.sessionId != null) {
            if (this.state.peer.sessionId.split('.')[0] == 'local') {
                color = '#A200FF';//purple
            }
        }
        else {
            color = '#8e8e93';//grey
        }
        return (<div id="cht_sendButt" className="center base-light" onClick={this.send} style={{ backgroundColor: color }}>Send</div>)
    }
    getLoader() {
        if (!this.state.allLoaded) {
            return (<div style={{ height: '3rem' }} className="center"><Loading /></div>)
        }
    }
    render() {
        if (this.state.peer != null) {
            return (<div id="cht" onScroll={this.handleScroll}>
                <div id="cht_head">
                    <div></div>
                    <div className="center" style={{ justifyContent: 'flex-end' }}>
                        <BarButton icon="Control_GoBack" onClick={() => {
                            window.actions('OPEN_RECENTS');
                        }} />
                    </div>
                    <div className="center handle" id="cht_title">
                        <div className="center">
                            <Icon style={{ fontSize: '1.8rem', margin: '0px' }} src={"common://icons/QuickActions_Contact.png"} />
                        </div>
                        <div className="center-col" style={{ alignItems: 'flex-start', paddingLeft: '0.5rem' }}>
                            <div style={{ fontSize: '0.9rem' }} className="base-regular ink-black">{this.state.peer.username}</div>
                            <div className="base-light ink-dark">{this.state.peer.devicename}</div>
                        </div>

                    </div>
                    <div className="handle"></div>
                    <div className="center"><BarButton icon="Preferences_Advanced" /></div>
                    <div className="handle"></div>
                </div>
                <div style={{ height: '6rem' }}></div>
                <div>{this.getLoader()}</div>
                {this.showChat()}
                <div style={{ height: '4rem' }}></div>
                <div id="cht_bar">
                    <div className="center">
                        <TextareaAutosize autoFocus maxRows={5} placeholder="Message" type="text" className="cht_input" value={this.state.text} onChange={this.change} />
            &nbsp;
            {this.getSendButton()}
                    </div>
                </div>

            </div>)
        }
        else {
            return this.showLoading()
        }

    }
}

export default Chat;