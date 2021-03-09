import { fetch } from "./util";

function Settings({ platform, profile }) {
  const updateSettings = async function (e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    await fetch("/platform/customer/plan", {
      method: "POST",
      body: { variableData: Object.fromEntries(formData) },
    });
  };

  const variableMetadata = platform.plans[0].variableMetadata;

  return (
    <div className="Settings">
      <form onSubmit={updateSettings}>
        <div>
          {(profile?.customer?.platformPlans || []).map((plan) => (
            <div key={plan.name}>
              <h2>
                Update your <strong>{plan.name}</strong> subscription settings:
              </h2>
            </div>
          ))}
        </div>
        {Object.keys(variableMetadata).map((variable) => {
          const field = variableMetadata[variable];
          return (
            <div className="input" key={variable}>
              {variable}
              <input
                type="text"
                id={variable}
                name={variable}
                placeholder={field.description || ""}
                // value={password}
                // onChange={(e) => setPassword(e.target.value)}
              />
              <label htmlFor="password" className="input-label">
                {variable}
              </label>
            </div>
          );
        })}

        <button className="plain" type="submit">
          Save
        </button>
      </form>
    </div>
  );
}

export default Settings;
