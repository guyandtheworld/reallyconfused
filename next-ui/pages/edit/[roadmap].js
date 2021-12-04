import React, { useContext, useEffect } from "react";
import { Container, Button, Form, Col, Row } from "react-bootstrap";
import CreateContext from "../../Context/CreateContext/CreateContext";
import RoadmapMaker from "./RoadmapMaker/RoadmapMaker";
import CustomNav from "../roadmap/Nav/Navbar";
import { useRouter } from "next/router";
import Head from "next/head";
import { initGA, logPageView } from "../../Utils/analytics";
import { hotjar } from "react-hotjar";
import RoadmapSettings from "./RoadmapSettings/RoadmapSetting";
import Dropdown from "../roadmap/Components/OutlineDropdown/OutlineDropdown";
import HOC from "../../Utils/withPrivateRoute";
import { Put, Get } from "../../Utils/api";
import { RiCheckFill } from "react-icons/ri";
import { toast, ToastContainer } from 'react-nextjs-toast'


const Edit = () => {
  const [title, setTitle] = React.useState([]);
  const [oGTitle, setOGTitle] = React.useState([]);
  const [disableSave, setDisableSave] = React.useState(true);
  const [clickedOnce, setClickedOnce] = React.useState(0);
  const [roadmapID, setRoadmapID] = React.useState([]);

  const router = useRouter();

  const queryKey = "roadmap";
  const roadmapUniqueKey = router.query[queryKey];

  const { data, createDefault, setNewMode, resetState, called } = useContext(
    CreateContext
  );

  const onClickNotify = (message) => {
    toast.notify(message, {
      duration: 5,
      type: "error",
      title: "You'll loose your progres..."
    })
  }

  useEffect(() => {

    Get(`roadmap/get/${roadmapUniqueKey}`).then((e) => {
      setRoadmapID(e.data.id);
      setTitle(e.data.title);
      setOGTitle(e.data.title);
    });

    hotjar.initialize(2067448, 6);

    if (!window.GA_INITIALIZED) {
      initGA();
      window.GA_INITIALIZED = true;
    }

    logPageView();

    setNewMode(false);
    roadmapUniqueKey && createDefault(roadmapUniqueKey);
    return function cleanup() {
      resetState();
    };
  }, [roadmapID]);

  const saveTitle = () => {
    /*
      Changes the title
    */
    Put("roadmap/update", {
      ID: parseInt(roadmapID),
      title: title,
    }).then(() => setDisableSave(true));
  };


  return (
    <>
      <Head>
        <title>Edit Roadmap</title>
      </Head>
      <div>
        <CustomNav />
        <ToastContainer align={"right"}/>
        {called === true && (
          <img
            style={{
              position: "fixed",
              zIndex: 1000,
              right: 32,
              bottom: 16,
              height: "64px",
            }}
            src="/loadingSave.svg"
            alt=""
          />
        )}

        {data[0].type === undefined || data[0].type === "" ? (
          <div className=" loader"></div>
        ) : (
          <>
            <Col
              style={{}}
              className={"d-flex mt-5 mb-3"}
              md={{ span: 6, offset: 3 }}
            >
              <h2>Edit Your Roadmap</h2>
            </Col>
            <Container className={"mb-5 pl-5"}>
              <Row className={"mb-3"}>
                <Col
                  className={"d-flex justify-content-end"}
                  md={{ span: 6, offset: 3 }}
                >
                  <Dropdown name={"Roadmap Settings"}>
                    <div className={"pl-3 pr-3 pt-3"}>
                      <RoadmapSettings roadmap={roadmapID} />
                    </div>
                  </Dropdown>
                  <Button
                    className={"ml-2"}
                    variant={"outline-primary"}
                    onClick={() => {
                      var view = true;
                      data.every(function(element, index) {
                        // Do your thing, then:
                        if (element["new"] == true) {
                          view = false;
                          return false;
                        } else {
                          return true;
                        }
                      });

                      if (view || clickedOnce === 2) {
                        toast.remove();
                        router.push(`/roadmap/${roadmapUniqueKey}`);
                      } else {
                        setClickedOnce(clickedOnce + 1);
                        onClickNotify("Please save your steps before leaving the page.");
                      }
                    }}
                  >
                    View Roadmap
                  </Button>
                </Col>
              </Row>
              <Col
                style={{}}
                className={"d-flex mt-5 mb-3"}
                md={{ span: 6, offset: 3 }}
              >
                <Form.Control
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (oGTitle != title && title.length > 10) {
                          setDisableSave(false);
                        }
                      }}
                      className={"mt-1 mb-4"}
                      as="textarea"
                      rows={1}
                      placeholder="Roadmap Title"
                />

                <div>
                  <RiCheckFill
                      style={{
                        color: '#1FD12E',
                        cursor: "pointer",
                        marginTop: "0.1rem",
                        marginLeft: "0.4rem",
                        float: "left",
                        display: disableSave ? "none" : "block",
                      }}
                      onClick={() => saveTitle()}
                      size={45}/>
                </div>
              </Col>

              {data.map((x, index) => {
                return (
                  <RoadmapMaker
                    roadmapID={roadmapID}
                    key={index}
                    order={index}
                    start={0 === index}
                    end={data.length - 1 === index}
                  />
                );
              })}
            </Container>
          </>
        )}
      </div>
    </>
  );
};

export default HOC(Edit);
