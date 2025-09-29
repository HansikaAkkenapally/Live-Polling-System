import React from 'react';

const KickedOutScreen = () => {
  return (
    <div className="container">
      <div className="brand-tag">Intervue.io</div>
      
      <div className="kicked-container">
        <h1 className="kicked-title">You've been Kicked out!</h1>
        
        <p className="kicked-message">
          Looks like the teacher has removed you from the poll system. Please Try again sometime.
        </p>
      </div>
    </div>
  );
};

export default KickedOutScreen;
