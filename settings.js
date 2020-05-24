import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Icon, Switcher, BarButton, Loading } from "./global.js";

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = { dp: window.state.DP, updates: { isAvailable: false, isDownloaded: false, isChecking: false } }
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
        var st = window.state.getState();
        var updates = st.updates;
        updates.isChecking = false;
        var dp = window.state.myIcon();
        this.setState({ ...this.state, dp, updates });
    }
    showIds() {
        var ids = airPeer.getMyAirIds();
        return (<div className="ink-light size-xs base-light" style={{ textAlign: 'left', padding: '0.5rem' }}>
            <div className="ink-black size-xs base-bold center">AIR ID</div>
            <div><span className="ink-dark base-regular">WEB</span> &nbsp;&nbsp; <span className="text-selectable">{ids.global}</span></div>
            <div><span className="ink-dark base-regular">LOCAL</span> &nbsp;&nbsp;<span className="text-selectable">{ids.local}</span></div>
        </div>)
    }
    changeDp() {
        electron.remote.dialog.showOpenDialog({
            properties: ['openFile'],
            buttonLabel: "Choose",
            filters: [
                { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] },
            ],
            title: "Choose your DP",
            defaultPath: dirs.pictures
        }).then(result => {
            if (!result.canceled) {
                var pth = result.filePaths[0];
                window.state.setMyIcon(pth);
            }
        }).catch(err => {
            console.error(err)
        })
    }
    updatesTab() {
        var opts = () => {
            if (this.state.updates.isChecking) {
                return (<div className="center"><Loading />&nbsp;Checking for updates</div>)
            }
            else {
                if (this.state.updates.isAvailable) {
                    if (this.state.updates.isDownloaded) {
                        return (<div className="center-col">Update downloaded
                            <br />Relaunch the app to install
                            <br />
                            <div><button onClick={() => {
                                window.updates.install();
                            }}>Install</button></div>
                        </div>)
                    }
                    else {
                        return (<div className="center"><Loading />&nbsp;Downloading updates</div>)
                    }
                }
                else {
                    return (<div><button onClick={() => {
                        window.updates.check();
                        var updates=this.state.updates;
                        updates.isChecking=true;
                        this.setState({...this.state,updates})
                    }}>Check for updates</button></div>)
                }
            }
        }
        return (<div className="size-xs base-regular ink-dark">
            <div>Version&nbsp;{VERSION}</div>
            <div>{opts()}</div>
        </div>)
    }
    render() {
        return (<div>
            <div className="ink-black size-xl base-bold"
                style={{ padding: '0.8rem 1rem', backgroundColor: '#ececec', position: 'sticky', top: '0px' }}>
                Settings
                </div>
            <br />
            <div className="center-col">
                <div><Icon style={{ fontSize: '4rem', borderRadius: '100%' }} src={this.state.dp} /></div>
                <div className="ink-blue base-semilight" style={{ padding: '0.3rem', fontSize: '0.9rem' }}
                    onClick={() => { this.changeDp() }}>Change</div>
            </div>
            <br />
            {this.showIds()}
            <br />
            {this.updatesTab()}
        </div>)
    }
}

export default Settings;