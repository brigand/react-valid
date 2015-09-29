Simple joi validation high order component for validing forms.

## Install

```js
npm install --save react-valid
```

## Example

```js
import Joi from 'joi';

import providesValidation from 'react-valid';

@providesValidation({validate: Joi.validate}, {
  name: {type: Joi.string().min(3).max(28)},
})
class MyForm extends React.Component {
  static propTypes = {
    data: providesValidation.propTypes.data,
    val: providesValidation.propTypes.validation,
    onChange: providesValidation.propTypes.onChange,
  };
  render(){
    // name is an object with properties {}
    var {name} = this.props.val;
    <div>
      <Input value={name.data} onChange={(v) => this.props.onChange('name', v)} />
      {name.error && <Error error={error} />}
    </div>  
  }
}

```

