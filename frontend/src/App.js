import React from 'react';
import UserManager from './components/UserManager';
import StockManager from './components/StockManager';
import ItemManager from './components/ItemManager';
import ReminderManager from './components/ReminderManager';

const App = () => {
  return (
    <div className="App">
      <UserManager />
      <StockManager />
      <ReminderManager />
      <ItemManager />
    </div>
  );
};

export default App;
