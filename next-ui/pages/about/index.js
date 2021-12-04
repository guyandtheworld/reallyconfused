import { Container, Row, Col } from "react-bootstrap";
import React from "react";
import Nav from "../roadmap/Nav/Navbar";
import ReactGA from "react-ga";
import Head from "next/head";

import styles from "../index.module.scss";
import { RiMailLine, RiChatSmile2Line, RiLinkedinBoxLine, RiTwitterLine } from "react-icons/ri";


ReactGA.initialize("UA-178440628-1");

const About = () => {
  React.useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);

  return (
    <>
      <Head>
        <title>About</title>
      </Head>
      <Nav />
      <Container className={"d-flex flex-column justify-content-center"}>
        <Row className={"justify-content-center"}>
          {/* <Col md={8}>
            <img
              src="/work.png"
              style={{ maxWidth: "90vw" }}
              className={"ml-auto mr-auto d-block"}
              alt=""
            />
          </Col> */}
        </Row>
        <div
          style={{ maxWidth: "1100px" }}
          className={"flex-col w-100 ml-auto mr-auto"}
        >
          <Card
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
        </div>
        <div
          style={{ maxWidth: "900px" }}
          className={"flex-col mb-5 pb-5 ml-auto mr-auto"}
        >
          <Card
            title={"Explore Roadmaps Made By Self-Learners"}
            body={
              "How do you become a Full-Stack Developer after learning JavaScript? How does one start with Python and become a Data Scientist? Find out here! Get access to the unique journeys of self-learners who leveraged the internet to get a job of their choice and explore roadmaps curated from the internet."
            }
            img={"1.gif"}
            isLeft={false}
          />
          <Card
            title={"Build Your Own Roadmap And Pursue Long-Term Goals"}
            body={
              "Found an interesting roadmap to becoming a Node.js Developer? Take it up, edit the timeline, add your own steps, and work towards it! Organize the schedule, and we'll remind you to learn that language or watch that Coursera course or read that book every day! Additionally, share your awesome roadmap with the whole world and grow together!"
            }
            img={"3.gif"}
            isLeft={true}
          />
          <Card
            title={"Explore Careers Day-To-Days and Project Ideas"}
            body={
              "What kind of business problems does a Data Analyst or a Data Engineer solve? How can you align what you're learning now with the tech job of your choice? Additionally, explore project ideas that you can build to maximize your chances of landing a job in that field!"
            }
            img={"2.gif"}
            isLeft={false}
          />

          <div className={styles.contactCard}>
            <div>
              <h4>Do you have some kick-ass feedback to make this product better? Got ideas about the future? Would you like to contribute?</h4>
              <br></br>
              <h5>Contact me!</h5>

              <a href="mailto:guyandtheworld@gmail.com" target="_blank">
                <RiMailLine size={30} className={"mb-1 mr-1"} />
              </a>

              <a href="https://guyandtheworld.com" target="_blank">
                <RiChatSmile2Line size={30} className={"mb-1 mr-1"} />
              </a>

              <a href="https://www.linkedin.com/in/guyandtheworld/" target="_blank">
                <RiLinkedinBoxLine size={30} className={"mb-1 mr-1"} />
              </a>

            </div>
          </div>
        </div>
      </Container>
    </>
  );
};

const Card = ({ title, body, isLeft, img, big }) => {
  return (
    <>
      <Row
        className={`d-flex align-items-center ${
          big ? "flex-col" : "flex-column-reverse"
        } justify-content-center pt-5 pb-5  ${
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

export default About;
