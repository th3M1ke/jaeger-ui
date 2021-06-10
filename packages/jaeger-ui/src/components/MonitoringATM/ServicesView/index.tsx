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
import { Row, Col, Input } from 'antd';
// @ts-ignore
import { Field, formValueSelector, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import VirtSelect from '../../common/VirtSelect';
import reduxFormFieldAdapter from '../../../utils/redux-form-field-adapter';
import * as jaegerApiActions from '../../../actions/jaeger-api';
import ServiceGraph from './serviceGraphComponent';
import OperationTableDetails from './operationDetailsTable';

const Search = Input.Search;

const AdaptedVirtualSelect = reduxFormFieldAdapter({
  AntInputComponent: VirtSelect,
  onChangeAdapter: option => (option ? (option as any).value : null),
});

export const serviceFormSelector = formValueSelector('serviceForm');

// export for tests
export class MonitoringATMServicesViewImpl extends React.PureComponent<any, any> {
  myInput: any;
  serviceSelectorValue: string = '';
  state = {
    loading: true,
    graphWidth: 300,
    serviceOpsMetrics: null,
  };

  constructor(props: any) {
    super(props);
    this.myInput = React.createRef();

  }

  componentDidMount() {
    this.setState({
      graphWidth: this.myInput.current.offsetWidth,
    });

    const { fetchServices } = this.props;

    fetchServices().then(() => this.fetchMetrics());
  }

  fetchMetrics() {
    const { selectedService, selectedTimeFrame, fetchAllServiceMetrics, fetchAggregatedServiceMetrics } = this.props;

    const metricQueryPayload = {
      quantile: 0.95,
      endTs: Date.now(),
      lookback: selectedTimeFrame || 60*60*1000,
      step: 60*1000,
      ratePer: 60*60*1000,
    }

    fetchAllServiceMetrics(
      selectedService || this.props.services[0],
      metricQueryPayload
    );

    fetchAggregatedServiceMetrics(
      selectedService || this.props.services[0],
      metricQueryPayload);
  }

  componentDidUpdate(nextProps: any) {

    const { selectedService, selectedTimeFrame, metrics } = this.props;
    console.log('2222 componentDidUpdate metrics: ', metrics);
    console.log('selectedTimeFrame/componentDidUpdate: ', selectedTimeFrame);

    if (nextProps.selectedService !== selectedService || nextProps.selectedTimeFrame !== selectedTimeFrame) {
      this.fetchMetrics();
    }

    if(nextProps.metrics.serviceOpsMetrics !== metrics.serviceOpsMetrics) {
      this.setState({
        serviceOpsMetrics: metrics.serviceOpsMetrics
      })
    }
  }

  render() {
    const { services, selectedService, metrics, selectedTimeFrame } = this.props;

    return (
      <div style={{ padding: '1rem 0.5rem' }}>
        <Row>
          <Col span={6}>
            <h2>Choose service</h2>
            <Field
              name="service"
              component={AdaptedVirtualSelect}
              placeholder="Select A Service"
              props={{
                value: selectedService || services[0],
                disabled: false,
                clearable: false,
                options: services.map((s: string) => ({ label: s, value: s })),
                required: true,
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col span={16} className="ub-p2">
            <p style={{ marginTop: 'revert' }}>
              Aggregation of all "{selectedService || services[0]}" metrics in selected timeframe.{' '}
              <a href="#">View all traces</a>
            </p>
          </Col>
          <Col span={8} className="ub-p2">
            <Field
              name="timeframe"
              component={AdaptedVirtualSelect}
              placeholder="Select A Timeframe"
              props={{
                defaultValue: {label: 'Last Hour', value: 3600000},
                value: selectedTimeFrame || {label: 'Last Hour', value: 3600000},
                disabled: false,
                clearable: false,
                options: [{label: 'Last Hour', value: 3600000}, {label: 'Last 2 hour', value: 2*3600000}, {label: 'Last 6 hour', value: 6*3600000}],
                required: true,
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col span={8} className="ub-p2">
            <div ref={this.myInput}></div>
            <ServiceGraph
              width={this.state.graphWidth}
              metricsData={metrics.serviceMetrics.service_latencies}
            />
          </Col>
          <Col span={8} className="ub-p2">
            <ServiceGraph
              width={this.state.graphWidth}
              metricsData={metrics.serviceMetrics.service_error_rate}
            />
          </Col>
          <Col span={8} className="ub-p2">
          <ServiceGraph
              width={this.state.graphWidth}
              metricsData={metrics.serviceMetrics.service_call_rate}
            />
          </Col>
        </Row>
        <Row>
          <Row>
            <Col span={16} className="ub-p2">
              <p style={{ marginTop: 'revert' }}>
                Operations under "{selectedService || services[0]}" <span>Over the last hour</span>
              </p>
            </Col>
            <Col span={8} className="ub-p2">
            <Search
              placeholder="Enter Title"
              onChange={(a) => {
                if(Array.isArray(this.state.serviceOpsMetrics)) {
                  const filteredData = (this.props.metrics.serviceOpsMetrics as any).filter(({ name }: {name: string}) => {
                    console.log('777 name: ', name);
                    return name.toLowerCase().includes(a.target.value.toLowerCase());
                  });

                  console.log('777 filteredData:',  filteredData);

                  this.setState({
                    serviceOpsMetrics: filteredData
                  });
                }

              }}
              style={{ width: 200 }}
            />
            </Col>
          </Row>
          <Row>
            <OperationTableDetails
              data={this.state.serviceOpsMetrics}
            />
          </Row>
        </Row>
      </div>
    );
  }
}

export function mapStateToProps(state: any) {

  const { services, serviceMetrics, metrics } = state;
  return {
    services: services.services || [],
    serviceMetrics,
    metrics,
    selectedService: serviceFormSelector(state, 'service'),
    selectedTimeFrame: serviceFormSelector(state, 'timeframe'),
    searchOperations: serviceFormSelector(state, 'searchOperations'),
  };
}

export function mapDispatchToProps(dispatch: any) {

  const { fetchServices, fetchAllServiceMetrics, fetchAggregatedServiceMetrics } = bindActionCreators(jaegerApiActions, dispatch);
  return {
    fetchServices,
    fetchAllServiceMetrics,
    fetchAggregatedServiceMetrics
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  reduxForm({
    form: 'serviceForm',
  })(MonitoringATMServicesViewImpl)
);
