from collections import defaultdict
from datetime import datetime

class ButtonStatsManager:
    def __init__(self):
        self.stats = defaultdict(int)
        self.events = []
    
    def record_event(self, button_name: str, user_id: str = None):
        self.stats[button_name] += 1
        self.events.append({
            "button": button_name,
            "timestamp": datetime.now().isoformat(),
            "user_id": user_id
        })
    
    def get_stats(self) -> dict:
        return dict(self.stats)
    
    def get_events(self):
        return self.events
    
    def reset_stats(self):
        self.stats.clear()
        self.events.clear()

# Global instance
button_stats = ButtonStatsManager()
