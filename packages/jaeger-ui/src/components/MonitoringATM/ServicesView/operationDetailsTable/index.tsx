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
import { Row, Table, Progress, Button, Popover } from 'antd';
import IoIosCog from 'react-icons/lib/io/ios-cog';

import REDGraph from './graphComponents';

type TProps = {
  data: any
};


export class OperationTableDetails extends React.PureComponent<TProps> {
  state = {
    hoveredRowKey: 0,
  };

  constructor(props: any) {
    super(props);
  }

  render() {
    const columnConfig = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        // width: 150,
      },
      {
        title: 'Avg. Latency',
        dataIndex: 'latency',
        key: 'latency',
        // width: 150,
        render: (value: any, row: any, index: any) => {
          return (<div style={{display: 'flex', flexDirection: 'row'}}>
            <div>
              <REDGraph
              dataPoints={row.dataPoints.service_operation_latencies}
              color={'blue'} />
            </div>
            <div style={{width:40, alignSelf: 'center'}}>
              {value}ms
            </div>
          </div>);
        },
      },
      {
        title: 'Requests',
        dataIndex: 'requests',
        key: 'requests',
        ellipsis: true,
        render: (value: any, row: any, index: any) => {
          return (<div style={{display: 'flex', flexDirection: 'row'}}>
            <div>
            <REDGraph
              dataPoints={row.dataPoints.service_operation_call_rate}
              color={'red'} />
            </div>
            <div style={{width:40, alignSelf: 'center'}}>
              {value}ms
            </div>
          </div>);
        },
      },
      {
        title: 'Error rate %',
        dataIndex: 'errRate',
        key: 'errRate',
        ellipsis: true,
        render: (value: any, row: any, index: any) => {
          return (<div style={{display: 'flex', flexDirection: 'row'}}>
            <div>
            <REDGraph
              dataPoints={row.dataPoints.service_operation_error_rate}
              color={'yellow'} />
            </div>
            <div style={{width:40, alignSelf: 'center'}}>
              {value}ms
            </div>
          </div>);
        },
      },
      {
        title: <div><span style={{float:'left'}}>Impact</span> <Popover placement="bottomRight" title={'text'} content={() => 'content'} trigger="click"><IoIosCog style={{float:'right'}} size={25} /></Popover></div>,
        dataIndex: 'impact',
        key: 'impact',
        ellipsis: true,
        sorter: (a: any, b: any) => a.impact - b.impact,
        render: (value: any, row: any, index: any) => {
          let viewTraceButton = null;
          if(this.state.hoveredRowKey === row.key) {
            viewTraceButton = <Button>View trace</Button>
          }
          return {
            children: (<div style={{display:'flex'}}>
                <Progress style={{paddingRight:'20px'}} percent={value*100} showInfo={false} />
                {viewTraceButton}
              </div>),
            // props: {
            //   сolSpan: 3
            // }
          }
        }
      },
    ];

    if(this.props.data === null){
      return <div>No Data</div>
    }

    return !this.props.data ? <div>No Data</div> : (
          <Row>
            <Table
              columns={columnConfig}
              dataSource={this.props.data}
              pagination={false}
              onRow={() => {
                return {

                  onMouseEnter: (event: any) => { // mouse enter row
                    this.setState({
                      hoveredRowKey: event.currentTarget.getAttribute('data-row-key')
                    })
                  },
                  onMouseLeave: (event: any) => { // mouse leave row
                    this.setState({
                      hoveredRowKey: 0
                    })
                  },
                };
              }}
            />
          </Row>
    );
  }
}


export default OperationTableDetails;