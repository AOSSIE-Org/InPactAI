import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Jan",
    revenue: 4000,
    engagement: 2400,
  },
  {
    name: "Feb",
    revenue: 3000,
    engagement: 1398,
  },
  {
    name: "Mar",
    revenue: 2000,
    engagement: 9800,
  },
  {
    name: "Apr",
    revenue: 2780,
    engagement: 3908,
  },
  {
    name: "May",
    revenue: 5890,
    engagement: 4800,
  },
  {
    name: "Jun",
    revenue: 4390,
    engagement: 3800,
  },
]

export function PerformanceMetrics() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
        <Bar dataKey="engagement" fill="#82ca9d" name="Engagement" />
      </BarChart>
    </ResponsiveContainer>
  )
}

