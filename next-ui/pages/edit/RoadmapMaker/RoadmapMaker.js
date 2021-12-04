import React, { useContext } from "react";
import { Col, Row, Button, Container } from "react-bootstrap";
import styles from "./RoadmapMaker.module.scss";
import RoadmapBox from "../RoadmapBox/RoadmapBox";
import CreateContext from "../../../Context/CreateContext/CreateContext";
import { MdAddCircleOutline } from "react-icons/md";


const RoadmapMaker = ({ order, end, start, roadmapID }) => {
  /*
    Creates the skeleton of the Roadmap.
  */

  const colors = ["DA5D58", "DA8358", "DAA858", "DACD58", "C2DA58", "9DDA58", "78DA58", "58DA5D", "58DA83",
                  "58DAA8", "58DACD", "58C2DA", "589DDA", "5878DA", "5D58DA", "611FD1" ,"941FD1" ,"C71FD1",
                  "D11FA9", "D11F76", "D11F43"];


  const scrollToRef = (ref) => {
    setTimeout(() => {
      window.scrollTo({ top: ref.current.offsetTop + 300, behavior: "smooth" });
    }, [100]);
  }

  const myRef = React.useRef(null);

  const { saveMap, data } = useContext(CreateContext);

  const findColor = (i) => {
    if (!data[i]?.completed) {
      return "grey";
    }

    var color = colors[i%colors.length];
    return color;
  };

  return (
    <>
      <Container className={"pl-4 pt-1 mt-0"}>
      {start && (
          <Row>
            <Col className={"p-0 "} md={{ span: 6, offset: 3 }}>
              <span className={styles[`circle-${findColor(order)}`]}>{``}</span>
              <span className={styles[`road-${findColor(order)}`]}>{""}</span>
              <MdAddCircleOutline
                style={{
                  color: '#4285f4',
                  cursor: "pointer",
                  marginTop: "0.3rem",
                  marginLeft: "0.4rem",
                }}
                onClick={() => {
                  saveMap({}, order-1);
                }}
                size={35}/>
            </Col>
          </Row>
        )}

        <Row className={"mt-5  mb-5 roadmap-container"}>
          <Col ref={myRef} md={{ span: 6, offset: 3 }}>
            <span className={styles[`road-${findColor(order)}`]}>{""}</span>
            <span className={styles[`circle-card-${findColor(order)}`]}>{``}</span>

            <RoadmapBox roadmapID={roadmapID} order={order} start={false} end={false} />
          </Col>
        </Row>

        {!end ? (
          <Row>
            <Col className={"p-0"} md={{ span: 6, offset: 3 }}>
              <span className={styles[`circle-${findColor(order + 1)}`]}>{``}</span>
              <span className={styles[`road-${findColor(order + 1)}`]}>{""}</span>
              <MdAddCircleOutline
                  style={{
                    color: '#4285f4',
                    cursor: "pointer",
                    marginTop: "0.3rem",
                    marginLeft: "0.4rem",
                  }}
                  onClick={() => {
                    scrollToRef(myRef);
                    saveMap({}, order + 1);
                  }}
                  size={35}/>
            </Col>
          </Row>
        ) : (
          <Row>
            <span className={styles[`road-${findColor(order)}`]}>{""}</span>
            <Col className={"p-0 "} md={{ span: 6, offset: 3 }}>
              <span className={styles[`circle-${findColor(order)}`]}>{``}</span>
              <MdAddCircleOutline
                  style={{
                    color: '#4285f4',
                    cursor: "pointer",
                    marginTop: "0.3rem",
                    marginLeft: "0.4rem",
                  }}
                  onClick={() => {
                    saveMap({}, order + 1);
                    scrollToRef(myRef);
                  }}
                  size={35}/>
            </Col>
          </Row>
        )}
      </Container>
    </>
  );
};

export default RoadmapMaker;
