import Joi from 'joi';
import React from 'react';
import update from 'react-addons-update';
import propMatch from 'react-propmatch';

var {propTypes, makeFactory} = propMatch({
  data: null,
  onChange: null,
  validation: null,
});

export default function providesValidation(rules, options={}, Component=null){
  if (typeof Component !== 'function') return providesValidation.bind(null, rules, options);

  const makeProps = makeFactory(Component);

  return class ValidationProvider extends React.Component {
    constructor(){
      super();
      this.handleChange = this.handleChange.bind(this);
      this.state = {
        data: {},
        lastModified: {},
        now: Date.now(),
      };
      Object.keys(rules).forEach((key) => {
        this.state.data[key] = '';
        this.state.lastModified[key] = null;
      });
    }
    // updateState('a', ['b', 'c'], 'd') =>
    // this.setState({a: update(state, {b: {c: {$set: 'd'}}})})
    updateState(stateKey, keys, value){
      var change = {};
      var current = change;

      keys.forEach((key) => {
        const next = {};
        current[key] = next;
        current = next;
      });

      if (typeof value === 'function') {
        current.$apply = value;
      }
      else {
        current.$set = value;
      }

      // using the setState callback in case multiple updates happen
      this.setState((state) => ({
        [stateKey]: update(state[stateKey], change)
      }));
    }

    // when a value changes we have to update a few things
    handleChange(key, value){
      this.updateState('lastModified', [key], Date.now());
      this.updateState('data', [key], value);
      this.setState({now: Date.now()});
    }

    getValidation(){
      var res = {};
      Object.keys(rules).forEach((key) => {
        var rule = rules[key];

        // mostly to make testing easier
        if (!rule || !rule.type) {
          return;
        }

        var {error} = Joi.validate(this.state.data[key], rule.type);

        // hide error if debounce error
        if (rule.debounceError) {
          const lastModified = this.state.lastModified[key];
          if (lastModified + rule.debounceError > this.state.now) {
            error = null;
          }
        }

        var validation = {
          error: error || null,
          data: this.state.data[key],
          pristine: this.state.lastModified[key] == null,
        };

        res[key] = validation;
      });
      return res;
    }

    render(){
      return (
        <Component {...this.props} {...makeProps({
          data: this.state.data,
          onChange: this.handleChange,
          validation: this.getValidation(),
        })} />
      );
    }
  };
}

providesValidation.propTypes = propTypes;

