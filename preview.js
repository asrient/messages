import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Icon, Switcher, BarButton, Loading } from "./global.js";
import mimeCodes from './mimeCodes.js';

function parseAirId(airId) {
    var ids = airId.split(':');
    return {
        uid: ids[0],
        host: ids[1],
        sessionId: ids[2]
    }
}

class Preview extends React.Component {
    constructor(props) {
        super(props);
        this.state = { filename: null, fileid: null, airId: null, size: null,mime:null }
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
        const st = window.state.getState();
        if (st.window.page == 'preview') {
            this.setState({ ...this.state, ...st.window.relay });
        }
    }
    save(){
        window.actions('SAVE_FILE', { fileid: this.state.fileid, filename:this.state.filename,size:this.state.size, airId: this.state.airId });
        window.actions("CLOSE_WINDOW");
    }
    getSaveButton(){
        const ids=parseAirId(this.state.airId);
        var color = 'blue';//blue
        var canSave=true;
    if (ids.sessionId != undefined) {
        if (ids.sessionId.split('.')[0] == 'local') {
            color = 'purple';//purple
        }
    }
    else{
        canSave=false;
    }
    if(canSave){
        return(<div className={`ink-${color} size-xs base-semilight`} onClick={()=>{
            this.save();
        }} >Download</div>)
    }
    else{
    return(<div>can't save</div>)
    }
    }
    render() {
        if (this.state.fileid == null) {
            return (<div className="center" style={{ height: '5rem' }}><Loading /></div>)
        }
        else {
            const ficon = 'assets://ficons/' + mimeCodes.getFileIconFromMime(this.state.mime);
            const size = prettyBytes(this.state.size || 0);
            return (<div className="center-col" style={{minHeight:'30rem',height:'100%',padding:'1rem'}}>
                <div style={{paddingBottom:'0.6rem'}}><Icon style={{fontSize:'6rem'}} src={ficon}/></div>
                <div style={{maxWidth:'25rem',textOverflow: 'ellipsis',whiteSpace: 'nowrap',overflow: 'hidden'}}>{this.state.filename}</div>
                <div className="size-xs base-semilight">{size}</div>
                <br/>
                <br/>
                {this.getSaveButton()}
                <br/>
            </div>)
        }
    }
}

export default Preview;