import {Component} from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import Header from './base/header';
import './transfer.css';

class TransferVaccine extends Component {

  constructor(props) {
    super(props);
    this.state= {
      myvaccines: []
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  };

  componentDidMount() {

    const token = localStorage.getItem('token');
    const apiurl = 'http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc?fcn=GetMyVaccine';
    axios.get(apiurl,{ headers: { 'Authorization': `Bearer ${token}`}})
      .then(res => {
        this.setState({myvaccines : res.data.result});
        console.log(res.data.result);
      })
      .catch(err => console.log(err));

  }

  componentWillMount() {
    this.checkedVaccines = new Set();
  }

  renderMyVaccines = () => {
      const MyVaccines = this.state.myvaccines;
      return MyVaccines.map((item) => (
        <tr>
          <td>{item.Record.id}</td>
          <td>{item.Record.name}</td>
          <td>{item.Record.t_dev_id}</td>
          <td>{item.Record.count}</td>
          <td><input type="checkbox" name={item.Record.id} onChange={this.handleChange}/></td>
        </tr>
      ))
  };

  handleChange(event) {
    const name = event.target.name;
    if (this.checkedVaccines.has(name)) {
      this.checkedVaccines.delete(name);
    } else {
      this.checkedVaccines.add(name);
    }
  }

  handleSubmit(event){
    event.preventDefault();


    var args = [];
    const apiurl = "http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc";
    const token = localStorage.getItem('token');
    args.push(event.target.elements.to.value);
    for (const checked of this.checkedVaccines) {
      args.push(checked);
    };
    console.log(args);

    const data = {
      fcn:"UpdateVaccineOwner",
      peers:["peer0.manufacturer.example.com","peer0.distribution.example.com","peer0.med.example.com","peer0.beneficiary.example.com","peer0.iot.example.com"],
      chaincodeName:"vacsup_cc",
      channelName:"mychannel",
      args:args
    };

    axios.post(apiurl , data, {headers : {'Authorization':`Bearer ${token}`, 'Content-Type':'application/json'}})
      .then(res => console.log(res))
      .catch(err => console.log(err));


  }

  render() {
    return (
      <div className="form">
      <Header />
      <form className="transfer" onSubmit={event => this.handleSubmit(event)}>
        <label>
          To :
          <input type="text" name="to" />
        </label>
        <button type="submit">Submit</button>
        <Table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>IOT device</th>
              <th>Count</th>
              <th>ADD</th>
            </tr>
          </thead>
          <tbody>
            {this.renderMyVaccines()}
          </tbody>
        </Table>
      </form>

      </div>
    )
  };
}

export default TransferVaccine;
