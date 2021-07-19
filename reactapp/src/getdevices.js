import React, {Component} from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const token = localStorage.getItem('token');
const apiurl_get = 'http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc?fcn=GetAllDevices';
class GetDevices extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mydevices : []
    }
  };

  componentDidMount(){
    axios.get(apiurl_get,{ headers: {'Authorization':`Bearer ${token}`,'Content-Type':'application/json'}})
      .then(res => {
        this.setState({mydevices: res.data.result});
        console.log("devices"+res.data.result);
        console.log(res);
      })
      .catch(err => console.log(err));
  }

  getDevices =() => {
    var Devices = this.state.mydevices;
    if (Devices == null) return null;
    return Devices.map((item) => (
      <tr>
        <td><a href={`/vaccine_temp_location/${item.Record.id}/`}>{item.Record.id}</a></td>
        <td>{item.Record.min_temp}</td>
        <td>{item.Record.present_temp}</td>
        <td>{item.Record.max_temp}</td>
        <td>{item.Record.latitude}</td>
        <td>{item.Record.longitude}</td>
      </tr>
    ))
  }

  render() {
    return(
      <>
      <h2>Devices</h2><p>*click on the IDs of the respective device to update the location</p>
      <table>
      <thead>
        <th>ID</th>
        <th>Min. Temp.</th>
        <th>Present Temp.</th>
        <th>Max. Temp.</th>
        <th>Latitude</th>
        <th>Longitude</th>
      </thead>
      <tbody>
        {this.getDevices()}
      </tbody>
      </table>
      </>
    )
  }
}
export default GetDevices;
