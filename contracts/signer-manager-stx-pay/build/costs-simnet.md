| function | entries | reads | read bytes | writes | write bytes | runtime | per entry reads | per entry read bytes | per entry writes | reads % of 4.0 tenure | read bytes % |
|---|---|---|---|---|---|---|---|---|---|---|---|
| claim-rewards (pull) | 1 | 25 | 89244 | 6 | 272 | 105572 | 25 | 89244 | 6 | 0.08% | 0.04% |
| settle-staker-rewards (single) | 1 | 24 | 83151 | 7 | 390 | 95308 | 24 | 83151 | 7 | 0.08% | 0.04% |
| payout (single, sBTC) | 1 | 19 | 79395 | 4 | 43 | 91017 | 19 | 79395 | 4 | 0.06% | 0.04% |
| settle-many | 25 | 528 | 223432 | 175 | 9750 | 650982 | 21.1 | 8937.3 | 7.0 | 1.76% | 0.11% |
| payout-many (sBTC) | 25 | 403 | 129531 | 100 | 1075 | 487435 | 16.1 | 5181.2 | 4.0 | 1.34% | 0.06% |
| settle-many | 50 | 1053 | 369581 | 350 | 19500 | 1222382 | 21.1 | 7391.6 | 7.0 | 3.51% | 0.18% |
| payout-many (sBTC) | 50 | 803 | 181756 | 200 | 2150 | 895510 | 16.1 | 3635.1 | 4.0 | 2.68% | 0.09% |
| settle-many | 100 | 2103 | 661856 | 700 | 39000 | 2365182 | 21.0 | 6618.6 | 7.0 | 7.01% | 0.33% |
| payout-many (sBTC) | 100 | 1603 | 286206 | 400 | 4300 | 1711660 | 16.0 | 2862.1 | 4.0 | 5.34% | 0.14% |
| settle-many | 200 | 4203 | 1246406 | 1400 | 78000 | 4650782 | 21.0 | 6232.0 | 7.0 | 14.01% | 0.62% |
| payout-many (sBTC) | 200 | 3203 | 495106 | 800 | 8600 | 3343960 | 16.0 | 2475.5 | 4.0 | 10.68% | 0.25% |
| settle-many (STX electors) | 50 | 1253 | 384007 | 400 | 32000 | 1411382 | 25.1 | 7680.1 | 8.0 | 4.18% | 0.19% |
| convert (route 1, 500,000 sats) | 1 | 110 | 133193 | 11 | 684 | 282443 | 110 | 133193 | 11 | 0.37% | 0.07% |
| payout-many (STX) | 50 | 853 | 101756 | 300 | 16250 | 1595060 | 17.1 | 2035.1 | 6.0 | 2.84% | 0.05% |
| quote-routes (read-only, 7.5M sats) | 1 | 68 | 141918 | 0 | 0 | 250228 | 68 | 141918 | 0 | 0.23% | 0.07% |
| abandon-epoch | 1 | 9 | 77584 | 2 | 235 | 85064 | 9 | 77584 | 2 | 0.03% | 0.04% |
| payout (abandoned epoch, sBTC leg) | 1 | 30 | 79747 | 10 | 402 | 102833 | 30 | 79747 | 10 | 0.10% | 0.04% |
| payout (abandoned epoch, STX leg) | 1 | 15 | 77505 | 3 | 43 | 94853 | 15 | 77505 | 3 | 0.05% | 0.04% |

simnet reported limit table: {"writeLength":15000000,"writeCount":15000,"readLength":100000000,"readCount":15000,"runtime":5000000000}

mock pox-5 source bytes: 5332 ; mainnet pox-5 source bytes: 136051 (read 2026-09-19). Each entry loads pox-5 once, so add roughly (136051 - mock) bytes per entry to read bytes for a mainnet estimate.
manager source bytes (sim): 77305
