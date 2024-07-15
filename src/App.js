

import React, { useState } from 'react';
import CustomerTable from './components/CustomerTable';
import { customers, transactions } from './data';

function App() {
  return (
    <div className="App">
      <main>
        <CustomerTable
          customers={customers}
          transactions={transactions}
        />
      </main>
    </div>
  );
}

export default App;
