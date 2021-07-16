import React, {Component} from 'react';
import axios from 'axios';

const token = localStorage.getItem('token');

export default class GetHistoryForDevice  extends Component {

  constructor(props) {
    super(props);
    this.state = {
      history : []
    }
  }

  componentDidMount() {
    const apiurl = `http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc?args=${this.props.deviceID}&fcn=GetHistoryForDeviceAsset`;
    axios.get(apiurl,{ headers:{ 'Authorization':`Bearer ${token}`,'Content-Type':'application/json' }})
      .then(res => this.setState({history:res.data.result}))
      .catch(err => console.log(err));
  }

  getDeviceHistory=()=>{
    const History = this.state.history;
    return History.map((item) => (
      <tr>
        <td>{item.Value.time}</td>
        <td>{item.Value.present_temp}</td>
        <td>{item.Value.Latitude}</td>
        <td>{item.Value.Longitude}</td>
      </tr>
    ))
  }

  render() {
    return (
      <table>
        <thead>
          <th>Time</th>
          <th>Present Temp.</th>
          <th>Latitude</th>
          <th>Longitude</th>
        </thead>
        <tbody>
          {this.getDeviceHistory()}
        </tbody>
      </table>
    )
  }
}
