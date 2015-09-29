import test from 'tape'
import providesValidation from '../src/index';
import 'babel/polyfill';
import Joi from 'joi';

test('providesValidation', (t) => {
  var make = (rules, opts={}) => {
    opts.validate = Joi.validate;
    var C = providesValidation(opts, rules)(class Component {});
    var inst = new C;
    inst.setState = (change) => {
      if (typeof change === 'object') {
        Object.assign(inst.state, change);
      }
      else if (typeof change === 'function') {
        const res = change.call(inst, inst.state);
        inst.setState(res);
      }
    };
    return inst;
  }

  t.test('puts data in state', (t) => {
    var inst = make({a: null});
    t.equal(inst.state.data.a, '');
    t.equal(inst.state.lastModified.a, null);
    t.end();
  });

  t.test('handles changes', (t) => {
    var inst = make({a: null});
    inst.handleChange('a', 'foo');
    t.equal(inst.state.data.a, 'foo');
    t.notEqual(inst.state.lastModified.a, null);
    t.ok(inst.state.lastModified.a > 1443423600000, 'should be a recent date');
    t.end();
  });

  t.test('provides correct validation', (t) => {
    var inst = make({
      a: {
        type: Joi.string().min(3),
      },
    });

    inst.handleChange('a', '0');
    var v = inst.getValidation().a;
    t.ok(v.error, 'has error');
    t.equal(v.pristine, false);
    t.equal(v.data, '0');

    inst.handleChange('a', '55555');
    var v = inst.getValidation().a;
    t.notOk(v.error, 'has no error');
    t.equal(v.pristine, false);
    t.equal(v.data, '55555');

    t.end();
  });
});

