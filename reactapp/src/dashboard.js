import React , {Component} from 'react';
import Header from './base/header';
import axios from 'axios';
import States from './jsondata/states.json';
import GetDevices from './getdevices';
import './dashboard.css';
import GetCertificate from './getcertificate';
import VerifyQrCode from './verifyqrcode';


const token = localStorage.getItem('token');
const apiurl = 'http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc?fcn=GetMyVaccine';
const apiurl_get = 'http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc?fcn=GetAllDevices';
var QRCode = require('qrcode.react');
const sha256 = require('sha256');


class Dashboard extends Component {

  constructor(props) {
    super(props);
    this.state ={
      username : '',
      orgname : '',
      showAddvaccine: false,
      myvaccines:[],
      feedback: null,
      feedbackData:[],
      requirement:null,
      showAdddevice: false,
      registered:null,
      state_t:'Andhra Pradesh',
      district:'',
      phc:'',
      flag:null,
      qrvalue:null
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFeedback = this.handleFeedback.bind(this);
  };

  componentDidMount() {
    console.log(localStorage.getItem('username'));
    this.setState({username:localStorage.getItem('username'), orgname : localStorage.getItem('orgName'),feedback:false,flag:true});
    const apiurl_2 = `http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc?args=${localStorage.getItem('username')}&fcn=GetRequirementByUsername`;
    const apiurl = 'http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc?fcn=GetMyVaccine';

    axios.get(apiurl, { headers : { 'Authorization':`Bearer ${token}`,'Content-Type':'application/json'}})
      .then(res => {
        this.setState({ myvaccines :res.data.result});
        console.log(res.data.result);

        if (localStorage.getItem('orgName') === 'Beneficiary') {
          axios.get(apiurl_2, { headers : { 'Authorization':`Bearer ${token}`,'Content-Type':'application/json'}})
          .then(response => {
            console.log(response);
            if (response.data.result === `${localStorage.getItem('username')} does not exist`) {
              this.setState({registered:false});
            } else this.setState({registered:true,response:response.data.result,requirement:response.data.result,vaccinated:response.data.result.vaccinated});
          })
          .catch(err => console.log(err));
        }
      })
      .catch(err => console.log(err));

    //console.log(this.state.myvaccines);
  }

  addVaccine = () => {
    const a = this.state.showAddvaccine;
    this.setState({showAddvaccine:!a})
  }

  addDevice = () => {
    const a = this.state.showAdddevice;
    this.setState({showAdddevice:!a})
  }

  renderMyVaccines = () => {
    const MyVaccines = this.state.myvaccines;
    if (MyVaccines === null) return null;
    return MyVaccines.map((item) => (
      <tr>
        <td>{item.Record.id}</td>
        <td>{item.Record.name}</td>
        <td>{item.Record.manufacturer}</td>
        <td>{item.Record.owner}</td>
        <td><a href={`/vaccine_temp_location/${item.Record.t_dev_id}/`}>{item.Record.t_dev_id}</a></td>
        <td>{item.Record.count}</td>
      </tr>
    ))
  }

  getstates = () => {
    const South_states = States.states;
    return South_states.map((item) => (
      <option value={item.name}>{item.name}</option>
    ));
  };

  getdistricts = () => {
    const state = this.state.state_t;
    var Districts = [];
    const South_states = States.states;

    South_states.map((item) => (
      item.name === state ? Districts = item.districts : ""
    ));

    return Districts.map((item) => (
      <option value={item.name}>{item.name}</option>
    ));
  }

  getphcs = () => {
    const state = this.state.state_t;
    const district = this.state.district;
    const South_states = States.states;
    var Districts = [];
    var Phcs =[];

    South_states.map((item) => (
      item.name === state ? Districts = item.districts : ""
    ));
    Districts.map((item) => (
      item.name === district ? Phcs = item.phcs : ""
    ));

    return Phcs.map((item) => (
      <option value={item}>{item}</option>
    ));
  }

  async getFeedback() {
    const args = this.state.username+'-feedback';
    const res = await axios.get(`http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc?args=${args}&fcn=GetFeedbackById`,{headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'}});

    if (res.data.result === `${args} does not exist`) {
      this.setState({feedback:false});
    } else {
      this.setState({feedback:true,feedbackData:res.data.result});
    }
    console.log(res);

  }

  progressbar() {
    if (this.state.flag === true) {
      this.getFeedback();
      this.setState({flag:false});
    }
    let width;
    if (!this.state.registered) {
      width = 25;
    } else {
      if (this.state.response.vaccinated) {
        if (this.state.feedback) {
          width = 100;
        } else width=75;
      } else {
        width = 50;
      }
    }
    return (
      <div >
      <div className="progress-bar">
        <div className="progress" style={{width : width + '%'}}>
        </div>
      </div>
      <span style={{padding:120+'px'}}>Begin</span><span style={{padding:120+'px'}}>Registered</span><span style={{padding:120+'px'}}>Vaccinated</span><span style={{paddingLeft:160+'px' }}>Feedback</span>
      </div>
    )
  }

  registerForVaccine = () => {
    return (
      <>
        <h2>Register for vaccine here!!!</h2><p>***provide the same password as provided while logging in to the website</p>
        <form className="update" onSubmit={(event) => this.handleSubmit(event)}>

          <label>
            State:
            <select type="select" name="state_t" onChange={this.handleChange}>
              {this.getstates()}
            </select>
          </label>

          <label>
            District:
            <select type="select" name="district" onChange={this.handleChange}>
              {this.getdistricts()}
            </select>
          </label>

          <label>
            PHC:
            <select type="select" name="phc" onChange={this.handleChange}>
              {this.getphcs()}
            </select>
          </label>



          <button className="submit-button" type="submit">Register</button>
        </form>
      </>
    )
  };

  downloadQR = () => {
    const canvas = document.getElementById("qrcode");
    const pngUrl = canvas.toDataURL("image/png").replace("image/png","image/octe-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "qrcode.png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  handleFeedback(event) {
    event.preventDefault();
    const data = {
      fcn:"CreateFeedback",
      peers:["peer0.manufacturer.example.com","peer0.distribution.example.com","peer0.med.example.com","peer0.beneficiary.example.com","peer0.iot.example.com"],
      chaincodeName:"vacsup_cc",
      channelName:"mychannel",
      args:[this.state.username+'-feedback',this.state.requirement.vaccineId,event.target.elements.message.value]
    };
    axios.post('http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc',data,{headers:{'Authorization': `Bearer ${token}`,'Content-Type':'application/json'}})
      .then(res => console.log(res))
      .catch(err => console.log(err));

  }

  chooseForMyVaccines = () => {
    //this.getFeedback();
    const myorgs = ["Manufacturer","Distribution","Med"];
    if (myorgs.includes(this.state.orgname)) {

      return (
        <>
          <h1>Myvaccines</h1>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Manufacturer</th>
                <th>Owner</th>
                <th>IOT device</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {this.renderMyVaccines()}
            </tbody>
          </table>
        </>
      )

    } else  if (this.state.orgname === 'Beneficiary') {

      if (this.state.registered) {

        if (this.state.vaccinated) {

          if (this.state.feedback) return (
            <>
            <h2>You are Vaccinated with <a href={`/vaccineID/${this.state.requirement.vaccineId}/`}>{this.state.requirement.vaccineId}</a></h2>
            <h3>Feedback : </h3><span>{this.state.feedbackData.message}</span>
            <GetCertificate requirement_data={this.state.requirement}/>
            </>
          )
          else {
            return (
              <>
              <h2>You are Vaccinated with <a href={`/vaccineID/${this.state.requirement.vaccineId}/`}>{this.state.requirement.vaccineId}</a></h2>
              <p>Please fill the form to give the feedback</p>
              <form className="update" onSubmit={(event) => {this.handleFeedback(event)}}>
              <input type="text" name="message"/>&emsp;
              <button type="submit" className="submit-button">Submit</button>
              </form>
              </>
            )
          }
        } else return <><h2>You are already registered!!!</h2></>
//<QRCode id="qrcode" value={this.state.qrvalue} /><a href="#" onClick={this.downloadQR}>download</a>
      } else {

        return <>{this.registerForVaccine()}</>

      }

    } else if (this.state.orgname === 'Iot') {

      return <VerifyQrCode />

    }
  }

  handleChange(event) {
    switch (event.target.name) {
      case 'state_t': {
        this.setState({state_t: event.target.value});
        break;
      }
      case 'district': {
        this.setState({district:event.target.value});
        break;
      }
      case 'phc': {
        this.setState({phc: event.target.value});
      }
    }

  };

  handleSubmit(event) {
    event.preventDefault();

    //const passcode = event.target.elements.passcode.value;
    const data = {
      fcn:"CreateRequirement",
      peers:["peer0.manufacturer.example.com","peer0.distribution.example.com","peer0.med.example.com","peer0.beneficiary.example.com","peer0.iot.example.com"],
      chaincodeName:"vacsup_cc",
      channelName:"mychannel",
      args:[this.state.username, this.state.orgname,event.target.elements.state_t.value, event.target.elements.district.value,event.target.elements.phc.value]
    };

    axios.post('http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc/',data,{ headers: { 'Authorization':`Bearer ${token}`,'Content-Type':'application/json' } })
      .then(res => console.log(res))
      .catch(err => console.log(err));
    //this.setState({qrvalue : sha256(this.state.username + passcode), registered:true });
  }


  render() {
    return (
      <div className="dashboard">
        <Header />
        <div className="content">
        {
          this.state.orgname === 'Beneficiary' ? this.progressbar() : ""
        }
          {this.chooseForMyVaccines()}
        </div>
      </div>
    );
  }
}
/*<label>
  Password:
  <input type="password" name="passcode"/>
</label>*/

export default Dashboard;
