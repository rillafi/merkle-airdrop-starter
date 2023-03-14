import axios from 'axios';
import {
    Multicall,
    ContractCallResults,
    ContractCallContext
} from 'ethereum-multicall';
import { CallContext } from 'ethereum-multicall/dist/esm/models';
import { BigNumber, ethers } from 'ethers';
import fs from 'fs'

let provider = new ethers.providers.EtherscanProvider(
    'goerli',
    'GS67RJI5VR8XPRSRA63HCRNSKPXR2PEG9M'
);
const multicall = new Multicall({
    ethersProvider: provider,
    tryAggregate: true
});

function uniq(a: any[]) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    });
}
const getContractAbi = async (url: string) =>
    axios.get(url).then((res) => res.data);

const getContracts = async (
    reference: string,
    contractAddress: string,
    abi: any[],
    calls: CallContext[],
    /* context: ContractCallContext[], */
    /* reference: string */
) => {
    // const atATime = 500;
    let res = [];
    // for (let i = 0; i <= Math.floor(calls.length / atATime); ++i) {
        let context: ContractCallContext[] = [
            {
                reference,
                contractAddress,
                abi,
                calls
                // calls: calls.slice(i * atATime, (i + 1) * atATime)
            }
        ];
        let results = await multicall.call(context);
        res.push(
            ...results.results[reference].callsReturnContext.map(
                (elem) => elem.returnValues[0]
            )
        );
    // }
    return res;
};
(async () => {
    const list = [
        {
            name: 'donationRouter',
            url: 'https://raw.githubusercontent.com/rillafi/test-contracts/main/deployedContracts/5/DonationRouter.json',
            details: {} as any,
            interacted: []
        },
        {
            name: 'TokenClaim',
            url: 'https://raw.githubusercontent.com/rillafi/test-contracts/main/deployedContracts/5/TokenClaim.json',
            details: {} as any,
            interacted: []
        },
        {
            name: 'VoteEscrow',
            url: 'https://raw.githubusercontent.com/rillafi/test-contracts/main/deployedContracts/5/VoteEscrow.json',
            details: {} as any,
            interacted: []
        }
    ];
    let proms = list.map((elem, i) => {
        return (list[i].details = getContractAbi(elem.url));
    });
    proms = await Promise.all(proms);
    proms.forEach((e, i) => {
        list[i].details = e;
    });
list[2].interacted.length
  const contract = new ethers.Contract(
    list[2].details.address,
    list[2].details.abi,
    provider
  )
  let eventFilter = contract.filters.Deposit()
  let events = await contract.queryFilter(eventFilter)
  console.log(events.length)

    let contractCallContext: ContractCallContext[] = [
        {
            reference: 'donationRouter',
            contractAddress: list[0].details.address,
            abi: list[0].details.abi,
            calls: [
                {
                    reference: 'donationsInteracted',
                    methodName: 'getInteracted',
                    methodParameters: []
                }
            ]
        },
        {
            reference: 'tokenClaim',
            contractAddress: list[1].details.address,
            abi: list[1].details.abi,
            calls: [
                {
                    reference: 'tokensInteracted',
                    methodName: 'getInteracted',
                    methodParameters: []
                }
            ]
        }
    ];

    let results: ContractCallResults = await multicall.call(
        contractCallContext
    );

    let addresses =
        results.results.donationRouter.callsReturnContext[0].returnValues.filter(
            (elem) =>
                results.results.tokenClaim.callsReturnContext[0].returnValues.includes(
                    elem
                )
        );
    addresses.filter((elem) => ethers.utils.isAddress(elem));
    // addresses = results.results.tokenClaim.callsReturnContext[0].returnValues;
    // `let calls = addresses.map((elem) => ({
    // `    reference: 'veBalance',
    // `    methodName: 'balanceOf(address)',
    // `    methodParameters: [elem]
    // `}));
    let veAddresses = events.map((elem)=>elem.args?.provider);
    // const res = await getContracts('ve', list[2].details.address, list[2].details.abi, calls);
    // addresses = addresses.filter((_, i) => (BigNumber.from(res[i]?.hex).gt(0)))
    addresses = uniq(addresses)
    addresses = addresses.filter((addr) => (veAddresses.includes(addr)));
    const totalPot = ethers.utils.parseEther('1000000');
    const amount = totalPot.div(addresses.length);
    const config = JSON.parse(fs.readFileSync('./config.json').toString())
    config.airdrop = {};
    addresses.forEach((addr) => config.airdrop[addr] = ethers.utils.formatEther(amount));
    config.airdrop["0x5117438e943ab870625dda4B0FE3b8118640fFdb"] = 1;
    console.log(Object.keys(config.airdrop).length);
    fs.writeFileSync('./config.json', JSON.stringify(config))
})();
