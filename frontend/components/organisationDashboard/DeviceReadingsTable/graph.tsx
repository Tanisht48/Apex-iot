import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  TooltipProps,
  ResponsiveContainer,
  Brush,
  CartesianGrid
} from 'recharts';

interface GraphProps {
  data: any[];
  yKey: string;
  xKey: string;
  ticks: number[];
  domain: number[];
  xLabel: string;
  yLabel: string;
  threshold: number;
  tickFormat: 'time' | 'date' | 'month'; // Add 'month' to the prop
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #ccc',
        }}
      >
        <p className="text-sm text-gray-500">{`Time: ${new Date(
          label
        ).toLocaleString()}`}</p>
        <p className="text-sm text-gray-500">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

export function Graph({ data, yKey, xKey, ticks, domain, xLabel, yLabel, threshold, tickFormat }: GraphProps) {
  const formatTick = (tick: number): string => {
    if (tickFormat === 'time') {
      return new Date(tick).toLocaleTimeString();
    } else if (tickFormat === 'date') {
      return new Date(tick).toLocaleDateString();
    } else if (tickFormat === 'month') {
      return new Date(tick).toLocaleString('default', { month: 'short' });
    }
    return ''; // Default case to ensure a string is always returned
  };

  return (
    <div className="w-mx-auto">
      <div className="w-[55vw] -ml-16 -mt-16 h-[75vh]">
        <ResponsiveContainer width="100%" height="80%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 8,
              bottom: 50,
            }}
          >
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset={`${((threshold - 1) / 5) * 100}%`} stopColor="red" />
                <stop offset={`${((threshold - 1) / 5) * 100}%`} stopColor="green" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey={yKey}
              stroke="url(#colorGradient)"
              activeDot={{ r: 4 }}
            />
            <XAxis
              dataKey={xKey}
              type="number"
              domain={domain}
              ticks={ticks}
              tickCount={12}
              tickFormatter={formatTick}
              interval={0} // Ensure every tick is shown
              angle={-30} // Rotate the tick labels to 45 degrees
              height={10}
              textAnchor="end" // Align the text correctly
              label={{ value: xLabel, position: "insideBottomRight", offset: 15 }}
            />
            <YAxis
              label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 0 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Brush dataKey={xKey} height={30} stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
