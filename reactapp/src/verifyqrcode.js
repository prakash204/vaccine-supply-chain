import React ,{Component} from 'react';
import './dashboard.css';
import axios from 'axios';
var CryptoJS = require("crypto-js");
var token = localStorage.getItem('token');

export default class VerifyQrCode extends Component {

  constructor(){
    super();
    this.state = {
      qrtext:null,
      vaccinated:null,
      status:null,
      data:[],
      result:[]
    }
    this.handleChange = this.handleChange.bind(this);
  }

  async handleChange(e) {
    var bytes = CryptoJS.AES.decrypt(e.target.value, 'secret-key-to-encrypt-beneficiary-data');
    var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    console.log(decryptedData);
    this.setState({data:decryptedData});
  }

  async handleVerify(e){
    var res = await axios.post(`http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc?fcn=GetRequirementByUsername&args=${this.state.data.beneficiary}`, { headers : { 'Authorization':`Bearer ${token}`,'Content-Type':'application/json'}})
    console.log(res.data);
    if (res.data.result === this.props.requirement_data) {
      if (res.data.result.vaccinated === true) {
        this.setState({vaccinated:true});
      } else {
        this.setState({vaccinated:false});
      }
    } else {
      this.setState({status:'Invalid QRCode'});
    }
  }

  showVerification() {
    if (this.state.vaccinated=== true){ return (
      <p>Vaccinated</p>
    )} else if (this.state.vaccinated===false) { return (
      <p>Not Vaccinated, Invalid QRcode</p>
    )} else if (this.state.status==='Invalid QRCode') {
      return (
        <p>Invalid QRCode</p>
      )
    }
  }
  async Verify(){
    var res = await axios.post(`http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc?fcn=GetRequirementByUsername&args=${this.state.data.beneficiary}`, { headers : { 'Authorization':`Bearer ${token}`,'Content-Type':'application/json'}})
    console.log(res.data);
    if (res.data.result === this.props.requirement_data) {
      if (res.data.result.vaccinated === true) {
        this.setState({vaccinated:true});
      } else {
        this.setState({vaccinated:false});
      }
    } else {
      this.setState({status:'Invalid QRCode'});
    }
  }


  render ()
  {
    return (
      <>
          <h1>VerifyQrCode</h1>
          <form >
            <input type="text" name="qrcodetext"  onChange={this.handleChange}/>
            <button className="submit-button" type="button" onClick={this.handleVerify}>Verify</button>
          </form>
          {this.showVerification()}

      </>
    )
  }
}
