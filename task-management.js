import { fetchGetData, fetchPutData, fetchPostData, fetchDeleteData } from "./fetch.js";

const taskContainer = document.querySelector('.task-container');

// Load and initialize user tasks
export const loadUserTasks = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user ? user.id : null;
    
    // Update welcome and profile sections
    updateUserInterface(user);

    if (!userId) {
        console.error('No user ID found');
        return;
    }

    try {
        const data = await fetchGetData('http://localhost:3000/tasks');
        
        const userTasks = data
            .filter(task => task.userId == userId)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
        
        renderTasks(userTasks);
        updateTaskStats(userTasks);
        initializeDragAndDrop();
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
};

// Update user interface elements
const updateUserInterface = (user) => {
    if (!user) return;

    const welcomeHeader = document.querySelector('h1');
    if (welcomeHeader) {
        welcomeHeader.textContent = `Bonjour ${user.nom}`;
    }

    const profileImage = document.querySelector('.rounded-full img');
    if (profileImage && user.photo) {
        profileImage.src = user.photo;
    }
};

// Render tasks to the UI
const renderTasks = (tasks) => {
    // Clear existing tasks
    const existingTasks = document.querySelectorAll('.task-card');
    existingTasks.forEach(task => task.remove());
    
    // Render new tasks
    tasks.forEach(task => {
        const taskCard = createTaskCard(task);
        const addButton = document.querySelector('.add-button');
        if (addButton) {
            addButton.parentNode.insertBefore(taskCard, addButton);
        } else {
            taskContainer.appendChild(taskCard);
        }
    });
};

// Create task card HTML
const createTaskCard = (task) => {
    const taskCard = document.createElement('div');
    taskCard.className = 'task-card bg-[#F5F5DC] p-6 mb-6 rounded relative';
    taskCard.dataset.taskId = task.id; 
    taskCard.setAttribute('draggable', 'true');
    taskCard.innerHTML = `
        <div class="flex items-start gap-4">
            <button onclick="toggleTask(this)" class="w-12 h-12 bg-[#D3D3D3] mt-2 flex items-center justify-center rounded transition-colors hover:bg-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    ${task.completed ? '<polyline points="9 11 12 14 22 4"></polyline>' : ''}
                </svg>
            </button>
            <div class="flex-1">
                <div class="flex justify-between items-start">
                    <h3 class="text-xl font-normal task-title ${task.completed ? 'line-through' : ''}">${task.titre}</h3>
                    <div class="flex items-center gap-4">
                        <div class="text-xl">Date : <span class="text-base">${formatDate(task.date)}</span></div>
                        <button class="icon-button w-[75px] h-[30px] bg-black flex items-center justify-center rounded hover:bg-gray-800 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <p class="mt-2 whitespace-pre-line">${task.description}</p>
            </div>
        </div>
        <button class="icon-button absolute bottom-4 right-6 w-[54px] h-[25px] bg-black flex items-center justify-center rounded hover:bg-gray-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
        </button>
    `;
    return taskCard;
};

// Update task statistics
const updateTaskStats = (tasks) => {
    const completedTasks = tasks.filter(task => task.completed).length;
    const inProgressTasks = tasks.filter(task => !task.completed).length;
    
    const completedSpan = document.querySelector('.stats-card:first-child span');
    const inProgressSpan = document.querySelector('.stats-card:last-child span');
    
    if (completedSpan) completedSpan.textContent = `${completedTasks} Complét`;
    if (inProgressSpan) inProgressSpan.textContent = `${inProgressTasks} en cours`;
};

// Format date for display
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    });
};

// Toggle task completion
export const toggleTaskCompletion = async (taskId) => {
    try {
        const response = await fetch(`http://localhost:3000/tasks/${taskId}`);
        const task = await response.json();

        const updatedTask = {
            ...task,
            completed: !task.completed
        };

        await fetchPutData(`http://localhost:3000/tasks/${taskId}`, updatedTask);
        await loadUserTasks();
    } catch (error) {
        console.error('Error toggling task completion:', error);
    }
};

// Filter and search tasks
export const filterAndSearchTasks = async (filterValue, searchQuery) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user ? user.id : null;

    try {
        const data = await fetchGetData('http://localhost:3000/tasks');
        
        let userTasks = data.filter(task => task.userId == userId);
        
        if (filterValue && filterValue !== 'all') {
            userTasks = userTasks.filter(task => 
                filterValue === 'completed' ? task.completed : !task.completed
            );
        }
        
        if (searchQuery) {
            const lowercaseQuery = searchQuery.toLowerCase();
            userTasks = userTasks.filter(task => 
                task.titre.toLowerCase().includes(lowercaseQuery) || 
                task.description.toLowerCase().includes(lowercaseQuery)
            );
        }
        
        userTasks.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        renderTasks(userTasks);
        updateTaskStats(userTasks);
        initializeDragAndDrop();
    } catch (error) {
        console.error('Error filtering tasks:', error);
    }
};

