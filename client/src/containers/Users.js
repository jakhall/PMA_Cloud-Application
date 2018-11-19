import React, { Component } from "react";
import { API, Storage, Auth } from "aws-amplify";
import { FormGroup, FormControl, ControlLabel, PageHeader, ListGroup, ListGroupItem } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import { LinkContainer } from "react-router-bootstrap";
import { Link } from "react-router-dom";
import config from "../config";
import "./Users.css";



export default class projects extends Component {
  constructor(props) {
    super(props);

    this.file = null;

    this.state = {
      isLoading: null,
      isDeleting: null,
      isReady: null,
      projects: null,
      user: null,
      team: null,
      currentUser: null,
      sessionId: null,
      content: "",
      attachmentURL: null
    };
  }

  async componentDidMount() {


    try {

      const teamIds = await this.team();
      const projects = await this.projects();
      const user = await this.getUser();
      const { id } = await Auth.currentUserInfo();
      const currentUser = await this.getCurrentUser(id);
      const sessionId = id;


      this.setState({
        projects,
        currentUser,
        user,
        sessionId
     });

     this.state.isReady = true;

    } catch (e) {
      alert(e);
    }

  }


  getCurrentUser(userId){
    return API.get("pma-api", `/users/${userId}`);
  }


  projects() {
    return API.get("pma-api", `/projects/list/${this.props.match.params.id}`);
  }

  team() {
    return API.get("pma-api", `/teams/${this.props.match.params.id}`);
  }

  formatFilename(str) {
    return str.replace(/^\w+-/, "");
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleFileChange = event => {
    this.file = event.target.files[0];
  }

  saveUser(user) {
    return API.put("pma-api", `/users/${this.props.match.params.id}`, {
      body: user
    });
  }

  handleSubmit = async event => {
    let attachment;

    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      await this.saveUser({
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        bio: this.state.bio,
        skills: this.state.skills
      });
      this.props.history.push("/");
    } catch (e) {
      alert(e);
      this.setState({ isLoading: false });
    }
  }


  getUser(userId){
    return API.get("pma-api", `/users/${this.props.match.params.id}`);
  }

  deleteUser() {
    return API.del("pma-api", `/users/${this.props.match.params.id}`);
  }

    handleEdit = async event => {
      this.props.history.push("/");
      window.location.assign('/users/' + this.props.match.params.id  + '/edit');
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


  async getAssociatedProjects(){
    var newd = [];
    var member = null;
    var glob = this;

    for(const m of newd){
      member = await this.getUserObject(m);
      newd.push(member)
    }

    return newd;
  }

  renderprojectsList(projects) {
    return [{}].concat(projects).map(
      (project, i) =>
        i !== 0
          ? <LinkContainer
              key={project.projectId}
              to={`/projects/${project.projectId}`}
            >
              <ListGroupItem header={project.title.trim().split("\n")[0]}>
                {"Created: " + new Date(project.createdAt).toLocaleString()}
              </ListGroupItem>
            </LinkContainer>
          :  (!this.state.sessionId.localeCompare(this.state.user.userId)) &&

            <LinkContainer
              key="new"
              to="/projects/new"
            >
              <ListGroupItem>
                <h4>
                  <b>{"\uFF0B"}</b> Create a new project
                </h4>
              </ListGroupItem>

            </LinkContainer>
    );
  }

  canEdit(){
    if(this.state.user){
      if(!this.state.user.userId.localeCompare(this.state.sessionId) || this.state.currentUser.admin){
        return true;
      }
    }
    return false;
  }


  render() {
    return (
      <div className="users">
      <h3> User Profile </h3>
       {this.state.user &&
        <div>
          <p> {this.state.user.firstName + " " + this.state.user.lastName + " (" + this.state.user.username + ")"} </p>
        </div>
      }
        <h4> Bio </h4>
        {this.state.user &&
          <form onSubmit={this.handleSubmit}>
            <FormGroup controlId="bio">
              <FormControl readOnly
                onChange={this.handleChange}
                value={this.state.user.bio}
                componentClass="textarea"
              />
            </FormGroup>
            <h4> Skills </h4>
            {this.state.user &&
              <FormGroup>
                <FormControl readOnly
                  onChange={this.handleChange}
                  value={this.state.user.skills}
                  componentClass="textarea"
                />
              </FormGroup>}
              {this.canEdit() &&
              <LoaderButton
                block
                bsStyle="primary"
                bsSize="large"
                isLoading={this.state.isLoading}
                text="Edit"
                onClick={this.handleEdit}
                loadingText="Editing…"
              />}
          </form>}
          <h4> Created Projects </h4>
        {this.state.projects &&
          <div className="users">
            { this.renderprojectsList(this.state.projects)}
            {( [{}].concat(this.state.projects).length - 1 <= 0) &&
            <p> None yet! </p>}
          </div>}

      </div>
    );
  }
}
