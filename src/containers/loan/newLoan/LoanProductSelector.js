import React from "react";
import { connect } from "react-redux";
import LoanProductList from "containers/loan/components/LoanProductList";
import { Pgrid } from "components/PageLayout";
import { Message, Button } from "semantic-ui-react";
import { Link } from "react-router-dom";
//import { Container, Message, Icon } from "semantic-ui-react";

export function SelectLoanButton(props) {
    return (
        <Button
            labelPosition="right"
            content="Select"
            icon="right chevron"
            key={props.productId}
            as={Link}
            primary
            to={`/loan/new/${props.productId}`}
        />
    );
}

class LoanProductSelector extends React.Component {
    render() {
        return (
            <Pgrid columns={2}>
                <Pgrid.Column width={6}>
                    <Message info>
                        <p>
                            You can get ACD for placing your ETH in escrow
                            (collateral).{" "}
                        </p>
                        <p>
                            <strong>Repayment</strong>
                            <br />
                            When you repay the ACD on maturity you will get back
                            all of your ETH.
                        </p>
                        <p>
                            <strong>Default (non payment)</strong>
                            <br />
                            If you decide not to repay the ACD loan at maturity
                            then your ETH will be taken to the Augmint system
                            reserves.
                        </p>
                        <p>
                            TODO, Not yet implemented: <br />
                            If the value of your ETH (at the moment of
                            collection) is higher than the ACD value of your
                            loan + fees for the default then the leftover ETH
                            will be transfered back to your ETH account.
                        </p>
                    </Message>
                </Pgrid.Column>
                <Pgrid.Column width={10}>
                    <LoanProductList
                        products={this.props.loanProducts}
                        header="Select type of loan"
                        selectComponent={SelectLoanButton}
                        filter={item => {
                            return item.isActive;
                        }}
                    />
                </Pgrid.Column>
            </Pgrid>
        );
    }
}

const mapStateToProps = state => ({
    loanProducts: state.loanManager.products
});

export default connect(mapStateToProps)(LoanProductSelector);
