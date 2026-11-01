import React, { useId, useState } from 'react';
import { Activity, Radio, AlertTriangle, RefreshCw, Gauge } from 'lucide-react';
import { MetricCard, SectionHeader, StatusIndicator } from '../../components';
import { Button } from '../../components/ui/button';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell, TableCaption } from '../../components/ui/table';
import { devices } from './data';

export function ConcentrationChart({ revision = 0 }) {
  const id = useId();
  const values = [24, 29, 27, 36, 32, 41, 38, 47, 44, 50, 46, 48].map(value => value + (revision % 3));
  const points = values.map((value, index) => [48 + index * 44, 190 - value * 2]);
  const line = points.map(([x, y], index) => `${index ? 'L' : 'M'}${x},${y}`).join(' ');
  return (
    <figure className="min-w-0">
      <svg viewBox="0 0 570 230" role="img" aria-labelledby={`${id}-title ${id}-desc`} className="block h-auto w-full">
        <title id={`${id}-title`}>VOC 浓度趋势</title>
        <desc id={`${id}-desc`}>静态演示，09:00 至 14:30，当前 {values.at(-1)} ppm，告警阈值 50 ppm。</desc>
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 25, 50, 75].map(value => (
          <g key={value}>
            <line x1="48" x2="548" y1={190 - value * 2} y2={190 - value * 2} stroke="var(--border)" strokeDasharray="3 5" />
            <text x="36" y={194 - value * 2} textAnchor="end" fill="var(--muted-foreground)" fontSize="11">
              {value}
            </text>
          </g>
        ))}
        <text x="10" y="18" fill="var(--muted-foreground)" fontSize="11">
          ppm
        </text>
        <path d={`${line} L532,190 L48,190 Z`} fill={`url(#${id}-fill)`} />
        <line x1="48" x2="548" y1="90" y2="90" stroke="var(--status-warning)" strokeDasharray="5 4" />
        <text x="548" y="81" textAnchor="end" fill="var(--status-warning)" fontSize="11">
          告警阈值 50
        </text>
        <path d={line} fill="none" stroke="var(--chart-1)" strokeWidth="2.5" strokeLinejoin="round" />
        {points.map(([cx, cy], index) => (
          <circle key={index} cx={cx} cy={cy} r="3" fill="var(--card)" stroke="var(--chart-1)" strokeWidth="2">
            <title>{values[index]} ppm</title>
          </circle>
        ))}
        {['09:00', '10:00', '11:00', '12:00', '13:00', '14:30'].map((time, index) => (
          <text key={time} x={48 + index * 96.8} y="216" textAnchor="middle" fill="var(--muted-foreground)" fontSize="11">
            {time}
          </text>
        ))}
      </svg>
      <figcaption className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-4 bg-chart-1" />
          VOC-001 浓度（ppm）
        </span>
        <span>采样间隔 30 分钟 · 静态演示</span>
      </figcaption>
    </figure>
  );
}
export function AlarmFeed() {
  return (
    <div className="space-y-5">
      <SectionHeader title="事件与告警" description="关键状态同时使用文字与图标表达。" />
      <div className="space-y-4">
        <div className="border-l-2 border-status-warning pl-3">
          <StatusIndicator tone="warning" label="浓度超限" />
          <p className="mt-2 text-sm font-medium">VOC-003 · 废气处理站</p>
          <p className="mt-1 text-xs text-muted-foreground">58.2 ppm，超过阈值 50 ppm</p>
          <p className="mt-2 text-xs text-muted-foreground">14:28 · 等待处理</p>
        </div>
        <div className="border-l-2 border-status-neutral pl-3">
          <StatusIndicator tone="neutral" label="设备离线" />
          <p className="mt-2 text-sm font-medium">VOC-005 · 包装车间</p>
          <p className="mt-1 text-xs text-muted-foreground">已停止接收采样数据</p>
          <p className="mt-2 text-xs text-muted-foreground">14:21 · 检查连接</p>
        </div>
      </div>
    </div>
  );
}
export default function Monitoring({ showFeed = true }) {
  const [revision, setRevision] = useState(0);
  return (
    <div className="space-y-[var(--layout-gap)]">
      <SectionHeader
        title="园区环境监测"
        description="园区 A / VOC 采集网络 · 静态监测示例"
        actions={
          <Button variant="outline" onClick={() => setRevision(value => value + 1)}>
            <RefreshCw />
            刷新示例
          </Button>
        }
      />
      <div className="grid gap-[var(--layout-gap)] sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="设备总数" value="06" detail="覆盖 6 个采样位置" icon={Radio} />
        <MetricCard label="在线设备" value="04" detail="设备连接正常" icon={Activity} />
        <MetricCard label="待处理告警" value="02" detail="1 项浓度超限 · 1 台离线" icon={AlertTriangle} />
        <MetricCard label="当前浓度" value={`${48 + (revision % 3)}`} detail="ppm · VOC-001" icon={Gauge} />
      </div>
      <div className={showFeed ? 'grid gap-[var(--layout-gap)] xl:grid-cols-[minmax(0,1fr)_17rem]' : 'min-w-0'}>
        <section className="ds-panel min-w-0 space-y-5 p-[var(--panel-space)]">
          <SectionHeader title="浓度趋势" description="VOC-001 · 近 6 小时" />
          <ConcentrationChart revision={revision} />
        </section>
        {showFeed && (
          <section className="ds-panel p-[var(--panel-space)]">
            <AlarmFeed />
          </section>
        )}
      </div>
      <section className="ds-panel overflow-hidden">
        <div className="p-[var(--panel-space)]">
          <SectionHeader title="采集设备" description="状态色不随设计预设改变语义。" />
        </div>
        <Table>
          <TableCaption className="sr-only">设备状态与浓度列表</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>设备编号</TableHead>
              <TableHead>采样位置</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">浓度 / ppm</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.map(device => (
              <TableRow key={device.id}>
                <TableCell className="font-mono text-xs">{device.id}</TableCell>
                <TableCell className="whitespace-nowrap">{device.location}</TableCell>
                <TableCell>
                  <StatusIndicator tone={device.tone} label={device.status} />
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">{device.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
