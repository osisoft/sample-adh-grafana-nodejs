# Grafana Sequential Data Store Sample

**Version:** 1.2.2

[![Build Status](https://dev.azure.com/osieng/engineering/_apis/build/status/product-readiness/OCS/osisoft.sample-ocs-grafana-nodejs?repoName=osisoft%2Fsample-ocs-grafana-nodejs&branchName=main)](https://dev.azure.com/osieng/engineering/_build/latest?definitionId=2619&repoName=osisoft%2Fsample-ocs-grafana-nodejs&branchName=main)

This sample demonstrates how to build a [Grafana](https://grafana.com/) plugin that runs queries against the Sequential Data Store of OSIsoft Cloud Services or Edge Data Store. The sample performs normal "Get Values" calls against a specified stream in SDS, using the time range of the Grafana dashboard. See the [Grafana Documentation](https://grafana.com/docs/grafana/latest/developers/plugins/) for more information on developing Grafana plugins.

## Requirements

- [Grafana 7.0+](https://grafana.com/grafana/download)
- Web Browser with JavaScript enabled
- [NodeJS](https://nodejs.org/en/)
- [Git](https://git-scm.com/download/win)
- If using OSIsoft Cloud Services, register a Client Credentials Client in OSIsoft Cloud Services; a client secret will need to be provided to the sample plugin configuration
- If using Edge Data Store, the browser must be running local to a running copy of Edge Data Store

## Running the Sample with installed Grafana

1. Copy this folder to your Grafana server's plugins directory, like `.../grafana/data/plugins`
1. (Optional) If using other plugins, rename the folder to `osisoft-cloud-services-sample`
1. Open a command prompt inside that folder
1. Install dependencies, using `npm ci`
1. Build the plugin, using `npm run build` (or `npm run dev` for browser debugging)
1. Restart the Grafana server to load the new plugin
1. Open the Grafana configuration and set the parameter `allow_loading_unsigned_plugins` equal to `osisoft-sds-sample` or to the name of the folder set in step 2 (see [Grafana docs](https://grafana.com/docs/grafana/latest/administration/configuration/#allow_loading_unsigned_plugins))
1. Add a new Grafana datasource using the sample (see [Grafana docs](https://grafana.com/docs/grafana/latest/features/datasources/add-a-data-source/))
1. Choose whether to query against OSIsoft Cloud Services or Edge Data Store
1. Enter the relevant required information; if using OCS, the client secret will be encrypted in the Grafana server and HTTP requests to OCS will be made by a server-side proxy, as described in the [Grafana docs](https://grafana.com/docs/grafana/latest/developers/plugins/authentication/)
1. Open a new or existing Grafana dashboard, and choose the Sequential Data Store Sample as the data source
1. Enter your Namespace (if querying OCS) and Stream, and data will populate into the dashboard from the stream for the dashboard's time range

## Running the Sample with Docker

1. Open a command prompt inside this folder
1. Build the container using `docker build -t grafana-ocs .`  
*Note: The dockerfile being built contains an ENV statement that creates an [environment variable](https://grafana.com/docs/grafana/latest/administration/configuration/#configure-with-environment-variables) that overrides an option in the grafana config. In this case, the `allow_loading_unsigned_plugins` option is being overridden to allow the [unsigned plugin](https://grafana.com/docs/grafana/latest/administration/configuration/#allow_loading_unsigned_plugins) in this sample to be used.*
1. Run the container using `docker run -d --name=grafana -p 3000:3000 grafana-ocs`
1. Navigate to localhost:3000 to configure data sources and view data

## Using OCS OAuth login to Grafana

A limitation of this sample is that the use of a Client Credentials Client means that anyone using the Data Source in Grafana receives the same access inside OSIsoft Cloud Services. Grafana supports generic OAuth login to the Grafana server, and can forward its token to the destination data source, including OCS. See [here](https://grafana.com/docs/grafana/latest/auth/generic-oauth/) for more information on this feature of Grafana. This feature could be used to ensure individual users must log in to receive the appropriate permissions in OCS.

However, Grafana's implementation of the Authorization Code Flow does not use [Proof of Key Code Exchange](https://oauth.net/2/pkce/), or PKCE, which is an additional security layer required by OCS Authorization Code Clients. Grafana also does not support OCS Hybrid Clients as it does not support a `POST` back from the authentication server, nor does it support the `response_type` and `response_mode` headers required by that flow.

If you are interested in using using OCS OAuth in your Grafana server, please check and comment on [this issue](https://github.com/grafana/grafana/issues/26350) in the Grafana GitHub repository.

## Using Community Data

1. Add a new Grafana datasource using the sample (see [Grafana docs](https://grafana.com/docs/grafana/latest/features/datasources/add-a-data-source/))
1. Choose OSIsoft Cloud Services
1. Toggle the "Community Data" switch to 'true'
1. Enter the relevant required information. You can find the Community ID in the URL of the Community Details page.

## Running the Automated Tests

1. Open a command prompt inside this folder
1. Install dependencies, using `npm ci`
1. Run the tests, using `npm test`

---

For the main OCS page [ReadMe](https://github.com/osisoft/OSI-Samples-OCS)
For the main samples page [ReadMe](https://github.com/osisoft/OSI-Samples)
