import React, { useState } from "react";
import styles from "./signup.module.scss";
import { Col, Row, Form, Button, Container } from "react-bootstrap";
import { Post, Get, baseURL } from "../../Utils/api";
import { AuthToken } from "../../Utils/auth";
import { Router } from "next/router";
import ServerCookie from "next-cookies";
import Cookie from "js-cookie";
import Link from "next/link";
import Head from "next/head";
import { initGA, logPageView } from "../../Utils/analytics";
import { hotjar } from "react-hotjar";

const SignUp = ({ to }) => {
  const [fName, setFName] = useState("");
  const [email, setEmail] = useState("");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  React.useEffect(() => {
    hotjar.initialize(2067448, 6);
    if (!window.GA_INITIALIZED) {
      initGA();
      window.GA_INITIALIZED = true;
    }
    logPageView();
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (
      !p1.length ||
      !p2.length ||
      p1 !== p2 ||
      !fName.length ||
      !email.length
    ) {
      setError(true);
    } else {
      setError(false);
      Post("register", {
        name: fName,
        email: email,
        password: p1,
        type: "learner",
        premium: "false",
        completed_date: new Date().toISOString(),
      })
        .then(() => {
          Post("login", { email: email, password: p1 }).then((e) => {
            if (e.data.token) {
              AuthToken.storeToken(e.data.token);
              Get("user/profile").then((e) => {
                Cookie.set("userName", e?.data?.name, { expires: 70 });
                Cookie.set("userId", e.data.user_id, { expires: 70 });
                Cookie.set("premium", e?.data?.premium, { expires: 70 });
              });
            } else {
              Router.push("/login");
            }
          });
        })
        .catch(() => setError(true));
    }
  };

  return (
    <>
      <Head>
        <title>ReallyConfused - Roadmap</title>
      </Head>
      <Container fluid={true}>
        <Row className={styles.column}>
          <Col lg={8} className={`${styles.design} p-0 `}>
            <div className={styles.name}>
              <img src="/graduation.svg" className={styles.logo} /> Really
              Confused.
            </div>
          </Col>
          <Col className={styles.overflow}>
            <h4 className={"mb-4"}>Sign Up</h4>
            <Form onSubmit={(e) => submit(e)}>
              <Form.Group onChange={(e) => setFName(e.target.value)}>
                <Form.Label>Name</Form.Label>
                <Form.Control type="name" placeholder="Enter Your Name" />
                {error && !fName.length ? (
                  <Form.Text className="text-danger">
                    This Field should not be empty
                  </Form.Text>
                ) : null}
              </Form.Group>
              <Form.Group
                onChange={(e) => setEmail(e.target.value)}
                controlId="formBasicEmail"
              >
                <Form.Label>Email address</Form.Label>
                <Form.Control type="email" placeholder="Enter email" />
                {error && !email.length ? (
                  <Form.Text className="text-danger">
                    This Field should not be empty
                  </Form.Text>
                ) : null}
              </Form.Group>
              <Form.Group
                onChange={(e) => setP1(e.target.value)}
                controlId="formBasicPassword"
              >
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Password" />
                {error && !p1.length ? (
                  <Form.Text className="text-danger">
                    This Field should not be empty
                  </Form.Text>
                ) : null}
              </Form.Group>
              <Form.Group
                onChange={(e) => setP2(e.target.value)}
                controlId="formBasicPassword"
              >
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control type="password" placeholder="Password" />
                {p1 !== p2 ? (
                  <Form.Text className="text-danger">
                    Passwords do not Match
                  </Form.Text>
                ) : null}
              </Form.Group>
              <Button
                disabled={loading}
                className={"w-100 mt-4"}
                variant="primary"
                type="submit"
              >
                <b>Submit</b>
              </Button>
            </Form>

            <a
              href={
                baseURL +
                `auth/google?state=https://reallyconfused.co${to ? to : ""}`
              }
              className={"no-und"}
              passHref={true}
            >
              <div className={styles.googlebtn}>
                <div className={styles.googleiconwrapper}>
                  <img
                    className={styles.googleicon}
                    src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                  />
                </div>
                <p className={styles.btntext}>
                  <b>Sign Up With Google</b>
                </p>
              </div>
            </a>

            <a
              href={
                baseURL +
                `auth/github?state=https://reallyconfused.co${to ? to : ""}`
              }
              className={"no-und"}
              passHref={true}
            >
              <div className={styles.googlebtn}>
                <div className={styles.googleiconwrapper}>
                  <img
                    className={styles.googleicon}
                    src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                  />
                </div>
                <p className={styles.btntext}>
                  <b>Sign Up With Github</b>
                </p>
              </div>
            </a>

            <div className="text-center pt-4">
              <Link href={to ? `login?to=${to}` : "login"}>
                Already have an account? Log In.
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

SignUp.getInitialProps = async (ctx) => {
  const token = ServerCookie(ctx)["token"];
  const auth = new AuthToken(token);
  if (!token || auth.isExpired) {
    return {
      to: ctx.query["to"] || null,
    };
  } else {
    ctx.res.writeHead(302, {
      Location: "/",
    });
    ctx.res.end();
  }
};

export default SignUp;
