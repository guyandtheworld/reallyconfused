import React from "react";
import CustomNav from "../roadmap/Nav/Navbar";
import ProfileCard from "./profileCard";
import HOC from "../../Utils/withPrivateRoute";
import { Container } from "react-bootstrap";
import Head from "next/head";
import { initGA, logPageView } from "../../Utils/analytics";
import { hotjar } from "react-hotjar";

const Roadmap = () => {
  React.useEffect(() => {
    hotjar.initialize(2067448, 6);
    if (!window.GA_INITIALIZED) {
      initGA();
      window.GA_INITIALIZED = true;
    }
    logPageView();
  }, []);

  return (
    <>
      <Head>
        <title>ReallyConfused - Profile</title>
      </Head>
      <CustomNav />
      <Container>
        <ProfileCard user={1} />
      </Container>
    </>
  );
};

export default HOC(Roadmap);
