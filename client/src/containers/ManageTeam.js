import React, { Component } from "react";
import { FormGroup, FormControl, ControlLabel,DropdownButton, MenuItem, ListGroup, ListGroupItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
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
      const availableUsers = await this.getAvailableUsers(allUsers, team);
      this.setState({
        availableUsers,
        team
      });
    } catch(e){
      console.log(e)
    }

  }

  handleAdd = async event => {

    const roles = ["Role", "Developer", "Manager"]

    if(this.state.selected == null){
      alert("No user selected");
      return false;
    }

    if(!roles[this.state.selectedRole].localeCompare("Role")){
      alert("No role provided");
      return false;
    }

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

    this.setState({
       isAdding: false,
       selected: null
      });

      await this.componentDidMount();
      this.render();
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


    if(this.state.removeSelected == null){
      alert("No user selected");
      return false;
    }

    this.setState({ isDeleting: true });

    try {
      await this.deleteMember({userId: this.state.removeSelected.userId});
    } catch (e) {
      alert(e);
    }
    this.setState({
      isDeleting: false,
      removeSelected: null
     });

     await this.componentDidMount();
     this.render();

  }

    handleBack = async event => {
      this.props.history.push("/");
      window.location.assign('/projects/' + this.props.match.params.id);
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
    var newList = [];
    var member = null;

    for(const m of team){
      member = await this.getUserObject(m);
      member.role = m.role;
      newList.push(member)
    }

    return newList;
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
    return  API.get("pma-api", "/users/all");

  }


  getAvailableUsers(users, team){
    var available = users;
    for(const u of available){
      for(const t of team){
          if(!u.userId.localeCompare(t.userId)){
              available.splice(available.indexOf(u), 1);
              break;
          }
      }
    }
    return available;
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



    renderTeamList(team) {
      return [{}].concat(team).map(
        (member, i) =>
          i !== 0 &&
            <LinkContainer
                key={member.userId}
                to={`/users/${member.userId}`}
              >
                <ListGroupItem header={member.firstName + " " + member.lastName + " (" + member.role + ")"}>
                  {"Added: " + new Date(member.addedAt).toLocaleString()}
                </ListGroupItem>
              </LinkContainer>

      );
    }



  renderTeam() {
    return (
      <div className="team">
        <ListGroup>
          {!this.state.isLoading && this.renderTeamList(this.state.team)}
        </ListGroup>
      </div>
    );
  }


  render() {
    const glob = this;
    const roles = ["Role", "Developer", "Manager"]

      return (
        <div className="ManageTeam">
        {this.state.availableUsers &&
          <form>
            <h3> Add a new member </h3>
            <div class="searchAll">
            <Select class="test"
                  name="user"
                  value= {this.state.selected}
                  options={this.constructOptions(this.state.availableUsers)}
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
            <div className="clear"> </div>
            <LoaderButton
              className="back"
              block
              bsStyle="primary"
              bsSize="large"
              text="Back to project"
              onClick={this.handleBack}
              loadingText="Redirecting.."
            />
            <h3> Team </h3>
            {this.state.team &&
              <div>
                { this.renderTeam()}
              </div>}
        </div>
      );
    }
  }
