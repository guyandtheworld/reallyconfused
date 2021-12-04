import React from "react";
import CustomNav from "./Nav/Navbar";
import ShowRoadmap from "./ShowRoadmap/ShowRoadmap";
import Head from "next/head";
import { initGA, logPageView } from "../../Utils/analytics";
import { hotjar } from "react-hotjar";


const Roadmap = (props) => {

  var referer = props["referer"];

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
        <title>ReallyConfused - Roadmap</title>
      </Head>
      <CustomNav />
      <ShowRoadmap referer={referer} />
    </>
  );
};


export default Roadmap;
