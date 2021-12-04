import React, { useState } from "react";
import { Post } from "../../../Utils/api";
import { Modal, Button, Form } from "react-bootstrap";

const CustomModal = ({ show, setShow, names, emails, id }) => {
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [name, setName] = useState(names);
  const [email, setEmail] = useState(emails);
  const [feedback, setFeedback] = useState("");
  const [disbled, setDisabled] = useState(false);
  const [complete, setComplete] = useState(false);

  const submit = () => {
    setDisabled(true);
    Post("user/feedback", {
      user: id,
      reachable_email: email,
      feedback: feedback,
    }).then(() => {
      setComplete(true);
      setTimeout(() => {
        handleClose();
        setComplete(false);
        setDisabled(false);
      }, [1500]);
    });
  };

  return (
    <>
      <Modal className={"modal"} show={show} onHide={handleClose}>
        <Modal.Header className="border-0" closeButton>
          <Modal.Title>Feedback</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* <Form.Group controlId="formBasicUser">
            <Form.Label>Name</Form.Label>
            <Form.Control
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Name"
            />
          </Form.Group> */}

          <Form.Group>
            <Form.Label>Email address</Form.Label>
            <Form.Control
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Enter email"
            />
            <Form.Text className="text-muted">
              Email where our support team would be able to reach back to you.
            </Form.Text>
          </Form.Group>

          <Form.Group controlId="exampleForm.ControlTextarea1">
            <Form.Label>Feedback</Form.Label>
            <Form.Control
              onChange={(e) => setFeedback(e.target.value)}
              as="textarea"
              rows="5"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0">
          {disbled && (
            <div className={`circle-loader ${complete && "load-complete"}`}>
              <div
                style={complete ? { display: "block" } : {}}
                className="checkmark draw"
              ></div>
            </div>
          )}
          <Button
            type={"submit"}
            disabled={!feedback.length || disbled}
            variant="primary"
            onClick={submit}
            onSubmit={submit}
          >
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CustomModal;
