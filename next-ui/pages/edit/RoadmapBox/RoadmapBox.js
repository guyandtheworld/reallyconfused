import React, { useContext, useState } from "react";
import { Form, Button, Col, Row, FormCheck } from "react-bootstrap";
import CreateContext from "../../../Context/CreateContext/CreateContext";
import OutsideClickHandler from "react-outside-click-handler";
import DatePicker from "../DatePicker/DataPicker";
import { RiCheckFill, RiDeleteBin5Line } from "react-icons/ri";


const RoadmapBox = ({ order, start, end, roadmapID, createMode }) => {

  const {
    submit,
    setName,
    setDescription,
    data,
    removeMap,
    setRoadmapID,
    completed,
    setIncomplete,
    createStep,
  } = useContext(CreateContext);

  const [types, setTypes] = useState({});
  const [dropdownDisable, setDropdownDisable] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  const [isChanged, setIsChanged] = useState();

  const triggerChange = () => {
    setIsChanged(true);
  };

  const save = () => {
    /*
      Saves the step by
      * Updating the step title
      * Updating the step description
    */

    setIsChanged(false);
    if (!roadmapID) {
      data[order].new = true;
      submit();
    } else {
      createStep(order);
    }

  };

  React.useEffect(() => {
    setRoadmapID(roadmapID);
  }, []);

  return (
    <>
      <Row
        className={`mb-0 pl-0 p-2 ${start && "roadmap-first"} ${
          end && "roadmap-first"
        }`}
      >
        <Col className={"ml-0 mr-0 pl-0 pr-0"}>
          <Form onSubmit={(e) => e.preventDefault}>
            <Form.Row>
              <Form.Group className={"mr-3"} as={"div"}>
                <DatePicker onChange={() => setIsChanged(true)} order={order} />
              </Form.Group>
              {!completed && (
                <Form.Group className={"mt-1 ml-5 pt-0"}  >
                  <Row>
                    <FormCheck
                      style={{
                        paddingTop: 2
                      }}
                      className={"checkbox mt-1 ml-2"}
                      size={35}
                      onChange={() => {
                        setIncomplete(order);
                        triggerChange();
                      }}
                      checked={!data[order]?.completed}
                    />

                    <Form.Label className={"d-sm-block pt-1 mb-5"}>
                      <span
                        style={{
                          fontWeight: 500,
                          fontSize: 15
                        }}
                      >
                        Incomplete
                      </span>
                    </Form.Label>
                  </Row>
                </Form.Group>
              )}
            </Form.Row>
            {completed}
            <Form.Group>
                <Form.Control
                  value={data[order]?.name ? data[order].name : ""}
                  onChange={(e) => {
                    if (createMode == true) {
                      data[order].new = true;
                    }
                    setName(e.target.value, order);
                    triggerChange();
                  }}
                  as="textarea"
                  rows={1}
                  placeholder="Title"
                />
              </Form.Group>
            <Form.Group>
              <Form.Control
                value={data[order]?.description ? data[order].description : ""}
                onChange={(e) => {
                  setDescription(e.target.value, order);
                  triggerChange();
                }}
                as="textarea"
                rows={4}
                placeholder="Description"
              />
              </Form.Group>
              <div>
                <RiDeleteBin5Line
                  onClick={() => setShowDelete(true)}
                  disabled={false}
                  style={{
                    color: '#dc3545',
                    cursor: "pointer",
                    marginTop: "0.5rem",
                    marginLeft: "0.4rem",
                    float: "left",
                  }}
                  className={""}
                  size={26} />
                {(!dropdownDisable || !isChanged || !data[order]?.name != "") ? null : (
                  <div>
                    <RiCheckFill
                      style={{
                        color: '#1FD12E',
                        cursor: "pointer",
                        marginTop: "0.3rem",
                        marginLeft: "0.4rem",
                        float: "left",
                      }}
                      disabled={!dropdownDisable || !isChanged}
                      onClick={() => save()}
                      size={35}/>

                  </div>
                )}
             </div>
          </Form>
        </Col>
        <div>
          {showDelete && (
            <OutsideClickHandler
              onOutsideClick={() => {
                setShowDelete(false);
              }}
            >
              <div
                style={{
                  background: "white",
                  top: "40%",
                  right: "50%",
                  fontWeight: 500,
                }}
                className={"border pt-3 pb-3 pl-3 pr-3 position-absolute"}
              >
                Are you sure you want to delete this step?
                <div>
                  <Button
                    onClick={() => setShowDelete(false)}
                    variant="outline-primary"
                    className={"float-right border-0 mt-2"}
                    style={{
                      borderRadius: 0,
                    }}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDelete(false);
                      removeMap(order);
                    }}
                    variant="outline-danger"
                    className={"float-right border-0 mt-2"}
                    style={{
                      borderRadius: 0,
                    }}
                  >
                    Confirm Deletion
                  </Button>
                </div>
              </div>
            </OutsideClickHandler>
          )}
        </div>
      </Row>
    </>
  );
};

export default RoadmapBox;
