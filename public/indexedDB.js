let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = (e) => {
  const db = e.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = (e) => {
  db = e.target.result;

  // confirm app online

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = (e) => {
  console.log("error! ", +e.target.errorCode);
};
//create/store record
function saveRecord(record) {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  store.add(record);
}
//pending DB and set 
function checkDatabase() {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const getAll = store.getAll();

  getAll.onsuccess = () => {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: POST,
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          //open - access - clear pendingdb
          const transaction = db.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");
          store.clear();
        });
    }
  };
}

// listen for when app comes back online

window.addEventListener("online", checkDatabase);