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
      projectName: "",
      projectStatus: "",
      projectDesc: "",
      statColour: null
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

     this.state.isReady = true;

     if(this.state.userRole == null && this.state.user.admin){
       this.state.userRole = 0;
     }

    } catch (e) {
      alert(e);
    }

    try {
      let attachmentURL;
      const project = await this.getproject();
      const {title, description, projectStatus} = project;
      var colour = "success";
      if(!projectStatus.localeCompare("Active")){
        colour = "warning";
      } else if(!projectStatus.localeCompare("Pending")){
        colour = "primary";
      }

      this.setState({
        project,
        projectStatus,
        projectName: title,
        projectDesc: description,
        statColour: colour
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
    return this.state.projectName.length > 0;
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

  handleEdit = async event => {
    this.props.history.push("/");
    window.location.assign('/projects/' + this.props.match.params.id  + '/edit');
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
   if(!res.userId.localeCompare(this.state.user.userId)){
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


  handleJoin = async event => {
    this.setState({isJoining: true});
    await this.joinProject({
      projectId: this.props.match.params.id,
      role: "Developer"
    })
    this.setState({isJoining: false});
    await this.componentDidMount();
    this.render();
  }

  async joinProject(project){
   return API.post("pma-api", "/teams", {
     body: project
   });
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



  roleCheck(){
    if(this.state.userRole && this.state.user){
      return true;
    }
    return false;
  }


  render() {
    return (
      <div className="Projects">
      <h1> {this.state.projectName} </h1>
      <h3> Status </h3>
      {this.state.statColour &&
      <LoaderButton readOnly
        block
        bsStyle={this.state.statColour}
        bsSize="medium"
        isLoading={this.state.isJoining}
        text={this.state.projectStatus}
        loadingText="Joining.."
        className="status"
      />}

      <h3 className="details">Details</h3>

      {this.state.isReady &&
        (this.state.userRole == null || this.state.userRole == 0) &&
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

          <form>
            {this.state.project &&
            <FormGroup controlId="content">
              <FormControl readOnly
                value={this.state.projectDesc}
                componentClass="textarea"
              />
            </FormGroup>}
            {this.roleCheck() &&
            <div>
              {(this.state.userRole || this.state.user.admin) &&
                (this.state.userRole.localeCompare("Developer") || this.state.user.admin)  &&
                  <LoaderButton
                    block
                    bsStyle="primary"
                    bsSize="large"
                    disabled={!this.validateForm()}
                    isLoading={this.state.isLoading}
                    text="Edit"
                    onClick={this.handleEdit}
                    loadingText="Editing…"
                  />}
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
