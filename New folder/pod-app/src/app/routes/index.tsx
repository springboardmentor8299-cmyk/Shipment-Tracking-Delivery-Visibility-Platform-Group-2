import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import DeliveryProof from '../screens/DeliveryProof';

const Routes = () => {
    return (
        <Router>
            <Switch>
                <Route path="/delivery-proof" component={DeliveryProof} />
                {/* Add more routes here as needed */}
            </Switch>
        </Router>
    );
};

export default Routes;