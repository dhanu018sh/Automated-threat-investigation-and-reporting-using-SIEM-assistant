export type Role = 'analyst' | 'senior_analyst' | 'soc_manager';

export interface User {
  id?: string | number;
  username: string;
  email?: string;
  role: Role | string;
  is_active?: boolean;
}

export type MessageRole = 'user' | 'assistant';

export interface RFPrediction {
  random_forest_active: boolean;
  trees_in_ensemble: number;
  trees_voted_malicious: number;
  malware_family: string;
  malware_confidence_pct: number;
  threat_severity: string;
  attacked_system_risk_score: number;
  attacking_vulnerability: string;
  top_feature_importances: Record<string, number>;
  model_metadata: {
    algorithm: string;
    n_trees: number;
    criterion: string;
    realtime_latency_ms: number;
  };
}

export interface QueryResult {
  query: string;
  platform: string;
  total_hits: number;
  events: Record<string, unknown>[];
  execution_time_ms: number;
}

export interface PlaybookProgress {
  playbook_name?: string;
  total_nodes?: number;
  node_id?: string;
  node_name?: string;
  completed_nodes?: string[];
  status?: string;
  severity?: string;
  risk_score?: number;
}

export interface EnrichmentResult {
  type: string;
  value: string;
  risk_score: number;
  abuse_score?: number;
  vt_detection_ratio?: number;
  country?: string;
  isp?: string;
  is_tor?: boolean;
  total_reports?: number;
  is_malicious?: boolean;
  summary?: string;
  detection_names?: string[];
}

export interface IOC {
  type: string;
  value: string;
  context: string;
}

export interface MITRETechnique {
  technique_id: string;
  technique_name: string;
  tactic: string;
}

export interface ApprovalRequest {
  action: string;
  risk_level: string;
  description?: string;
}

export type WSEventType =
  | 'thinking'
  | 'intent_classified'
  | 'query_generated'
  | 'query_result'
  | 'playbook_matched'
  | 'playbook_progress'
  | 'playbook_complete'
  | 'enrichment_result'
  | 'approval_required'
  | 'final_response'
  | 'error';

export interface WSEvent {
  type: WSEventType;
  message?: string;
  intent?: string;
  confidence?: number;
  query?: string;
  platform?: string;
  total_hits?: number;
  events?: Record<string, unknown>[];
  execution_time_ms?: number;
  playbook?: string;
  description?: string;
  node_id?: string;
  node_name?: string;
  severity?: string;
  risk_score?: number;
  iocs?: IOC[];
  data?: EnrichmentResult;
  action?: string;
  risk_level?: string;
  rf_predictions?: RFPrediction;
  evidence?: ThreatEvidence;
  system_info?: SystemTelemetry;
}

export interface SystemTelemetry {
  hostname: string;
  os_name: string;
  os_family: string;
  os_version: string;
  architecture: string;
  local_ip: string;
  current_time_local: string;
  current_time_utc: string;
  timezone: string;
  cpu_cores: number;
  active_sockets: number;
  siem_engine_status: string;
  threat_model: string;
}

export interface ThreatEvidence {
  attacker_ip: string;
  ip_classification: string;
  target_host: string;
  target_os: string;
  target_ip: string;
  attacked_time: string;
  detection_time_local: string;
  detection_time_utc: string;
  active_timeframe: string;
  system_info?: SystemTelemetry;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string | Date;
  events?: WSEvent[];
  rf_predictions?: RFPrediction;
  iocs?: IOC[];
  evidence?: ThreatEvidence;
  system_info?: SystemTelemetry;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export type InvestigationStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Investigation {
  id: string;
  title: string;
  status: InvestigationStatus | string;
  severity?: string;
  playbook_name?: string;
  risk_score?: number;
  created_at: string;
  completed_at?: string;
  findings?: any[];
  iocs?: IOC[];
  mitre_techniques?: MITRETechnique[];
  analyst?: string;
  rf_predictions?: RFPrediction;
  attack_location?: string;
  attack_system?: string;
  attack_links?: { label: string; url: string }[];
}

export interface ReportItem {
  id: string;
  title: string;
  investigation_id: string;
  date: string;
  format: 'PDF' | 'HTML' | 'Markdown' | 'JSON' | string;
  size: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  risk_score: number;
  analyst: string;
  playbook: string;
  summary: string;
  mitre_techniques: MITRETechnique[];
  iocs: IOC[];
  recommended_actions: string[];
  html_preview?: string;
  rf_predictions?: RFPrediction;
}
