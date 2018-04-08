import React, { Component } from 'react';
import PropTypes from 'prop-types';
import WebPullToRefresh from '../pull-to-refresh/wptr.1.1';
import classnames from 'classnames';

export default class ReactPullToRefresh extends Component {

  constructor(props) {
    super(props);
    this.state = {
      initialized: false,
      disabled: false,
    };
    this.handleRefresh = this.handleRefresh.bind(this);
    this.touchActionHandler = this.touchActionHandler.bind(this);
  }

  handleRefresh() {
    return new Promise((resolve, reject) => {
      this.props.onRefresh(resolve, reject);
    });
  }

  componentWillUnmount() {
    const container = this.refs.refresh;
    container.removeEventListener('scroll', this.touchActionHandler);
  }

  touchActionHandler() {
    const container = this.refs.refresh;
    const scrollTop = container.scrollTop;
    const hammer = this.hammer;
    if (scrollTop <= 1) {
      this.setState({touchAction: 'pan-down', disabled: false});
    } else {
      this.setState({touchAction: 'unset', disabled: true});
    }
  }

  init() {
    if (!this.state.initialized) {
      WebPullToRefresh().init({
        contentEl: this.refs.refresh,
        ptrEl: this.refs.ptr,
        bodyEl: this.refs.body,
        distanceToRefresh: this.props.distanceToRefresh || undefined,
        loadingFunction: this.handleRefresh,
        resistance: this.props.resistance || undefined,
        hammerOptions: this.props.hammerOptions || undefined
      });
      this.setState({
        initialized: true
      });
    }
  }

  componentDidMount() {
    if (!this.props.disabled && !this.state.disabled) {
      this.init();
    }
    const disposer = setInterval(() => {
      const container = this.refs.refresh;
      if (document.body.contains(container)) {
        this.touchActionHandler();
        container.addEventListener('scroll', this.touchActionHandler);
        clearInterval(disposer);
      }
    }, 50);
  }

  componentDidUpdate() {
    if (!this.props.disabled) {
      this.init();
    }
  }

  render() {
    const {
      children,
      disabled,
      distanceToRefresh,
      hammerOptions,
      icon,
      loading,
      onRefresh,
      resistance,
      ...rest
    } = this.props;

    if (disabled) {
      return (
        <div {...rest}>
          {children}
        </div>
      );
    }

    return (
      <div ref="body" {...rest}>
        <div ref="ptr" className={classnames('ptr-element', {'disabled': this.state.disabled})}>
          {icon || <span className="genericon genericon-next"></span>}
          {loading ||
            <div className="loading">
              <span className="loading-ptr-1"></span>
              <span className="loading-ptr-2"></span>
              <span className="loading-ptr-3"></span>
           </div>}
        </div>
        <div ref="refresh" className={classnames('refresh-view', {
          'disabled': this.state.disabled,
        })} style={{
          touchAction: this.state.touchAction,
          }}>
          {children}
        </div>
      </div>
    );
  }
}

ReactPullToRefresh.propTypes = {
  onRefresh: PropTypes.func.isRequired,
  icon: PropTypes.element,
  loading: PropTypes.element,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  distanceToRefresh: PropTypes.number,
  resistance: PropTypes.number,
  hammerOptions: PropTypes.object
};
