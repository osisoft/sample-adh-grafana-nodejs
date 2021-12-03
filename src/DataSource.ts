import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
  SelectableValue,
} from '@grafana/data';

import { SdsQuery, SdsDataSourceOptions, SdsDataSourceType } from 'types';

export declare type BackendSrvRequest = {
  url: string;
  method?: string;
};

export interface BackendSrv {
  datasourceRequest(options: BackendSrvRequest): Promise<any>;
}

export class SdsDataSource extends DataSourceApi<SdsQuery, SdsDataSourceOptions> {
  name: string;
  proxyUrl: string;

  type: SdsDataSourceType;
  edsPort: string;
  ocsUrl: string;
  ocsVersion: string;
  ocsTenant: string;
  ocsUseCommunity: boolean;
  ocsCommunity: string;
  oauthPassThru: boolean;
  namespace: string;

  get streamsUrl() {
    return this.type === SdsDataSourceType.OCS
      ? this.ocsUseCommunity === true
        ? `${this.proxyUrl}/community/api/${this.ocsVersion}/tenants/${this.ocsTenant}/search/communities/${this.ocsCommunity}/streams`
        : `${this.proxyUrl}/ocs/api/${this.ocsVersion}/tenants/${this.ocsTenant}/namespaces/${this.namespace}/streams`
      : `http://localhost:${this.edsPort}/api/v1/tenants/default/namespaces/${this.namespace}/streams`;
  }

  /** @ngInject */
  constructor(instanceSettings: DataSourceInstanceSettings<SdsDataSourceOptions>, private backendSrv: BackendSrv) {
    super(instanceSettings);
    this.name = instanceSettings.name;
    this.proxyUrl = instanceSettings.url ? instanceSettings.url.trim() : '';
    this.backendSrv = backendSrv;

    this.type = instanceSettings.jsonData?.type || SdsDataSourceType.OCS;
    this.edsPort = instanceSettings.jsonData?.edsPort || '5590';
    this.ocsUrl = instanceSettings.jsonData?.ocsUrl || '';
    this.ocsVersion = instanceSettings.jsonData?.ocsVersion || 'v1';
    this.ocsTenant = instanceSettings.jsonData?.ocsTenant || '';
    this.ocsUseCommunity = instanceSettings.jsonData?.ocsUseCommunity || false;
    this.ocsCommunity = instanceSettings.jsonData?.ocsCommunity || '';
    this.oauthPassThru = instanceSettings.jsonData?.oauthPassThru || false;
    this.namespace = instanceSettings.jsonData?.namespace || '';
  }

  async query(options: DataQueryRequest<SdsQuery>): Promise<DataQueryResponse> {
    const from = options.range?.from.utc().format();
    const to = options.range?.to.utc().format();
    const requests = options.targets.map((target) => {
      if (!target.streamId) {
        return new Promise((resolve) => resolve(null));
      }
      if (this.ocsUseCommunity) {
        const url = new URL(target.streamId);

        return this.backendSrv.datasourceRequest({
          url: `${this.proxyUrl}/community${url.pathname}/data?startIndex=${from}&endIndex=${to}`,
          method: 'GET',
        });
      } else {
        return this.backendSrv.datasourceRequest({
          url: `${this.streamsUrl}/${target.streamId}/data?startIndex=${from}&endIndex=${to}`,
          method: 'GET',
        });
      }
    });

    const data = await Promise.all(requests).then((responses) => {
      let i = 0;
      return responses.map((r: any) => {
        if (!r || !r.data.length) {
          return new MutableDataFrame();
        }

        const target = options.targets[i];
        i++;
        return new MutableDataFrame({
          refId: target.refId,
          name: target.streamName,
          fields: Object.keys(r.data[0]).map((name) => {
            const val0 = r.data[0][name];
            const date = Date.parse(val0);
            const num = Number(val0);
            const type =
              typeof val0 === 'string' && !isNaN(date)
                ? FieldType.time
                : val0 === true || val0 === false
                ? FieldType.boolean
                : !isNaN(num)
                ? FieldType.number
                : FieldType.string;
            
            if (type === FieldType.boolean) {
              var values = r.data.map((d) => {
                if (d[name] === undefined) { // Not including Accept-Verbosity header will skip false values, translate to false
                  return 0
                }

                return d[name].toString() === "true" ? 1 : 0;
              });
            }
            else {
              var values = r.data.map((d) => (type === FieldType.time ? Date.parse(d[name]) : d[name]));
            }

            return {
              name,
              values: values,
              type: type === FieldType.boolean ? FieldType.number : type,
            };
          }),
        });
      });
    });

    return { data };
  }

  async getStreams(query: string): Promise<Array<SelectableValue<string>>> {
    const url = query ? `${this.streamsUrl}?query=*${query}*` : this.streamsUrl;
    const requests = this.backendSrv.datasourceRequest({ url, method: 'GET' });
    if (this.ocsUseCommunity === true) {
      return await Promise.resolve(requests).then((responses) =>
        Object.keys(responses.data).map((r) => ({ value: responses.data[r].Self, label: responses.data[r].Id }))
      );
    } else if (this.namespace) {
      return await Promise.resolve(requests).then((responses) =>
        Object.keys(responses.data).map((r) => ({ value: responses.data[r].Id, label: responses.data[r].Id }))
      );
    } else {
      return await new Promise((resolve) => resolve([]));
    }
  }

  async testDatasource() {
    return this.backendSrv
      .datasourceRequest({
        url: this.streamsUrl,
        method: 'GET',
      })
      .then((r) => {
        if (r.status === 200) {
          return {
            status: 'success',
            message: 'Data source is working',
          };
        } else {
          return {
            status: 'error',
            message: `${r.status}: ${r.statusText}`,
          };
        }
      });
  }
}
