import Cookies from "js-cookie";
import "./App.css";
import Login from "./Login";
import Settings from "./Settings";
import { Component } from "react";
import { fetch, toast } from "./util";
import { loadStripe } from "@stripe/stripe-js";

class App extends Component {
  state = {
    profile: null,
    platform: null,
  };

  fetchProfile = async () => {
    const { profile } = this.state;
    if (profile) return;
    let { json, status } = await fetch("/platform/customer/profile");
    if (status === 401) {
      // Sign-out
      console.log("sign out");
    }
    if (status !== 200) {
      return;
    }
    this.setState({ profile: json });
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
    this.fetchProfile();
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
    console.log({ profile });
    return (
      <div className="App-container">
        <div className="App-background"></div>
        <div className="App">
          <div
            className="App-header"
            style={{ backgroundColor: platform?.brandColor || "#282c34" }}
          >
            <h2>{platform ? platform.name : "Loading..."}</h2>
            {platform && (
              <img
                style={{ maxWidth: "250px", maxHeight: "250px" }}
                alt={`${platform.name}`}
                src={platform.logo}
              />
            )}
            {profile && (
              <div className="profile">
                <div>{profile?.customer?.email}</div>
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
              </div>
            )}
            <div className="logout">
              <button
                className="plain"
                onClick={() => {
                  // TODO logout route
                  Cookies.remove("kubesail-platform-customer");
                }}
              >
                Log out
              </button>
            </div>
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
