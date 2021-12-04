import { getDisplayName } from "next/dist/next-server/lib/utils";
import React from "react";
import { Form, Col } from "react-bootstrap";


const SocialMediaField = ({ name, isEdit, state, setState, type, ownProfile }) => {
  return (
    <>
      <Col className={"mt-2"}>
        <Form.Label>{name}</Form.Label>
        {isEdit ? (
          <Form.Control
            type="text"
            placeholder={`${name}`}
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
        ) : type === "link" ? (
          <h6>
            <a target="_blank" href={state}>
              {state}
            </a>
          </h6>
        ) : (
          <h6>{state}</h6>
        )}
      </Col>
    </>
  );
};

export default SocialMediaField;
