import React, { Component } from "react";
import { FormGroup, FormControl, ControlLabel,DropdownButton, MenuItem } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import config from "../config";
import { API } from "aws-amplify";
import Select from 'react-select';
import "./ManageTeam.css";



export default class ManageTeam extends React.Component {

  constructor(props) {
    super(props);

    this.file = null;

    this.state = {
      isLoading: null,
      allUsers: null,
      team: null,
      teamUsers: null,
      isDeleting: false,
      isAdding: false,
      selected: null,
      removeSelected: null,
      selectedRole: 0,
      multiple: false
    };
  }



  async componentDidMount() {
    try{
      const teamIds = await this.getTeam();
      const team = await this.getTeamUsers(teamIds)
      const allUsers = await this.getAllUsers();
      this.setState({
        allUsers,
        team
      });
    } catch(e){
      console.log(e)
    }

  }


  handleAdd = async event => {

    const roles = ["Role", "Developer", "Manager"]

    this.setState({ isAdding: true });

    try {
      await this.addMember({
        userId: this.state.selected.userId,
        projectId: this.props.match.params.id,
        role: roles[this.state.selectedRole]
      });
    } catch (e) {
      alert(e);
    }
    alert("Added");

    this.setState({
       isAdding: false,
       selectedRole: 0,
       selected: null
      });
  }

  addMember(member) {
    return API.post("pma-api", `/teams`, {
      body: member
    });
  }

  deleteMember(member) {
    return API.del("pma-api", `/teams/${this.props.match.params.id}`, {
      body: member
    });
  }

  handleRemove = async event => {

    this.setState({ isDeleting: true });

    try {
      await this.deleteMember({userId: this.state.removeSelected.userId});
    } catch (e) {
      alert(e);
    }
    alert("Added");
    this.setState({
      isDeleting: false,
      removeSelected: null
     });
  }


  addMember(link) {
    const newLink = API.post("pma-api", "/teams", {
      body: link
    });

    return newLink;
  }


  getTeam(){
     return API.get("pma-api", `/teams/${this.props.match.params.id}`);
  }

  async getTeamUsers(team){
    var newd = [];
    var member = null;
    var glob = this;

    for(const m of team){
      member = await this.getUserObject(m);
      newd.push(member)
    }

    return newd;
  }

  getUser(userId){
    return API.get("pma-api", `/users/${userId}`);
  }

  async getUserObject(user){
   var res = null;
   await this.getUser(user.userId).then(function(result){
      res = result;
    })
    res.addedAt = user.addedAt;
    res.role = user.role;
    return res;
  }


  getAllUsers(){
    return API.get("pma-api", "/users/all");
  }


  constructOptions(userList){
    var options = [];
    for(const user of userList){
      options.push({value: user.firstName + " " + user.lastName + " (" + user.username + ")", label: user.firstName + " " + user.lastName + " (" + user.username + ")", userId: user.userId});
    }

    return options;
  }


  validateForm() {
    return this.state.content.length > 0;
  }


  render() {
    const glob = this;
    const roles = ["Role", "Developer", "Manager"]

      return (
        <div className="ManageTeam">
        {this.state.allUsers &&
          <form>
            <h3> Add a new member </h3>
            <div class="searchAll">
            <Select class="test"
                  name="user"
                  value= {this.state.selected}
                  options={this.constructOptions(this.state.allUsers)}
                  onChange={val => this.setState({selected: val})}
              />
              </div>
              <div class="role-select">
                <DropdownButton
                 key={0}
                 title={roles[this.state.selectedRole]}
                 id="role"
                 onSelect={function(evt){glob.setState({selectedRole: evt})}}
                 >
                  <MenuItem eventKey={1}>Developer</MenuItem >
                  <MenuItem eventKey={2}>Manager</MenuItem >

                </DropdownButton>
              </div>
              <div class="ldButton">
              <LoaderButton
                block
                bsStyle="primary"
                bsSize="big"
                onClick={function(evt){glob.handleAdd()}}
                isLoading={this.state.isLoading}
                text="Add"
                loadingText="Adding…"
              />
              </div>
            </form>}
            <div class="clear"> </div>
            {this.state.team &&
            <form>
            <h3> Remove a member </h3>
            <div class="searchAll">
            <Select class="test"
                  name="user"
                  value= {this.state.removeSelected}
                  options={this.constructOptions(this.state.team)}
                  onChange={val => this.setState({removeSelected: val})}
              />
              </div>
              <div class="ldButton">
              <LoaderButton
                block
                bsStyle="danger"
                bsSize="big"
                onClick={function(evt){glob.handleRemove()}}
                isLoading={this.state.isLoading}
                text="Remove"
                loadingText="Removing…"
              />
              </div>

            </form>}
        </div>
      );
    }
  }
