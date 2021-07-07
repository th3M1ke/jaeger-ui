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
import { connect } from 'react-redux';
import MonitoringATMEmptyState from './EmptyState';
import MonitoringATMServicesView from './ServicesView';

class MonitoringATMPageImpl extends React.PureComponent<any> {
  render() {
    const EmptyState = this.props.metrics.error && this.props.metrics.error.httpStatus === 501;
    if (EmptyState) {
      return <MonitoringATMEmptyState configureStatus={false} sendDataStatus={false} />;
    }

    return <MonitoringATMServicesView />;
  }
}

export function mapStateToProps(state: any) {
  const { serviceMetrics, metrics } = state;
  return {
    serviceMetrics,
    metrics,
  };
}

export default connect(mapStateToProps)(MonitoringATMPageImpl);
