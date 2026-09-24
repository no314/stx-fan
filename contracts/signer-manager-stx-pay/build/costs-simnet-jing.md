| function | entries | reads | read bytes | writes | write bytes | runtime | per entry reads | per entry read bytes | per entry writes | reads % of 4.0 tenure | read bytes % |
|---|---|---|---|---|---|---|---|---|---|---|---|
| claim-rewards (pull) | 1 | 25 | 107184 | 6 | 277 | 123507 | 25 | 107184 | 6 | 0.08% | 0.05% |
| settle-staker-rewards (single) | 1 | 24 | 101091 | 7 | 395 | 113243 | 24 | 101091 | 7 | 0.08% | 0.05% |
| payout (single, sBTC) | 1 | 19 | 97330 | 4 | 43 | 108952 | 19 | 97330 | 4 | 0.06% | 0.05% |
| settle-many | 25 | 528 | 241492 | 175 | 9875 | 668917 | 21.1 | 9659.7 | 7.0 | 1.76% | 0.12% |
| payout-many (sBTC) | 25 | 403 | 147466 | 100 | 1075 | 505370 | 16.1 | 5898.6 | 4.0 | 1.34% | 0.07% |
| settle-many | 50 | 1053 | 387766 | 350 | 19750 | 1240317 | 21.1 | 7755.3 | 7.0 | 3.51% | 0.19% |
| payout-many (sBTC) | 50 | 803 | 199691 | 200 | 2150 | 913445 | 16.1 | 3993.8 | 4.0 | 2.68% | 0.10% |
| settle-many | 100 | 2103 | 680291 | 700 | 39500 | 2383117 | 21.0 | 6802.9 | 7.0 | 7.01% | 0.34% |
| payout-many (sBTC) | 100 | 1603 | 304141 | 400 | 4300 | 1729595 | 16.0 | 3041.4 | 4.0 | 5.34% | 0.15% |
| settle-many | 200 | 4203 | 1265341 | 1400 | 79000 | 4668717 | 21.0 | 6326.7 | 7.0 | 14.01% | 0.63% |
| payout-many (sBTC) | 200 | 3203 | 513041 | 800 | 8600 | 3361895 | 16.0 | 2565.2 | 4.0 | 10.68% | 0.26% |
| settle-many (STX electors) | 50 | 1253 | 402192 | 400 | 32250 | 1429317 | 25.1 | 8043.8 | 8.0 | 4.18% | 0.20% |
| convert (route 1, 500,000 sats) | 1 | 111 | 151135 | 11 | 684 | 300629 | 111 | 151135 | 11 | 0.37% | 0.08% |
| payout-many (STX) | 50 | 853 | 119691 | 300 | 16250 | 1612995 | 17.1 | 2393.8 | 6.0 | 2.84% | 0.06% |
| quote-routes (read-only, 7.5M sats) | 1 | 68 | 159858 | 0 | 0 | 268163 | 68 | 159858 | 0 | 0.23% | 0.08% |
| jing-deposit (maker) | 1 | 43 | 130565 | 10 | 539 | 149644 | 43 | 130565 | 10 | 0.14% | 0.07% |
| jing-reconcile (partial fill) | 1 | 53 | 181188 | 7 | 604 | 202316 | 53 | 181188 | 7 | 0.18% | 0.09% |
| jing-cancel | 1 | 60 | 199175 | 9 | 333 | 221313 | 60 | 199175 | 9 | 0.20% | 0.10% |
| jing-swap (taker, 100,000 sats) | 1 | 99 | 134788 | 28 | 1527 | 201997 | 99 | 134788 | 28 | 0.33% | 0.07% |
| get-jing-state (read-only) | 1 | 31 | 196601 | 0 | 0 | 200185 | 31 | 196601 | 0 | 0.10% | 0.10% |
| abandon-epoch | 1 | 10 | 95521 | 2 | 235 | 103250 | 10 | 95521 | 2 | 0.03% | 0.05% |
| payout (abandoned epoch, sBTC leg) | 1 | 30 | 97682 | 10 | 402 | 120768 | 30 | 97682 | 10 | 0.10% | 0.05% |
| payout (abandoned epoch, STX leg) | 1 | 15 | 95440 | 3 | 43 | 112788 | 15 | 95440 | 3 | 0.05% | 0.05% |

simnet reported limit table: {"writeLength":15000000,"writeCount":15000,"readLength":100000000,"readCount":15000,"runtime":5000000000}

mock pox-5 source bytes: 5332 ; mainnet pox-5 source bytes: 136051 (read 2026-09-19). Each entry loads pox-5 once, so add roughly (136051 - mock) bytes per entry to read bytes for a mainnet estimate.
manager source bytes (sim): 95240
