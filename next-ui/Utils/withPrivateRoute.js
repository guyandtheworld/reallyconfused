import ServerCookie from "next-cookies";
import React, { Component } from "react";
import { AuthToken } from "./auth";
import Cookie from "js-cookie";
import Router from "next/router";

export default function privateRoute(WrappedComponent) {
  return class extends Component {
    static async getInitialProps(ctx) {
      const token = ServerCookie(ctx)["token"];
      const auth = new AuthToken(token);
      const initialProps = { auth };
      if (ctx.res) {
        const token = ServerCookie(ctx)["token"];
        const auth = new AuthToken(token);
        if (!token || auth.isExpired) {
          ctx.res.writeHead(302, {
            Location: `/login?redirected=true&to=${ctx.asPath}`,
          });
          ctx.res.end();
        }
      } else {
        const token = Cookie.get("token");
        const auth = new AuthToken(token);
        if (!token || auth.isExpired) {
          Router.push(`/login?redirected=true&to=${ctx.asPath}`);
        }
      }
      if (WrappedComponent.getInitialProps)
        return WrappedComponent.getInitialProps(initialProps);
      return initialProps;
    }

    get auth() {
      return new AuthToken(this.props.auth.token);
    }

    render() {
      return <WrappedComponent auth={this.auth} {...this.props} />;
    }
  };
}
