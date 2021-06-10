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
  // @ts-ignore
} from 'react-vis';

type TProps = {
  color: string,
  dataPoints: {x: number, y: number}[]
};

// export for tests
export class OperationsGraph extends React.PureComponent<TProps> {
  constructor(props: any) {
    super(props);
  }

  render() {
    if(this.props.dataPoints.length === 0){
      return <div style={{
        verticalAlign: 'middle',
        textAlign: 'center',
        display: 'table-cell'
      }}>No Data</div>
    }

    return (<XYPlot margin={{
      left: 5,
      right: 5,
      bottom: 5,
      top: 5
    }} width={200} height={100}>
      {/* <VerticalGridLines />
      <HorizontalGridLines />
      <YAxis /> */}
      <AreaSeries
        className="area-series-example"
        curve="curveLinear"
        color={this.props.color}
        style={{opacity:0.6}}
        data={this.props.dataPoints}
      />
      {/* <LineMarkSeries
        className="area-elevated-line-series"
        color="gray"
        data={row.dataPoints}
      />
      <MarkSeries data={[{ x: 1, y: 0 }]} style={{ display: 'none' }} /> */}
    </XYPlot>)


  }
}


export default OperationsGraph;