let db;
let budgetVersion;

const request = indexedDB.open('BudgetDB', 1)

request.onupgradeneeded = function (e) {
    console.log('upgrade needed in IndexDB')

    db = e.target.result;
    db.createObjectStore('budgetStore', {
        autoIncrement: true,
        keyPath: 'listID'
    });
};

request.onsuccess = function (e) {
    db = e.target.result;

    if (navigator.onLine) {
        checkDatabase()
    }
};

request.onerror = function (e) {
    console.log(`${e.target.errorCode}`)
};

function saveRecord(record) {
    const transaction = db.transaction(['budgetStore'], 'readwrite');
    const budgetStore = transaction.objectStore('budgetStore')

    budgetStore.add(record)
}

function checkDatabase() {

    const transaction = db.transaction(['budgetStore'], 'readwrite');
    const budgetStore = transaction.objectStore('budgetStore')
    const getAll = budgetStore.getAll()

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*', 'Content-Type': 'application/json',
                }
            })
            .then((response) => response.json())
            .then((res) => {
                if(res) {
                    const transaction = db.transaction(['budgetStore'], 'readwrite');
                    const budgetStore = transaction.objectStore('budgetStore');
                    budgetStore.clear()
                }
            })
        }
    }
};

window.addEventListener('online', checkDatabase)