import { Helmet } from "react-helmet";
// import Cookies from "js-cookie";
import { Component } from "react";
import socketioClient from "socket.io-client";
import { loadStripe } from "@stripe/stripe-js";
import "./App.css";
import Login from "./Login";
import Settings from "./Settings";
import { fetch, toast } from "./util";
import { API_TARGET, WSS_TARGET } from "./config";

class App extends Component {
  state = {
    profile: null,
    platform: null,
  };

  createSocket = (force = false) => {
    if (window.__EVENTSTREAM && !force) return window.__EVENTSTREAM;

    let target = WSS_TARGET;

    try {
      const key = window.localStorage.getItem("INTEGRATION_API_KEY");
      const secret = window.localStorage.getItem("INTEGRATION_API_SECRET");
      if (key && secret) {
        target = target + `?token=${key}|${secret}`;
      }
    } catch {}

    window.__EVENTSTREAM = socketioClient(target, {
      timeout: 5000,
      reconnectionDelayMax: 3000,
      secure: true,
    });

    window.__EVENTSTREAM.on("error", (err) => {
      if (err === "Unauthorized") {
        console.error("Unauthorized received from Websocket!", { err });
        toast({
          type: "error",
          msg: `Failed to connect to websocket - logging out!`,
          err,
        });
      } else if (err.type !== "TransportError") {
        console.error("Unknown error!", err);
      }
    });

    window.__EVENTSTREAM.on("connect", () => {
      console.log("Socket connected");
    });

    window.__EVENTSTREAM.on("connect_error", (error) => {
      console.warn("Socket connection error!", error);
    });

    window.__EVENTSTREAM.on("connect_timeout", (timeout) => {
      console.warn("Socket connection timeout!", timeout);
    });

    return window.__EVENTSTREAM;
  };

  fetchProfile = async () => {
    const { profile } = this.state;
    if (profile) return;
    let { json, status } = await fetch("/platform/customer/profile");
    if (status === 400) {
      // Sign-out
      // console.log("sign out 400");
    } else if (status === 401) {
      // console.log("sign out");
    }

    if (status !== 200) {
      return;
    }
    this.setState({ profile: json });
    return json;
  };

  fetchStripeSession = async () => {
    const { platform } = this.state;
    let { json, status } = await fetch("/platform/customer/stripe-session", {
      method: "POST",
    });
    if (json.error) return toast({ msg: json.error });
    if (status !== 200)
      return toast({ msg: "Error redirecting to billing portal" });

    const stripe = await loadStripe(platform.stripePublishableKey);
    await stripe.redirectToCheckout({ sessionId: json.id });
    // TODO: Billing portal option
  };

  fetchPublicPlatform = async () => {
    let { json, status } = await fetch("/platform", { credentials: "omit" });
    if (status !== 200) {
      return this.setState({ platform: false });
    }
    this.setState({ platform: json });
  };

  componentDidMount = async () => {
    await this.fetchPublicPlatform();
    const profile = await this.fetchProfile();
    if (profile) {
      this.createSocket();
    }
  };

  renderPlatformPlans = () => {
    const { platform } = this.state;
    return (
      <div>
        <h2>Pick a plan:</h2>
        {platform.plans.map((plan) => {
          if (!plan.readyForUse) {
            return (
              <div className="App-plan" key={plan.name}>
                This plan is not configured yet, please check back soon!
              </div>
            );
          }
          return (
            <div
              className="App-plan"
              key={plan.name}
              onClick={this.fetchStripeSession}
            >
              <div className="details">
                <h2>{plan.name}</h2>
                <div>${(plan.price / 100).toFixed(2)} / mo</div>
              </div>

              <svg
                focusable="false"
                className="App-plan-icon svg-inline--fa fa-arrow-circle-right fa-w-16"
                role="img"
                viewBox="0 0 512 512"
              >
                <path
                  fill="currentColor"
                  d="M256 8c137 0 248 111 248 248S393 504 256 504 8 393 8 256 119 8 256 8zm-28.9 143.6l75.5 72.4H120c-13.3 0-24 10.7-24 24v16c0 13.3 10.7 24 24 24h182.6l-75.5 72.4c-9.7 9.3-9.9 24.8-.4 34.3l11 10.9c9.4 9.4 24.6 9.4 33.9 0L404.3 273c9.4-9.4 9.4-24.6 0-33.9L271.6 106.3c-9.4-9.4-24.6-9.4-33.9 0l-11 10.9c-9.5 9.6-9.3 25.1.4 34.4z"
                />
              </svg>
            </div>
          );
        })}
      </div>
    );
  };

  render() {
    const { platform, profile } = this.state;
    return (
      <div className="App-container">
        <Helmet>
          {/* <link rel="canonical" href="https://kubesail.com" />
          <meta property="og:title" content="KubeSail" />
          <meta
          property="og:description"
          content="Host apps at Home (or anywhere) with Kubernetes and KubeSail!"
          />
          <meta property="og:site_name" content="KubeSail.com" />
          <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kubesail.com/" /> */}
          <meta property="og:image:type" content="image/png" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="1200" />
          <meta property="og:image" content={platform?.logo} />
          <title>{platform?.name || ""} Customer Portal</title>
          <link rel="icon" href={platform?.logo || "/favicon.ico"} />
        </Helmet>
        <div
          className="App-background"
          style={{ backgroundColor: platform?.brandColor || "#282c34" }}
        />
        <div className="App">
          <div className="App-header">
            <h1>{platform ? platform.name : "Loading..."}</h1>
            {platform && (
              <img
                style={{ maxWidth: "250px", maxHeight: "250px" }}
                alt={`${platform.name}`}
                src={platform.logo}
              />
            )}
            {profile && (
              <div className="profile">
                <div>
                  {profile?.customer?.platformCustomerPlanTemplates ? (
                    <div>
                      {profile.customer.platformCustomerPlanTemplates.find(
                        (t) => t.errors
                      ) ? (
                        <div className="errors">
                          There was an error setting up your resources.
                          <br />
                          Please contact support!
                        </div>
                      ) : null}
                      {profile.customer.platformCustomerPlanTemplates.map(
                        (template) => {
                          return (template.dnsName || "")
                            .split(",")
                            .map((domain) => {
                              return (
                                <a
                                  key={domain}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  href={`https://${domain}`}
                                >
                                  {domain}
                                </a>
                              );
                            });
                        }
                      )}
                    </div>
                  ) : null}
                </div>
                <div>{profile?.customer?.email}</div>
              </div>
            )}
            {profile && (
              <div className="logout">
                <a href={`${API_TARGET}/platform/customer/logout`}>Log out</a>
              </div>
            )}
          </div>
          <div className="App-form">
            {profile &&
            platform &&
            profile.customer.platformPlans.length > 0 ? (
              <Settings
                platform={platform}
                profile={profile}
                fetchProfile={this.fetchProfile}
              />
            ) : profile?.customer?.platformPlans?.length === 0 ? (
              this.renderPlatformPlans()
            ) : (
              <Login
                platform={platform}
                setLoggedIn={() => {
                  this.fetchProfile();
                }}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
