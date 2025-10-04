document.addEventListener('DOMContentLoaded', () => {
    'use strict';
    // --- DOM Elements ---
    const listSelector = document.getElementById('list-selector');
    const addListForm = document.getElementById('add-list-form');
    const newListInput = document.getElementById('new-list-input');
    const deleteListBtn = document.getElementById('delete-list-btn');
    const renameListBtn = document.getElementById('rename-list-btn');
    const langToggle = document.getElementById('lang-toggle');
    const themeToggle = document.getElementById('theme-toggle');
    const addItemForm = document.getElementById('add-item-form');
    const itemInput = document.getElementById('item-input');
    const quantityInput = document.getElementById('quantity-input');
    const priceInput = document.getElementById('price-input');
    const categoryInput = document.getElementById('category-input');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const itemList = document.getElementById('item-list');
    const clearAllBtn = document.getElementById('clear-all');
    const totalCountSpan = document.getElementById('total-count');
    const purchasedCountSpan = document.getElementById('purchased-count');
    const totalCostSpan = document.getElementById('total-cost');
    const translatableElements = document.querySelectorAll('[data-en], [data-ar]');
    const submitBtn = document.querySelector('#add-item-form button[type="submit"]');
    const undoContainer = document.getElementById('undo-container');
    const undoBtn = document.getElementById('undo-btn');
    const shareWhatsAppBtn = document.getElementById('share-whatsapp');
    const shareEmailBtn = document.getElementById('share-email');

    // --- Application State ---
    let shoppingData = {};
    let items = []; // Pointer to the active list's items
    let currentLang = localStorage.getItem('shopping-list-lang') || 'en';
    let currentSort = localStorage.getItem('shopping-list-sort') || 'manual';
    let currentTheme = localStorage.getItem('shopping-list-theme') || 'light';
    let currentlyEditingItemId = null;
    let lastDeletedItems = [];
    let undoTimeout = null;
    let draggedItemId = null;

    // --- Core Data & Rendering Functions ---

    const saveData = () => {
        localStorage.setItem('shopping-data', JSON.stringify(shoppingData));
    };

    const loadData = () => {
        const data = localStorage.getItem('shopping-data');
        if (data) {
            shoppingData = JSON.parse(data);
        } else {
            // Migration from old version
            const oldItems = localStorage.getItem('shopping-list-items');
            const defaultListName = 'Shopping List';
            shoppingData = {
                lists: {
                    [defaultListName]: oldItems ? JSON.parse(oldItems) : []
                },
                activeList: defaultListName
            };
            // Clean up old data
            localStorage.removeItem('shopping-list-items');
            saveData();
        }

        if (Object.keys(shoppingData.lists).length === 0) {
            const defaultListName = 'Shopping List';
            shoppingData.lists[defaultListName] = [];
            shoppingData.activeList = defaultListName;
        }

        if (!shoppingData.lists[shoppingData.activeList]) {
            shoppingData.activeList = Object.keys(shoppingData.lists)[0];
        }

        items = shoppingData.lists[shoppingData.activeList];
    };

    const renderListSelector = () => {
        listSelector.innerHTML = '';
        for (const listName in shoppingData.lists) {
            const option = document.createElement('option');
            option.value = listName;
            option.textContent = listName;
            if (listName === shoppingData.activeList) {
                option.selected = true;
            }
            listSelector.appendChild(option);
        }
    };

    const renderApp = () => {
        items = shoppingData.lists[shoppingData.activeList];
        renderListSelector();
        renderItems();
    };

    // --- List Management ---

    const addList = (e) => {
        e.preventDefault();
        const newListName = newListInput.value.trim();
        if (newListName && !shoppingData.lists[newListName]) {
            shoppingData.lists[newListName] = [];
            shoppingData.activeList = newListName;
            newListInput.value = '';
            saveData();
            renderApp();
        }
    };

    const deleteList = () => {
        const listNameToDelete = shoppingData.activeList;
        if (Object.keys(shoppingData.lists).length <= 1) {
            alert('You cannot delete the last list.');
            return;
        }
        if (confirm(`Are you sure you want to delete the list "${listNameToDelete}"?`)) {
            delete shoppingData.lists[listNameToDelete];
            shoppingData.activeList = Object.keys(shoppingData.lists)[0];
            saveData();
            renderApp();
        }
    };

    const renameList = () => {
        const oldListName = shoppingData.activeList;
        const newListName = prompt(`Enter a new name for "${oldListName}":`, oldListName);

        if (newListName && newListName.trim() !== '' && newListName !== oldListName) {
            if (shoppingData.lists[newListName]) {
                alert('A list with this name already exists.');
                return;
            }
            
            const newLists = {};
            for (const listName in shoppingData.lists) {
                if (listName === oldListName) {
                    newLists[newListName] = shoppingData.lists[oldListName];
                } else {
                    newLists[listName] = shoppingData.lists[listName];
                }
            }
            shoppingData.lists = newLists;
            shoppingData.activeList = newListName;
            saveData();
            renderApp();
        }
    };

    const switchList = () => {
        const selectedList = listSelector.value;
        shoppingData.activeList = selectedList;
        saveData();
        renderApp();
    };

    // --- Item & UI Functions ---

    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => { func.apply(this, args); }, delay);
        };
    };

    const getCategoryColor = (categoryName) => {
        let hash = 0;
        for (let i = 0; i < categoryName.length; i++) {
            hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash) % 360;
        const saturation = 65 + (Math.abs(hash) % 20);
        const lightness = 45 + (Math.abs(hash) % 15);
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };

    const updateLanguage = () => {
        document.documentElement.lang = currentLang;
        document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
        translatableElements.forEach(el => {
            const text = el.dataset[currentLang];
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = text;
            } else {
                el.textContent = text;
            }
        });
        localStorage.setItem('shopping-list-lang', currentLang);
    };

    const toggleLanguage = () => {
        currentLang = currentLang === 'en' ? 'ar' : 'en';
        updateLanguage();
    };

    const updateTheme = () => {
        document.body.classList.toggle('dark-mode', currentTheme === 'dark');
        themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('shopping-list-theme', currentTheme);
    };

    const toggleTheme = () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        updateTheme();
    };

    const sortItems = (itemsToSort) => {
        const sorted = [...itemsToSort];
        switch (currentSort) {
            case 'alphabetical':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'newest':
                sorted.sort((a, b) => b.timestamp - a.timestamp);
                break;
            case 'unpurchased':
                sorted.sort((a, b) => a.purchased - b.purchased);
                break;
        }
        return sorted;
    };

    const filterItems = (itemsToFilter, searchTerm) => {
        if (!searchTerm) return itemsToFilter;
        return itemsToFilter.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    };
    
    const groupItemsByCategory = (itemsToGroup) => {
        return itemsToGroup.reduce((acc, item) => {
            const category = item.category || (currentLang === 'ar' ? 'عام' : 'General');
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {});
    };

    const createCategoryHeaderElement = (category, count) => {
        const header = document.createElement('li');
        header.className = 'list-group-item category-header';
        header.innerHTML = `
            <div class="category-title">
                <span class="category-tag" style="background-color: ${getCategoryColor(category)}"></span>
                <span>${category}</span>
                <span class="category-count">(${count})</span>
            </div>
        `;
        return header;
    };

    const createItemElement = (item, searchTerm) => {
        const li = document.createElement('li');
        li.className = `list-group-item ${item.purchased ? 'purchased' : ''}`;
        li.dataset.id = item.id;
        li.draggable = true;

        const highlightedName = searchTerm ? item.name.replace(new RegExp(searchTerm, 'gi'), (match) => `<mark>${match}</mark>`) : item.name;

        li.innerHTML = `
            <div class="item-content">
                <input type="checkbox" class="form-check-input" ${item.purchased ? 'checked' : ''}>
                <span class="item-text">${highlightedName} (x${item.quantity}) - $${item.price.toFixed(2)}</span>
            </div>
            <div class="item-actions">
                <button class="btn btn-sm btn-outline-primary edit-btn">✏️</button>
                <button class="btn btn-sm btn-outline-danger delete-btn">🗑️</button>
            </div>
        `;
        return li;
    };

    const updateFooter = () => {
        const purchasedCount = items.filter(item => item.purchased).length;
        const totalCost = items.reduce((total, item) => total + (item.price * item.quantity), 0);
        totalCountSpan.textContent = items.length;
        purchasedCountSpan.textContent = purchasedCount;
        totalCostSpan.textContent = totalCost.toFixed(2);
    };

    const renderItems = () => {
        const searchTerm = searchInput.value;
        itemList.innerHTML = '';
        const filteredItems = filterItems(items, searchTerm);
        const sortedItems = sortItems(filteredItems);
        const groupedItems = groupItemsByCategory(sortedItems);
        const sortedCategories = Object.keys(groupedItems).sort();

        if (sortedItems.length === 0) {
            itemList.innerHTML = `<li class="list-group-item text-center">${currentLang === 'ar' ? 'القائمة فارغة' : 'List is empty'}</li>`;
        } else {
            sortedCategories.forEach(category => {
                const categoryItems = groupedItems[category];
                const categoryHeader = createCategoryHeaderElement(category, categoryItems.length);
                itemList.appendChild(categoryHeader);
                categoryItems.forEach(item => {
                    const itemElement = createItemElement(item, searchTerm);
                    itemList.appendChild(itemElement);
                });
            });
        }

        updateFooter();
        saveData();
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const itemName = itemInput.value.trim();
        if (!itemName) return;

        const quantity = parseInt(quantityInput.value, 10) || 1;
        const price = parseFloat(priceInput.value) || 0;
        const categoryName = categoryInput.value.trim() || (currentLang === 'ar' ? 'عام' : 'General');

        if (currentlyEditingItemId !== null) {
            const itemIndex = items.findIndex(item => item.id === currentlyEditingItemId);
            if (itemIndex > -1) {
                items[itemIndex].name = itemName;
                items[itemIndex].quantity = quantity;
                items[itemIndex].price = price;
                items[itemIndex].category = categoryName;
            }
        } else {
            items.push({
                id: Date.now(),
                name: itemName, quantity, price, category: categoryName,
                purchased: false, timestamp: Date.now()
            });
        }
        exitEditMode();
        renderItems();
    };
    
    const handleItemClick = (e) => {
        const target = e.target;
        const li = target.closest('.list-group-item');
        if (!li) return;
        const itemId = parseInt(li.dataset.id, 10);
        const itemIndex = items.findIndex(item => item.id === itemId);

        if (target.classList.contains('delete-btn')) {
            items.splice(itemIndex, 1);
            renderItems();
        } else if (target.classList.contains('edit-btn')) {
            enterEditMode(items[itemIndex]);
        } else if (target.type === 'checkbox') {
            items[itemIndex].purchased = target.checked;
            renderItems();
        }
    };

    const enterEditMode = (item) => {
        currentlyEditingItemId = item.id;
        itemInput.value = item.name;
        quantityInput.value = item.quantity;
        priceInput.value = item.price;
        categoryInput.value = item.category;
        submitBtn.textContent = currentLang === 'ar' ? 'تحديث' : 'Update';
        itemInput.focus();
    };

    const exitEditMode = () => {
        currentlyEditingItemId = null;
        addItemForm.reset();
        submitBtn.textContent = currentLang === 'ar' ? 'إضافة' : 'Add';
    };

    const clearAll = () => {
        if (items.length === 0) return;
        lastDeletedItems = [...items];
        shoppingData.lists[shoppingData.activeList] = [];
        renderApp();
        showUndoNotification();
    };

    const showUndoNotification = () => {
        undoContainer.classList.add('show');
        undoTimeout = setTimeout(() => {
            hideUndoNotification();
        }, 5000);
    };

    const hideUndoNotification = () => {
        clearTimeout(undoTimeout);
        undoContainer.classList.remove('show');
    };

    const handleUndo = () => {
        if (lastDeletedItems.length > 0) {
            shoppingData.lists[shoppingData.activeList] = lastDeletedItems;
            lastDeletedItems = [];
            renderApp();
        }
        hideUndoNotification();
    };
    
    const generateShareableText = () => {
        let text = `${shoppingData.activeList}:
`;
        items.forEach(item => {
            text += `- ${item.name} (x${item.quantity})${item.purchased ? ' (Purchased)' : ''}\n`;
        });
        return text;
    };

    // --- Event Listeners ---
    addListForm.addEventListener('submit', addList);
    listSelector.addEventListener('change', switchList);
    deleteListBtn.addEventListener('click', deleteList);
    renameListBtn.addEventListener('click', renameList);
    langToggle.addEventListener('click', toggleLanguage);
    themeToggle.addEventListener('click', toggleTheme);
    addItemForm.addEventListener('submit', handleFormSubmit);
    clearAllBtn.addEventListener('click', clearAll);
    undoBtn.addEventListener('click', handleUndo);
    searchInput.addEventListener('input', debounce(renderItems, 300));
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        localStorage.setItem('shopping-list-sort', currentSort);
        renderItems();
    });
    itemList.addEventListener('click', handleItemClick);
    
    shareWhatsAppBtn.addEventListener('click', () => {
        const text = encodeURIComponent(generateShareableText());
        window.open(`https://api.whatsapp.com/send?text=${text}`);
    });

    shareEmailBtn.addEventListener('click', () => {
        const text = generateShareableText();
        const subject = `Shopping List: ${shoppingData.activeList}`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`);
    });


    // --- Initial Application Load ---
    loadData();
    updateTheme();
    updateLanguage();
    renderApp();
});
