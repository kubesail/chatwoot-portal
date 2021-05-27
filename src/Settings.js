import { Component } from "react";
import { fetch } from "./util";

class Settings extends Component {
  state = {
    spinning: false,
    platform: null,
    formFields: {},
  };

  constructor(props) {
    super(props);
    this.state.platform = props.platform;
  }

  updateSettings = async (e) => {
    e.preventDefault();
    this.setState({ spinning: true });
    const formData = new FormData(e.target);
    const variableMetadata = this.state.platform.plans[0].variableMetadata;
    for (const pair of formData.entries()) {
      const variable = pair[0];
      const value = pair[1];
      const varData = variableMetadata[variable];
      if (varData.userRequired && !value) {
        this.setState({ requiredEntryError: variable });
        return;
      }
    }
    await fetch("/platform/customer/plan", {
      method: "POST",
      body: { variableData: Object.fromEntries(formData) },
    });
    setTimeout(() => {
      this.props.fetchProfile();
      this.setState({ spinning: false });
    }, 4000);
  };

  renderSpinner = () => {
    return (
      <svg
        focusable="false"
        role="img"
        viewBox="0 0 512 512"
        className="spinner"
      >
        <path
          fill="currentColor"
          d="M288 39.056v16.659c0 10.804 7.281 20.159 17.686 23.066C383.204 100.434 440 171.518 440 256c0 101.689-82.295 184-184 184-101.689 0-184-82.295-184-184 0-84.47 56.786-155.564 134.312-177.219C216.719 75.874 224 66.517 224 55.712V39.064c0-15.709-14.834-27.153-30.046-23.234C86.603 43.482 7.394 141.206 8.003 257.332c.72 137.052 111.477 246.956 248.531 246.667C393.255 503.711 504 392.788 504 256c0-115.633-79.14-212.779-186.211-240.236C302.678 11.889 288 23.456 288 39.056z"
        />
      </svg>
    );
  };

  render() {
    const { spinning } = this.state;
    const variableMetadata = this.state.platform.plans[0].variableMetadata;
    const variableData =
      this.props.profile?.customer?.platformPlans?.[0]?.platformCustomerPlan
        ?.variableData;

    return (
      <div className="Settings">
        <form onSubmit={this.updateSettings}>
          {/* <div>
            {(this.props.profile?.customer?.platformPlans || []).map((plan) => (
              <div key={plan.name}>
                <h2>Settings</h2>
              </div>
            ))}
          </div> */}
          {Object.keys(variableMetadata).map((variable) => {
            const field = variableMetadata[variable];
            const value = variableData?.[variable];
            return (
              <div className="input" key={variable}>
                <label htmlFor="password" className="input-label">
                  {variableMetadata[variable].friendly || variable}
                  <input
                    type="text"
                    id={variable}
                    name={variable}
                    placeholder={field.description || ""}
                    value={
                      this.state.formFields[variable] ||
                      value ||
                      field.default ||
                      ""
                    }
                    onChange={(e) =>
                      this.setState({
                        formFields: {
                          ...this.state.formFields,
                          [variable]: e.target.value,
                        },
                      })
                    }
                  />
                  {this.state.requiredEntryError === variable ? (
                    <div>This field is required!</div>
                  ) : null}
                </label>
              </div>
            );
          })}

          <button type="submit">
            {spinning ? this.renderSpinner() : "Save & Relaunch"}
          </button>
        </form>
      </div>
    );
  }
}

export default Settings;
