import { Container, Row, Col } from "react-bootstrap";
import React from "react";
import Nav from "../roadmap/Nav/Navbar";
import ReactGA from "react-ga";
import Head from "next/head";
ReactGA.initialize("UA-178440628-1");

const Construction = () => {
  React.useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);

  return (
    <>
      <Head>
        <title>Coming Soon</title>
      </Head>
      <Nav />
      <Container
        className={"d-flex flex-column justify-content-center"}
        style={{ height: "90vh" }}
      >
        <Row>
          <Col>
            <img
              src="/work.png"
              style={{ maxWidth: "90vw" }}
              className={"ml-auto mr-auto d-block"}
              alt=""
            />
          </Col>
        </Row>
        <Row>
          <Col
            style={{ fontWeight: 700, color: "#2f5d99" }}
            className="h2 d-none d-lg-block mb-5 pt-5 text-center"
          >
            DIDN'T FIND WHAT YOU WERE LOOKING FOR
          </Col>
          <Col
            style={{ fontWeight: 700, color: "#2f5d99" }}
            className="h4 mb-5 pb-5 d-lg-none pt-4 text-center"
          >
            DIDN'T FIND WHAT YOU WERE LOOKING FOR
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Construction;
