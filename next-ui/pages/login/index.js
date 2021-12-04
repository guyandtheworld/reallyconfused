import React, { useState } from "react";
import styles from "../signup/signup.module.scss";
import { Col, Row, Form, Button, Container } from "react-bootstrap";
import { Post, Get, baseURL } from "../../Utils/api";
import ServerCookie from "next-cookies";
import { AuthToken } from "../../Utils/auth";
import Link from "next/link";
import Head from "next/head";
import Cookie from "js-cookie";
import { initGA, logPageView } from "../../Utils/analytics";
import Router from "next/router";
import { signIn } from 'next-auth/client'


const Login = ({ to }) => {
  const [email, setEmail] = useState("");
  const [p1, setP1] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [invalid, setInvalid] = useState(false);

  React.useEffect(() => {
    if (!window.GA_INITIALIZED) {
      initGA();
      window.GA_INITIALIZED = true;
    }
    logPageView();
  }, []);

  const submit = (e) => {
    e.preventDefault();
    setInvalid(false);
    if (!p1.length || !email.length) {
      setError(true);
    } else {
      setError(false);
      setLoading(true);
      Post("login", { email: email, password: p1 })
        .then((e) => {
          setLoading(false);
          setInvalid(false);
          if (e.data.token) {
            Cookie.set("token", e.data.token, { expires: 70 });
            Router.push(to || "/");
            Get("user/profile").then((e) => {
              Cookie.set("userName", e?.data?.name, { expires: 70 });
              Cookie.set("userId", e.data.user_id, { expires: 70 });
              Cookie.set("premium", e?.data?.premium, { expires: 70 });
            });
          } else {
            setInvalid(true);
          }
        })
        .catch(() => {
          setLoading(false);
          setInvalid(true);
        });
    }
  };

  return (
    <>
      <Head>
        <title>ReallyConfused - Login</title>
      </Head>
      <Container fluid={true}>
        <Row className={styles.column}>
          <Col lg={8} className={`${styles.design} p-0 `}>
            <div className={styles.name}>
              <img src="/graduation.svg" className={styles.logo} /> Really
              Confused.
            </div>
          </Col>
          <Col className={"p-5"}>
            <h4 className={"mb-4"}>Log In</h4>
            <Form onSubmit={(e) => submit(e)}>
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
              {invalid && (
                <Form.Text className="text-danger">
                  Invalid Email or Password
                </Form.Text>
              )}
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
              onClick={() => signIn("google", { callbackUrl: `/` })}
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
              onClick={() => signIn("github", { callbackUrl: `/` })}
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
              <Link href={to ? `signup?to=${to}` : "signup"}>
                New User? Sign Up.
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

Login.getInitialProps = async (ctx) => {
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

export default Login;
