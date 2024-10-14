import React from 'react';
import Dashboard from './components/Dashboard';
import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css'; // Make sure you have Ant Design styles

function App() {
  return (

    <div className="App">
        <Dashboard />
    </div>

  );
}

export default App;
