# Grafana Sequential Data Store Sample

| :loudspeaker: **Notice**: This sample has been Archived. Dependencies will not be updated and pipelines will not be run. Please contact samples@osisoft.com or visit The OSIsoft Feedback Site for comments |
| -----------------------------------------------------------------------------------------------|

**Version:** ARCHIVED

[![Build Status](https://dev.azure.com/osieng/engineering/_apis/build/status/product-readiness/ADH/aveva.sample-adh-grafana-nodejs?branchName=main)](https://dev.azure.com/osieng/engineering/_build/latest?definitionId=2619&branchName=main)

This sample demonstrates how to build a [Grafana](https://grafana.com/) plugin that runs queries against the Sequential Data Store of AVEVA Data Hub or Edge Data Store. The sample performs normal "Get Values" calls against a specified stream in SDS, using the time range of the Grafana dashboard. See the [Grafana Documentation](https://grafana.com/docs/grafana/latest/developers/plugins/) for more information on developing Grafana plugins.

## Requirements

- [Grafana 7.0+](https://grafana.com/grafana/download)
- Web Browser with JavaScript enabled
- [NodeJS](https://nodejs.org/en/)
- [Git](https://git-scm.com/download/win)
- If using AVEVA Data Hub, register a Client Credentials Client in AVEVA Data Hub; a client secret will need to be provided to the sample plugin configuration
- If using Edge Data Store, the browser must be running local to a running copy of Edge Data Store

## Running the Sample with installed Grafana

1. Copy this folder to your Grafana server's plugins directory, like `.../grafana/data/plugins`
1. (Optional) If using other plugins, rename the folder to `aveva-data-hub-sample`
1. Open a command prompt inside that folder
1. Install dependencies, using `npm ci`
1. Build the plugin, using `npm run build` (or `npm run dev` for browser debugging)
1. Restart the Grafana server to load the new plugin
1. Open the Grafana configuration and set the parameter `allow_loading_unsigned_plugins` equal to `aveva-sds-sample` or to the name of the folder set in step 2 (see [Grafana docs](https://grafana.com/docs/grafana/latest/administration/configuration/#allow_loading_unsigned_plugins))
1. Add a new Grafana datasource using the sample (see [Grafana docs](https://grafana.com/docs/grafana/latest/features/datasources/add-a-data-source/))
1. Choose whether to query against AVEVA Data Hub or Edge Data Store
1. Enter the relevant required information; if using ADH, the client secret will be encrypted in the Grafana server and HTTP requests to ADH will be made by a server-side proxy, as described in the [Grafana docs](https://grafana.com/docs/grafana/latest/developers/plugins/authentication/)
1. Open a new or existing Grafana dashboard, and choose the Sequential Data Store Sample as the data source
1. Enter your Namespace (if querying ADH) and Stream, and data will populate into the dashboard from the stream for the dashboard's time range

## Running the Sample with Docker

1. Open a command prompt inside this folder
1. Build the container using `docker build -t grafana-adh .`  
   _Note: The dockerfile being built contains an ENV statement that creates an [environment variable](https://grafana.com/docs/grafana/latest/administration/configuration/#configure-with-environment-variables) that overrides an option in the grafana config. In this case, the `allow_loading_unsigned_plugins` option is being overridden to allow the [unsigned plugin](https://grafana.com/docs/grafana/latest/administration/configuration/#allow_loading_unsigned_plugins) in this sample to be used._
1. Run the container using `docker run -d --name=grafana -p 3000:3000 grafana-adh`
1. Navigate to localhost:3000 to configure data sources and view data

## Using ADH OAuth login to Grafana

A limitation of this sample is that the use of a Client Credentials Client means that anyone using the Data Source in Grafana receives the same access inside AVEVA Data Hub. Grafana supports generic OAuth login to the Grafana server, and can forward its token to the destination data source, including ADH. See [here](https://grafana.com/docs/grafana/latest/auth/generic-oauth/) for more information on this feature of Grafana. This feature could be used to ensure individual users must log in to receive the appropriate permissions in ADH.

However, Grafana's implementation of the Authorization Code Flow does not use [Proof of Key Code Exchange](https://oauth.net/2/pkce/), or PKCE, which is an additional security layer required by ADH Authorization Code Clients. Grafana also does not support ADH Hybrid Clients as it does not support a `POST` back from the authentication server, nor does it support the `response_type` and `response_mode` headers required by that flow.

If you are interested in using using ADH OAuth in your Grafana server, please check and comment on [this issue](https://github.com/grafana/grafana/issues/26350) in the Grafana GitHub repository.

## Using Community Data

1. Add a new Grafana datasource using the sample (see [Grafana docs](https://grafana.com/docs/grafana/latest/features/datasources/add-a-data-source/))
1. Choose AVEVA Data Hub
1. Toggle the "Community Data" switch to 'true'
1. Enter the relevant required information. You can find the Community ID in the URL of the Community Details page.

## Running the Automated Tests

1. Open a command prompt inside this folder
1. Install dependencies, using `npm ci`
1. Run the tests, using `npm test`

---

For the main ADH page [ReadMe](https://github.com/osisoft/OSI-Samples-OCS)  
For the main samples page [ReadMe](https://github.com/osisoft/OSI-Samples)
