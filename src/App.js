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
import ProgressCircle from "./ProgressCircle";

class App extends Component {
  state = {
    profile: null,
    platform: null,
    progress: 0,
    progressMessage: "",
    resources: [],
  };

  createSocket = () => {
    let target = WSS_TARGET;

    try {
      const key = window.localStorage.getItem("INTEGRATION_API_KEY");
      const secret = window.localStorage.getItem("INTEGRATION_API_SECRET");
      if (key && secret) {
        target = target + `?token=${key}|${secret}`;
      }
    } catch {}

    this.socket = socketioClient(target, {
      timeout: 5000,
      reconnectionDelayMax: 3000,
      secure: true,
    });

    this.socket.on("error", (err) => {
      if (err.type !== "TransportError") {
        console.error("Unknown error!", err);
      }
    });

    // this.socket.on("connect", () => {
    //   console.log("Socket connected");
    // });

    this.socket.on("connect_error", (error) => {
      console.warn("Socket connection error!", error);
    });

    this.socket.on("connect_timeout", (timeout) => {
      console.warn("Socket connection timeout!", timeout);
    });

    return this.socket;
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

    const socket = this.createSocket();

    if (json?.customer?.platformCustomerPlanTemplates) {
      socket.emit("watch-resources");
    }

    socket.on("resource-event", (event) => {
      const existing = this.state.resources.findIndex(
        (r) => r.name === event.name && r.kind === event.kind
      );
      let resources;
      if (existing === -1) {
        resources = [...this.state.resources, event];
      } else {
        resources = this.state.resources.map((r) => {
          if (r.name === event.name && r.kind === event.kind) return event;
          return r;
        });
      }
      let newPercentComplete = 0;
      let progressMessage = "";
      for (let i = 0; i < resources.length; i++) {
        const resource = resources[i];
        if (resource.kind === "PersistentVolumeClaim") {
          if (resource.status.phase !== "Bound") {
            progressMessage = "Provisioning storage...";
            break;
          }
        } else if (resource.kind === "Deployment") {
          if (resource.status.availableReplicas < 1) {
            progressMessage = "Launching your app...";
            break;
          }
        } else {
          if (
            resource.status.conditions.find((c) => c.type === "Ready")
              .status === "False"
          ) {
            progressMessage = "Finishing Touches...";
            break;
          }
        }
        newPercentComplete = ((i + 1) / resources.length) * 100;
      }
      this.setState({
        resources,
        progress: newPercentComplete,
        progressMessage,
      });
    });

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
    await this.fetchProfile();
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
                  ) : (
                    <div>
                      Resources not yet provisioned - please complete the
                      required settings!
                    </div>
                  )}
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
            this.state.progress < 100 &&
            this.state.resources.length > 0 ? (
              <div className="progress">
                <div>
                  <ProgressCircle percent={this.state.progress} />
                </div>
                <div className="progress-message">
                  {this.state.progressMessage}
                </div>
              </div>
            ) : profile &&
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
