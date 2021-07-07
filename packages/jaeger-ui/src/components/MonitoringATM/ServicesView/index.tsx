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
// @ts-ignore
import store from 'store';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import VirtSelect from '../../common/VirtSelect';
import reduxFormFieldAdapter from '../../../utils/redux-form-field-adapter';
import * as jaegerApiActions from '../../../actions/jaeger-api';
import ServiceGraph from './GraphComponent';
import OperationTableDetails from './operationDetailsTable';

import './index.css';

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
  endTime: number = Date.now();
  state = {
    graphWidth: 300,
    serviceOpsMetrics: null,
    searchOps: '',
  };

  constructor(props: any) {
    super(props);
    this.myInput = React.createRef();
  }

  componentDidMount() {
    this.setState({
      graphWidth: this.myInput.current.offsetWidth - 24,
    });

    const { fetchServices } = this.props;

    fetchServices().then(() => this.fetchMetrics());
  }

  componentDidUpdate(nextProps: any) {
    const { selectedService, selectedTimeFrame } = this.props;

    if (nextProps.selectedService !== selectedService || nextProps.selectedTimeFrame !== selectedTimeFrame) {
      this.fetchMetrics();
    }
  }

  fetchMetrics() {
    const {
      selectedService,
      selectedTimeFrame,
      fetchAllServiceMetrics,
      fetchAggregatedServiceMetrics,
    } = this.props;

    this.endTime = Date.now();
    store.set('lastAtmSearchTimeframe', selectedTimeFrame);
    store.set('lastAtmSearchService', this.getSelectedService());

    const metricQueryPayload = {
      quantile: 0.95,
      endTs: this.endTime,
      lookback: selectedTimeFrame,
      step: 60 * 1000,
      ratePer: 60 * 60 * 1000,
    };

    fetchAllServiceMetrics(selectedService || this.props.services[0], metricQueryPayload);

    fetchAggregatedServiceMetrics(selectedService || this.props.services[0], metricQueryPayload);

    this.setState({ serviceOpsMetrics: null });
    this.setState({ searchOps: '' });
  }

  getSelectedService() {
    const { selectedService, services } = this.props;
    return selectedService || store.get('lastAtmSearchService') || services[0];
  }

  getLoadingState() {
    const { metrics } = this.props;

    return metrics.loading || !this.getSelectedService();
  }

  render() {
    const { services, metrics, selectedTimeFrame } = this.props;

    const timeframeInHours = selectedTimeFrame / 3600000;
    const timePeriod = timeframeInHours <= 1 ? '' : timeframeInHours.toFixed(0);

    return (
      <div style={{ padding: '1rem 1.375rem' }}>
        <Row>
          <Col span={6}>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 800,
              }}
            >
              Choose service
            </h2>
            <Field
              name="service"
              component={AdaptedVirtualSelect}
              placeholder="Select A Service"
              props={{
                style: { fontSize: 14, width: '100%' },
                value: this.getSelectedService(),
                disabled: false,
                clearable: false,
                options: services.map((s: string) => ({ label: s, value: s })),
                required: true,
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col span={16}>
            <p
              style={{
                marginTop: 17,
                marginBottom: 14,
                fontSize: 14,
                fontWeight: 400,
              }}
            >
              Aggregation of all &quot;{this.getSelectedService()}&quot; metrics in selected timeframe.{' '}
              <a href="#">View all traces</a>
            </p>
          </Col>
          <Col span={8} style={{ display: 'inline-flex', justifyContent: 'flex-end' }}>
            <Field
              name="timeframe"
              component={AdaptedVirtualSelect}
              placeholder="Select A Timeframe"
              props={{
                style: { fontSize: 14, width: 128 },
                defaultValue: { label: 'Last Hour', value: 3600000 },
                value: selectedTimeFrame,
                disabled: false,
                clearable: false,
                options: [
                  { label: 'Last Hour', value: 3600000 },
                  { label: 'Last 2 hour', value: 2 * 3600000 },
                  { label: 'Last 6 hour', value: 6 * 3600000 },
                ],
                required: true,
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <div ref={this.myInput} />
            <ServiceGraph
              loading={this.getLoadingState()}
              name="Latency"
              width={this.state.graphWidth}
              metricsData={metrics.serviceMetrics.service_latencies}
              showLegend
              margin="0px 7px 0px 0px"
              showHorizontalLines
            />
          </Col>
          <Col span={8}>
            <ServiceGraph
              loading={this.getLoadingState()}
              name="Error rate %"
              width={this.state.graphWidth}
              metricsData={metrics.serviceMetrics.service_error_rate}
              margin="0px 3px"
              yDomain={[0, 100]}
            />
          </Col>
          <Col span={8}>
            <ServiceGraph
              loading={this.getLoadingState()}
              name="Requests"
              width={this.state.graphWidth}
              metricsData={metrics.serviceMetrics.service_call_rate}
              showHorizontalLines
              margin="0px 0px 0px 7px"
            />
          </Col>
        </Row>
        <Row style={{ marginTop: 54 }}>
          <Row>
            <Col span={16}>
              <h2
                style={{
                  display: 'inline-block',
                  marginBottom: 15,
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                Operations under {this.getSelectedService()}
              </h2>{' '}
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 400,
                }}
              >
                Over the last {timePeriod} hour{timePeriod === '' ? '' : 's'}
              </span>
            </Col>
            <Col span={8} style={{ display: 'inline-flex', justifyContent: 'flex-end' }}>
              <Search
                placeholder="Search operation"
                style={{ fontSize: 14, width: 218 }}
                value={this.state.searchOps}
                onChange={a => {
                  // if (Array.isArray(this.state.serviceOpsMetrics)) {
                  const filteredData = (this.props.metrics.serviceOpsMetrics as any).filter(
                    ({ name }: { name: string }) => {
                      return name.toLowerCase().includes(a.target.value.toLowerCase());
                    }
                  );

                  this.setState({ searchOps: a.target.value });

                  this.setState({
                    serviceOpsMetrics: filteredData,
                  });
                  // }
                }}
              />
            </Col>
          </Row>
          <Row>
            <OperationTableDetails
              loading={metrics.operationMetricsLoading}
              data={
                this.state.serviceOpsMetrics === null
                  ? metrics.serviceOpsMetrics
                  : this.state.serviceOpsMetrics
              }
              endTime={this.endTime}
              lookback={selectedTimeFrame}
              serviceName={this.getSelectedService()}
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
    selectedService: serviceFormSelector(state, 'service') || store.get('lastAtmSearchService'),
    selectedTimeFrame:
      serviceFormSelector(state, 'timeframe') || store.get('lastAtmSearchTimeframe') || 3600000,
    searchOperations: serviceFormSelector(state, 'searchOperations'),
  };
}

export function mapDispatchToProps(dispatch: any) {
  const { fetchServices, fetchAllServiceMetrics, fetchAggregatedServiceMetrics } = bindActionCreators(
    jaegerApiActions,
    dispatch
  );
  return {
    fetchServices,
    fetchAllServiceMetrics,
    fetchAggregatedServiceMetrics,
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
