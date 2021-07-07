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
  AreaSeries,
  LineSeries,
  // @ts-ignore
} from 'react-vis';

type TProps = {
  color: string;
  dataPoints: { x: number; y: number }[];
  yDomain?: [number, number];
};

// export for tests
export class OperationsGraph extends React.PureComponent<TProps> {
  render() {
    if (this.props.dataPoints.length === 0) {
      return (
        <div
          style={{
            verticalAlign: 'middle',
            textAlign: 'center',
            display: 'table-cell',
          }}
        >
          No Data
        </div>
      );
    }

    const dynProps: any = {};

    if (this.props.yDomain) {
      dynProps.yDomain = this.props.yDomain;
    }

    return (
      <div style={{ paddingTop: 2 }}>
        <XYPlot
          margin={{
            left: 0,
            right: 0,
            bottom: 1,
            top: 2,
          }}
          width={100}
          height={15}
        >
          {/* <VerticalGridLines />
      <HorizontalGridLines /> */}
          {/* <YAxis /> */}
          <AreaSeries
            className="area-series-example"
            curve="curveLinear"
            color={this.props.color}
            style={{ opacity: 0.2 }}
            data={this.props.dataPoints}
            {...dynProps}
          />
          <LineSeries
            className="area-elevated-line-series"
            color={this.props.color}
            data={this.props.dataPoints}
            {...dynProps}
          />
        </XYPlot>
      </div>
    );
  }
}

export default OperationsGraph;
