var React = require('react');
var debug = require('debug')('example:views')

var ImmutableRenderMixin = require('react-immutable-render-mixin')

var {$$} = require('./actions');

function vis(bool){
  return bool ? {} : {display: 'none'};
}

var Search = React.createClass({
  mixins: [ImmutableRenderMixin],
  onChange(e){
    $$.search(e.target.value);
  },
  render() {
    var props = this.props,
      {list, details} = props,
      selected = list.get('selected');

    return (
      <div className="Search">
        <input value={list.get('query')} onChange={this.onChange}/>
        <Results {...props} style={vis(!selected)}/>
        <Details key={details.get('id')} {...props} style={vis(!!selected)}/>        
      </div>
    );
  }
});

module.exports.Search = Search;

var Results = React.createClass({
  mixins: [ImmutableRenderMixin],
  render: function() {
    return (
      <div className="Results" style={this.props.style}>
        {this.props.list.get('results').map((item, i) => <Result product={item} key={item.get('styleid')}/>)}
      </div>
    );
  }
});

var Result = React.createClass({
  mixins: [ImmutableRenderMixin],
  onClick: function(e){
    $$.select(this.props.product.get('styleid'));
  },
  render: function() {
    return (
      <div className="Result" onClick={this.onClick}>
        <span>{this.props.product.get('product')}</span>
        <img key={Date.now()} src={this.props.product.get('search_image')} style={{maxWidth:200}}/>      
      </div>
    );
  }
});

var Details = React.createClass({
  mixins: [ImmutableRenderMixin],
  onBack: function(){
    $$.backToList();
  },
  render: function() {
    
    return (
      <div className='Details-cnt' style={this.props.style}>
        <span style={{cursor:'pointer'}} onClick={this.onBack}>back to list page</span> 
        {this.props.details.get('loading') ? 
          <span>loading...</span> : 
          <div className="Details">
            <img src={this.props.details.getIn(['details', 'styleImages', 'default', 'imageURL'])} style={{maxWidth:200}}/>
            <span>{this.props.details.getIn(['details', 'productDisplayName'])}</span>
          </div>}
      </div>
      
    );
  }
});

