import { Container, Row, Col, Button } from "react-bootstrap";
import Nav from "../roadmap/Nav/Navbar";
import { Post } from "../../Utils/api";
import Cookie from "js-cookie";
import Router from "next/router";
import React from "react";
import Head from "next/head";
import { initGA, logPageView } from "../../Utils/analytics";
import { hotjar } from "react-hotjar";
import { useRouter } from "next/router";

const Premium = () => {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  var expired = router.query["expired"];

  if (expired == undefined) {
    expired = false
  }

  React.useEffect(() => {
    hotjar.initialize(2067448, 6);
    if (!window.GA_INITIALIZED) {
      initGA();
      window.GA_INITIALIZED = true;
    }
    logPageView();
  }, []);

  const subscribe = () => {
    setLoading(true);
    Get("user/profile").then((e) => {
      var expiryDate = new Date(e.data.premium_date);
      expiryDate.setDate(expiryDate.getDate() + 14);
      if (expiryDate < new Date()) {
        Post("user/upgradepremium", { id: parseInt(Cookie.get("userId")) }).then(
          (e) => {
            Router.back();
          }
        );
      }
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "white",
      }}
    >
      <Nav />
      <Head>
        <title>ReallyConfused - Premium</title>
      </Head>
      <script src="https://gumroad.com/js/gumroad.js"></script>
      <Container className={"mt-4 d-flex justify-content-center"}>
        <Col className="mt-2" style={{"maxWidth": "420px"}}>
          <Row className={"  mb-2"}>
            <span className={"text-center h1"}>Pricing</span>
          </Row>
          <Col
            style={{
              boxShadow: "0px 8px 20px 2px rgba(25.9, 64.7, 96.1, 0.2)",
              borderWidth: "2px",
              borderColor: "#42a5f5",
              borderRadius: "8px",
            }}
            className={"box pt-4 pr-4 pl-4 pb-4"}
          >
            <Row>
              <Col className={"text-center"}>
                <span
                  style={{
                    fontWeight: 800,
                  }}
                  className="h1"
                >
                  $3.00
                </span>{" "}
                <span className="h4">/per month</span>
                <br />
                <div className={" pt-2 h6"}>Comes With</div>
              </Col>
            </Row>
            <Row>
              <div
                className={"mt-2"}
                style={{ fontSize: "1rem", fontWeight: 300 }}
              >
                <ul>
                  <li>Private road-maps.</li>
                  <li>Build and pursue your own road-maps.</li>
                  <li>Get matched with people following the same road-map as you.</li>
                  <li>Fork, follow and edit other road-maps.</li>
                  <li>Multiple Road-maps.</li>
                  <li>Email Reminders.</li>
                  <li>Mobile App (Coming Soon).</li>
                </ul>
              </div>
            </Row>

            <Row
              style={{
                paddingLeft: "17px",
                paddingTop: "10px"
            }}>
              <a
                class="gumroad-button"
                href="https://gum.co/reallyconfused"
              >
                <span style={{
                  color: "#000",
                  marginLeft: 60,
                  marginRight: 95,
                  fontSize: 20
              }}>Buy Premium</span>
              </a>
            </Row>

            <br></br>
            <h3 style={{paddingLeft: "150px"}}>OR</h3>

            {!expired ? (
              <div>
                <Row>
                  <Button
                    onClick={subscribe}
                    size="lg"
                    variant={"outline-primary"}
                    disabled={loading}
                    className={"ml-3 mt-4 mb-1 mr-3 w-100"}
                  >
                    Life-long Free Trial
                  </Button>
                </Row>
                <br></br>
                <div
                  // className={"mt-2 mb-1 w-100"}
                  style={{
                      position: 'absolute', left: '50%',
                      transform: 'translate(-50%, -50%)'
                  }}
                  >
                  No Credit Card Required!
                  </div>
                </div>
              ) : null}
            {expired ? (
              <div>
                <div
                  style={{
                      position: 'absolute', left: '44%',
                      transform: 'translate(-50%, -50%)',
                      marginTop: '10px', marginBottom: '10px'
                  }}
                  >
                  You've finished your 14 day trial!
                </div>
              </div>
            ) : null}
          </Col>
        </Col>
      </Container>
    </div>
  );
};

export default Premium;
