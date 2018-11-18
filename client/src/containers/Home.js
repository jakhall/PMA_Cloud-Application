import React, { Component } from "react";
import { PageHeader, ListGroup, ListGroupItem } from "react-bootstrap";
import "./Home.css";
import { API, Auth } from "aws-amplify";
import { LinkContainer } from "react-router-bootstrap";
import { Link } from "react-router-dom";
export default class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      projects: [],
      user: null,
      statusColour: null
    };
  }

  async componentDidMount() {
    if (!this.props.isAuthenticated) {
      return;
    }

    try {
      const projects = await this.projects();
      const {id}= await Auth.currentUserInfo()
      const user = await this.getUser(id);
      this.setState({ projects, user});
    } catch (e) {
      alert(e);
    }

  this.setState({ isLoading: false });
}

async projects() {
  var projects = [];
  var proj = null;
  const projectLinks = await API.get("pma-api", "/users/list");
  for(const p of projectLinks){
    proj = await this.getProject(p.projectId);
    proj.role = p.role;
    projects.push(proj)
  }

  return projects;
}


getProject(id) {
  return API.get("pma-api", `/projects/${id}`);
}

 getUser(userId){
    return API.get("pma-api", `/users/${userId}`);
  }

statusColour(status){
  if(!status.localeCompare("Pending")){
    return "blue";
  } else if(!status.localeCompare("Completed")){
    return "green";
  }
  return "orange";
}


renderprojectsList(projects) {
  return [{}].concat(projects).map(
    (project, i) =>
      i !== 0
        ? <LinkContainer
            key={project.projectId}
            to={`/projects/${project.projectId}`}
          >
            <ListGroupItem header={project.title.trim().split("\n")[0] + " (" + project.role + ")"}>
              <div className="created">{"Created: " + new Date(project.createdAt).toLocaleString()} </div>
              <div className="status"> {" Status: "} <a style={{color: this.statusColour(project.projectStatus)}}>  {project.projectStatus} </a> </div>
              <div className="clear"> </div>
            </ListGroupItem>
          </LinkContainer>
        : <LinkContainer
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

renderLander() {
  return (
    <div className="lander">
      <h1>Proton</h1>
      <p>A project management app!</p>
      <div>
        <Link to="/login" className="btn btn-info btn-lg">
          Login
        </Link>
        <Link to="/signup" className="btn btn-success btn-lg">
          Signup
        </Link>
      </div>
    </div>
  );
}


  renderProfile(){
    return(
      <div className="projects">
      <h3>Your Profile</h3>
      {!this.state.isLoading &&
      <LinkContainer
        key={this.state.user.userId}
        to={`/users/${this.state.user.userId}`}
      >
        <ListGroupItem header={this.state.user.firstName + " " + this.state.user.lastName + " (" + this.state.user.username + ")"}>
        </ListGroupItem>
      </LinkContainer>}
      </div>
    );
  }

  renderprojects() {
    return (
      <div className="projects">
        {this.renderProfile()}
        <h3>Collaborations</h3>
        <ListGroup>
          {!this.state.isLoading && this.renderprojectsList(this.state.projects)}
        </ListGroup>
      </div>
    );
  }

  render() {
    return (
      <div className="Home">
        {this.props.isAuthenticated ? this.renderprojects() : this.renderLander()}
      </div>
    );
  }
}
