import store from "modules/store";
import { setupWatch } from "./web3Provider";
import { connectExchange, refreshExchange } from "modules/reducers/exchange";
import { refreshOrders } from "modules/reducers/orders";

export default () => {
    const exchange = store.getState().exchange;
    const web3Connect = store.getState().web3Connect;

    if (!exchange.isLoading && !exchange.isConnected) {
        setupWatch("web3Connect.network", onWeb3NetworkChange);
        setupWatch("exchange.contract", onExchangeContractChange);
        if (web3Connect.isConnected) {
            console.debug(
                "exchangeProvider - exchange not connected or loading and web3 alreay loaded, dispatching connectExchange() "
            );
            store.dispatch(connectExchange());
        }
    }
    return;
};

const setupListeners = () => {
    const exchange = store.getState().exchange.contract.instance;
    exchange
        .e_newOrder({ fromBlock: "latest", toBlock: "pending" })
        .watch(onNewOrder);
    exchange
        .e_orderFill({ fromBlock: "latest", toBlock: "pending" })
        .watch(onOrderFill);
};

const removeListeners = oldInstance => {
    if (oldInstance && oldInstance.instance) {
        oldInstance.instance.e_newOrder().stopWatching();
        oldInstance.instance.e_orderFill().stopWatching();
    }
};

const onWeb3NetworkChange = (newVal, oldVal, objectPath) => {
    removeListeners(oldVal);
    if (newVal !== null) {
        console.debug(
            "exchangeProvider - web3Connect.network changed. Dispatching connectExchange()"
        );

        store.dispatch(connectExchange());
    }
};

const onExchangeContractChange = (newVal, oldVal, objectPath) => {
    removeListeners(oldVal);
    if (newVal) {
        console.debug(
            "exchangeProvider - exchange.contract changed. Dispatching refreshExchange()"
        );
        store.dispatch(refreshExchange());
        store.dispatch(refreshOrders());
        setupListeners();
    }
};

// event e_newOrder(uint orderId, OrdersLib.OrderType orderType, address maker, uint amount);
const onNewOrder = (error, result) => {
    console.debug(
        "exchangeProvider.onNewOrder: dispatching refreshExchange() and refreshOrders()"
    );
    store.dispatch(refreshExchange());
    store.dispatch(refreshOrders());
    // Userbalance is refreshed because e_transfer is emmitted from neworder tx
};

// event e_orderFill(uint orderId, OrdersLib.OrderType orderType, address maker, address taker, uint amountSold, uint amountPaid);
const onOrderFill = (error, result) => {
    console.debug(
        "exchangeProvider.onOrderFill: dispatching refreshExchange()",
        error,
        result
    );
    // FIXME: shouldn't do refresh for each orderFill event becuase multiple orderFills emmitted for one new order
    //          but newOrder is not emmited when a sell fully covered by orders and
    store.dispatch(refreshExchange());
    store.dispatch(refreshOrders());
    // Userbalance is refreshed because e_transfer is emmitted from orderfill tx
};
