import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { AsyncSelect, InlineFormLabel } from '@grafana/ui';
import React from 'react';
import { Debounce } from './debounce';

import { SdsDataSource } from './DataSource';
import { SdsDataSourceOptions, SdsQuery } from './types';

type Props = QueryEditorProps<SdsDataSource, SdsQuery, SdsDataSourceOptions>;

export const QueryEditor = ({ query, datasource, onChange, onRunQuery }: Props) => {
  query = { ...query };

  const onSelectedStream = (value: SelectableValue<string>) => {
    onChange({ ...query, streamId: value.value || '', streamName: value.label || '' });
  };

  const debouncedGetStreams = Debounce((inputvalue: string) => {
    return datasource.getStreams(inputvalue);
  }, 1000);

  const selectStream: SelectableValue<string> = { label: query.streamName, value: query.streamId };

  return (
    <div className="gf-form">
      <InlineFormLabel width={8}>Stream</InlineFormLabel>
      <AsyncSelect
        defaultOptions={true}
        width={50}
        loadOptions={(inputvalue) => debouncedGetStreams(inputvalue)}
        value={selectStream}
        onChange={(inputvalue) => onSelectedStream(inputvalue)}
        placeholder="Select Stream"
        loadingMessage={'Loading streams...'}
        noOptionsMessage={'No streams found'}
      />
    </div>
  );
};
