import { DataQuery, DataSourceJsonData } from '@grafana/data';

export enum SdsDataSourceType {
  ADH = 'ADH',
  EDS = 'EDS',
}

export interface SdsQuery extends DataQuery {
  streamId: string;
  streamName: string;
}

export interface SdsDataSourceOptions extends DataSourceJsonData {
  type: SdsDataSourceType;
  edsPort: string;
  adhUrl: string;
  adhVersion: string;
  adhTenant: string;
  adhClient: string;
  adhUseCommunity: boolean;
  adhCommunity: string;
  oauthPassThru: boolean;
  namespace: string;
}

export interface SdsDataSourceSecureOptions {
  adhSecret: string;
}
