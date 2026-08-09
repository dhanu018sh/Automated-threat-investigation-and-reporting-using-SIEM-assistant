from ..siem.base import SIEMQuery, QueryType

class QueryTranslator:
    def translate(self, intent: str, entities: list, platform: str, time_range: dict) -> SIEMQuery:
        query_str = ""
        ips = [e["value"] for e in entities if e["type"] == "ip_address"]
        
        if intent == "investigate":
            if ips:
                query_str = f"investigate IP {ips[0]}"
            else:
                query_str = "general investigation"
        else:
            query_str = f"{intent} query"
            
        return SIEMQuery(
            raw_query=query_str,
            query_type=QueryType.SEARCH,
            time_range=time_range,
            platform_hint=platform
        )
