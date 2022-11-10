# Домашнее задание №4 К занятию “Solidity + EVM, low-level patterns”

В рамках тестирования деплоятся `GoldCoin` и `SilverCoin`, создается Uniswap пара для них, посредством использования Uniswap Factory из форка Mainnet. Затем производится обмен токенов с использованием этой пары.

Перед запуском тестов запустите форк Mainnet'а используя ключ с Alchemy.
```
$ npx hardhat node --fork https://eth-mainnet.g.alchemy.com/v2/<API KEY>
```

Пример запуска тестов:

```
$ npx hardhat test --network localhost


  Echange coins with Uniswap
    Deployment
      - Deploy GoldCoin
      - Deploy SilverCoin
      ✔ Should set the right owner (934ms)
      ✔ Should assign the total supply of tokens to the owner (44ms)
    Swap gold and silver coins
      - Creating uniswap factory contract: adress = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f
      - Creating uniswap pair...
      - Pair created: address = 0xc0dE107eC52bc729d9F8D540b1abB1B889661094
      - Creating liquidity...
      - Liquidity created: reserves of pair equals 10000 and 100000000
      - Transferring 1000 token0 to pair...
      - Getting 1000 token1 from pair...
      - Checking balances...
      ✔ Just true (1697ms)


  3 passing (3s)
```
