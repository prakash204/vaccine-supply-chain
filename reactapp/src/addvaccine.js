import {Component} from 'react';
import axios from 'axios';
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
      const vacid = event.target.elements.vacid.value;
      const vacname = event.target.elements.vacname.value;
      const devid = event.target.elements.devid.value;
      const count = event.target.elements.count.value;
      const manufacturer = localStorage.getItem('username');
      const token = localStorage.getItem('token');
      const tym = Math.floor(Date.now() / 1000);

      const data = {
        fcn:"CreateVaccine",
        peers:["peer0.manufacturer.example.com","peer0.distribution.example.com","peer0.med.example.com","peer0.beneficiary.example.com","peer0.iot.example.com"],
        chaincodeName:"vacsup_cc",
        channelName:"mychannel",
        args:[vacid,vacname,manufacturer,manufacturer,count,devid,String(tym)],
      };

      /*const requestOptions = {
        method : 'POST',
        headers : { 'Content-Type':'application/json',
                    'Authorization':`Bearer ${token}`},
        body: {
          fcn:"CreateVaccine",
          peers:["peer0.manufacturer.example.com","peer0.distribution.example.com","peer0.med.example.com","peer0.beneficiary.example.com","peer0.iot.example.com"],
          chaincodeName:"vacsup_cc",
          channelName:"mychannel",
          args:[vacid,vacname,manufacturer,manufacturer,count,devid],
        }
      }
      fetch('http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc', requestOptions)
      .then(res =>this.setState({response : res.data}))
      .catch(err => console.log(err));*/
      axios.post('http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc', data, { headers : { 'Content-Type' : 'application/json','Authorization':`Bearer ${token}`}})
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
              VaccineID:
              <input type="text" name="vacid" />
            </label><br/>
            <label>
              Name:
              <input type="text" name="vacname" />
            </label><br/>
            <label>
              DeviceID:
              <input type="text" name="devid" />
            </label><br/>
            <label>
              Count:
              <input type="text" name="count" />
            </label><br/>

            <button className="submit-button" type="submit">ADD</button>
          </form>
      </div>
    );
  }
}

export default AddVaccine;
