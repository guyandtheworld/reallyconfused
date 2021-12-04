import React from "react";
import Nav from "./roadmap/Nav/Navbar";
import { ServerGetNoCookie } from "../Utils/api";
import Router from "next/router";
import { initGA, logPageView } from "../Utils/analytics";
import { hotjar } from "react-hotjar";
import { NextSeo } from "next-seo";
import Cookie from "js-cookie";
import { Button } from "react-bootstrap";
import history from "next/router";
import { Get, Post } from "../Utils/api";
import { Container, Col, Row } from "react-bootstrap";
import { useSession } from 'next-auth/client'
import styles from "./index.module.scss";


function Home({ languages, careers, mentors }) {

  const [session] = useSession();

  var userExists = false;
  if (Cookie.get("token")) {
    userExists = true;
  }

  if (session) {
    userExists = true;
    Cookie.set("token", session.accessToken, { expires: 70 });
    Get("user/profile").then((e) => {
      Cookie.set("userName", e?.data?.name, { expires: 70 });
      Cookie.set("userId", e.data.user_id, { expires: 70 });
      Cookie.set("premium", e?.data?.premium, { expires: 70 });
    });
  }

  var isUser = Cookie.get("token") ? true : false;

  const clickHandler = (id, type) => {
    Router.push(`list?${type}=${id}`);
  };

  React.useEffect(() => {
    hotjar.initialize(2067448, 6);
    if (!window.GA_INITIALIZED) {
      initGA();
      window.GA_INITIALIZED = true;
    }
    logPageView();
  }, []);


  return (
    <>
      <NextSeo
        title="ReallyConfused"
        description="Explore, Create and Share Learning Roadmaps in Tech"
        openGraph={{
          type: "website",
          url: "https://www.reallyconfused.co",
          title: "ReallyConfused",
          description:
            "Explore, Create and Share Learning Roadmaps in Tech",
          images: [
            {
              url: "https://reallyconfused.co/logo.jpg",
              width: 200,
              height: 200,
              alt: "Og Image Alt",
            },
          ],
        }}
      />
      <Nav />
      <Container>
        <Container>
          {!isUser ? (
            <>
              <LandingCard
                title={
                  "Explore, Create and Share Learning Roadmaps in Tech"
                }
                body={
                  "Explore roadmaps on how to break into tech careers using self-study. Understand what courses to take, books to read, projects to build, how to network, and how much money you need to spend to get a job in tech. Then build your own roadmap and crush those long-term goals!"
                }
                img={"worker.svg"}
                isLeft={"true"}
                big={true}
              />

              <Container className={"d-flex justify-content-around"}>
                <Button
                  onClick={() => history.push("/about")}
                  style={{ fontSize: "1rem" }}
                  variant="outline-primary"
                >
                  <span className={"font-weight-bold"}>Learn More</span>
                </Button>
              </Container>
            </>
          ) : null}
        </Container>

        <Container>
          <div className={"mt-5 ml-3"}>
            <h3>Roadmaps With Mentors 🧑‍🏫</h3>
          </div>

          <Row className={"mt-4 mr-2 ml-2"}>
            {mentors?.steps
              ?.sort((a, b) => (b.title > a.title ? -1 : 1))
              ?.map((x, i) => (
                <Card
                  count={x.roadmap_count}
                  onClick={() => Router.push(`roadmap/${x.unique_link}`)}
                  key={i}
                >
                  {x.title}
                </Card>
              ))}
          </Row>
        </Container>

        <Container>
          <div className={"mt-5 ml-3"}>
            <h3>Careers 🎒</h3>
          </div>

          <Row className={"mt-4 mr-2 ml-2"}>
            {careers?.steps
              ?.sort((a, b) => (b.title > a.title ? -1 : 1))
              ?.map((x, i) => (
                <Card
                  count={x.roadmap_count}
                  onClick={() => clickHandler(x.id, "career")}
                  key={i}
                >
                  {x.title}
                </Card>
              ))}
          </Row>
        </Container>

        <Container className={styles.bottomItem}>
          <div className={"mt-5 ml-3"}>
            <h3>Languages & Frameworks 🕹️</h3>
          </div>

          <Row className={"mt-4 mr-2 ml-2"}>
            {languages?.steps
              ?.sort((a, b) => (b.title > a.title ? -1 : 1))
              ?.map((x, i) => (
                <Card
                  count={x.roadmap_count}
                  onClick={() => clickHandler(x.id, "language")}
                  key={i}
                >
                  {x.title}
                </Card>
              ))}
          </Row>
        </Container>
      </Container>
    </>
  );
}

Home.getInitialProps = async (ctx) => {

  var referer = "";

  if (ctx.req != undefined) {
    referer = ctx.req.headers.referer;
  }


  if (referer == undefined) {
    referer = "";
  }

  Post("metrics/createclick", {
    type: "main",
    from: referer,
    current: "/",
    roadmap: 0,
    user: Cookie.get("userId") ? parseInt(Cookie.get("userId")) : 0
  })

  const [Lang, Careers, Mentors] = await Promise.all([
    ServerGetNoCookie("roadmap/stepwithcount?step_type=3", ctx),
    ServerGetNoCookie("roadmap/stepwithcount?step_type=1", ctx),
    ServerGetNoCookie("roadmap/mentorroadmaps", ctx),
  ]);

  return { languages: Lang.data, careers: Careers.data, mentors: Mentors.data };
};

const Card = (props) => {
  return (
    <Col
      xs={12}
      onClick={props.onClick}
      sm={12}
      md={4}
      lg={3}
      className={"p-2 d-flex align-items-center"}
    >
      <Col
        style={{
          minHeight: "150px",
        }}
        className={`h-100   d-flex align-items-center flex-column justify-content-center ${styles.card}`}
      >
        <div className={styles.heading}>{props.children}</div>
        <Row className={"d-flex justify-content-around mb-1"}>
          <div className={styles.pill}>
            <span className={"mr-1 ml-2"} aria-label={"briefcase"} role={"img"}>
              <span className={"font-weight-bold"}>{props.count}</span> Roadmap
              {`${!props?.count || props?.count === 1 ? "" : "s"}`} 🧭
            </span>
          </div>
        </Row>
      </Col>
    </Col>
  );
};

const LandingCard = ({ title, body, isLeft, img, big }) => {
  return (
    <>
      <Row
        className={`d-flex align-items-center ${
          big ? "flex-col" : "flex-column-reverse"
        } justify-content-center pt-1 pb-1  ${
          isLeft ? "flex-md-row" : "flex-md-row-reverse"
        }`}
      >
        <Col className={"d-flex"} md={6}>
          <img
            className={"ml-auto mr-auto mb-3 mt-3"}
            style={{ width: "100%", maxWidth: big ? "600px" : "400px" }}
            src={img}
            alt=""
          />
        </Col>
        <Col className={"d-flex"}>
          <div
            className={`mt-auto text-center mb-auto ${
              !isLeft ? "text-md-right" : "text-md-left"
            } `}
          >
            {big ? <h1>{title}</h1> : <h2>{title}</h2>}
            <p
              style={{ fontSize: big ? "1.04rem" : "1.01rem" }}
              className={"mb-0"}
            >
              {body}
            </p>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default Home;
