import { default as Contract } from "truffle-contract";

export default class SolidityContract {
    constructor(instance) {
        this.instance = instance;
    }
    static async connectNewOwned(provider, artifacts) {
        let contract = this.connectNew(provider, artifacts);

        return contract;
    }

    static async connectNew(provider, artifacts) {
        var contractDef = Contract(artifacts);
        contractDef.setProvider(provider);
        var instance = await contractDef.deployed();

        // This extra check needed because .deployed() returns an instance
        //      even when contract is not deployed
        // TODO: find out if there is a better way to do it
        //      (especially for contracts which don't have owner prop)
        if (typeof instance.owner === "function") {
            let owner = await instance.owner();

            if (owner === "0x") {
                let contractName = artifacts.contract_name;
                throw new Error(
                    "Can't connect to " +
                        contractName +
                        " contract. Owner is 0x. Not deployed?"
                );
            }
        }
        return new SolidityContract(instance);
    }

    static async connectNewAt(provider, artifacts, address) {
        let contractDef = Contract(artifacts);
        contractDef.setProvider(provider);
        let instance = await contractDef.at(address);
        return new SolidityContract(instance);
    }
}