// Drag and Drop initialization
const initializeDragAndDrop = () => {
    const taskCards = document.querySelectorAll('.task-card');
    taskCards.forEach(card => {
        card.removeEventListener('dragstart', handleDragStart);
        card.removeEventListener('dragend', handleDragEnd);
        
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });

    taskContainer.removeEventListener('dragover', handleDragOver);
    taskContainer.removeEventListener('drop', handleDrop);
    
    taskContainer.addEventListener('dragover', handleDragOver);
    taskContainer.addEventListener('drop', handleDrop);
};

// Drag start handler
function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', this.dataset.taskId);
    this.classList.add('dragging');
}

// Drag end handler
function handleDragEnd() {
    this.classList.remove('dragging');
    updateTaskOrder();
}

// Drag over handler
function handleDragOver(e) {
    e.preventDefault();
    const draggingElement = document.querySelector('.dragging');
    const afterElement = getDragAfterElement(e.clientY);

    if (afterElement) {
        taskContainer.insertBefore(draggingElement, afterElement);
    } else {
        taskContainer.appendChild(draggingElement);
    }
}

// Get element to insert after during drag
function getDragAfterElement(y) {
    const draggableElements = [...taskContainer.querySelectorAll('.task-card:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > (closest.offset || Number.NEGATIVE_INFINITY)) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, {}).element;
}

// Update task order after drag and drop
async function updateTaskOrder() {
    try {
        const taskCards = document.querySelectorAll('.task-card');
        const updatedTasks = [];

        taskCards.forEach((card, index) => {
            const taskId = card.dataset.taskId;
            updatedTasks.push({ 
                id: taskId, 
                order: index
            });
        });

        const currentTasks = await fetchGetData('http://localhost:3000/tasks');

        const updatePromises = updatedTasks.map(async (updatedTask) => {
            const fullTaskDetails = currentTasks.find(task => task.id == updatedTask.id);
            if (fullTaskDetails) {
                const taskToUpdate = {
                    ...fullTaskDetails,
                    order: updatedTask.order
                };
                return fetchPutData(`http://localhost:3000/tasks/${updatedTask.id}`, taskToUpdate);
            }
        });

        await Promise.all(updatePromises);
        console.log('Task order updated');
    } catch (error) {
        console.error('Error updating task order:', error);
    }
}

// Add task functionality
export const addTask = async () => {
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const dueDate = document.getElementById('dueDate').value;

    if (!title) {
        alert('Le titre est obligatoire');
        return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        console.error('Utilisateur non connecté');
        return;
    }

    // Check for existing tasks with the same title and description
    const tasks = await fetchGetData('http://localhost:3000/tasks');
    const existingTask = tasks.find(task => 
        task.userId == user.id && 
        task.titre === title && 
        task.description === description
    );

    if (existingTask) {
        alert('Cette tâche existe déjà');
        return;
    }

    // Get the maximum current order for this user's tasks
    const userTasks = tasks.filter(task => task.userId == user.id);
    const maxOrder = userTasks.length > 0 
        ? Math.max(...userTasks.map(task => task.order || 0)) 
        : 0;

    const newTask = {
        userId: user.id,
        titre: title,
        description: description,
        date: dueDate,
        completed: false,
        libelle: 'Non classé',
        order: maxOrder + 1  // Increment order instead of always using 0
    };

    try {
        await fetchPostData('http://localhost:3000/tasks', newTask);
        closeModal();
        await loadUserTasks();
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la tâche:', error);
        alert('Impossible d\'ajouter la tâche. Réessayez.');
    }
};
// Close modal and reset input fields
function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('dueDate').value = '';
}

// Global function handlers
window.toggleTask = (button) => {
    const taskCard = button.closest('.task-card');
    const taskId = taskCard.dataset.taskId;
    toggleTaskCompletion(taskId);
};

window.addTask = addTask;
window.closeModal = closeModal;

// Event listeners setup
function setupEventListeners() {
    const searchInput = document.querySelector('.search-container input');
    const selectItems = document.querySelectorAll('.select-items div');

    // Search input listener
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const filterValue = document.querySelector('.select-selected').textContent.toLowerCase();
            filterAndSearchTasks(
                filterValue === 'all' ? 'all' : 
                filterValue === 'completed' ? 'completed' : 'pending', 
                searchInput.value
            );
        });
    }

    // Filter dropdown listeners
    selectItems.forEach(item => {
        item.addEventListener('click', () => {
            const filterValue = item.getAttribute('data-value');
            const searchInput = document.querySelector('.search-container input');
            filterAndSearchTasks(filterValue, searchInput.value);
        });
    });
}

// Add this function to your existing code
// Add event listener for drop
function handleDarop(e) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const draggedElement = document.querySelector(`.task-card[data-task-id="${taskId}"]`);

    if (draggedElement) {
        updateTaskOrder();
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    loadUserTasks();
    setupEventListeners();
});

export default {
    loadUserTasks,
    toggleTaskCompletion,
    filterAndSearchTasks,
    addTask
};