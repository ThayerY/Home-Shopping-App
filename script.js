// Initialize budgets and history
const monthlyBudget = 150000;
const dailyLimit = 5000;

let currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
let dailySpent = 0;

const form = document.getElementById('shopping-form');
const historyTable = document.getElementById('history-table');
const monthlyBudgetEl = document.getElementById('monthly-budget');
const dailyLimitEl = document.getElementById('daily-limit');

// Load history from localStorage
let shoppingHistory = JSON.parse(localStorage.getItem('shoppingHistory')) || [];

// Helper function to get the day of the week
function getDayName(dateString) {
  const date = new Date(dateString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

// Helper function to format time as HH:mm
function formatTime(date) {
  return date.toTimeString().split(' ')[0].slice(0, 5); // Extract HH:mm
}

// Update budget and history display
function updateDisplay() {
  const spentToday = shoppingHistory
    .filter(item => item.date === currentDate)
    .reduce((total, item) => total + item.price, 0);
  dailySpent = spentToday;

  const remainingBudget = monthlyBudget - shoppingHistory.reduce((total, item) => total + item.price, 0);

  monthlyBudgetEl.textContent = `$${remainingBudget}`;
  dailyLimitEl.textContent = `$${dailyLimit - dailySpent}`;

  renderHistory();
}

// Render shopping history
function renderHistory() {
  const tbody = historyTable.querySelector('tbody');
  tbody.innerHTML = '';

  shoppingHistory.forEach((item, index) => {
    const row = document.createElement('tr');

    row.innerHTML = `
            <td>${item.name}</td>
            <td>$${item.price}</td>
            <td>${item.date}</td>
            <td>${item.time}</td>
            <td>${getDayName(item.date)}</td>
            <td>
                <button class="edit-btn" data-index="${index}">Edit</button>
                <button class="delete-btn" data-index="${index}">Delete</button>
            </td>
        `;

    tbody.appendChild(row);
  });

  // Attach event listeners to Edit and Delete buttons
  document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', handleEditDateTime);
  });
  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', handleDeleteItem);
  });
}

// Handle deleting an item
function handleDeleteItem(e) {
  const index = e.target.dataset.index;

  // Confirm deletion
  const confirmDelete = confirm("Are you sure you want to delete this item?");
  if (confirmDelete) {
    shoppingHistory.splice(index, 1); // Remove item from the history
    localStorage.setItem('shoppingHistory', JSON.stringify(shoppingHistory));
    updateDisplay(); // Refresh the UI
  }
}

// Handle editing the date and time
function handleEditDateTime(e) {
  const index = e.target.dataset.index;
  const item = shoppingHistory[index];
  const row = e.target.parentElement.parentElement;

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.value = item.date;
  dateInput.className = 'edit-date-input';

  const timeInput = document.createElement('input');
  timeInput.type = 'time';
  timeInput.value = item.time;
  timeInput.className = 'edit-time-input';

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.className = 'save-btn';

  const dateCell = row.children[2];
  const timeCell = row.children[3];
  dateCell.innerHTML = '';
  timeCell.innerHTML = '';
  dateCell.appendChild(dateInput);
  timeCell.appendChild(timeInput);
  e.target.replaceWith(saveBtn);

  saveBtn.addEventListener('click', () => {
    const newDate = dateInput.value;
    const newTime = timeInput.value;

    if (newDate && newTime) {
      item.date = newDate;
      item.time = newTime;
      shoppingHistory[index] = item;
      localStorage.setItem('shoppingHistory', JSON.stringify(shoppingHistory));

      dateCell.textContent = newDate;
      timeCell.textContent = newTime;
      saveBtn.replaceWith(e.target);
      e.target.addEventListener('click', handleEditDateTime);

      updateDisplay();
    }
  });
}

// Add new item to history
form.addEventListener('submit', e => {
  e.preventDefault();
  const itemName = document.getElementById('item-name').value;
  const itemPrice = parseFloat(document.getElementById('item-price').value);

  const now = new Date();
  const time = formatTime(now);

  if (dailySpent + itemPrice > dailyLimit) {
    const addToNextDay = confirm(
      "Daily limit exceeded! Would you like to add this item to the next day's budget?"
    );
    if (addToNextDay) {
      const nextDate = new Date(now);
      nextDate.setDate(now.getDate() + 1);
      const nextDay = nextDate.toISOString().split('T')[0];

      shoppingHistory.push({
        name: itemName,
        price: itemPrice,
        date: nextDay,
        time,
      });
      localStorage.setItem('shoppingHistory', JSON.stringify(shoppingHistory));
      alert(`Item added to the next day's budget (Date: ${nextDay}, Day: ${getDayName(nextDay)})`);
      form.reset();
      return;
    } else {
      return;
    }
  }

  const newItem = {
    name: itemName,
    price: itemPrice,
    date: currentDate,
    time,
  };

  shoppingHistory.push(newItem);
  localStorage.setItem('shoppingHistory', JSON.stringify(shoppingHistory));

  form.reset();
  updateDisplay();
});

// Automatically handle date change
function handleDateChange() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  if (currentDate !== today) {
    currentDate = today;
    dailySpent = 0; // Reset daily spent
    updateDisplay();
  }
}

setInterval(handleDateChange, 60000);

updateDisplay(); // Initial load



