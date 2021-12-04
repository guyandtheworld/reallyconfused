import { Container, Row, Button, Col, Form } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import OutlineDropdown from "../Components/OutlineDropdown/OutlineDropdown";
import styles from "./ShowRoadmap.module.scss";
import { Delete, Get, Post, Put } from "../../../Utils/api";
import Lodash, { xor } from "lodash";
import { useRouter } from "next/router";
import ToolTip from "../Components/ToolTip/ToolTip";
import { AiFillStar } from "react-icons/ai";
import { FiMoreHorizontal } from "react-icons/fi";
import Cookie from "js-cookie";
import { BsLink45Deg } from "react-icons/bs";
import ReactMarkdown from "react-markdown";

const ShowRoadmap = (props) => {
  const [data, setData] = useState([]);
  const [starCount, setStarCount] = useState([]);
  const [incomplete, setIncomplete] = useState([]);
  const [string, setString] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [simplified, setSimplified] = useState(false);
  const [premium, setPremium] = useState(false);
  const [email, setEmail] = useState("");
  const [userID, setUserID] = useState(0);
  const [roadmapID, setRoadmapID] = useState([]);

  const router = useRouter();
  const queryKey = "roadmap";
  const roadmapUniqueKey = router.query[queryKey];

  const [isUser, setIsUser] = useState(Cookie.get("token") ? true : false);

  const colors = [
    "DA5D58",
    "DA8358",
    "DAA858",
    "DACD58",
    "C2DA58",
    "9DDA58",
    "78DA58",
    "58DA5D",
    "58DA83",
    "58DAA8",
    "58DACD",
    "58C2DA",
    "589DDA",
    "5878DA",
    "5D58DA",
    "611FD1",
    "941FD1",
    "C71FD1",
    "D11FA9",
    "D11F76",
    "D11F43",
  ];

  const getDate = (date) => {
    return new Date(date);
  };

  const [buttonDisable, setButtonDisable] = useState(false);

  const createRoadmapLandMetric = (id) => {
    /*
      create click if user lands on roadmap through link and website
      create metric if user came through
    */
    Post("metrics/createclick", {
      type: "roadmap",
      from: props["referer"],
      current: router.pathname,
      roadmap: id,
      user: Cookie.get("userId") ? parseInt(Cookie.get("userId")) : 0,
    });
  };

  const externalUserLink = () => {
    /*
      Record click to adam's website
      metric is useful for building the funnel.
    */

    window.open("https://discord.gg/aDvHC5DUPU", "_blank");
  };

  const createRoadmapButtonMetric = () => {
    /*
      create click if user clicks on button out of the website
    */

    Post("metrics/createclick", {
      type: "roadmap_external_button",
      from: props["referer"],
      current: router.pathname,
      roadmap: parseInt(roadmapID),
      user: Cookie.get("userId") ? parseInt(Cookie.get("userId")) : 0,
    });
  };

  const pursueRoadmap = () => {
    if (isUser) {
      setButtonDisable(true);
      Post("roadmap/pursue", { id: parseInt(roadmapID) }).then((e) => {
        router.push(`${e.data.unique_link}`);
      });
    } else {
      router.push({
        pathname: "/login",
        query: {
          redirected: "true",
          to: router.asPath,
        },
      });
    }
  };

  const save = (i) => {
    let tempData = data[i];
    tempData.checked = false;
    let finalData = data;
    finalData[i] = tempData;
    setData([...finalData]);
    Put("roadmap/roadmapstep", {
      user: parseInt(localStorage.getItem("userId")),
      ...tempData,
    });
  };

  function LinkRenderer(props) {
    return (
      <a href={props.href} target="_blank">
        {props.children}
      </a>
    );
  }

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];

  const [creator, setCreator] = useState();

  const [checkRoadmap, setCheckRoadmap] = useState(false);

  useEffect(() => {

    Get("user/profile").then((e) => {
      Cookie.set("userName", e?.data?.name, { expires: 70 });
      Cookie.set("userId", e.data.user_id, { expires: 70 });
      Cookie.set("premium", e?.data?.premium, { expires: 70 });
      setEmail(e?.data?.email);
      setUserID(e?.data?.user_id);
      setPremium(e?.data?.premium);
    });

    // remove it way later. redirection from old adam roadmap
    if (roadmapUniqueKey == "web-dev-career") {
      router.push(`/roadmap/land-my-first-web-developer-job-interview-asap`);
    } else {
      roadmapUniqueKey &&
        Get(`roadmap/get/${roadmapUniqueKey}`).then((e) => {
          if (e.status === 200) {
            createRoadmapLandMetric(e.data.id);
            setRoadmapID(e.data.id);
            setCreator(e.data.creator);
            setIncomplete(e.data.incomplete);
            if (e.data.creator == Cookie.get("userId") && e.data.incomplete) {
              setCheckRoadmap(true);
            }

            let tempData = Lodash.sortBy(e.data.steps, ["position"]);

            tempData.forEach((x) => {
              x["checked"] = false;
            });

            setStarCount(e.data.stars);
            setCreatorName(e.data.name);
            setSimplified(e.data.simplified);
            setData(tempData);
            setString(e.data.title);
          } else {
            router.push(`/construction/`);
          }
        });
    }
  }, [router]);

  const findColor = (completed, i) => {
    /* Allot color to the steps */

    if (!completed) {
      return "grey";
    }

    var color = colors[i % colors.length];
    return color;
  };

  return (
    <>
      <script src="https://gumroad.com/js/gumroad.js"></script>
      <Container className={"position-relative"}>
        {data.length === 0 ? <div className=" loader"></div> : null}

        <Row className={"d-none  d-lg-none"}>
          <Col className={""}>
            <h1 className={"mt-5 mb-2"}>{string}</h1>
          </Col>

          {!!data.length && parseInt(Cookie.get("userId")) === creator && (
            <Button
              size={"md"}
              onClick={() => router.push(`/edit/${roadmapID}`)}
              variant={"outline-primary"}
              style={{
                borderRadius: 0,
              }}
              className={`${styles.createButton} mt-5 mb-auto`}
            >
              Edit Roadmap
            </Button>
          )}
        </Row>
        <div className={"d-lg"}>
          <Row>
            <Col className={"text-center"}>
              <h1 className={"mt-5 mb-2"}>{string}</h1>
            </Col>
          </Row>

          <div
            style={{
              display: roadmapID != 1107 ? "none" : "block",
            }}
          >
            <Row>
              <Col className={`text-center ${styles.roadProfile}`}>
                <img src="https://i.imgur.com/ibGRRCE.jpg"/>
                <p className={`${styles.roadProfileName}`}>Adam Mikulasev</p>
              </Col>
            </Row>

            <Row>
              <Col className={`text-center`}>
                <p className={`${styles.roadProfileText}`}>
                  A lot of road-maps end with the mastery of a specific
                  programming language or framework in mind, and try to
                  incorporate popular tools and technologies along the way. This
                  road-map is not like that.
                  <br></br>
                  <br></br>
                  This road-map is a step by step guide to landing that first
                  web development job as quickly as possible, for those who
                  don't know where to start or feel lost on their journey.
                  <br></br>
                  <br></br>
                  By focusing attention on job listings at the beginning of the
                  process, you'll be in for less surprises later. Do your
                  research first so that you know where you need to focus your
                  programming efforts to land that first interview.
                </p>
              </Col>
            </Row>
          </div>

          {!!data.length && (
            <Row className={"flex-end mt-3 justify-content-center flex-wrap "}>
              <Col className={"d-flex"} lg={{ span: 8 }}>
                <Button
                  style={{
                    border: 0,
                    color: "#7a7aea",
                    fontWeight: 600,
                    fontSize: "1.8em",
                    display: roadmapID == 1107 ? "none" : "block",
                  }}
                  variant={""}
                  onClick={() => router.push({
                    pathname: "/profile",
                    query: {
                      roadmap: roadmapID,
                      title: roadmapUniqueKey,
                    },
                  })}
                  className={`border-0 ml-auto p-0 lg-mt ${styles}`}
                >
                  {"- "}
                  <i>{creatorName}</i>
                </Button>
              </Col>
            </Row>
          )}
          {!!data.length && (
            <Row className={"flex-end justify-content-center flex-wrap "}>
              <Col
                lg={{ span: 8 }}
                className={"d-flex flex-wrap mt-3 mb-3 justify-content-end"}
              >
                {parseInt(Cookie.get("userId")) === creator ? (
                  <span className={"ml-3"}>
                    <Reminder roadmap={roadmapID} />
                  </span>
                ) : null}

                {roadmapID != 1107 ? (
                  <Stars roadmap={roadmapID} starCount={starCount} />
                ) : null}

                {parseInt(Cookie.get("userId")) === creator ? (
                  <Button
                    size={"md"}
                    onClick={() => router.push(`/edit/${roadmapUniqueKey}`)}
                    variant={"outline-primary"}
                    className={`${styles.createButton} ml-3 md-mt`}
                  >
                    Edit Roadmap
                  </Button>
                ) : (
                  <Button
                    size={"md"}
                    onClick={() => {
                      pursueRoadmap(isUser);
                    }}
                    style={{
                      display: roadmapID == 1107 ? "none" : "block",
                    }}
                    disabled={buttonDisable}
                    variant={"outline-primary"}
                    className={`${styles.createButton} ml-3`}
                  >
                    Fork Roadmap
                  </Button>
                )}
              </Col>
            </Row>
          )}
        </div>

      {/* { premium === true || roadmapID == 1107 || roadmapID == 1281 || roadmapID == 1205 ? ( */}
        <Col
          lg={{ span: 6, offset: 3 }}
          className={"d-lg row pr-0 pl-0 d-flex mt-5 mb-5 pb-5 flex-column"}
        >
          {data.length ? (
            <span
              className={
                styles[`lineStart-${findColor(data[0]?.completed, 0)}`]
              }
            ></span>
          ) : null}
          {data.map((y, i) => (
            <>
              <Col className={"p-0 pb-4"}>
                <div
                  className={`${styles[`detStraight`]} display-flex flex-row`}
                >
                  {!(i === data.length - 1) && (
                    <span
                      className={
                        styles[`lineDown-${findColor(y?.completed, i)}`]
                      }
                    >
                      {""}
                    </span>
                  )}
                  <span
                    className={
                      styles[`downCircle-${findColor(y?.completed, i)}`]
                    }
                  >
                    {""}
                  </span>
                  {!simplified ? (
                    <span
                      className={
                        styles[`typeStraight-${findColor(y?.completed, i)}`]
                      }
                    >
                      {y.step_type}
                    </span>
                  ) : null}
                </div>
                <div
                  className={`pl-1 ml-3 ${
                    simplified ? "pt-0" : "pt-4"
                  } pb-4 pr-3`}
                >
                  <div
                    className={`ml-5 ${
                      styles[`box-${findColor(true, i)}`]
                    } pt-0 pl-4 pr-3 pb-0`}
                  >
                    <div
                      className={` justify-content-between d-flex align-items-center`}
                    >
                      {
                        // eslint-disable-next-line
                        <div
                          onClick={() => y.link && window.open(y.link)}
                          className={`h5 ${y.link && "linkHover"}`}
                        >
                          {checkRoadmap && (y.checked || !y.completed) && (
                            <Form.Group
                              onChange={(e) => {
                                let tempData = data[i];
                                tempData.checked = e.target.checked;
                                tempData.completed = e.target.checked;
                                let finalData = data;
                                finalData[i] = tempData;
                                setData([...finalData]);
                              }}
                              className={"d-inline "}
                            >
                              <Form.Check
                                disabled={
                                  i - 1 !== -1 &&
                                  (data[i - 1].checked ||
                                    !data[i - 1].completed)
                                }
                                type="checkbox"
                                className={"d-inline mr-3"}
                              />
                            </Form.Group>
                          )}
                          {y.title}
                          {y.link && (
                            <BsLink45Deg
                              style={{ marginLeft: 1, strokeWidth: 0.5 }}
                            />
                          )}
                        </div>
                      }

                      {roadmapID != 1107 ? (
                        <div
                          className={
                            styles[`datebox-${findColor(y?.completed, i)}`]
                          }
                        >
                          <span className={styles.month}>
                            {monthNames[getDate(y.date).getMonth()]}{" "}
                            {getDate(y.date).getFullYear()}
                          </span>
                        </div>
                      ) : null}
                    </div>{" "}
                    {incomplete && y.checked && (
                      <>
                        <Form.Group>
                          <Form.Control
                            style={{ border: "1px solid #919191" }}
                            value={y?.description_1 ? y.description_1 : ""}
                            onChange={(e) => {
                              let tempData = data[i];
                              tempData.description_1 = e.target.value;
                              let finalData = data;
                              finalData[i] = tempData;
                              setData([...finalData]);
                            }}
                            as="textarea"
                            className={"mt-3"}
                            rows={4}
                            placeholder={"Description"}
                          />
                        </Form.Group>
                        <Button
                          variant={"outline-primary"}
                          onClick={() => save(i)}
                          className={"ml-auto d-block"}
                        >
                          Save
                        </Button>
                      </>
                    )}
                    {!y.checked && y.description_1 ? (
                      <div>
                        <FiMoreHorizontal />
                        <p>
                          <ReactMarkdown renderers={{ link: LinkRenderer }}>
                            {y.description_1}
                          </ReactMarkdown>
                        </p>
                      </div>
                    ) : null}
                    {y.description_2 ? (
                      <ToolTip
                        text={
                          y.step_type === "Language"
                            ? "How was it beneficial to your end-goal?"
                            : y.step_type === "Career" ||
                              y.step_type === "Day-Job"
                            ? "Are you Content?"
                            : "How was it beneficial to your end-goal?"
                        }
                      >
                        <div>
                          <FiMoreHorizontal />
                          <p>{y.description_2}</p>
                        </div>
                      </ToolTip>
                    ) : null}
                  </div>
                </div>
              </Col>
            </>
          ))}

          <Row>
            <Col className={`text-center pt-4`}>
              <p className={`${styles.roadProfileText}`}>
                Still feeling confused, lost or overwhelmed?
              </p>
              <p className={`${styles.roadProfileText}`}>
                Let us know what your biggest problem is right now, and one of
                our mentors will help you move forward with confidence!
              </p>
            </Col>
          </Row>

          <Container className={"d-flex justify-content-around pt-4"}>
            <img
              src="/joindiscord.png"
              className={`${styles.discordButton}`}
              onClick={() => {
                createRoadmapButtonMetric();
                externalUserLink();
              }}
              height="60px"
              alt="Discord Invite"
            />
          </Container>
        </Col>
        {/* ) : (
          <Col
          lg={{ span: 6, offset: 3 }}
          className={"d-lg row pr-0 pl-0 d-flex mt-5 mb-5 pb-5 flex-column"}
          >
            <div className={styles.contactCard}>
              <div>
                <h4>Upgrade to Premium to Unlock Roadmaps</h4>
                <br></br>
                <p>With premium, you get lifetime access to all the Roadmaps. You can edit, create and host Roadmaps.</p>
                <br></br>
                <a class="gumroad-button" href={`https://reallyconfused.gumroad.com/l/roadmaps?email=${email}&userid=${userID}`}>Buy Premium (Lifetime Access)</a>
              </div>
            </div>

          </Col>
        )} */}
      </Container>
    </>
  );
};

