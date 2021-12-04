import React, { useEffect, useState } from "react";
import CustomNav from "../roadmap/Nav/Navbar";
import TableContainer from "../list/Table/Table";
import { Container, Dropdown, Row } from "react-bootstrap";
import Head from "next/head";
import { ServerGet } from "../../Utils/api";
import ServerCookie from "next-cookies";
import HOCfun from "../../Utils/reRoute";
import { initGA, logPageView } from "../../Utils/analytics";
import { hotjar } from "react-hotjar";
import Card from "../list/Card/Card";

const Roadmap = ({ dataRoad, userId, errors }) => {
  const [data, setData] = useState(dataRoad || []);

  React.useEffect(() => {
    hotjar.initialize(2067448, 6);
    if (!window.GA_INITIALIZED) {
      initGA();
      window.GA_INITIALIZED = true;
    }
    logPageView();
  }, []);

  const [error, setError] = useState(errors);

  return (
    <>
      <Head>
        <title>ReallyConfused</title>
      </Head>
      <CustomNav />
      <Container className={"d-none d-md-block mt-4"}>
        <TableContainer
          error={error}
          jobFilterList={{}}
          langFilterList={{}}
          jobFilter={null}
          langFilter={null}
          my={true}
          data={data.sort((a, b) => (b.stars || 0) - (a.stars || 0))}
        />
      </Container>
      <Container className={"d-md-none mt-4"}>
        <h4 className={"m-2 p-1 mb-4 mr-auto"}>My Roadmaps</h4>
        {data.length !== 0 ? (
          data
            .sort((a, b) => (b.stars || 0) - (a.stars || 0))
            .map((x) => <Card key={x.id} data={x} />)
        ) : error ? (
          <div className={"empty-message"}>Sorry, no roadmaps found.</div>
        ) : (
          <div className="loader"></div>
        )}{" "}
      </Container>
    </>
  );
};

Roadmap.getInitialProps = async (ctx) => {
  let errors = false;
  let res;
  try {
    HOCfun(ctx);
    res = await ServerGet(`roadmap/user/${ServerCookie(ctx)["userId"]}`, ctx);
    if (res.data["roadmaps"] && res.data["roadmaps"].length) {
      res = res.data["roadmaps"];
    } else {
      errors = true;
      res = [];
    }
  } catch (e) {
    console.log(e);
    res = [];
    errors = true;
  }

  return {
    dataRoad: res,
    errors,
    userId: ServerCookie(ctx)["userId"],
  };
};

export default Roadmap;
