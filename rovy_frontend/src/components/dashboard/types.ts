export type DashboardMode = 'copilot';

export interface DashboardContextType {
  mode: DashboardMode;
  setMode: (mode: DashboardMode) => void;
}
