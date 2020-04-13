import React, { useState, useContext, createContext, Component } from '../../src/react';
import { render } from '../../src/renderer';
import document from '../../src/document';

const context = createContext();
const { Consumer, Provider } = context;

class App extends Component {
  state = {
    nickname: 'aniwei'
  }

  onChangeNickname = () => {
    const { nickname } = this.state;
    debugger;
    this.setState({
      nickname: nickname === 'aniwei' ? 'nayuki' : 'aniwei'
    })
    
  }

  render () {
    const { nickname } = this.state;
    return (
      <Provider value={{ nickname }}>
        <Nickname onChangeNickname={this.onChangeNickname} />
      </Provider>
    );
  }
}

const Nickname = ({ onChangeNickname }) => {
  return (
    <Consumer>
      {
        ({ nickname }) => {
          return <div style={{ border: '1px solid red'}} onClick={onChangeNickname}>{nickname}</div>
        }
      }
    </Consumer>
  )
}

// const App = () => {
//   const [nickname, setNickname] = useState('aniwei');

//   const onChangeNickname = () => {
//     setNickname(nickname === 'aniwei' ? 'nayuki' : 'aniwei');
//   }

//   return (
//     <Provider value={{ nickname }}>
//       <Nickname onChangeNickname={onChangeNickname} />
//     </Provider>
//   )
// }

render(
  <App />,
  document.getElementById('app')
);