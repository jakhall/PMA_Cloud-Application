import React, { Component } from "react";
import { PageHeader, ListGroup, ListGroupItem } from "react-bootstrap";
import "./Search.css";
import { API, Auth } from "aws-amplify";
import { LinkContainer } from "react-router-bootstrap";
import { Link } from "react-router-dom";
export default class Search extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      projects: null,
      users: null,
      user: null
    };
  }

  async componentDidMount() {
    if (!this.props.isAuthenticated) {
      return;
    }

    try {
      if(!this.props.match.params.type.localeCompare("projects")){
        const projects = await this.projectSearch();
        this.setState({ projects, selectedSearch: 1});
      } else {
        const users = await this.userSearch();
        this.setState({ users});
      }
    } catch (e) {
      alert(e);
    }

  this.setState({ isLoading: false });
}

  projectSearch() {
    return API.get("pma-api", `/projects/search/${this.props.match.params.search}`);
  }

  userSearch() {
    return API.get("pma-api", `/users/search/${this.props.match.params.search}`);
  }


 getUser(userId){
    return API.get("pma-api", `/users/${userId}`);
  }



  renderprojectsList(projects) {
    return [{}].concat(projects).map(
      (project, i) =>
        i !== 0
           && <LinkContainer
              key={project.projectId}
              to={`/projects/${project.projectId}`}
            >
              <ListGroupItem header={project.content.trim().split("\n")[0]}>
                {"Created: " + new Date(project.createdAt).toLocaleString()}
              </ListGroupItem>
            </LinkContainer>
    );
  }

    renderusersList(users) {
      return [{}].concat(users).map(
        (user, i) =>
          i !== 0 &&
             <LinkContainer
                key={user.userId}
                to={`/users/${user.userId}`}
              >
                <ListGroupItem header={user.firstName + " " + user.lastName + " (" + user.username + ")"}>
                </ListGroupItem>
              </LinkContainer>
          );
        }


  render() {
    return (
      <div className="Search">
        <h3> Results: </h3>
        {this.state.projects &&
        <div>
        {this.renderprojectsList(this.state.projects)}
        </div>}
        {this.state.users &&
        <div>
        {this.renderusersList(this.state.users)}
        </div>}
      </div>
    );
  }
}
