import axios from "axios";
import Cookie from "js-cookie";
import Router from "next/router";
import ServerCookie from "next-cookies";
import { AuthToken } from "./auth";

let url;

if(process.env.RC_ENV) {
  url = "http://localhost:8080/";
} else {
  url = "https://api.reallyconfused.co/";
}

export const baseURL = url;

export const Post = (url, data) => {
  return axios
    .post(`${baseURL}${url}`, data, {
      headers: {
        "x-access-token": `${Cookie.get("token")}`,
      },
    })
    .then((e) => {
      if (e.status === 401 || e.status === 403) {
        Router.push("/login");
      } else {
        return e;
      }
    });
};

export const Get = (url) => {
  return axios.get(`${baseURL}${url}`, {
    headers: {
      "x-access-token": `${Cookie.get("token")}`,
    },
    validateStatus: false,
  }).then((e) => {
    return e;
  });
};

export const Put = (url, data) => {
  return axios
    .put(`${baseURL}${url}`, data, {
      headers: {
        "x-access-token": `${Cookie.get("token")}`,
      },
    })
    .then((e) => {
      if (e.status > 400) {
        Router.push("/login");
      } else {
        return e;
      }
    });
};

export const Delete = (url, data) => {
  return axios({
    method: "DELETE",
    url: `${baseURL}${url}`,
    data: {
      ...data,
    },
    headers: {
      "x-access-token": `${Cookie.get("token")}`,
    },
  }).then((e) => {
    if (e.status === 401 || e.status === 403) {
      Router.push("/login");
    } else {
      return e;
    }
  });
};

export const ServerGet = (url, ctx) => {
  const token = ServerCookie(ctx)["token"];
  const auth = new AuthToken(token);
  if (!token || auth.isExpired) {
    ctx.res.writeHead(302, {
      Location: `/login?redirected=true&to=${ctx.asPath}`,
    });
    ctx.res.end();
  }
  return axios
    .get(`${baseURL}${url}`, {
      headers: {
        "x-access-token": token,
      },
    })
    .then((e) => {
      if (e.status > 400) {
        Router.push("/login");
      } else {
        return e;
      }
    });
};

export const ServerGetNoCookie = (url) => {
  return axios.get(`${baseURL}${url}`).then((e) => {
    if (e.status > 400) {
      Router.push("/login");
    } else {
      return e;
    }
  });
};
