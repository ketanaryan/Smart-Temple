import math

class QueueBalancer:
    @staticmethod
    def get_next_category(online_count: int, walkin_count: int, last_served: list = []) -> str:
        """
        Phase 2: Dynamic Queue Balancing
        3:1 tendency based on queue imbalance, dynamic reversal, and alternating when balanced.
        For stateless operation, we assume state or probabilistic tendency.
        """
        if online_count == 0 and walkin_count == 0:
            return None
        if online_count == 0:
            return "WALK_IN"
        if walkin_count == 0:
            return "ONLINE"

        # If Online demand is heavily skewed (e.g., 12 vs 4 -> ratio >= 2 or 3)
        if online_count >= walkin_count * 2:
            return "ONLINE (3:1 Tendency)"
        
        # Reversing tendency when Walk-in is heavily skewed
        if walkin_count >= online_count * 2:
            return "WALK_IN (3:1 Tendency)"
        
        # Alternating evenly when queues are balanced
        return "BALANCED (Alternating)"

    @staticmethod
    def calculate_mmk_metrics(arrival_rate_lambda: float, service_rate_mu: float, num_servers_k: int) -> dict:
        """
        Phase 3: Calculates M/M/k Queuing metrics:
        - Expected waiting time in queue (Wq)
        - Expected queue length (Lq)
        - System Utilization (rho)
        """
        rho = arrival_rate_lambda / (num_servers_k * service_rate_mu)
        
        if rho >= 1:
            return {
                "expected_wait_mins": float('inf'),
                "expected_queue_length": float('inf'),
                "utilization": round(rho * 100, 2)
            }
        
        sum_p0 = sum((((arrival_rate_lambda / service_rate_mu) ** n) / math.factorial(n)) for n in range(num_servers_k))
        last_term = (((arrival_rate_lambda / service_rate_mu) ** num_servers_k) / math.factorial(num_servers_k)) * (1 / (1 - rho))
        P0 = 1 / (sum_p0 + last_term)

        Lq = (P0 * ((arrival_rate_lambda / service_rate_mu) ** num_servers_k) * rho) / (math.factorial(num_servers_k) * ((1 - rho) ** 2))
        Wq = Lq / arrival_rate_lambda
        
        return {
            "expected_wait_mins": round(Wq, 2),
            "expected_queue_length": round(Lq, 2),
            "utilization": round(rho * 100, 2)
        }
