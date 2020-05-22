import $ from "jquery";
import TextareaAutosize from 'react-textarea-autosize';
import React, { Component } from "react";
import "./chat.css";
import { Icon, Switcher, BarButton, Loading } from "./global.js";
import addFile from "./addFile.js";
import mimeCodes from './mimeCodes.js';

class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.state = { list: [], text: '', peer: null, me: null, allLoaded: false, listLength: 0, peerId: null };
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
                window.state.loadChat(this.state.peerId, () => {
                    this.isLoading = false;
                });
            }, 20);
        }
    }
    parseState() {
        var st = window.state.getState();
        var state = {};
        state.peerId = st.nav.relay;
        var peerId = st.nav.relay;
        if (peerId != undefined && peerId != null) {
            if (st.chats[peerId] != undefined) {
                state.list = st.chats[peerId].list;
                state.listLength = state.list.length;
                if (state.listLength != this.state.listLength)
                    this.listUpdated = true;
                state.allLoaded = st.chats[peerId].allLoaded;
            }
            else {
                state.list = [];
                state.allLoaded = false;
                state.listLength = 0;
                this.listUpdated = true;
                window.state.initChat(peerId);
            }

            window.state.getPeer(peerId, (peer) => {
                state.peer = peer;
                state.me = st.info;
                this.setState({ ...this.state, ...state });
            })
        }
        // else
        // console.error("Chat parseState: peerId is ",peerId);
    }
    componentDidUpdate(pervProp, prevState) {

        if (prevState.listLength != this.state.listLength) {
            if (this.bottomAnchor) {
                this.scrollToBottom();
            }
        }
    }
    componentDidMount() {
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
    getTextHtml(chat, next) {
        var timeStamp = () => {
            if (next != null) {
                if (Math.abs(next.deliveredOn - chat.deliveredOn) > 30 * 60 * 1000) {
                    var dt = new Date(next.deliveredOn);
                    var str = dt.toDateString();
                    var hrs = dt.getHours();
                    var suff = 'AM'
                    if (hrs > 12) {
                        suff = 'PM';
                        hrs = hrs - 12;
                    }
                    var min = dt.getMinutes();
                    if (min < 10) {
                        min = '0' + min;
                    }
                    str = str.split(' ')[0] + ' ' + str.split(' ')[2] + ' ' + str.split(' ')[1] + ' ' + hrs + ':' + min + ' ' + suff;
                    return (<div className="center base-semilight ink-dark" style={{ fontSize: '0.8rem', paddingBottom: '0.02rem', paddingTop: '0.5rem' }}>
                        {str}</div>)
                }
            }
        }
        var dir = 'flex-start';
        var bgcolor = '#ccc';//light grey
        var txtcolor = 'black';
        var space = '0.7rem';
        var myPeerId = this.state.me.uid + ':' + this.state.me.host;
        if (chat.from == myPeerId) {
            dir = 'flex-end';
            txtcolor = 'white';
            bgcolor = 'linear-gradient(100deg,rgb(0, 184, 255),rgb(0, 78, 255))';//blue
            if (chat.via == 'local') {
                bgcolor = 'linear-gradient(100deg,rgb(228, 0, 255),#9100ff)';//purple
            }
        }
        if (next != null) {
            if (chat.from == next.from) {
                if (Math.abs(next.deliveredOn - chat.deliveredOn) < 60 * 1000) {
                    space = '0.07rem';
                }
            }
        }
        var body = () => {
            if (chat.type == 'text') {
                return (<div className="cht_text base-light" style={{ background: bgcolor, color: txtcolor, marginBottom: space }} >
                    {chat.text}
                </div>)
            }
            else {
                ///////////
                const ficon = 'assets://ficons/' + mimeCodes.getFileIconFromMime(chat.mime);
                const size = prettyBytes(chat.size || 0);
                return (
                    <div className="cht_text cht_file base-light center-col"
                        style={{ background: 'none', marginBottom: space }}>
                        <div
                            onClick={() => {
                                this.openFile(chat.fileid, chat.mime, chat.filename, chat.size)
                            }}>
                            <Icon className="clickable" style={{ fontSize: '4rem' }} src={ficon} />
                        </div>
                        <div className="cht_file_size">{size}</div>
                    </div>)
            }
        }
        return (<div key={chat.key + chat.sentOn}>
            <div className="cht_textHolder" style={{ justifyContent: dir }}>
                {body()}
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
            list.forEach((chat, ind) => {
                var next = list[ind + 1];
                if (next == undefined) {
                    next = null;
                }
                html.push(this.getTextHtml(chat, next));
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
            window.actions('SEND_CHAT', { peerId: this.state.peerId, chat });
            this.bottomAnchor = true;
            this.setState({ ...this.state, text: '' });
        }
    }
    handleSendFile = () => {
        addFile(this.sendFile);
    }
    sendFile = (fid, mime, filename, size) => {
        var chat = {
            filename,
            fileid: fid,
            mime,
            size,
            type: 'file'
        }
        window.actions('SEND_CHAT', { peerId: this.state.peerId, chat });
        this.bottomAnchor = true;
        //this.setState({ ...this.state, text: '' });
    }
    openFile = (fid, mime, filename, size) => {
        console.log("OPENING FILE", fid, mime, filename, size);
        /////////// Show preview window here
        var airId=this.state.peerId;
        if(this.state.peer.sessionId!=null){
            airId+= ':' + this.state.peer.sessionId;
        }
        window.actions('OPEN_PREVIEW', { fileid: fid, filename, size, mime, airId })
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
            var icn = this.state.peer.icon;
            if (icn == null || icn == 'default') {
                icn = window.state.DP;
            }
            return (<div id="cht" onScroll={this.handleScroll}>
                <div id="cht_head">
                    <div className="center" style={{ justifyContent: 'flex-end' }}>
                        <BarButton icon="Control_GoBack" onClick={() => {
                            window.actions('OPEN_RECENTS');
                        }} />
                    </div>
                    <div className="center handle" id="cht_title">
                        <div className="center">
                            <Icon style={{ fontSize: '3.6rem', margin: '0px', borderRadius: '100%' }} src={icn} />
                        </div>
                        <div className="center-col" style={{ alignItems: 'flex-start', paddingLeft: '0.5rem' }}>
                            <div  className="base-regular ink-black size-l">{this.state.peer.username}</div>
                            <div className="base-light size-s ink-dark">{this.state.peer.devicename}</div>
                        </div>

                    </div>
                    <div className="center"><BarButton icon="Preferences_Advanced" onClick={() => {
                        window.state.init2(this.state.peerId, true);
                    }} />
                    </div>
                </div>
                <div id="cht_bdy">
                    <div style={{ height: '6rem' }}></div>
                    <div>{this.getLoader()}</div>
                    {this.showChat()}
                    <div style={{ height: '4rem' }}></div>
                </div>
                <div id="cht_bar">
                    <div className="center">
                        <div className="cht_file_btn center"
                            onClick={() => { this.handleSendFile() }}
                        >
                            <Icon style={{ fontSize: '1.2rem', margin: '0px' }} src="assets://icons/win_finder.png" />
                        </div>
                        &nbsp;
                        <TextareaAutosize autoFocus
                            maxRows={5}
                            placeholder="Message"
                            type="text"
                            className="cht_input"
                            value={this.state.text}
                            onChange={this.change}
                        />
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