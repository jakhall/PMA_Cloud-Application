import React, { Component } from "react";
import { API, Storage, Auth } from "aws-amplify";
import { FormGroup, FormControl, ControlLabel, PageHeader, ListGroup, ListGroupItem } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import { LinkContainer } from "react-router-bootstrap";
import { Link } from "react-router-dom";
import config from "../config";
import "./Projects.css";



export default class projects extends Component {
  constructor(props) {
    super(props);

    this.file = null;

    this.state = {
      isLoading: null,
      isDeleting: null,
      isJoining: null,
      isReady: null,
      project: null,
      team: null,
      user: null,
      userRole: null,
      content: "",
      attachmentURL: null
    };
  }

  async componentDidMount() {

    try {
      const {id} = await Auth.currentUserInfo();
      const user = await this.getCurrentUser(id);
      this.setState({user});
      const teamIds = await this.team();
      const team = await this.getTeamUsers(teamIds);
      this.setState({
        team
     });

     if(user.admin){
       this.setState({userRole: "Admin"});
     }

     this.state.isReady = true;

    } catch (e) {
      alert(e);
    }

    try {
      let attachmentURL;
      const project = await this.getproject();
      const {content} = project;


      this.setState({
        project,
        content,
      });

    } catch (e) {
      alert(e);
    }

  }

  getCurrentUser(userId){
    return API.get("pma-api", `/users/${userId}`);
  }


  team() {
    return API.get("pma-api", `/teams/${this.props.match.params.id}`);
  }

  getproject() {
    return API.get("pma-api", `/projects/${this.props.match.params.id}`);
  }

  validateForm() {
    return this.state.content.length > 0;
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

  saveProject(project) {
    return API.put("pma-api", `/projects/${this.props.match.params.id}`, {
      body: project
    });
  }

  handleSubmit = async event => {
    let attachment;

    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      await this.saveProject({
        content: this.state.content,
      });
      this.props.history.push("/");
    } catch (e) {
      alert(e);
      this.setState({ isLoading: false });
    }
  }


  getUser(userId){
    return API.get("pma-api", `/users/${userId}`);
  }

  deleteProject() {
    return API.del("pma-api", `/projects/${this.props.match.params.id}`);
  }

  handleDelete = async event => {
    event.preventDefault();

    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) {
      return;
    }

    this.setState({ isDeleting: true });

    try {
      await this.deleteProject();
      this.props.history.push("/");
    } catch (e) {
      alert(e);
      this.setState({ isDeleting: false });
    }
  }

 async getUserObject(user){
  var res = null;
  const glob = this;
  await this.getUser(user.userId).then(function(result){
     res = result;

   })

   res.addedAt = user.addedAt;
   res.role = user.role;
   if(!res.userId.localeCompare(this.state.user.username)){
     this.setState({userRole: res.role});
   }
   return res;
 }

  renderTeam() {
    return (
      <div className="team">
        <h3>Team</h3>
        <ListGroup>
          {!this.state.isLoading && this.renderTeamList(this.state.team)}
        </ListGroup>
      </div>
    );
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

  renderTeamList(team) {
    return [{}].concat(team).map(
      (member, i) =>
        i !== 0
          ? <LinkContainer
              key={member.userId}
              to={`/users/${member.userId}`}
            >
              <ListGroupItem header={member.firstName + " " + member.lastName + " (" + member.role + ")"}>
                {"Added: " + new Date(member.addedAt).toLocaleString()}
              </ListGroupItem>
            </LinkContainer>
          : <LinkContainer

              to={`/projects/${this.props.match.params.id}/manage`}
            >
              <ListGroupItem>
                <h4>
                  <b>{"\uFF0B"}</b> Manage Team
                </h4>
              </ListGroupItem>
            </LinkContainer>
    );
  }

  render() {
    return (
      <div className="Projects">
      <h3>Details</h3>

      {this.state.isReady &&
        this.state.userRole == null &&
      <div className="join-container">
        <LoaderButton
          block
          bsStyle="warning"
          bsSize="large"
          isLoading={this.state.isJoining}
          onClick={this.handleJoin}
          text="Join"
          loadingText="Joining.."
        />
      </div>}

          <form onSubmit={this.handleSubmit}>
            {this.state.project &&
            <FormGroup controlId="content">
              <FormControl
                onChange={this.handleChange}
                value={this.state.content}
                componentClass="textarea"
              />
            </FormGroup>}
            {this.state.isReady && (this.state.userRole.localeCompare("Admin") || this.state.userRole.localeCompare("Manager")) &&
            <div>
            <LoaderButton
              block
              bsStyle="primary"
              bsSize="large"
              disabled={!this.validateForm()}
              type="submit"
              isLoading={this.state.isLoading}
              text="Save"
              loadingText="Saving…"
            />
            <LoaderButton
              block
              bsStyle="danger"
              bsSize="large"
              isLoading={this.state.isDeleting}
              onClick={this.handleDelete}
              text="Delete"
              loadingText="Deleting…"
            />
            </div>}
          </form>
        {this.state.team &&
          <div className="Project">
            { this.renderTeam()}
          </div>}

      </div>
    );
  }
}
