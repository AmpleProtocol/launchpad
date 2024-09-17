import { useMemo } from "react";
import { CartesianGrid, Legend, Area, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Line } from "recharts"
import { IAnalytic } from "../../types/analytic.type";
import { theme } from "../../theme";

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

	return <ResponsiveContainer width='100%' height={400}>
		<LineChart
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
			<Line type="monotone" dataKey="streams" stroke={theme.colors?.primary?.toString()} />
			{/* <Area type="monotone" dataKey="streams" stroke="#8884d8" fill="#8884d8" /> */}
		</LineChart>
	</ResponsiveContainer>
}
