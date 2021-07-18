import React , {Component} from 'react';
import axios from 'axios';
import Header from './base/header';
import './dashboard.css';

const token = localStorage.getItem('token');


class Vaccinate extends Component {

  constructor(props) {
    super(props);
    this.state ={
      id:'',
      registered:false,
      verified:false,
      vaccinated:false
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleVerify = this.handleVerify.bind(this);
  }

  componentDidMount(){
    this.setState({id:'',registered:null,verified:false,vaccinated:false});
  }


  handleChange(event) {
    switch(event.target.name) {
      case 'id' :
        this.setState({id:event.target.value});
        break;
      default:
        break;
    }
  }

  async checkVerification(id){
    axios.get(`http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc?args=${this.state.id}&fcn=GetRequirementByUsername`,{ headers : {'Authorization':`Bearer ${token}`,'Content-Type':'application/json'}})
      .then(res=> {
        console.log(res);
        if (res.data.result.username === id) {
          console.log("hoho");
          this.setState({registered:true,verified:true,vaccinated:res.data.result.vaccinated});
        } else if (res.data.result == `${this.state.id} does not exist`) {
          this.setState({registered:false,verified:false,vaccinated:false});
        }
      })
      .catch(err => console.log(err));
    return null
  }

  handleVerify(event) {
    event.preventDefault();
    this.checkVerification(event.target.elements.id.value);
  }

  handleVaccinate() {
    const data = {
      fcn:"Vaccinated",
      peers:["peer0.manufacturer.example.com","peer0.distribution.example.com","peer0.med.example.com","peer0.beneficiary.example.com","peer0.iot.example.com"],
      chaincodeName:"vacsup_cc",
      channelName:"mychannel",
      args:this.state.id
    };
      axios.post('http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc',data,{headers: {'Authorization':`Bearer ${token}`,'Content-Type':'application/json'}})
        .then(res => console.log(res))
        .catch(err => console.log(err));
  }

  render() {
    return (
      <div className="dashboard">
      <Header />
      <div className="content">
        <h2>Verify</h2>
        { this.state.verified === false
          ?
          <>
          { this.state.registered === false
            ?
            <h3>{this.state.id} not yet Registered</h3>
            :
            ""
          }
          <form onSubmit={(event) => this.handleVerify(event)}>
            <input type="text" name="id" onChange={this.handleChange}/>
            <button className="submit-button" type="submit">Verify</button>
          </form>
          </>
          :
          <>
          {
            this.state.vaccinated === false
            ?
            <button className="submit-button" type="button" onClick={this.handleVaccinate()}>Vaccinate</button>
            :
            <h3>Already vaccinated</h3>
          }
          </>
        }
      </div>
      </div>
    )
  }
}

export default Vaccinate;
