// Copyright (c) 2021 The Jaeger Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as React from 'react';
import { Row, Table, Progress, Button, Icon, Tooltip } from 'antd';
import REDGraph from './graphComponents';
import LoadingIndicator from '../../../common/LoadingIndicator';

import './index.css';

type TProps = {
  data: any;
  loading: boolean;
  endTime: number;
  lookback: number;
  serviceName: string;
};

export class OperationTableDetails extends React.PureComponent<TProps> {
  state = {
    hoveredRowKey: 0,
  };

  render() {
    if (this.props.loading) {
      return <LoadingIndicator className="u-mt-vast" centered />;
    }
    const columnConfig = [
      {
        title: 'Name',
        className: 'header-item',
        dataIndex: 'name',
        key: 'name',
        sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      },
      {
        title: 'Avg. Latency',
        className: 'header-item',
        dataIndex: 'latency',
        key: 'latency',
        sorter: (a: any, b: any) => a.latency - b.latency,
        render: (value: any, row: any) => {
          return (
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <REDGraph dataPoints={row.dataPoints.service_operation_latencies} color="#869ADD" />
              <div style={{ alignSelf: 'center', marginLeft: 12 }}>{value ? `${value}ms` : ''}</div>
            </div>
          );
        },
      },
      {
        title: 'Avg. Requests',
        className: 'header-item',
        dataIndex: 'requests',
        key: 'requests',
        sorter: (a: any, b: any) => a.requests - b.requests,
        render: (value: any, row: any) => {
          return (
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <REDGraph dataPoints={row.dataPoints.service_operation_call_rate} color="#4795BA" />
              <div style={{ alignSelf: 'center', marginLeft: 12 }}>{value ? `${value} req/s` : ''}</div>
            </div>
          );
        },
      },
      {
        title: 'Avg. Error rate %',
        className: 'header-item',
        dataIndex: 'errRates',
        key: 'errRates',
        sorter: (a: any, b: any) => a.errRates - b.errRates,
        render: (value: any, row: any) => {
          return (
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <REDGraph
                dataPoints={row.dataPoints.service_operation_error_rate}
                color="#CD513A"
                yDomain={[0, 100]}
              />
              <div style={{ alignSelf: 'center', marginLeft: 12 }}>{value ? `${value}%` : ''}</div>
            </div>
          );
        },
      },
      {
        title: (
          <div style={{ paddingTop: 1 }}>
            <span style={{ float: 'left', color: '#459798' }}>
              Impact &nbsp;
              <Tooltip placement="top" title="Impact tooltip text">
                <Icon type="info-circle" />
              </Tooltip>
            </span>
          </div>
        ),
        className: 'header-item',
        dataIndex: 'impact',
        key: 'impact',
        defaultSortOrder: 'descend' as 'ascend' | 'descend' | undefined,
        sorter: (a: any, b: any) => a.impact - b.impact,
        render: (value: any, row: any) => {
          let viewTraceButton = null;
          if (this.state.hoveredRowKey === row.key) {
            viewTraceButton = (
              <Button
                href={`/search?end=${this.props.endTime}000&limit=20&lookback=${this.props.lookback /
                  (3600 * 1000)}h&maxDuration&minDuration&operation=${encodeURIComponent(row.name)}&service=${
                  this.props.serviceName
                }&start=${this.props.endTime - this.props.lookback}000`}
                target="blank"
              >
                View traces
              </Button>
            );
          }

          return {
            children: (
              <div style={{ display: 'flex' }}>
                <Progress
                  className="impact"
                  percent={value * 100}
                  strokeLinecap="square"
                  strokeColor="#459798"
                  showInfo={false}
                />
                <div style={{ width: 200, height: 30 }}>{viewTraceButton}</div>
              </div>
            ),
          };
        },
      },
    ];

    return (
      <Row>
        <Table
          rowClassName={() => 'table-row'}
          columns={columnConfig}
          dataSource={this.props.data}
          pagination={{ defaultPageSize: 20, showSizeChanger: true, pageSizeOptions: ['20', '50', '100'] }}
          onRow={() => {
            return {
              onMouseEnter: (event: any) => {
                this.setState({
                  hoveredRowKey: event.currentTarget.getAttribute('data-row-key'),
                });
              },
              onMouseLeave: () => {
                this.setState({
                  hoveredRowKey: 0,
                });
              },
            };
          }}
        />
      </Row>
    );
  }
}

export default OperationTableDetails;
