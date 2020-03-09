# Data Replication for EasyBase
The goal of EasyBase is to:
- have simple Key/Value DataStores without any additional bloat
- infinitely scalable Servers for handling any load

## Masters - Slave replication scheme
EasyBase takes a modified approach to the Master - Slave scheme:
- For each Master, there are 4 slaves in Replication mode
- Masters can work with other Masters to provide HA write, but may impact performance
- If the Master goes unresponsive, the remaining Slaves will perform a Master election while a replacement Slave is deployed