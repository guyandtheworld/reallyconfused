import React, { useState } from "react";
import { Post } from "../../../Utils/api";
import { Modal, Button, Form } from "react-bootstrap";

const Premium = ({ show, setShow, names, emails, id }) => {
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [email, setEmail] = useState(emails);
  const [name, setName] = useState(names);
  const [interest, setInterest] = useState("");
  const [ambition, setAmbition] = useState("");
  const [disbled, setDisabled] = useState(false);
  const [complete, setComplete] = useState(false);

  const submit = () => {
    setDisabled(true);
    Post("user/schedulecall", {
      user: id,
      reachable_email: email,
      interest: interest,
      ambition: ambition,
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
          <Modal.Title>Interests and Goals</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Email</Form.Label>
            <Form.Control
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Enter email"
            />
            <Form.Text className="text-muted">
              Email where our we would be able to reach back to you.
            </Form.Text>
          </Form.Group>

          <Form.Group controlId="exampleForm.ControlTextarea1">
            <Form.Label>What are your goals?</Form.Label>
            <Form.Control
              onChange={(e) => setAmbition(e.target.value)}
              rows="2"
              as="textarea"
            />
            <Form.Text className="text-muted">
              Do you see yourself working remotely from Ibiza? Do you never want to talk to human being again while making six figure salary? Do you eventually want to run a company?
            </Form.Text>
          </Form.Group>

          <Form.Group controlId="exampleForm.ControlTextarea1">
            <Form.Label>What are your interests?</Form.Label>
            <Form.Control
              onChange={(e) => setInterest(e.target.value)}
              as="textarea"
              rows="2"
            />
            <Form.Text className="text-muted">
              Are you good at talking? Do you consider yourself a generalist? Are you an artist? Anything to describe yourself so that we can find what would suit you.
            </Form.Text>
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
            disabled={!interest.length || !ambition.length || disbled}
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

export default Premium;
