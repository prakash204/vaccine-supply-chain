import React , {Component} from 'react';
import axios from 'axios';
import Header from './base/header';

import './home.css';

const token = localStorage.getItem('token');

class GetFeedbacks extends Component {

  constructor(props) {
    super(props);
    this.state = {
      feedbacks : [],
    }
  }

  componentDidMount(){
    if (token !== null) {
      axios.get('http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc?fcn=GetAllFeedbacks',{headers : {'Authorization':`Bearer ${token}`}})
        .then(res => this.setState({feedbacks:res.data.result}))
        .catch(err => console.log(err));
    }
  }


  getFeedbackData () {
    const Feedbacks = this.state.feedbacks;

    return Feedbacks.map((item) => (
      <tr>
        <td>{item.Record.username.substring(0,item.Record.username.length - 10)}</td>
        <td>{item.Record.vaccineId}</td>
        <td>{item.Record.message}</td>
      </tr>
    ))
  }

  render() {
    return (
      <div className="home">
      <Header />
        <div className="home_content">
          <div className="table">
            <table>
              <thead>
                <th>UserId</th>
                <th>Vaccine Id</th>
                <th>Feedback</th>
              </thead>
              <tbody>
                {this.getFeedbackData()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }
}

export default GetFeedbacks;
