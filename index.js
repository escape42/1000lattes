import React from 'react';
import ReactDOM from 'react-dom';
import '@trulia/txl/build/css/screen.css';

import Lattes from './src/lattes';
import './sass/lattes.scss';

ReactDOM.render(
  <Lattes />,
  document.querySelector('#thousandLattes')
);