export default ShowRoadmap;

const Stars = ({ roadmap, starCount }) => {
  const router = useRouter();
  const [isUser, setIsUser] = React.useState(
    Cookie.get("token") ? true : false
  );

  if (starCount == null) {
    starCount = 0;
  }

  useEffect(() => {
    if (isUser) {
      Post("roadmap/isstarred", {
        user: parseInt(Cookie.get("userId")),
        roadmap: parseInt(roadmap),
      }).then((e) => {
        setStars(e.data.stars);
        setIsStared(e.data.result);
        setLoading(false);
      });
    } else {
      setStars(starCount);
      setLoading(false);
    }
  }, []);

  const [isStared, setIsStared] = useState(false);
  const [stars, setStars] = useState(0);
  const [loading, setLoading] = useState(true);

  const star = () => {
    setLoading(true);
    if (isUser) {
      if (isStared) {
        setStars(stars - 1);
        Post("roadmap/unstar", {
          user: parseInt(Cookie.get("userId")),
          roadmap: parseInt(roadmap),
        }).then(() => {
          setIsStared(false);
          setLoading(false);
        });
      } else {
        setStars(stars + 1);
        Post("roadmap/star", {
          user: parseInt(Cookie.get("userId")),
          roadmap: parseInt(roadmap),
        }).then(() => {
          setIsStared(true);
          setLoading(false);
        });
      }
    } else {
      setLoading(false);
      router.push({
        pathname: "/login",
        query: {
          redirected: "true",
          to: router.asPath,
        },
      });
    }
  };

  return (
    <>
      <Button
        onClick={star}
        disabled={loading}
        variant={"outline-primary position-relative pr-5"}
        className={`${styles.createButton} ml-3 md`}
      >
        <AiFillStar
          size={16}
          className={"mr-1 "}
          style={{ marginBottom: "0.125rem" }}
        />
        {!isStared ? "Star" : "Unstar"}{" "}
        <div className={styles.miniBox}>{stars}</div>
      </Button>
    </>
  );
};

