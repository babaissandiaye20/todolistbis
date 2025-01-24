import { fetchGetData,fetchPutData } from "./fetch.js";
const taskContainer = document.querySelector('.task-container');

export const loadUserTasks = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user ? user.id : null;
    
    // Update welcome message with user's name
    const welcomeHeader = document.querySelector('h1');
    if (welcomeHeader && user) {
        welcomeHeader.textContent = `Bonjour ${user.nom}`;
    }

    // Update profile image if available
    const profileImage = document.querySelector('.rounded-full img');
    if (profileImage && user && user.photo) {
        profileImage.src = user.photo;
    }

    if (!userId) {
        console.error('No user ID found');
        return;
    }

    try {
        const data = await fetchGetData('http://localhost:3000/tasks');
        
        // Filter tasks for the current user
        const userTasks = data
            .filter(task => task.userId == userId)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
        
        // Update stats
        updateTaskStats(userTasks);
        
        // Clear existing tasks
        const existingTasks = document.querySelectorAll('.task-card');
        existingTasks.forEach(task => task.remove());
        
        // Render tasks
        userTasks.forEach(task => {
            const taskCard = createTaskCard(task);
            const addButton = document.querySelector('.add-button');
            if (addButton) {
                addButton.parentNode.insertBefore(taskCard, addButton);
            } else {
                taskContainer.appendChild(taskCard);
            }
        });

        // Re-initialize drag and drop
        initializeDragAndDrop();
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
};

const createTaskCard = (task) => {
    const taskCard = document.createElement('div');
    taskCard.className = 'task-card bg-[#F5F5DC] p-6 mb-6 rounded relative';
    taskCard.dataset.taskId = task.id; 
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

const updateTaskStats = (tasks) => {
    const completedTasks = tasks.filter(task => task.completed).length;
    const inProgressTasks = tasks.filter(task => !task.completed).length;
    
    const completedSpan = document.querySelector('.stats-card:first-child span');
    const inProgressSpan = document.querySelector('.stats-card:last-child span');
    
    if (completedSpan) completedSpan.textContent = `${completedTasks} Complét`;
    if (inProgressSpan) inProgressSpan.textContent = `${inProgressTasks} en cours`;
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    });
};

export const toggleTaskCompletion = async (taskId) => {
    try {
        const response = await fetch(`http://localhost:3000/tasks/${taskId}`);
        const task = await response.json();

        const updatedTask = {
            ...task,
            completed: !task.completed
        };

        const updatedResponse = await fetchPutData(`http://localhost:3000/tasks/${taskId}`, updatedTask);
        
        if (updatedResponse) {
            loadUserTasks();
        }

        return updatedResponse;
    } catch (error) {
        console.error('Error toggling task completion:', error);
        return null;
    }
};

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
        
        updateTaskStats(userTasks);
        
        const existingTasks = document.querySelectorAll('.task-card');
        existingTasks.forEach(task => task.remove());
        
        userTasks.forEach(task => {
            const taskCard = createTaskCard(task);
            const addButton = document.querySelector('.add-button');
            if (addButton) {
                addButton.parentNode.insertBefore(taskCard, addButton);
            } else {
                taskContainer.appendChild(taskCard);
            }
        });
    } catch (error) {
        console.error('Error filtering tasks:', error);
    }
};

function toggleTask(button) {
    const taskCard = button.closest('.task-card');
    const taskId = taskCard.dataset.taskId;
    
    toggleTaskCompletion(taskId);
}

const initializeDragAndDrop = () => {
    const taskContainer = document.querySelector('.task-container');
    
    taskContainer.addEventListener('dragstart', handleDragStart);
    taskContainer.addEventListener('dragover', handleDragOver);
    taskContainer.addEventListener('drop', handleDrop);
    taskContainer.addEventListener('dragend', handleDragEnd);

    function handleDragStart(e) {
        const taskCard = e.target.closest('.task-card');
        if (!taskCard) return;

        e.dataTransfer.setData('text/plain', taskCard.dataset.taskId);
        taskCard.classList.add('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault();
        const draggingElement = document.querySelector('.dragging');
        const afterElement = getDragAfterElement(taskContainer, e.clientY);

        if (afterElement) {
            taskContainer.insertBefore(draggingElement, afterElement);
        } else {
            taskContainer.appendChild(draggingElement);
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        updateTaskOrder();
    }

    function handleDragEnd(e) {
        const taskCard = e.target.closest('.task-card');
        if (taskCard) {
            taskCard.classList.remove('dragging');
        }
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    async function updateTaskOrder() {
        try {
            const taskCards = document.querySelectorAll('.task-card');
            const updatedTasks = [];

            taskCards.forEach((card, index) => {
                updatedTasks.push({ 
                    id: card.dataset.taskId, 
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
            console.log('Ordre des tâches mis à jour');
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'ordre:', error);
        }
    }

    document.querySelectorAll('.task-card').forEach(card => {
        card.setAttribute('draggable', 'true');
    });
}

document.addEventListener('DOMContentLoaded', function() {
    loadUserTasks();
    setTimeout(initializeDragAndDrop, 100);
    
    // Filter dropdown
    const selectItems = document.querySelectorAll('.select-items div');
    selectItems.forEach(item => {
        item.addEventListener('click', () => {
            const filterValue = item.getAttribute('data-value');
            const searchInput = document.querySelector('.search-container input');
            filterAndSearchTasks(filterValue, searchInput.value);
        });
    });

    // Search input
    const searchInput = document.querySelector('.search-container input');
    searchInput.addEventListener('input', () => {
        const filterValue = document.querySelector('.select-selected').textContent.toLowerCase();
        filterAndSearchTasks(
            filterValue === 'all' ? 'all' : 
            filterValue === 'completed' ? 'completed' : 'pending', 
            searchInput.value
        );
    });
});

window.toggleTask = toggleTask;