import React , {Component} from 'react';
import AddVaccine from './addvaccine';
import AddDevice from './adddevice';
import Header from './base/header';
import './dashboard.css';
import axios from 'axios';
import Table from 'react-bootstrap/Table';

const token = localStorage.getItem('token');
const apiurl = 'http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc?fcn=GetMyVaccine';

class Dashboard extends Component {

  constructor(props) {
    super(props);
    this.state ={
      username : '',
      orgname : '',
      showAddvaccine: false,
      myvaccines:[],
      showAdddevice: false,
    }
  };

  componentDidMount() {
    var data;
    axios.get(apiurl, { headers : { 'Authorization':`Bearer ${token}`,'Content-Type':'application/json'}})
    .then(res => {
      this.setState({ myvaccines :res.data.result});
      console.log(res.data.result);
    })
    .catch(err => console.log(err));
    //console.log(this.state.myvaccines);
    this.setState({username:localStorage.getItem('username'), orgname : localStorage.getItem('orgName')});
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
    return MyVaccines.map((item) => (
      <tr>
        <td>{item.Record.id}</td>
        <td>{item.Record.name}</td>
        <td>{item.Record.manufacturer}</td>
        <td>{item.Record.owner}</td>
        <td>{item.Record.t_dev_id}</td>
        <td>{item.Record.count}</td>
      </tr>
    ))
  }


  render() {
    return (
      <div className="dashboard">
        <Header />
        <div className="content">
          <h1>Myvaccines</h1>
          <Table>
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
          </Table>
        </div>
      </div>
    );
  }
}

export default Dashboard;
