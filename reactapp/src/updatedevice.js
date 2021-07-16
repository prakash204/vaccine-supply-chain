import React , {Component}  from 'react';
import axios from 'axios';
import Header from './base/header';
import './dashboard.css';
import GetHistoryForDevice from './gethistoryfordevice';

const token = localStorage.getItem('token');
class UpdateDevice extends Component {

  constructor(props){
    super(props);
    this.state = {
      temp: null,
      latitude: null,
      longitude: null,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  };

  componentDidMount() {
    const id = this.props.match.params.id;
    const apiurl_get = `http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc?args=${id}&fcn=GetDeviceById`;
    axios.get(apiurl_get,{ headers: {'Authorization':`Bearer ${token}`}})
      .then(res => {
        console.log(res);
        this.setState({temp:res.data.result.present_temp,latitude:res.data.result.Latitude,longitude:res.data.result.Longitude});
      })
      .catch(err => console.log(err));
  }

  handleChange(event) {
    switch (event.target.name) {
      case 'temp':
        this.setState({temp: event.target.value});
        break;
      case 'latitude':
        this.setState({latitude: event.target.value});
        break;
      case 'longitude':
        this.setState({longitude: event.target.value});
        break;
    }
  }

  handleSubmit(event) {
    event.preventDefault();

    const temp = event.target.elements.temp.value;
    const latitude = event.target.elements.latitude.value;
    const longitude = event.target.elements.longitude.value;
    const id = this.props.match.params.id;
    const dt = new Date().toString();
    console.log(this.props.match.params.id)

    const apiurl_post = 'http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc/';
    const data = {
      fcn:"SetTemplocation",
      peers:["peer0.manufacturer.example.com","peer0.distribution.example.com","peer0.med.example.com","peer0.beneficiary.example.com","peer0.iot.example.com"],
      chaincodeName:"vacsup_cc",
      channelName:"mychannel",
      args:[id,temp,latitude,longitude,dt]
    };
    axios.post(apiurl_post,data,{ headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'} })
      .then(res => console.log(res))
      .catch(err => console.log(err));
  }

  render() {
    return(
      <div class="dashboard">
        <Header />
        { localStorage.getItem('orgName') === 'Iot'
        ?
          <>
          <div className="content">
            <h3>Update Device, ID : {this.props.match.params.id}</h3>
            <form className="update" onSubmit={(event) => this.handleSubmit(event)}>
              <label>
                Temp:
                <input type="text" name="temp" value={this.state.temp} onChange={this.handleChange}/>
              </label>

              <label>
                Latitude:
                <input type="text" name="latitude" value={this.state.latitude} onChange={this.handleChange}/>
              </label>

              <label>
                Longitude:
                <input type="text" name="longitude" value={this.state.longitude} onChange={this.handleChange}/>
              </label>

              <button className="submit-button" type="submit">Update</button>
            </form>
          </div>
          <div className="content" style={{marginTop:30+'px'}}>
            <h3>Previous Data</h3>
            <GetHistoryForDevice deviceID={this.props.match.params.id} />
          </div>
          </>
        :

        <div className="content" style={{marginTop:100+'px'}}>
          <h3>Previous Data</h3>
          <GetHistoryForDevice deviceID={this.props.match.params.id} />
        </div>
        
        }

      </div>
    )
  }
}
export default UpdateDevice;