const Reminder = ({ roadmap }) => {
  //

  const defaultData = [
    {
      day: "MO",
      id: null,
      active: false,
    },
    {
      day: "TU",
      id: null,
      active: false,
    },
    {
      day: "WE",
      id: null,
      active: false,
    },
    {
      day: "TH",
      id: null,
      active: false,
    },
    {
      day: "FR",
      id: null,
      active: false,
    },
    {
      day: "SA",
      id: null,
      active: false,
    },
    {
      day: "SU",
      id: null,
      active: false,
    },
  ];

  const [data, setData] = useState(defaultData);

  useEffect(() => {
    Post(`roadmap/listreminder`, {
      user: parseInt(Cookie.get("userId")),
      roadmap: parseInt(roadmap),
    }).then((e) => {
      setLoading(false);
      let stateData = [...data];
      let reminderData = e.data.sort((a, b) => a["day"] - b["day"]);
      reminderData.map((x) => {
        stateData[x.day - 1].active = true;
        stateData[x.day - 1].id = x.ID;
      });
      setData(stateData);
    });
  }, []);

  const activeStyle = {
    borderRadius: "50%",
    fontSize: "0.8rem",
    backgroundColor: "#2196f3",
    padding: "0.75rem",
    margin: "0.25rem",
    color: "white",
    border: "none",
  };

  const inactiveStyle = {
    borderRadius: "50%",
    fontSize: "0.8rem",
    color: "#2196f3",
    padding: "0.75rem",
    margin: "0.25rem",
    border: "none",
    backgroundColor: "white",
  };

  const activate = (day) => {
    setLoading(true);
    Post("roadmap/reminder", {
      user: parseInt(Cookie.get("userId")),
      roadmap: parseInt(roadmap),
      day: day,
      hour: 1,
      timezone: new Date().getTimezoneOffset() / 60,
    }).then((e) => {
      setLoading(false);
      let newData = data;
      newData[day - 1].active = true;
      newData[day - 1].id = e.data.ID;
      setData([...newData]);
    });
  };

  const deactivate = (id, day) => {
    setLoading(true);
    Delete(`roadmap/reminder/${id}`).then(() => {
      let newData = data;
      newData[day - 1].active = false;
      newData[day - 1].id = null;
      setData([...newData]);
      setLoading(false);
    });
  };

  const [loading, setLoading] = useState(true);

  return (
    <>
      <OutlineDropdown name={"Reminders"}>
        <div className={"h6 m-2"}>Pick Week Day</div>
        <div className={"d-flex justify-content-between"}>
          {data?.map((x, i) => (
            <button
              className={"btn"}
              disabled={loading}
              style={x.active ? activeStyle : inactiveStyle}
              onClick={() => {
                if (x.active) {
                  deactivate(x.id, i + 1);
                } else {
                  activate(i + 1);
                }
              }}
              key={x.day}
            >
              {x.day}
            </button>
          ))}
        </div>
      </OutlineDropdown>
    </>
  );
};
