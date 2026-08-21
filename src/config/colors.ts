export const uiColors = {
  brand: 'var(--color-brand-primary)',
  brandDark: 'var(--color-brand-primary-dark)',
  accent: 'var(--color-brand-accent)',
  study: 'var(--color-study)',
  health: 'var(--color-health)',
  work: 'var(--color-work)',
  finance: 'var(--color-finance)',
  habit: 'var(--color-habit)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
  success: 'var(--color-success)',
  muted: 'var(--color-text-muted)',
  chartGrid: 'var(--color-chart-grid)',
} as const

export const chartSeries = [uiColors.brand, uiColors.study, uiColors.accent, uiColors.work, uiColors.finance, uiColors.health] as const
