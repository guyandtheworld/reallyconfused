import React, { useContext, useEffect } from "react";
import {
  Button,
  Container,
  Form,
  Col,
} from "react-bootstrap";
import CreateContext from "../../Context/CreateContext/CreateContext";
import CustomNav from "../roadmap/Nav/Navbar";
import { Get } from "../../Utils/api";
import RoadmapMaker from "../edit/RoadmapMaker/RoadmapMaker";
import Head from "next/head";
import { initGA, logPageView } from "../../Utils/analytics";
import { hotjar } from "react-hotjar";
import HOC from "../../Utils/withPrivateRoute";
import { RiCheckFill } from "react-icons/ri";
import { toast, ToastContainer } from 'react-nextjs-toast'


const Create = () => {
  /* Create a new roadmap */


  React.useEffect(() => {
    hotjar.initialize(2067448, 6);
    if (!window.GA_INITIALIZED) {
      initGA();
      window.GA_INITIALIZED = true;
    }
    logPageView();
  }, []);

  const {
    submit,
    setTagRes,
    setNewMode,
    setRoadmapTitle,
  } = useContext(CreateContext);

  const [ disableSave, setDisableSave] = React.useState(true);
  const { saveMap, data } = useContext(CreateContext);
  const [tag, setTag] = React.useState([]);
  const [ title, setTitle ] = React.useState([]);

  const onClickNotify = (message) => {
    toast.notify(message, {
      duration: 5,
      type: "error",
      title: "Oops..."
    })
  }

  const saveTitle = () => {
    /*
      Changes the title
    */
    if (!data[0].new) {
      setRoadmapTitle(title); 
    } else {
      onClickNotify("Please add at least one step before saving the roadmap...")
    }
  };

  useEffect(() => {
    setNewMode(false);
    Get("roadmap/tag").then((e) => {
      setTagRes(e.data[0].ID);
      let obj = {};
      e.data.map((x) => {
        obj[x.ID] = x.tag;
      });
      setTag(obj);
    });
  }, []);

  return (
    <>
      <Head>
        <title>Create Roadmap</title>
      </Head>
      <div>
        <CustomNav />
        <ToastContainer align="right"/>
          <>
            <Col
              style={{}}
              className={"d-flex mt-5 mb-3"}
              md={{ span: 6, offset: 3 }}
            >
              <h2>Create Roadmap</h2>
            </Col>
          <Container className={"mb-5 pl-5"}>
            <Col
              style={{}}
              className={"d-flex mt-5 mb-3"}
              md={{ span: 6, offset: 3 }}
            >
              <Form.Control
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setRoadmapTitle(e.target.value);
                      if (title.length > 5) {
                        setDisableSave(false);
                      }
                    }}
                    className={"mt-1 mb-4"}
                    as="textarea"
                    rows={1}
                    placeholder="Roadmap Title"
              />

              <div>
                <div>
                  <RiCheckFill
                    style={{
                      color: '#1FD12E',
                      cursor: "pointer",
                      marginTop: "0.3rem",
                      marginLeft: "0.4rem",
                      float: "left",
                      display: disableSave ? "none" : "block",
                    }}
                    onClick={() => saveTitle()}
                    size={35}/>
                </div>
              </div>
            </Col>
            {data.map((x, index) => {
                return (
                  <RoadmapMaker                  
                    roadmapID={undefined}
                    key={index}
                    order={index}
                    start={0 === index}
                    end={data.length - 1 === index}
                  />
                );
            })}
              <Container className={"d-flex justify-content-around"}>
                <Button
                  onClick={() => {
                          if (!data[0].new) {
                            submit();
                          } else {
                            onClickNotify("Please save step before creating the roadmap...");
                          }
                        }}
                  className={"green-button"}
                  style={{ fontSize: "1rem",
                           marginTop: "3rem",
                           width: "15rem",
                           color: '#1FD12E',
                         }}
                  variant="outline-primary"
                >
                  <span className={"font-weight-bold"}>Create Roadmap</span>
                </Button>
              </Container>
            </Container>
          </>
      </div>
    </>
  );
};

export default HOC(Create);
