import React from "react";
import store from "modules/store";
import { Pblock } from "components/PageLayout";
import { ContractBaseInfo } from "./ContractBaseInfo";
import { refreshRates } from "modules/reducers/rates";

export function RatesInfo(props) {
    let { contract } = props;

    const handleRefreshClick = e => {
        e.preventDefault();
        store.dispatch(refreshRates());
    };

    return (
        <Pblock header="Rates contract">
            <p>ETH/USD: {contract.info.ethUsdRate}</p>

            <ContractBaseInfo
                contract={contract}
                refreshCb={handleRefreshClick}
            />
        </Pblock>
    );
}
