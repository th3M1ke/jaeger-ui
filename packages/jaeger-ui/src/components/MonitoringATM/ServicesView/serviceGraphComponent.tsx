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
  YAxis,
  HorizontalGridLines,
  LineSeries,
  // @ts-ignore
} from 'react-vis';

type TMetricPoints = {x: number, y: number}[]

type TProps = {
  width: number;
  metricsData: {
    serviceName: string,
    metricPoints: TMetricPoints,
  } | null
};

// export for tests
export class ServiceGraphImpl extends React.PureComponent<TProps> {
  height = 300;
  state = {
    crosshairValues: [],
  };

  constructor(props: any) {
    super(props);
  }

  componentDidMount() {}

  componentDidUpdate() {}

  componentWillUnmount() {}

  renderLines() {

		return [this.props.metricsData!.metricPoints].map((line, ind) => {
			return (
				<LineSeries
					data={line}
					size={0.1}
					key={ind}
				/>
			);
		});
	}

  render() {
    if(this.props.metricsData === null) {
      return <div
        style={{
          width: this.props.width,
          height: this.height,
          verticalAlign: 'middle',
          textAlign: 'center',
          display: 'table-cell'
        }}>No Data</div>
    }

    const Lines = () => {
      let x = [<LineSeries onNearestX={(value: any, v: any) => {
        this.setState({crosshairValues: [value]});
      }}
      data={this.props.metricsData ? this.props.metricsData.metricPoints : []} />];

      x.push(<LineSeries
      data={this.props.metricsData ? this.props.metricsData.metricPoints.map(p => ({
        x: p.x - 20,
        y: p.y - 10,
      })) : []} />)

      return x;
    }


    // const Lines = () => {
    //   return <LineSeries onNearestX={(value: any, v: any) => {
    //     this.setState({crosshairValues: [value]});
    //   }}
    //   data={this.props.metricsData ? this.props.metricsData.metricPoints : []} />
    // }

    return <XYPlot
     margin={{bottom: 0}}
     onMouseLeave={() => this.setState({crosshairValues: []})}
     width={this.props.width}
     height={this.height}>
        <HorizontalGridLines />
        {/* <XAxis
          tickFormat={(v :any) => {
            const dateObj = new Date(v);
            const hours = dateObj.getHours().toString();
            const minutes = dateObj.getMinutes().toString();

            return `${hours.length === 1 ? '0' + hours : hours}:${minutes.length === 1 ? '0' + minutes : minutes}`
          }}
          // tickValues={[0, 1, 3, 4, 5]}
        /> */}
        <YAxis />
        {Lines()}
        {/* <LineSeries onNearestX={(value: any, v: any) => {
            this.setState({crosshairValues: [value]});
          }}
          data={this.props.metricsData ? this.props.metricsData.metricPoints : []} /> */}
        {/* <Crosshair values={this.state.crosshairValues}>
          <div>
              {`${this.state.crosshairValues[0]
                ? (this.state.crosshairValues[0] as any).y
                : '-'}`}
          </div>
        </Crosshair> */}
      </XYPlot>;
  }
}

export default ServiceGraphImpl;