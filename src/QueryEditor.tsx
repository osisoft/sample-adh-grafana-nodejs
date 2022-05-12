import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { AsyncSelect, InlineFormLabel } from '@grafana/ui';
import React, { PureComponent } from 'react';
import { Debounce } from './debounce';

import { SdsDataSource } from './DataSource';
import { SdsDataSourceOptions, SdsQuery } from './types';

type Props = QueryEditorProps<SdsDataSource, SdsQuery, SdsDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  onSelectedStream = (value: SelectableValue<string>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, streamId: value.value || '', streamName: value.label || '' });
  };

  render() {
    const query = this.props.query;
    const selectStream: SelectableValue<string> = { label: query.streamName, value: query.streamId };

    return (
      <div className="gf-form">
        <InlineFormLabel width={8}>Stream</InlineFormLabel>
        <AsyncSelect
          defaultOptions={true}
          width={50}
          loadOptions={Debounce((inputvalue: string) => {
            return this.props.datasource.getStreams(inputvalue);
          }, 1000)}
          value={selectStream}
          onChange={(inputvalue) => this.onSelectedStream(inputvalue)}
          placeholder="Select Stream"
          loadingMessage={'Loading streams...'}
          noOptionsMessage={'No streams found'}
        />
      </div>
    );
  }
}
