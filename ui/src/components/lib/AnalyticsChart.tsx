import { useMemo } from "react";
import { CartesianGrid, Legend, Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { IAnalytic } from "../../types/analytic.type";

interface IChartData {
	date: string,
	streams: number
}

interface IAnalyticsChartProps {
	analytics: IAnalytic[],
}

export default function AnalyticsChart({ analytics }: IAnalyticsChartProps) {
	const data = useMemo<IChartData[]>(() => analytics.map(analytic => ({
		date: new Date(analytic.timestamp).toLocaleDateString(),
		streams: analytic.streams
	})), [analytics])

	return <ResponsiveContainer width="100%" height="100%">
		<AreaChart
			width={500}
			height={300}
			data={data}
			margin={{
				top: 5,
				right: 30,
				left: 20,
				bottom: 5,
			}}
		>
			<CartesianGrid strokeOpacity={.1} />
			<XAxis dataKey="date" />
			<YAxis />
			<Tooltip />
			<Legend />
			{/* <Line type="monotone" dataKey="streams" stroke="#8884d8" /> */}
			<Area type="monotone" dataKey="streams" stroke="#8884d8" fill="#8884d8" />
		</AreaChart>
	</ResponsiveContainer>
}
