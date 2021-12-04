import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'
import { Post } from "../../../Utils/api";

const providers = [
        Providers.GitHub({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET
        }),
        Providers.Google({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
        }),
    ]

const callbacks = {};


callbacks.signIn = async function signIn(user, account, metadata) {
    /*
        To figure this part out, read
        https://arunoda.me/blog/add-auth-support-to-a-next-js-app-with-a-custom-backend
    */
    var githubUsername = "";
    if (account["provider"] == "github") {
        githubUsername = user["name"]; //github
    }

    await Post("oauth-register", {
                    name: user["name"],
                    email: user["email"],
                    provider: account["provider"],
                    github_username: githubUsername,
    }).then((e) => {
        if (e.data.token) {
            user.accessToken = e.data.token;
            return true;
        } else {
            return false;
        }
    })
}

callbacks.jwt = async function jwt(token, user) {
    if (user) {
        token = { accessToken: user.accessToken }
    }
    return token
}

callbacks.session = async function session(session, token) {
    session.accessToken = token.accessToken;
    return session
}

callbacks.redirect = async (url, baseUrl) => {
    /*
        We can't custom redirect URLs now since we need to
        execute caching userID, which is only done in the
        root url. So if you wanna redirect to custom page,
        make caching centralized
    */
    return Promise.resolve(url)
  }


const options = {
    providers,
    callbacks
}

export default (req, res) => NextAuth(req, res, options)
