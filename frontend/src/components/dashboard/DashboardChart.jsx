import Chart from "react-apexcharts";
import { Card } from "../ui/Card";

const hasPositiveValue = (value) =>
  Number(typeof value === "object" && value !== null ? value.y : value) > 0;

export const DashboardChart = ({ title, subtitle, config, type = "bar", height = 280 }) => {
  const hasData = config?.series?.some((series) => {
    if (typeof series === "number") return hasPositiveValue(series);
    const values = Array.isArray(series) ? series : series?.data;
    return values?.some(hasPositiveValue);
  });
  return (
    <Card title={title} subtitle={subtitle}>
      {hasData ? (
        <Chart options={config.options} series={config.series} type={type} height={height} />
      ) : (
        <p className="text-sm text-base-content/60">Belum ada data untuk ditampilkan.</p>
      )}
    </Card>
  );
};
