import React, {Component} from 'react';
import axios from 'axios';
import Header from './base/header';
import './dashboard.css';

const token=localStorage.getItem('token')
class VaccineData extends Component {

  constructor(props){
    super(props);
    this.state = {
      vaccine:null,
      notfound:null
    }
  }

  componentDidMount() {
    console.log(typeof this.props.match.params.id);
      axios.get(`http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc?args=${this.props.match.params.id}&fcn=GetVaccineById`,{headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'}})
        .then(res => {
          console.log(res.data);
          if (res.data.result === `${this.props.match.params.id} does not exist`) {
            this.setState({notfound:true});
          } else {
            this.setState({vaccine:res.data.result,notfound:false});
          }
        })
        .catch(err => console.log(err))
  }

  render() {
    return (
      <div className="dashboard">
        <Header />
        <div className="content">
        { this.state.notfound === false
          ?
          <>
          <h2>Vaccine Data:</h2>
          <table>
            <thead>
              <th>Vaccine Id</th>
              <th>Manufacturer</th>
              <th>Iot Device</th>
            </thead>
            <tbody>
              <tr>
              <td>{this.state.vaccine.id}</td>
              <td>{this.state.vaccine.manufacturer}</td>
              <td><a href={`/vaccine_temp_location/${this.state.vaccine.t_dev_id}/`}>{this.state.vaccine.t_dev_id}</a></td>
              </tr>
            </tbody>
          </table>
          </>
          :
          <h2>Vaccine {this.props.match.params.id} not found</h2>
        }

        </div>
      </div>
    )
  }
}

export default VaccineData;
