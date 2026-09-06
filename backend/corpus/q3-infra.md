<!-- page: 9 section: Capacity -->
Autoscaling lag during the August traffic spike created a 14-minute saturation window on the ingest tier. Horizontal pod autoscaler targets were too conservative for bursty retrieval workloads. The ingest fleet queued requests while CPU sat idle on adjacent pools that were not part of the same HPA group. Capacity planning for Q3 assumed a smooth diurnal curve; the spike was a product launch plus a retry storm.

Operators should split retrieval workers from ingest and raise the HPA target only for the retrieval deployment. Do not raise cluster-wide CPU requests — that recreates the idle staging cost problem.

<!-- page: 17 section: Cost posture -->
Cloud infrastructure expenditure increased 18% quarter over quarter, driven primarily by GPU burst capacity and idle staging clusters in eu-central-1. Reserved-instance coverage fell to 61%. Finance tagged GPU burst to the shared platform rather than the teams that triggered it, which hid the true unit cost of retrieval experiments.

A 12-month reserved ladder and a scale-to-zero policy for staging GPUs after 20:00 are the two highest-leverage actions. Without them the run-rate continues to compound into Q4.

<!-- page: 24 section: Risk register -->
Three primary risks were identified: cloud cost volatility, infrastructure scaling bottlenecks, and security configuration drift across newly provisioned GPU nodes. Drift is most acute when images are not baked with CIS baselines. Cost volatility tracks GPU spot interruptions and ungoverned burst.

<!-- page: 31 section: Outlook -->
Q4 guidance holds spend flat if staging GPUs scale to zero after 20:00 and reserved coverage returns above 80%. Otherwise the run-rate continues to compound. Reliability owns the autoscaling lag item; FinOps owns reserved coverage.
