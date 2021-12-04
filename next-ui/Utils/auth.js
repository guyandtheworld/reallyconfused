import jwtDecode from "jwt-decode";
import Router from "next/router";
import { Post } from "./api";
import Cookie from "js-cookie";

export const PostLogin = (username, password) => {
  Post("login", { email: username, password }).then((e) => {
    AuthToken.storeToken(e.data.token);
  });
};

export class AuthToken {
  constructor(token) {
    // we are going to default to an expired decodedToken
    this.decodedToken = { email: "", exp: 0 };
    this.token = token;
    // then try and decode the jwt using jwt-decode
    try {
      if (token) this.decodedToken = jwtDecode(token);
    } catch (e) {}
  }

  get authorizationString() {
    return `Bearer ${this.token}`;
  }

  get expiresAt() {
    return new Date(this.decodedToken.exp * 1000);
  }

  get isExpired() {
    return new Date() > this.expiresAt;
  }

  get isValid() {
    return !this.isExpired;
  }

  static async storeToken(token) {
    Cookie.set("token", token, { expires: 70 });
    await Router.push("/");
  }

  static async logout() {
    Cookie.remove("token");
    Cookie.remove("userId","name");
    await Router.push("/login");
  }
}
