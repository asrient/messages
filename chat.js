import $ from "jquery";
import TextareaAutosize from 'react-textarea-autosize';
import React, { Component } from "react";
import "./chat.css";
import { Icon, Switcher, BarButton,Loading } from "./global.js";

class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.state = { list: [], text: '',peer:null,me:null }
    }
    componentWillUnmount() {
        this.unsub();
    }
    loadMore() {
        var st = window.state.getState();
        if (!st.chats[this.props.relay].allLoaded) {
            window.state.loadChat(this.props.relay);
        }
    }
    parseState() {
        var st = window.state.getState();
        if (st.chats[this.props.relay] != undefined) {
            this.state.list = st.chats[this.props.relay].list;
        }
        window.state.getPeer(this.props.relay,(peer)=>{
            this.state.peer=peer;
            this.state.me=st.info;
            this.setState(this.state);
        })
    }
    componentDidMount() {
        window.state.initChat(this.props.relay);
        this.parseState();
        this.unsub = window.state.subscribe(() => {
            this.parseState();
        })
    }
    getTextHtml(chat){
        var dir='flex-start';
        var bgcolor='#ccc';//light grey
        var txtcolor='black';
        if(chat.from==this.state.me.uid+':'+this.state.me.host){
            dir='flex-end';
            txtcolor='white';
            bgcolor='#007cff';//blue
            if(chat.via=='local'){
                bgcolor='#A200FF';//purple
            }
        }
        return(<div className="cht_textHolder" style={{justifyContent:dir}} key={chat.key+chat.sentOn}>
            <div className="cht_text base-light" style={{background:bgcolor,color:txtcolor}} >{chat.text}</div>
        </div>)
    }
    showChat() {
        var list = this.state.list;
        var html = [];
        if (!list.length) {
            return (<div className="ink-dark base-regular center" style={{ height: '16rem' }}>No messages</div>)
        }
        else {
            list.forEach((chat) => {
                html.push(this.getTextHtml(chat));
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
        if(txt!=''){
        window.actions('SEND_CHAT', { peerId: this.props.relay, chat });
        this.state.text='';
        this.setState(this.state);    
        }
    }
    change = (event) => {
        this.state.text = event.target.value;
        this.setState(this.state);
    }
    showLoading(){
        return(
            <div className="center" style={{height:'100vh'}}>
                <div id="cht_head">
                <div></div>
                <div className="center">
                    <BarButton icon="Control_GoBack" onClick={() => {
                        window.actions('OPEN_RECENTS');
                    }} />  
                </div>
                <div className="handle"></div>
                </div>
                <div><Loading/></div>
            </div>
        )
    }
    getSendButton(){
        var color='#007cff';//blue
        if(this.state.peer.sessionId!=null){
            if(this.state.peer.sessionId.split('.')[0]=='local'){
             color='#A200FF';//purple
            }
         }
         else{
            color='#8e8e93';//grey
         }
        return(<div id="cht_sendButt" className="center base-light" onClick={this.send} style={{backgroundColor:color}}>Send</div>)
    }
    render() {
        if(this.state.peer!=null){
         return (<div id="cht">
            <div id="cht_head">
                <div></div>
                <div className="center" style={{justifyContent:'flex-end'}}>
                    <BarButton icon="Control_GoBack" onClick={() => {
                        window.actions('OPEN_RECENTS');
                    }} />
                </div>
                <div className="center handle" id="cht_title">
                    <div className="center">
                        <Icon style={{fontSize: '1.8rem',margin:'0px'}} src={"common://icons/QuickActions_Contact.png"}/>
                        </div>
                    <div className="center-col" style={{alignItems:'flex-start',paddingLeft:'0.5rem'}}>
                       <div style={{fontSize:'0.9rem'}} className="base-regular ink-black">{this.state.peer.username}</div> 
                   <div className="base-light ink-dark">{this.state.peer.devicename}</div>  
                    </div>
                   
                    </div>
                <div className="handle"></div>
                <div className="center"><BarButton icon="Preferences_Advanced" /></div>
                <div className="handle"></div>
            </div>
            <div style={{ height: '6rem' }}></div>
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
        else{
            return this.showLoading()
        }
        
    }
}

export default Chat;