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
import {
  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  LineSeries,
  AreaSeries,
  Crosshair,
  DiscreteColorLegend,
  // @ts-ignore
} from 'react-vis';
import LoadingIndicator from '../../common/LoadingIndicator';

type TMetricPoints = { x: number; y: number }[];

type TProps = {
  width: number;
  name: string;
  metricsData: {
    serviceName: string;
    metricPoints: TMetricPoints;
  } | null;
  loading: boolean;
  margin?: string;
  showLegend?: boolean;
  showHorizontalLines?: boolean;
  yDomain?: number[];
};

// export for tests
export class ServiceGraphImpl extends React.PureComponent<TProps> {
  height = 242;
  data: any = null;
  colors: any = ['#869ADD', '#EA9977', '#DCA3D2'];
  state = {
    crosshairValues: [],
  };

  getData() {
    if (this.data === null) {
      if (this.props.metricsData === null) {
        return null;
      }

      this.data = Array.isArray(this.props.metricsData) ? this.props.metricsData : [this.props.metricsData];
    }

    return this.data;
  }

  renderLines() {
    if (this.props.metricsData) {
      const graphs: any = [];

      this.getData().forEach((line: any, idx: any) => {
        graphs.push(
          <AreaSeries
            data={line.metricPoints ? line.metricPoints : []}
            onNearestX={
              idx === 0
                ? (value: any, v: any) => {
                    const { index } = v;
                    this.setState({
                      crosshairValues: this.getData().map((d: any) => ({
                        ...d.metricPoints[index],
                        label: d.quantile,
                      })),
                    });
                  }
                : null
            }
            opacity={0.1}
            color={[this.colors[idx]]}
          />
        );
        graphs.push(
          <LineSeries data={line.metricPoints ? line.metricPoints : []} color={[this.colors[idx]]} />
        );
      });

      return graphs;
    }

    return [];
  }

  render() {
    if (this.props.loading) {
      return <LoadingIndicator className="u-mt-vast" centered />;
    }

    const noData = (
      <div
        style={{
          width: this.props.width,
          height: this.height - 74,
          verticalAlign: 'middle',
          textAlign: 'center',
          display: 'table-cell',
        }}
      >
        No Data
      </div>
    );

    const Plot = (
      <XYPlot
        margin={{ bottom: 25 }}
        onMouseLeave={() => this.setState({ crosshairValues: [] })}
        width={this.props.width}
        height={this.height - 74}
        yDomain={this.props.yDomain}
      >
        {this.props.showHorizontalLines ? <HorizontalGridLines /> : null}
        <XAxis
          tickFormat={(v: any) => {
            const dateObj = new Date(v);
            const hours = dateObj.getHours().toString();
            const minutes = dateObj.getMinutes().toString();

            return `${hours.length === 1 ? `0${hours}` : hours}:${
              minutes.length === 1 ? `0${minutes}` : minutes
            }`;
          }}
          tickTotal={8}
        />
        <YAxis />
        {this.renderLines()}
        <Crosshair values={this.state.crosshairValues}>
          <div style={{ width: 70 }}>
            {this.state.crosshairValues.map((d: any) =>
              this.props.showLegend ? (
                <div>
                  {d.label * 100}th: {d.y}
                </div>
              ) : (
                <div>{d.y}</div>
              )
            )}
          </div>
        </Crosshair>
        {this.props.showLegend ? (
          <div>
            <DiscreteColorLegend
              className="legend-label"
              orientation="horizontal"
              items={
                this.data
                  ? this.getData().map((d: any, idx: number) => ({
                      color: this.colors[idx],
                      title: <span>{d.quantile * 100}th</span>,
                    }))
                  : []
              }
            />
          </div>
        ) : null}
      </XYPlot>
    );

    return (
      <div
        style={{
          height: this.height,
          border: '1px solid #D7D7D7',
          margin: this.props.margin,
          padding: '14px 12px 12px 12px',
          borderRadius: 4,
        }}
      >
        <h3 style={{ marginBottom: 0, fontSize: 14, fontWeight: 500 }}>{this.props.name}</h3>
        {this.props.metricsData === null ? noData : Plot}
      </div>
    );
  }
}

export default ServiceGraphImpl;
