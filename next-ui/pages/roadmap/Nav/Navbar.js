import React from "react";
import { Navbar, Nav, Button, NavDropdown, Container } from "react-bootstrap";
import { AuthToken } from "../../../Utils/auth.js";
import { HiUserCircle } from "react-icons/hi";
import { Get } from "../../../Utils/api.js";
import FeedbackModal from "../Modal/CustomModal";
import { MdBuild } from "react-icons/md";
import { ImMap } from "react-icons/im";
import history from "next/router";
import Router from "next/router";
import Cookie from "js-cookie";
import Head from "next/head";
import {
  RiChatSmile3Fill,
  RiHomeHeartFill,
} from "react-icons/ri";


const CustomNav = () => {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const [id, setId] = React.useState(1);
  var isUser = Cookie.get("token") ? true : false;

  React.useEffect(() => {
    isUser &&
      Get("user/profile").then((e) => {
        setName(e?.data?.name);
        setEmail(e?.data?.email);
        setId(e?.data?.user_id);
        localStorage.setItem("userId", e.data.user_id);
      });
  }, []);

  React.useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <>
      <Head>
      </Head>
      <Navbar
        collapseOnSelect
        className={"shadow-custom"}
        expand="lg"
        bg="light"
        variant="light"
      >
        <Container className="justify-content-start">
          <Navbar.Toggle
            className=" pl-0"
            aria-controls="responsive-navbar-nav"
          />
          <Navbar.Brand align={"left"} href="/">
            <img
              src="/logo.svg"
              alt=""
              style={{ height: "24px", width: "24px" }}
            />
            <span
              className={"ml-2"}
              style={{ fontSize: "0.925rem", fontWeight: 500 }}
            >
              ReallyConfused.
            </span>
          </Navbar.Brand>
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav
              className={
                "d-flex justify-content-lg-between flex-column flex-lg-row ml-auto"
              }
            >
              {isUser ? (
                <Nav.Item className="d-lg-none  border-bottom  d-flex nav-link">
                  <div className="mt-2">
                    <HiUserCircle size={24} /> {name}{" "}
                    <span className="ml-2 mr-2">{}</span>
                  </div>
                  <Nav.Link className="ml-auto" onClick={AuthToken.logout}>
                    Logout
                  </Nav.Link>
                </Nav.Item>
              ) : null}

              <Nav.Link
                onClick={() => history.push("/")}
                className={"d-lg-block mt-auto mb-auto ml-auto mr-lg-3"}
              >
                <RiHomeHeartFill size={16} className={"mb-1 mr-1"} />
                Home
              </Nav.Link>

              <Nav.Link
                onClick={() => history.push("/create")}
                className={"d-lg-block mt-auto mb-auto ml-auto mr-lg-3"}
              >
                <MdBuild size={14} className={"mb-1 mr-1"} />
                Create
              </Nav.Link>

              {isUser ? (
                <Nav.Link
                  onClick={() => history.push("/myroadmap")}
                  className={"d-lg-block mt-auto mb-auto ml-auto mr-lg-3"}
                >
                  <ImMap size={14} className={"mb-1 mr-1"} />
                  My Roadmaps
                </Nav.Link>
              ) : null}

              <Nav.Link
                onClick={() => history.push("/about")}
                className={"d-lg-block mt-auto mb-auto ml-auto mr-lg-3"}
              >
                <RiChatSmile3Fill size={16} className={"mb-1 mr-1"} />
                About
              </Nav.Link>

              {isUser ? (
                <NavDropdown
                  className={"d-none mt-auto mb-auto d-lg-block"}
                  title={
                    <>
                      <HiUserCircle size={24} /> {name}
                    </>
                  }
                >
                  <NavDropdown.Item onClick={() => setShow(true)}>
                    Feedback
                  </NavDropdown.Item>

                  <FeedbackModal
                    emails={email || ""}
                    id={id || ""}
                    names={name || ""}
                    show={show}
                    setShow={setShow}
                  />

                  <NavDropdown.Item onClick={() => Router.push("/profile")}>
                    Profile
                  </NavDropdown.Item>

                  <NavDropdown.Item onClick={AuthToken.logout}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ) : null}

              {!isUser ? (
                <Nav.Link
                  onClick={() => history.push("/login")}
                  className={
                    "d-lg-block mt-auto ml-auto pt-md-2 mb-auto mr-lg-3"
                  }
                >
                  <HiUserCircle size={20} className={"mb-1 mr-1"} />
                  Login
                </Nav.Link>
              ) : null}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default CustomNav;
