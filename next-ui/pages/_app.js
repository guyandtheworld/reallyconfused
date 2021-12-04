import React from "react";
import App from "next/app";
import "../styles/globals.scss";
import "../styles/react-select.scss"
import CreateState from "../Context/CreateContext/CreateState";

export default class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <>
        <CreateState>
          <Component {...pageProps} />
        </CreateState>
      </>
    );
  }
}
