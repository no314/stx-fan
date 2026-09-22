| function | entries | reads | read bytes | writes | write bytes | runtime | per entry reads | per entry read bytes | per entry writes | reads % of 4.0 tenure | read bytes % |
|---|---|---|---|---|---|---|---|---|---|---|---|
| claim-rewards (pull) | 1 | 25 | 99324 | 6 | 272 | 113468 | 25 | 99324 | 6 | 0.08% | 0.05% |
| settle-staker-rewards (single) | 1 | 24 | 93231 | 7 | 390 | 105388 | 24 | 93231 | 7 | 0.08% | 0.05% |
| payout (single, sBTC) | 1 | 18 | 89452 | 4 | 43 | 100295 | 18 | 89452 | 4 | 0.06% | 0.04% |
| settle-many | 25 | 528 | 233512 | 175 | 9750 | 661062 | 21.1 | 9340.5 | 7.0 | 1.76% | 0.12% |
| payout-many (sBTC) | 25 | 378 | 139036 | 100 | 1075 | 477465 | 15.1 | 5561.4 | 4.0 | 1.26% | 0.07% |
| settle-many | 50 | 1053 | 379661 | 350 | 19500 | 1232462 | 21.1 | 7593.2 | 7.0 | 3.51% | 0.19% |
| payout-many (sBTC) | 50 | 753 | 190686 | 200 | 2150 | 865490 | 15.1 | 3813.7 | 4.0 | 2.51% | 0.10% |
| settle-many | 100 | 2103 | 671936 | 700 | 39000 | 2375262 | 21.0 | 6719.4 | 7.0 | 7.01% | 0.34% |
| payout-many (sBTC) | 100 | 1503 | 293986 | 400 | 4300 | 1641540 | 15.0 | 2939.9 | 4.0 | 5.01% | 0.15% |
| settle-many | 200 | 4203 | 1256486 | 1400 | 78000 | 4660862 | 21.0 | 6282.4 | 7.0 | 14.01% | 0.63% |
| payout-many (sBTC) | 200 | 3003 | 500586 | 800 | 8600 | 3193640 | 15.0 | 2502.9 | 4.0 | 10.01% | 0.25% |
| settle-many (STX electors) | 50 | 1253 | 392666 | 400 | 30550 | 1412512 | 25.1 | 7853.3 | 8.0 | 4.18% | 0.20% |
| convert (route 1, 500,000 sats) | 1 | 106 | 135643 | 11 | 655 | 279599 | 106 | 135643 | 11 | 0.35% | 0.07% |
| payout-many (STX) | 50 | 853 | 122686 | 300 | 14800 | 1605440 | 17.1 | 2453.7 | 6.0 | 2.84% | 0.06% |
| quote-routes (read-only, 7.5M sats) | 1 | 64 | 142201 | 0 | 0 | 246813 | 64 | 142201 | 0 | 0.21% | 0.07% |
| jing-deposit | 1 | 54 | 157842 | 9 | 468 | 176271 | 54 | 157842 | 9 | 0.18% | 0.08% |
| jing-reconcile (partial fill, order stays open) | 1 | 82 | 261655 | 7 | 603 | 299144 | 82 | 261655 | 7 | 0.27% | 0.13% |
| jing-cancel | 1 | 36 | 123288 | 9 | 311 | 139488 | 36 | 123288 | 9 | 0.12% | 0.06% |
| get-jing-state (read-only) | 1 | 30 | 156470 | 0 | 0 | 160842 | 30 | 156470 | 0 | 0.10% | 0.08% |

simnet reported limit table: {"writeLength":15000000,"writeCount":15000,"readLength":100000000,"readCount":15000,"runtime":5000000000}

mock pox-5 source bytes: 5332 ; mainnet pox-5 source bytes: 136051 (read 2026-09-19). Each entry loads pox-5 once, so add roughly (136051 - mock) bytes per entry to read bytes for a mainnet estimate.
manager source bytes (sim): 87385
