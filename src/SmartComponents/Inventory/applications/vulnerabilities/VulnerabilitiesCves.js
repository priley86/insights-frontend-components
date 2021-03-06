import React, { Component } from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import some from 'lodash/some';
import propTypes from 'prop-types';
import { connect } from 'react-redux';
import VulnerabilitiesCveTable from './VulnerabilitiesCveTable';
import VulnerabilitiesCveTableToolbar from './VulnerabilitiesCveTableToolbar';
import { downloadFile } from '../../../../Utilities/helpers';
import StatusDropdown from './StatusDropdown';

class VulnerabilitiesCves extends Component {
    componentDidMount() {
        const { defaultSort: sort } = this.props;
        StatusDropdown.setCallback(this.sendRequest);
        this.apply(sort && { sort });
    }

    apply = (config = {}) => {
        const toBeReset = [ 'filter', 'page_size', 'show_all' ];
        if (some(toBeReset, item => config.hasOwnProperty(item) && config[item] !== this.state[item])) {
            config.page = 1;
        }

        this.setState({ ...this.state, ...config }, this.sendRequest);
    };

    selectorHandler = selectedCves => {
        this.setState({ ...this.state, selectedCves });
    };

    sendRequest = () => {
        const { fetchData } = this.props;
        fetchData && fetchData(() => this.props.fetchResource(this.state));
    };

    downloadReport = format => {
        const { fetchResource } = this.props;
        const { payload } =
            fetchResource &&
            // eslint-disable-next-line camelcase
            fetchResource({ ...this.state, page_size: Number.MAX_SAFE_INTEGER, data_format: format, page: 1 });
        payload &&
            payload.then(({ data: response }) => {
                const data = format === 'json' ? JSON.stringify(response) : response;
                return downloadFile(data, `vulnerability_cves-${new Date().toISOString()}`, format);
            });
    };

    render() {
        const { cveList, header, showAllCheckbox, dataMapper, showRemediationButton } = this.props;
        const cves = dataMapper(cveList);
        return (
            <Stack>
                <StackItem>
                    <VulnerabilitiesCveTableToolbar
                        apply={ this.apply }
                        totalNumber={ cves.meta.total_items }
                        showAllCheckbox={ showAllCheckbox }
                        showRemediationButton={ showRemediationButton }
                        downloadReport={ this.downloadReport }
                        cves={ cves }
                        selectedCves={ this.state && this.state.selectedCves }
                        entity={ this.props.entity }
                    />
                </StackItem>
                <StackItem>
                    <VulnerabilitiesCveTable
                        header={ header }
                        cves={ cves }
                        selectorHandler={ this.selectorHandler }
                        isSelectable={ this.props.isSelectable }
                        apply={ this.apply }
                    />
                </StackItem>
            </Stack>
        );
    }
}

function mapStateToProps({ VulnerabilitiesStore }) {
    return {
        cveList: VulnerabilitiesStore && VulnerabilitiesStore.cveList
    };
}

const mapDispatchToProps = dispatch => {
    return {
        fetchData: action => dispatch(action())
    };
};

VulnerabilitiesCves.propTypes = {
    cveList: propTypes.any,
    fetchData: propTypes.func,
    fetchResource: propTypes.func,
    header: propTypes.array,
    showAllCheckbox: propTypes.bool,
    showRemediationButton: propTypes.bool,
    dataMapper: propTypes.func,
    defaultSort: propTypes.any,
    entity: propTypes.any,
    isSelectable: propTypes.bool
};

VulnerabilitiesCves.defaultProps = {
    dataMapper: () => undefined,
    isSelectable: false,
    cveList: {
        isLoading: true
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(VulnerabilitiesCves);
