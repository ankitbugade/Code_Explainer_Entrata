import React, { useState, useCallback } from 'react';

let pushToastRef = null;

export function toast(message, type = 'info') {
  pushToastRef?.(message, type);
}

export function ToastHost() {
  const [items, setItems] = useState([]);

  const push = useCallback((message, type) => {
    const id = Date.now() + Math.random();
    setItems((cur) => [...cur, { id, message, type }]);
    setTimeout(() => {
      setItems((cur) => cur.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  pushToastRef = push;

  return (
    <div className="toast-host">
      {items.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
