import ServerCookie from "next-cookies";
import Cookie from "js-cookie";
import { AuthToken } from "./auth";
import Router from "next/router";

const route = (ctx) => {
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
};

export default route;
