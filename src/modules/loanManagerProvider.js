import store from "modules/store";
import { setupWatch } from "./web3Provider";
import {
    connectLoanManager,
    refreshLoanManager,
    fetchProducts
} from "modules/reducers/loanManager";
import { fetchLoans } from "modules/reducers/loans";
import { refreshTokenUcd } from "modules/reducers/tokenUcd";
import { fetchUserBalance } from "modules/reducers/userBalances";

export default () => {
    const loanManager = store.getState().loanManager;
    let web3Connect = store.getState().web3Connect;

    if (!loanManager.isLoading && !loanManager.isConnected) {
        setupWatch("web3Connect.network", onWeb3NetworkChange);
        setupWatch("loanManager.contract", onLoanManagerContractChange);
        setupWatch("web3Connect.userAccount", onUserAccountChange);
        if (web3Connect.isConnected) {
            console.debug(
                "loanManagerProvider - loanManager not connected or loading and web3 alreay loaded, dispatching connectLoanManager() "
            );
            store.dispatch(connectLoanManager());
        }
    }
    return;
};

const setupListeners = () => {
    const loanManager = store.getState().loanManager.contract.instance;
    loanManager
        .e_newLoan({ fromBlock: "latest", toBlock: "pending" })
        .watch(onNewLoan);
    loanManager
        .e_repayed({ fromBlock: "latest", toBlock: "pending" })
        .watch(onRepayed);
    loanManager
        .e_collected({ fromBlock: "latest", toBlock: "pending" })
        .watch(onCollected);
    // TODO: add & handle loanproduct change events
};

const removeListeners = oldInstance => {
    if (oldInstance && oldInstance.instance) {
        oldInstance.instance.e_newLoan().stopWatching();
        oldInstance.instance.e_repayed().stopWatching();
        oldInstance.instance.e_collected().stopWatching();
    }
};

const onWeb3NetworkChange = (newVal, oldVal, objectPath) => {
    removeListeners(oldVal);
    if (newVal !== null) {
        console.debug(
            "loanManagerProvider - web3Connect.network changed. Dispatching connectLoanManager()"
        );
        store.dispatch(connectLoanManager());
    }
};

const onLoanManagerContractChange = (newVal, oldVal, objectPath) => {
    removeListeners(oldVal);
    if (newVal) {
        console.debug(
            "loanManagerProvider - loanManager.contract changed. Dispatching refreshLoanManager, fetchProducts, fetchLoans"
        );
        const userAccount = store.getState().web3Connect.userAccount;
        store.dispatch(refreshLoanManager());
        store.dispatch(fetchProducts());
        store.dispatch(fetchLoans(userAccount));
        setupListeners();
    }
};

const onUserAccountChange = (newVal, oldVal, objectPath) => {
    const loanManager = store.getState().loanManager;
    if (loanManager.isConnected && newVal !== "?") {
        console.debug(
            "loanManagerProvider - web3Connect.userAccount changed. Dispatching fetchLoans()"
        );
        const userAccount = store.getState().web3Connect.userAccount;
        store.dispatch(fetchLoans(userAccount));
    }
};

const onNewLoan = (error, result) => {
    // event e_newLoan(uint8 productId, uint loanId, address borrower, address loanContract, uint disbursedLoanInUcd );
    console.debug(
        "loanManagerProvider.onNewLoan: dispatching refreshLoanManager & refreshTokenUcd"
    );
    store.dispatch(refreshTokenUcd());
    store.dispatch(refreshLoanManager()); // to update loanCount
    let userAccount = store.getState().web3Connect.userAccount;
    if (result.args.borrower.toLowerCase() === userAccount.toLowerCase()) {
        console.debug(
            "loanManagerProvider.onNewLoan: new loan for current user. Dispatching fetchLoans & fetchUserBalance"
        );
        // TODO: it can be expensive, should create a separate single fetchLoan action
        store.dispatch(fetchLoans(userAccount));
        store.dispatch(fetchUserBalance(userAccount));
    }
};

const onRepayed = (error, result) => {
    // e_repayed(loanContractAddress, loanContract.owner());
    console.debug(
        "loanManagerProvider.onRepayed:: Dispatching refreshTokenUcd"
    );
    store.dispatch(refreshTokenUcd());
    let userAccount = store.getState().web3Connect.userAccount;
    if (result.args.borrower.toLowerCase() === userAccount.toLowerCase()) {
        console.debug(
            "loanManagerProvider.onRepayed: loan repayed for current user. Dispatching fetchLoans & fetchUserBalance"
        );
        // TODO: it can be expensive, should create a separate single fetchLoan action
        store.dispatch(fetchLoans(userAccount));
        store.dispatch(fetchUserBalance(userAccount));
    }
};

const onCollected = (error, result) => {
    // event e_collected(address borrower, address loanContractAddress);
    console.debug(
        "loanManagerProvider.onCollected: Dispatching refreshTokenUcd"
    );
    store.dispatch(refreshTokenUcd());
    let userAccount = store.getState().web3Connect.userAccount;
    if (result.args.borrower.toLowerCase() === userAccount.toLowerCase()) {
        console.debug(
            "loanManagerProvider.onCollected: loan collected for current user. Dispatching fetchLoans & fetchUserBalance"
        );
        // TODO: it can be expensive, should create a separate single fetchLoan action
        store.dispatch(fetchLoans(userAccount));
        store.dispatch(fetchUserBalance(userAccount));
    }
};
