import { Container, Row, Col } from "react-bootstrap";
import React from "react";
import ReactGA from "react-ga";
import Head from "next/head";
import { AuthToken } from "../../Utils/auth";
import { Get } from "../../Utils/api";
import Router from "next/router";
import Cookie from "js-cookie";

ReactGA.initialize("UA-178440628-1");

const Oauth = ({ token, redirect }) => {
  // AuthToken.storeToken(token);
  // Get("user/profile").then((e) => {
  //   Cookie.set("userName", e?.data?.name, { expires: 70 });
  //   Cookie.set("userId", e.data.user_id, { expires: 70 });
  // });

  React.useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);

    Cookie.set("token", token);

    Get("user/profile").then((e) => {
      Cookie.set("userName", e?.data?.name, { expires: 70 });
      Cookie.set("userId", e.data.user_id, { expires: 70 });
      Cookie.set("premium", e?.data?.premium, { expires: 70 });
      if (redirect) {
        Router.push(`${redirect}`);
      } else {
        Router.push(`/`);
      }
    });
  }, []);

  return (
    <>
      <Head>
        <title>Verification</title>
      </Head>
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
      </Container>
    </>
  );
};

Oauth.getInitialProps = async (ctx) => {
  const { token, redirect } = ctx.query;

  if (redirect) {
    return { token, redirect };
  }

  return { token, redirect: null };
};

export default Oauth;
