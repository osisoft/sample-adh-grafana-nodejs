import { DataSourceInstanceSettings, MutableDataFrame, FieldType } from '@grafana/data';

import { SdsDataSource } from 'DataSource';
import { SdsDataSourceOptions, SdsDataSourceType } from 'types';

describe('SdsDataSource', () => {
  const url = 'URL';
  const edsPort = 'PORT';
  const adhUrl = 'URL';
  const adhVersion = 'VERSION';
  const adhTenant = 'TENANT';
  const adhClient = 'CLIENT';
  const oauthPassThru = false;
  const namespace = 'NAMESPACE';
  const adhUseCommunity = false;
  const adhCommunity = 'COMMUNITY';
  const adhSettings: DataSourceInstanceSettings<SdsDataSourceOptions> = {
    id: 0,
    uid: '',
    name: '',
    access: 'direct',
    type: '',
    url,
    meta: null as any,
    jsonData: {
      type: SdsDataSourceType.ADH,
      edsPort: edsPort,
      adhUrl: adhUrl,
      adhVersion: adhVersion,
      adhTenant: adhTenant,
      adhClient: adhClient,
      oauthPassThru,
      namespace,
      adhUseCommunity: adhUseCommunity,
      adhCommunity: adhCommunity,
    },
  };
  const adhCommSettings = { ...adhSettings, ...{ jsonData: { ...adhSettings.jsonData, adhUseCommunity: true } } };
  const edsSettings = { ...adhSettings, ...{ jsonData: { ...adhSettings.jsonData, type: SdsDataSourceType.EDS } } };
  const backendSrv = {
    datasourceRequest: () => new Promise((r) => r),
  };

  describe('constructor', () => {
    it('should use passed in data source information', () => {
      const datasource = new SdsDataSource(adhSettings, backendSrv as any);
      expect(datasource.proxyUrl).toEqual(url);
      expect(datasource.type).toEqual(SdsDataSourceType.ADH);
      expect(datasource.edsPort).toEqual(edsPort);
      expect(datasource.adhUrl).toEqual(adhUrl);
      expect(datasource.adhVersion).toEqual(adhVersion);
      expect(datasource.adhTenant).toEqual(adhTenant);
      expect(datasource.adhUseCommunity).toEqual(adhUseCommunity);
      expect(datasource.adhCommunity).toEqual(adhCommunity);
      expect(datasource.oauthPassThru).toEqual(oauthPassThru);
      expect(datasource.namespace).toEqual(namespace);
    });

    it('should handle empty jsonData', () => {
      const nullSettings: any = { ...adhSettings, ...{ url: null, jsonData: null } };
      const datasource = new SdsDataSource(nullSettings, backendSrv as any);
      expect(datasource.proxyUrl).toEqual('');
      expect(datasource.type).toEqual(SdsDataSourceType.ADH);
      expect(datasource.edsPort).toEqual('5590');
      expect(datasource.adhUrl).toEqual('');
      expect(datasource.adhVersion).toEqual('v1');
      expect(datasource.adhTenant).toEqual('');
      expect(datasource.adhUseCommunity).toEqual(false);
      expect(datasource.adhCommunity).toEqual('');
      expect(datasource.oauthPassThru).toEqual(false);
      expect(datasource.namespace).toEqual('');
    });
  });

  describe('getStreamsUrl', () => {
    it('should return the correct URL for ADH', () => {
      const datasource = new SdsDataSource(adhSettings, backendSrv as any);
      expect(datasource.streamsUrl).toEqual('URL/adh/api/VERSION/tenants/TENANT/namespaces/NAMESPACE/streams');
    });

    it('should return the correct URL for ADH communities', () => {
      const datasource = new SdsDataSource(adhCommSettings, backendSrv as any);
      expect(datasource.streamsUrl).toEqual(
        'URL/community/api/VERSION/search/communities/COMMUNITY/streams'
      );
    });

    it('should return the correct URL for EDS', () => {
      const datasource = new SdsDataSource(edsSettings, backendSrv as any);
      expect(datasource.streamsUrl).toEqual(
        'http://localhost:PORT/api/v1/tenants/default/namespaces/NAMESPACE/streams'
      );
    });
  });

  describe('query', () => {
    it('should query with the expected parameters', (done) => {
      spyOn(backendSrv, 'datasourceRequest').and.returnValue(
        Promise.resolve({
          data: [
            {
              TimeStamp: '2020-01-01',
              Boolean: true,
              Number: 1,
              String: 'A',
            },
          ],
        })
      );
      const datasource = new SdsDataSource(adhSettings, backendSrv as any);
      const options = {
        range: {
          from: {
            utc: () => ({
              format: () => 'FROM',
            }),
          },
          to: {
            utc: () => ({
              format: () => 'TO',
            }),
          },
        },
        targets: [
          {
            refId: 'REFID',
            namespace: 'NAMESPACE',
            streamId: 'STREAM',
            streamName: 'STREAM',
          },
        ],
      };
      const response = datasource.query(options as any);
      expect(backendSrv.datasourceRequest).toHaveBeenCalledWith({
        url: 'URL/adh/api/VERSION/tenants/TENANT/namespaces/NAMESPACE/streams/STREAM/data?startIndex=FROM&endIndex=TO',
        method: 'GET',
      });
      response.then((r) => {
        expect(JSON.stringify(r)).toEqual(
          JSON.stringify({
            data: [
              new MutableDataFrame({
                refId: 'REFID',
                name: 'STREAM',
                fields: [
                  {
                    name: 'TimeStamp',
                    type: FieldType.time,
                    values: [Date.parse('2020-01-01')],
                  },
                  {
                    name: 'Boolean',
                    type: FieldType.number,
                    values: [1],
                  },
                  {
                    name: 'Number',
                    type: FieldType.number,
                    values: [1],
                  },
                  {
                    name: 'String',
                    type: FieldType.string,
                    values: ['A'],
                  },
                ],
              }),
            ],
          })
        );
        done();
      });
    });

    it('should query a community with the expected parameters', (done) => {
      spyOn(backendSrv, 'datasourceRequest').and.returnValue(
        Promise.resolve({
          data: [
            {
              TimeStamp: '2020-01-01',
              Boolean: true,
              Number: 1,
              String: 'A',
            },
          ],
        })
      );
      const datasource = new SdsDataSource(adhCommSettings, backendSrv as any);
      const options = {
        range: {
          from: {
            utc: () => ({
              format: () => 'FROM',
            }),
          },
          to: {
            utc: () => ({
              format: () => 'TO',
            }),
          },
        },
        targets: [
          {
            refId: 'REFID',
            namespace: 'NAMESPACE',
            streamId: 'https://uswe.datahub.connect.aveva.com/streampath',
            streamName: 'STREAM',
          },
        ],
      };
      const response = datasource.query(options as any);
      expect(backendSrv.datasourceRequest).toHaveBeenCalledWith({
        url: 'URL/community/streampath/data?startIndex=FROM&endIndex=TO',
        method: 'GET',
      });
      response.then((r) => {
        expect(JSON.stringify(r)).toEqual(
          JSON.stringify({
            data: [
              new MutableDataFrame({
                refId: 'REFID',
                name: 'STREAM',
                fields: [
                  {
                    name: 'TimeStamp',
                    type: FieldType.time,
                    values: [Date.parse('2020-01-01')],
                  },
                  {
                    name: 'Boolean',
                    type: FieldType.number,
                    values: [1],
                  },
                  {
                    name: 'Number',
                    type: FieldType.number,
                    values: [1],
                  },
                  {
                    name: 'String',
                    type: FieldType.string,
                    values: ['A'],
                  },
                ],
              }),
            ],
          })
        );
        done();
      });
    });

    it('should handle invalid query', (done) => {
      spyOn(backendSrv, 'datasourceRequest');
      const datasource = new SdsDataSource(adhSettings, backendSrv as any);
      const options = {
        range: null,
        targets: [
          {
            refId: 'REFID',
            namespace: 'NAMESPACE',
            streamId: null,
            streamName: 'STREAM',
          },
        ],
      };
      const response = datasource.query(options as any);
      expect(backendSrv.datasourceRequest).not.toHaveBeenCalled();
      response.then((r) => {
        expect(JSON.stringify(r)).toEqual(JSON.stringify({ data: [new MutableDataFrame()] }));
        done();
      });
    });
  });

  describe('getStreams', () => {
    it('should return empty if namespace is not defined', (done) => {
      const datasource = new SdsDataSource(adhSettings, backendSrv as any);
      datasource.namespace = '';
      const result = datasource.getStreams('');
      result.then((r) => {
        expect(r).toEqual([]);
        done();
      });
    });

    it('should query for streams', (done) => {
      const Id = 'Stream';
      const Name = 'Stream';
      spyOn(backendSrv, 'datasourceRequest').and.returnValue(Promise.resolve({ data: [{ Id, Name }] }));
      const datasource = new SdsDataSource(adhSettings, backendSrv as any);
      const result = datasource.getStreams('test');
      result.then((r) => {
        expect(r).toEqual([{ value: Id, label: Name }]);
        done();
      });
    });

    it('should query a community for streams', (done) => {
      const Id = 'Stream';
      const Self = 'Self';
      const Name = 'Stream';
      spyOn(backendSrv, 'datasourceRequest').and.returnValue(Promise.resolve({ data: [{ Self, Id, Name }] }));
      const datasource = new SdsDataSource(adhCommSettings, backendSrv as any);
      const result = datasource.getStreams('test');
      result.then((r) => {
        expect(r).toEqual([{ value: Self, label: Name }]);
        done();
      });
    });
  });

  describe('testDatasource', () => {
    it('should run a test query', (done) => {
      spyOn(backendSrv, 'datasourceRequest').and.returnValue(
        Promise.resolve({
          status: 200,
        })
      );
      const datasource = new SdsDataSource(adhSettings, backendSrv as any);
      const response = datasource.testDatasource();
      expect(backendSrv.datasourceRequest).toHaveBeenCalledWith({
        url: 'URL/adh/api/VERSION/tenants/TENANT/namespaces/NAMESPACE/streams',
        method: 'GET',
      });
      response.then((r) => {
        expect(r).toEqual({
          status: 'success',
          message: 'Data source is working',
        });
        done();
      });
    });

    it('should handle test failure', (done) => {
      spyOn(backendSrv, 'datasourceRequest').and.returnValue(
        Promise.resolve({
          status: 400,
          statusText: 'Error',
        })
      );
      const datasource = new SdsDataSource(adhSettings, backendSrv as any);
      const response = datasource.testDatasource();
      expect(backendSrv.datasourceRequest).toHaveBeenCalledWith({
        url: 'URL/adh/api/VERSION/tenants/TENANT/namespaces/NAMESPACE/streams',
        method: 'GET',
      });
      response.then((r) => {
        expect(r).toEqual({
          status: 'error',
          message: '400: Error',
        });
        done();
      });
    });
  });
});
