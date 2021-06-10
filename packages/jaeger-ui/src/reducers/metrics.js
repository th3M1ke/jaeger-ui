/* eslint-disable no-debugger */
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

import { handleActions } from 'redux-actions';

import {
    fetchAllServiceMetrics,
    fetchAggregatedServiceMetrics,
} from '../actions/jaeger-api';

const initialState = {
  error: null,
  loading: false,
  operationMetricsLoading: false,
  serviceMetrics: {},
  serviceOpsMetrics: null,
};

function fetchStarted(state) {
  return { ...state, loading: true };
}

function fetchServiceMetricsDone(state, { payload }) {
    const serviceMetrics = {
        service_latencies: null,
        service_call_rate: null,
        service_error_rate: null,
    };

    payload.forEach(metrics => {
        if(metrics.metrics[0]) {
            if(serviceMetrics[metrics.name] !== null){
                throw new Error('API response was changed');
            }

            const metric = {
              serviceName: metrics.metrics[0].labels[0].value,
              metricPoints: metrics.metrics[0].metricPoints.map(p => {
                  return {
                    x: (new Date(p.timestamp)).getTime(),
                    y: parseFloat(p.gaugeValue.doubleValue.toFixed(2))
                  }
                }),
          };

            serviceMetrics[metrics.name] = metric;
        }
    })

  return { ...state, serviceMetrics, error: null, loading: false };
}

function fetchServiceMetricsErred(state, { payload: error }) {
  return { ...state, error, loading: false, serviceMetrics: {} };
}

function fetchOpsMetricsStarted(state) {
  return { ...state, operationMetricsLoading: true };
}

function fetchOpsMetricsDone(state, { payload }) {
  let opsMetrics = null;

  payload.forEach(metric => {
    metric.metrics.forEach(metricDetails => {
      if(opsMetrics === null) {
        opsMetrics = {};
      }

      let opsName = null;
      const avg = {
        service_operation_latencies: 0,
        service_operation_call_rate: 0,
        service_operation_error_rate: 0,
      }
      metricDetails.labels.forEach(label => {
        if(label.name === 'operation'){
          opsName = label.value;
        }
      })

      if(opsName) {
        if(opsMetrics[opsName] === undefined) {
          opsMetrics[opsName] = {
            name: opsName,
            metricPoints: {
              service_operation_latencies: [],
              service_operation_call_rate: [],
              service_operation_error_rate: [],
              avg: {
                service_operation_latencies: null,
                service_operation_call_rate: null,
                service_operation_error_rate: null,
              }
            },
          };
        }

        opsMetrics[opsName].metricPoints[metric.name] = metricDetails.metricPoints.map(p => {
          const y = parseFloat(p.gaugeValue.doubleValue.toFixed(2));
          avg[metric.name] += y;
          return {
            x: (new Date(p.timestamp)).getTime(),
            y,
          }
        });

        opsMetrics[opsName].metricPoints.avg[metric.name] =  metricDetails.metricPoints.length > 0 ? parseFloat((avg[metric.name] / metricDetails.metricPoints.length).toFixed(2)) : null;
      }
    })
  })

  const minMax = {
    min: null,
    max: null,
  }

  let serviceOpsMetrics = null;
  if(opsMetrics) {
    serviceOpsMetrics = Object.keys(opsMetrics).map((key, i) => {
      let impact = 0;
      if(opsMetrics[key].metricPoints.avg.service_operation_latencies !== null && opsMetrics[key].metricPoints.avg.service_operation_call_rate !== null){
        impact = (opsMetrics[key].metricPoints.avg.service_operation_latencies * opsMetrics[key].metricPoints.avg.service_operation_call_rate) / 100
      }

      if(i === 0) {
        minMax.max = impact;
        minMax.min = impact;
      }
      else{
        minMax.max = minMax.max < impact ? impact : minMax.max;
        minMax.min = minMax.min > impact ? impact : minMax.min;
      }


      return {
        key: i.toString(),
        name: opsMetrics[key].name,
        latency: opsMetrics[key].metricPoints.avg.service_operation_latencies || 0,
        requests: opsMetrics[key].metricPoints.avg.service_operation_call_rate || 0,
        errRates: opsMetrics[key].metricPoints.avg.service_operation_error_rate || 0,
        impact,
        dataPoints: opsMetrics[key].metricPoints
      }
    })

    if(serviceOpsMetrics.length > 1){
      serviceOpsMetrics.forEach((v, i) => {
        serviceOpsMetrics[i].impact = (v.impact - minMax.min) / (minMax.max - minMax.min);
      })
    }
  }

  return { ...state, serviceOpsMetrics, error: null, operationMetricsLoading: false };

}

function fetchOpsMetricsErred(state, { payload: error }) {
  return { ...state, error, loading: false, serviceMetrics: {} };
}

export default handleActions(
  {
    [`${fetchAllServiceMetrics}_PENDING`]: fetchStarted,
    [`${fetchAllServiceMetrics}_FULFILLED`]: fetchServiceMetricsDone,
    [`${fetchAllServiceMetrics}_REJECTED`]: fetchServiceMetricsErred,

    [`${fetchAggregatedServiceMetrics}_PENDING`]: fetchOpsMetricsStarted,
    [`${fetchAggregatedServiceMetrics}_FULFILLED`]: fetchOpsMetricsDone,
    [`${fetchAggregatedServiceMetrics}_REJECTED`]: fetchOpsMetricsErred,
  },
  initialState
);
