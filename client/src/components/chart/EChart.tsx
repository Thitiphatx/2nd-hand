import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface EChartProps {
  options: echarts.EChartsOption;
  style?: React.CSSProperties;
  theme?: 'light' | 'dark';
}

const EChart: React.FC<EChartProps> = ({ options, style, theme = 'light' }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Dispose of any existing chart instance to handle theme change
    if (instanceRef.current) {
      instanceRef.current.dispose();
    }

    // Initialize ECharts with the current theme
    instanceRef.current = echarts.init(chartRef.current, theme);
    instanceRef.current.setOption(options);

    // Watch for window resize events
    const handleResize = () => {
      instanceRef.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      instanceRef.current?.dispose();
      instanceRef.current = null;
    };
  }, [theme]);

  // Update options dynamically if they change
  useEffect(() => {
    if (instanceRef.current) {
      instanceRef.current.setOption(options, { notMerge: true });
    }
  }, [options]);

  return (
    <div
      ref={chartRef}
      style={{ width: '100%', height: '320px', ...style }}
    />
  );
};

export default EChart;
