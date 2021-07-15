import {Component} from 'react';
import axios from 'axios';
import './Form.css';
import Header from './base/header';

const token = localStorage.getItem('token');

class AddVaccine extends Component {

  constructor(props) {
    super(props);
    this.state = {
      response : {},
    }
  }

  handleSubmit(event) {
      const devid = event.target.elements.devid.value;
      const min_temp = event.target.elements.min_temp.value;
      const max_temp = event.target.elements.max_temp.value;
      const token = localStorage.getItem('token');
      const dt = new Date().toString();
      const data = {
        fcn:"CreateDevice",
        peers:["peer0.manufacturer.example.com","peer0.distribution.example.com","peer0.med.example.com","peer0.beneficiary.example.com","peer0.iot.example.com"],
        chaincodeName:"vacsup_cc",
        channelName:"mychannel",
        args:[devid,min_temp,"0",max_temp,"0","0","0",dt],
      };

      /*const requestOptions = {
        method : 'POST',
        headers : { 'Content-Type':'application/json',
                    'Authorization':`Bearer ${token}`},
        body: {
          fcn:"CreateDevice",
          peers:["peer0.manufacturer.example.com","peer0.distribution.example.com","peer0.med.example.com","peer0.beneficiary.example.com","peer0.iot.example.com"],
          chaincodeName:"vacsup_cc",
          channelName:"mychannel",
          args:[{id:devid,min_temp:min_temp,present_temp:null,max_temp:max_temp,latitude:null,longitude:null,total_lots_watching:null}],
        }
      }
      fetch('http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc', requestOptions)
      .then(res =>this.setState({response : res.data}))
      .catch(err => console.log(err));*/
      axios.post('http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc', data , { headers : { 'Content-Type' : 'application/json','Authorization':`Bearer ${token}`}})
      .then((res) => this.setState({response : res.data}))
      .catch((err) => console.log(err));

      console.log(this.state.response);
  }

  render() {
    return (
      <div className="form-login">
          <Header />
          <form className="login" onSubmit={(event) => this.handleSubmit(event)}>

            <label>
              DeviceID:
              <input type="text" name="devid" />
            </label><br/>

            <label>
              Min_temp:
              <input type="text" name="min_temp" />
            </label><br/>

            <label>
              Max_temp:
              <input type="text" name="max_temp" />
            </label><br/>


            <button className="submit-button" type="submit">ADD</button>
          </form>
      </div>
    );
  }
}

export default AddVaccine;
