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
import LabeledList from '../../common/LabeledList';
import { List, Row, Col, Button } from 'antd';
import IoIosCheckmark from 'react-icons/lib/io/ios-checkmark-outline';
import IoIosCloseCircle from 'react-icons/lib/io/ios-circle-outline';

export default class MonitoringATMEmptyState extends React.PureComponent<any, any> {
  private statusText = [
    {
      text: 'Configured',
      status: true,
    },
    {
      text: 'Sent data',
      status: false,
    },
  ];

  render() {
    const itemStyle = {
      listStyleType: 'square',
      display: 'list-item',
    };
    return (
      <Row justify="center">
        <Col span={12} offset={6} style={{ textAlign: 'center', marginTop: 'calc(100vh/3.5)' }}>
          <List
            itemLayout="vertical"
            dataSource={this.statusText}
            split={false}
            size={'small'}
            rowKey={'-'}
            header={<h2 className="ub-m0">Get started with Services Monitoring</h2>}
            footer={
              <Button
                style={{ backgroundColor: '#199', color: '#fff' }}
                href="https://www.jaegertracing.io/docs/latest/frontend-ui/"
                target="_blank"
              >
                Go to documentation
              </Button>
            }
            renderItem={(item: any) => (
              <div>
                &bull; {item.text} {item.status ? <IoIosCheckmark /> : <IoIosCloseCircle />}
              </div>
            )}
          />
        </Col>
      </Row>
    );
  }
}
