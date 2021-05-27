# KubeSail Customer Billing Portal

See the [KubeSail Docs](https://docs.kubesail.com/platform/) for more info. This is an open source portal which you can fork and customize, which allows your customers to sign-up for a KubeSail Platform. We're busy adding features and documentation to this portal, but please feel free to reach out to us at support@kubesail.com or [in our discord channel](https://discord.gg/N3zNdp7jHc)

# Deploying this portal

This repo can easily be deployed to Netlify, and includes a `public/_redirects` file which instructs Netlify to proxy API requests to KubeSail. Simply fork this repo, and select the default `yarn build` command when setting up your deployment. For KubeSail API features to work correctly, make sure you set the "Portal Domain" to the domain of where you will host this repo.

![Portal Domain](kubesail-dash-portal-domain.png)
