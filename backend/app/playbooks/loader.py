import yaml
import os
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class PlaybookNode:
    id: str
    type: str
    depends_on: List[str]
    config: Dict

@dataclass
class PlaybookDefinition:
    name: str
    version: str
    description: str
    trigger: Dict
    nodes: Dict[str, PlaybookNode]

class PlaybookLoader:
    def __init__(self, definitions_dir: str):
        self.definitions_dir = definitions_dir
        
    def load_all(self) -> Dict[str, PlaybookDefinition]:
        playbooks = {}
        if not os.path.exists(self.definitions_dir):
            return playbooks
            
        for file in os.listdir(self.definitions_dir):
            if file.endswith(('.yaml', '.yml')):
                path = os.path.join(self.definitions_dir, file)
                with open(path, 'r') as f:
                    data = yaml.safe_load(f)
                    nodes = {}
                    for node_data in data.get('nodes', []):
                        nodes[node_data['id']] = PlaybookNode(
                            id=node_data['id'],
                            type=node_data['type'],
                            depends_on=node_data.get('depends_on', []),
                            config=node_data
                        )
                    pb = PlaybookDefinition(
                        name=data.get('name', 'unknown'),
                        version=str(data.get('version', '1.0')),
                        description=data.get('description', ''),
                        trigger=data.get('trigger', {}),
                        nodes=nodes
                    )
                    playbooks[pb.name] = pb
        return playbooks
