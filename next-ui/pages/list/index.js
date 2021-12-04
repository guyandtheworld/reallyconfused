import React, { useEffect, useState } from "react";
import CustomNav from "../roadmap/Nav/Navbar";
import TableContainer from "./Table/Table";
import { Container, Dropdown } from "react-bootstrap";
import Card from "./Card/Card";
import Head from "next/head";
import { ServerGetNoCookie } from "../../Utils/api";
import { Get } from "../../Utils/api";
import { initGA, logPageView } from "../../Utils/analytics";
import { hotjar } from "react-hotjar";

const Roadmap = ({ dataRoad, langFilterProp, jobFilterProp }) => {
  const [data, setData] = useState(dataRoad);

  const [jobFilter, setJobFilter] = useState(jobFilterProp);
  const [langFilter, setLangFilter] = useState(langFilterProp);
  const [jobFilterList, setJobFilterList] = useState({});
  const [langFilterList, setLangFilterList] = useState({});

  React.useEffect(() => {
    hotjar.initialize(2067448, 6);
    if (!window.GA_INITIALIZED) {
      initGA();
      window.GA_INITIALIZED = true;
    }
    logPageView();
  }, []);

  useEffect(() => {
    Get("roadmap/step?type=3").then((e) => {
      if (e.status === 200) {
        let obj = {};
        e.data.map((x) => {
          obj[x.ID] = x.title;
        });
        setLangFilterList(obj);
      }
    });
    Get("roadmap/step?type=1").then((e) => {
      if (e.status === 200) {
        let obj = {};
        e.data.map((x) => {
          obj[x.ID] = x.title;
        });
        setJobFilterList(obj);
      }
    });
  }, []);

  const [error, setError] = useState();

  useEffect(() => {
    setError(false);
    setData([]);
    if (!langFilter && !jobFilter) {
      Get("roadmap/all").then((e) => {
        if (e.status === 200) {
          if (e.data.roadmaps) {
            setData(e.data["roadmaps"]);
          } else {
            setError(true);
          }
        }
      });
    } else if (!jobFilter) {
      Get(`roadmap/all?start=${langFilter}`).then((e) => {
        if (e.status === 200) {
          if (e.data.roadmaps?.length) {
            setData(e.data["roadmaps"]);
          } else {
            setError(true);
          }
        }
      });
    } else if (!langFilter) {
      Get(`roadmap/all?end=${jobFilter}`).then((e) => {
        if (e.status === 200) {
          if (e.data.roadmaps?.length) {
            setData(e.data["roadmaps"]);
          } else {
            setError(true);
          }
        }
      });
    } else {
      Get(`roadmap/all?start=${langFilter}&end=${jobFilter}`).then((e) => {
        if (e.status === 200) {
          if (e.data.roadmaps?.length) {
            setData(e.data["roadmaps"]);
          } else {
            setError(true);
          }
        }
      });
    }
  }, [langFilter, jobFilter]);

  return (
    <>
      <Head>
        <title>ReallyConfused</title>
      </Head>
      <CustomNav />
      <Container className={"d-none d-md-block mt-4"}>
        <TableContainer
          error={error}
          setLangFilter={setLangFilter}
          langFilter={langFilter}
          setLangFilterList={setLangFilterList}
          jobFilterList={jobFilterList}
          setJobFilterList={setJobFilterList}
          langFilterList={langFilterList}
          setJobFilter={setJobFilter}
          jobFilter={jobFilter}
          data={data.sort((a, b) => (b.stars || 0) - (a.stars || 0))}
        />
      </Container>
      <Container className={"d-md-none mt-4"}>
        <h4 className={"m-2 p-1 mb-4 mr-auto"}>Roadmaps</h4>
        <Dropdown className={"mt-2"} onSelect={(e) => setLangFilter(e)}>
          <Dropdown.Toggle variant="outline" id="dropdown-basic">
            <span className={"mr-1"} aria-label={"laptop"} role={"img"}>
              💻
            </span>
            {langFilter ? langFilterList[langFilter] : "All Languages"}
          </Dropdown.Toggle>

          <Dropdown.Menu alignRight>
            <Dropdown.Item eventKey={0}>All Languages</Dropdown.Item>
            {Object.keys(langFilterList).map((x) => {
              return (
                <Dropdown.Item key={x} eventKey={x}>
                  {langFilterList[x]}
                </Dropdown.Item>
              );
            })}
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown className={"mt-2 mr-2"} onSelect={(e) => setJobFilter(e)}>
          <Dropdown.Toggle variant="outline" id="dropdown-basic">
            <span className={"mr-1"} aria-label={"brief-case"} role={"img"}>
              💼
            </span>
            {jobFilter ? jobFilterList[jobFilter] : "All Day-Jobs"}
          </Dropdown.Toggle>

          <Dropdown.Menu alignRight>
            <Dropdown.Item eventKey={0}>All Day-Jobs</Dropdown.Item>
            {Object.keys(jobFilterList).map((x) => {
              return (
                <Dropdown.Item key={x} eventKey={x}>
                  {jobFilterList[x]}
                </Dropdown.Item>
              );
            })}
          </Dropdown.Menu>
        </Dropdown>
        {data?.length ? (
          data
            .sort((a, b) => (b.stars || 0) - (a.stars || 0))
            .map((x) => <Card key={x.id} data={x} />)
        ) : error ? (
          <div className={"empty-message"}>Sorry, no roadmaps found.</div>
        ) : (
          <div className="loader"></div>
        )}
      </Container>
    </>
  );
};

Roadmap.getInitialProps = async (ctx) => {
  let res;
  let langFilterProp = 0;
  let jobFilterProp = 0;
  if (ctx.query.career) {
    res = await ServerGetNoCookie(`roadmap/all?end=${ctx.query.career}`, ctx);
    jobFilterProp = ctx.query.career;
  } else if (ctx.query.language) {
    res = await ServerGetNoCookie(`roadmap/all?start=${ctx.query.language}`, ctx);
    langFilterProp = ctx.query.language;
  } else {
    res = await ServerGetNoCookie("roadmap/all?type", ctx);
  }
  return { dataRoad: res.data["roadmaps"], langFilterProp, jobFilterProp };
};

export default Roadmap;
