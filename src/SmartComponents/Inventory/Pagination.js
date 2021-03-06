import React, { Component, Fragment } from 'react';
import { Pagination, dropDirection } from '../../PresentationalComponents/Pagination';
import { entitiesLoading } from '../../redux/actions/inventory';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { InventoryContext } from './Inventory';
import debounce from 'lodash/debounce';

const perPageOptions = [ 10, 20, 50, 100 ];

class ContextFooterPagination extends Component {
    constructor(props) {
        super(props);
        this.state = {
            page: undefined
        };

        this.changePage = debounce((pagination) => this.updatePagination(pagination), 800);
    }

    updatePagination = (pagination) => {
        const { onRefreshData, onRefresh, dataLoading } = this.props;
        if (onRefresh) {
            dataLoading();
            onRefresh(pagination);
        } else {
            onRefreshData(pagination);
        }
    }

    onSetPage = (page, debounce) => {
        const { perPage, filters } = this.props;
        // eslint-disable-next-line camelcase
        const pagination = { page, per_page: perPage, filters };
        if (debounce) {
            this.changePage(pagination);
            this.setState({
                page
            });
        } else {
            this.updatePagination(pagination);
            this.setState({
                page: undefined
            });
        }
    }

    onPerPageSelect = (perPage) => {
        const { page, filters } = this.props;
        // eslint-disable-next-line camelcase
        this.updatePagination({ page, per_page: perPage, filters });
    }

    render() {
        const { total, page, perPage, loaded } = this.props;
        const { page: statePage } = this.state;
        return (
            <Fragment>
                { loaded && (
                    <Pagination
                        numberOfItems={ total }
                        perPageOptions={ perPageOptions }
                        page={ statePage || page }
                        itemsPerPage={ perPage }
                        direction={ dropDirection.up }
                        onSetPage={ this.onSetPage }
                        onPerPageSelect={ this.onPerPageSelect }
                    />
                ) }
            </Fragment>
        );
    }
}

const FooterPagination = ({ ...props }) => (
    <InventoryContext.Consumer>
        { ({ onRefreshData }) => (
            <ContextFooterPagination { ...props } onRefreshData={ onRefreshData } />
        ) }
    </InventoryContext.Consumer>
);

const propTypes = {
    perPage: PropTypes.number,
    total: PropTypes.number,
    loaded: PropTypes.bool,
    onRefresh: PropTypes.func
};

ContextFooterPagination.propTypes = {
    ...propTypes,
    onRefreshData: PropTypes.func
};

FooterPagination.propTypes = propTypes;

FooterPagination.defaultProps = {
    total: 0,
    loaded: false,
    onRefreshData: () => undefined
};

function stateToProps(
    { entities: { page, perPage, total, loaded, activeFilters }},
    { totalItems, page: currPage, perPage: currPerPage, hasItems }) {
    return {
        page: hasItems ? currPage : page,
        perPage: hasItems ? currPerPage : perPage,
        total: hasItems ? totalItems : total,
        loaded,
        filters: activeFilters
    };
}

function dispatchToProps(dispatch) {
    return {
        dataLoading: () => dispatch(entitiesLoading())
    };
}

export default connect(stateToProps, dispatchToProps)(FooterPagination);
