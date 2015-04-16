// module.exports = function(dispatcher, fn){
// 	return {
// 		getInitialState: function(){
// 			return fn();
// 		},
// 		$state: function(){
// 			this.setState(fn());
// 		},
// 		componentDidMount: function() {
// 			dispatcher.on('change', this.$state);
// 		},
// 		componentWillUnmount: function() {
// 			dispatcher.off('change', this.$state);	
// 		}
// 	}
// }


export default {
  getInitialState() {
    const data = {};

    this.subscribe(this.props, this.context, (key, value) => {
      data[key] = value;
    });
    this.unsubscribe();

    return { data };
  },

  componentWillMount() {
    this.subscribe(this.props, this.context, this.setData);
  },

  componentWillReceiveProps(props, context) {
    this.subscribe(props, context, this.setData);
  },

  componentWillUnmount() {
    this.unsubscribe();
  },

  setData(key, value) {
    this.setState({
      data: {...this.state.data, [key]: value }
    });
  },

  subscribe(props, context, onNext) {
    const newObservables = this.observe(props, context);
    const newSubscriptions = {};

    for (let key in newObservables) {
      newSubscriptions[key] = newObservables[key].subscribe({
        onNext: (value) => onNext(key, value),
        onError: () => {},
        onCompleted: () => {}
      });
    }

    this.unsubscribe();
    this.subscriptions = newSubscriptions;
  },

  unsubscribe() {
    for (let key in this.subscriptions) {
      if (this.subscriptions.hasOwnProperty(key)) {
        this.subscriptions[key].dispose();
      }
    }

    this.subscriptions = {};
  }
}