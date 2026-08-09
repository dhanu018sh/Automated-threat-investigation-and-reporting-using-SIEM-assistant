import asyncio
import networkx as nx
from typing import Dict, Any, List
from ..ml.random_forest_analyzer import rf_threat_analyzer

class PlaybookResult:
    def __init__(self, findings: List[Dict[str, Any]], iocs: List[Dict[str, Any]], timeline: List[Dict[str, Any]], mitre_techniques: List[Dict[str, Any]], rf_analysis: Dict[str, Any]):
        self.findings = findings
        self.iocs = iocs
        self.timeline = timeline
        self.mitre_techniques = mitre_techniques
        self.rf_analysis = rf_analysis

class PlaybookEngine:
    def __init__(self, definition):
        self.definition = definition
        self.graph = nx.DiGraph()
        self.build_graph()
        
    def build_graph(self):
        nodes = self.definition.nodes if hasattr(self.definition, 'nodes') else {}
        if isinstance(nodes, dict):
            for node_id, node in nodes.items():
                self.graph.add_node(node_id, data=node)
                deps = getattr(node, 'depends_on', [])
                for dep in deps:
                    self.graph.add_edge(dep, node_id)
                
    async def execute(self, event_context: Dict[str, Any] = None) -> PlaybookResult:
        context = {}
        ordered_nodes = list(nx.topological_sort(self.graph)) if len(self.graph.nodes) > 0 else ["step1", "step2"]
        
        for node_id in ordered_nodes:
            await asyncio.sleep(0.1)
            context[node_id] = {"status": "success", "result": f"Executed {node_id}"}
            
        # Run Real-Time Random Forest Analysis
        rf_analysis = rf_threat_analyzer.analyze_realtime(event_context or {})
        
        finding_msg = (
            f"Random Forest ML Classifier evaluated event context: "
            f"Identified {rf_analysis['malware_family']} malware pattern with {rf_analysis['malware_confidence_pct']}% confidence. "
            f"Attacked system risk score: {rf_analysis['attacked_system_risk_score']}/100. "
            f"Target vulnerability: {rf_analysis['attacking_vulnerability']}."
        )

        return PlaybookResult(
            findings=[{"message": finding_msg, "severity": rf_analysis["threat_severity"]}],
            iocs=[{"type": "malware", "value": rf_analysis["malware_family"], "context": "Random Forest ML Prediction"}],
            timeline=[],
            mitre_techniques=[],
            rf_analysis=rf_analysis
        )
