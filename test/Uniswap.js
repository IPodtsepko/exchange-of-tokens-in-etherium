const { expect } = require("chai");
const { Contract } = require("ethers");
const { ethers } = require('hardhat');

const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");


const IUniswapV2Factory = require('@uniswap/v2-core/build/IUniswapV2Factory.json');
const uniswapV2FactoryAddress = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';

const IUniswapV2Pair = require('@uniswap/v2-core/build/IUniswapV2Pair.json');

describe("Echange coins with Uniswap", function () {

    async function deployCoins() {
        const [owner, signer,] = await ethers.getSigners();

        console.log('      - Deploy GoldCoin');
        let GoldCoin = await ethers.getContractFactory('GoldCoin');
        let goldCoin = await GoldCoin.deploy();

        console.log('      - Deploy SilverCoin');
        let SilverCoin = await ethers.getContractFactory('SilverCoin');
        let silverCoin = await SilverCoin.deploy();

        return { goldCoin, silverCoin, owner, signer };
    }

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const { goldCoin, silverCoin, owner } = await loadFixture(deployCoins);
            expect(await goldCoin.owner()).to.equal(owner.address);
            expect(await silverCoin.owner()).to.equal(owner.address);
        });
        it("Should assign the total supply of tokens to the owner", async function () {
            const { goldCoin, silverCoin, owner } = await loadFixture(deployCoins);
            expect(await goldCoin.totalSupply()).to.equal(await goldCoin.balanceOf(owner.address));
            expect(await silverCoin.totalSupply()).to.equal(await silverCoin.balanceOf(owner.address));
        });
    });

    describe("Swap gold and silver coins", function () {
        it("Just true", async function () {
            const { goldCoin, silverCoin, owner, signer } = await loadFixture(deployCoins);

            console.log('      - Creating uniswap factory contract: adress =', uniswapV2FactoryAddress);
            const factory = new Contract(uniswapV2FactoryAddress, IUniswapV2Factory.abi, owner);
            console.log('      - Creating uniswap pair...');
            const transaction = await factory.createPair(goldCoin.address, silverCoin.address);
            const result = await transaction.wait();

            expect(result.events.length == 1, 'It was expected that only one pair was created');

            const args = result.events[0].args;

            expect(args.token0 == goldCoin.address, 'The addresses in the pair must match the addresses of the coins');
            expect(args.token1 == silverCoin.address, 'The addresses in the pair must match the addresses of the coins');
            const pairAddress = args.pair;
            console.log('      - Pair created: address =', pairAddress);

            const uniswapPair = new Contract(pairAddress, IUniswapV2Pair.abi, owner);

            let [token0, token1] = goldCoin.address < silverCoin.address ? [goldCoin, silverCoin] : [silverCoin, goldCoin];

            console.log('      - Creating liquidity...');
            await token0.transfer(pairAddress, 1e4);
            await token1.transfer(pairAddress, 1e8);
            await uniswapPair.sync();

            const reserves = await uniswapPair.getReserves();

            expect(reserves.reserve0).to.equal(1e4);
            expect(reserves.reserve1).to.equal(1e8);

            expect(await token0.balanceOf(pairAddress)).to.equal(1e4);
            expect(await token1.balanceOf(pairAddress)).to.equal(1e8);
            console.log('      - Liquidity created: reserves of pair equals', 1e4, 'and', 1e8);

            console.log('      - Transferring', 1e3, 'token0 to pair...');
            await token0.transfer(pairAddress, 1e3);

            console.log('      - Getting', 1e3, 'token1 from pair...');
            await expect(await uniswapPair.swap(0, 1e3, signer.address, '0x'))
                .to.emit(uniswapPair, 'Swap')
                .withArgs(owner.address, 1e3, 0, 0, 1e3, signer.address);

            console.log('      - Checking balances...');
            expect(await token0.balanceOf(signer.address)).to.equal(0);
            expect(await token1.balanceOf(signer.address)).to.equal(1e3);
        });
    })
});
