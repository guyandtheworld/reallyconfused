import React from "react";
import PropTypes from "prop-types";
import { Container, Row, Col, Form } from "react-bootstrap";
import Avatar from '../../avatar'
import SocialMediaField from "../socialMediaField";
import { Get, Put } from "../../../Utils/api";
import { Button } from "react-bootstrap";
import { RiEdit2Fill } from "react-icons/ri";
import { MdSave } from "react-icons/md";
import { useRouter } from "next/router";
import Cookie from "js-cookie";
import history from "next/router";

const Card = ({ user }) => {
  const [isEdit, setIsEdit] = React.useState(false);
  const [id, setUserId] = React.useState(0);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [twitter, setTwitter] = React.useState("");
  const [linkedin, setLinkedin] = React.useState("");
  const [github, setGithub] = React.useState("");
  const [contact_link, setContactLink] = React.useState("");
  const router = useRouter();
  const {roadmap} = router.query
  const {title} = router.query
  const [ownProfile, setOwnProfile] = React.useState("");


  React.useEffect(() => {
    if (roadmap == undefined) {
      Get("user/get").then((e) => {
        setOwnProfile(e.data.user_id == Cookie.get("userId"));

        setName(e.data.name);
        setGithub(e.data.github);
        setTwitter(e.data.twitter);
        setLinkedin(e.data.linkedin);
        setUserId(e.data.user_id);
        setContactLink(e.data.contact_link);
      });
    } else {
      Get(`user/get?roadmap=${roadmap}`).then((e) => {
        setOwnProfile(e.data.user_id == Cookie.get("userId"));

        setName(e.data.name);
        setEmail(e.data.email);
        setGithub(e.data.github);
        setTwitter(e.data.twitter);
        setLinkedin(e.data.linkedin);
        setUserId(e.data.user_id);
        setContactLink(e.data.contact_link);
      });
    }
  }, []);

  const save = () => {
    setIsEdit(false);
    Put("user/update", {
      ID: id,
      email,
      name,
      github,
      twitter,
      linkedin,
      contact_link,
    });
  };
  return (
    <>
      <Row
        style={{ maxWidth: "500px" }}
        className={"flex-column ml-auto mr-auto mt-5 box p-3 mb-5"}
      >
        <Col
          className={
            "d-flex flex-column justify-content-center h4 align-items-center"
          }
        >
          <div>
            {/* <HiUserCircle size={128} /> */}
            <Avatar name = {name}/>
          </div>
          <div>{name}</div>
        </Col>
        <Col>

          {ownProfile ? (
            [
              (
                isEdit ? (
                  <Button
                  variant={"success"}
                  size={"sm"}
                  className={"d-block ml-auto"}
                  onClick={save}
                  >
                    <MdSave
                      className={"mr-1"}
                      style={{ marginBottom: "0.125rem" }}
                      size={14}
                    />{" "}
                    Save
                  </Button>
                ) : (
                  <Button
                  onClick={() => setIsEdit(true)}
                  size={"sm"}
                  className={"d-block ml-auto"}
                  >
                    <RiEdit2Fill
                      className={"mr-1"}
                      style={{ marginBottom: "0.125rem" }}
                      size={14}
                    />{" "}
                    Edit
                  </Button>

                )
              )
            ]
          ) : null}

        </Col>
        <Col>
          {/* <div>Links</div> */}
          {/* Socail Media Component */}
        </Col>
        {ownProfile ? (
          <SocialMediaField
            isEdit={isEdit}
            name={"Name"}
            state={name}
            setState={setName}
            type={"name"}
          />
        ) : null}

        {ownProfile ? (
          <SocialMediaField
            isEdit={isEdit}
            name={"Email"}
            state={email}
            setState={setEmail}
            type={"email"}
          />
        ) : null}

        {ownProfile || contact_link != "" ? (
          <SocialMediaField
            isEdit={isEdit}
            name={"Portfolio"}
            state={contact_link}
            setState={setContactLink}
            type={"link"}
            ownProfile={ownProfile}
          />
        ) : null}

        {ownProfile || github != "" ? (
          <SocialMediaField
            isEdit={isEdit}
            name={"Github"}
            state={github}
            setState={setGithub}
            type={"link"}
            ownProfile={ownProfile}
          />
          ) : null}

        {ownProfile || twitter != "" ? (
          <SocialMediaField
            isEdit={isEdit}
            name={"Twitter"}
            state={twitter}
            setState={setTwitter}
            type={"link"}
            ownProfile={ownProfile}
          />
        ) : null}

        {ownProfile || linkedin != "" ? (
          <SocialMediaField
            isEdit={isEdit}
            name={"Linkedin"}
            state={linkedin}
            setState={setLinkedin}
            type={"link"}
            ownProfile={ownProfile}
          />
        ) : null}

      </Row>

      {!ownProfile ? (
        <Container className={"d-flex justify-content-around"}>
          <Button
              onClick={() => history.push(`/roadmap/${title}`)}
              style={{ fontSize: "1rem" }}
              variant="outline-primary"
          >
            <span>Go Back to Roadmap</span>
          </Button>
        </Container>
      ) : null}

    </>
  );
};

Card.propTypes = {
  user: PropTypes.number,
};

export default Card;
