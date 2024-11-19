import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaTrashAlt } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

const TodayChallenges = () => {
  const user = useSelector((state) => state.auth.user);
  const [tasks, setTasks] = useState({ todo: [], inProcess: [], done: [] });
  const [newTask, setNewTask] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [specialDay, setSpecialDay] = useState({ month: '', day: '', task: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No token found, please log in');
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://95.130.227.110:8000/api/todos/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.error('Unauthorized access, please log in again');
            navigate('/login');
            return;
          }
          throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();
        setTasks({
          todo: data.filter((task) => task.status === 'todo'),
          inProcess: data.filter((task) => task.status === 'inProcess'),
          done: data.filter((task) => task.status === 'done'),
        });
      } catch (error) {
        console.error('Error fetching tasks:', error.message);
      }
    };

    fetchTasks();
  }, [navigate]);

  const addTask = async () => {
    const token = localStorage.getItem('access_token');
    if (!newTask.trim()) return;
    
    if (!user || !user.id) {
      console.error('User ID not found. Make sure you are logged in.');
      return;
    }

    try {
      const response = await fetch('http://95.130.227.110:8000/api/todos/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: user.id,
          title: newTask,
          status: 'todo',
          due_date: null,
          created_date: new Date().toISOString(),
          is_special_day: false,
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to add task: ${response.status} - ${errorMessage}`);
      }

      const createdTask = await response.json();
      setTasks((prevTasks) => ({
        ...prevTasks,
        todo: [...prevTasks.todo, createdTask],
      }));
      setNewTask('');
    } catch (error) {
      console.error('Error adding task:', error.message);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceColumn = Array.from(tasks[source.droppableId]);
    const destColumn = Array.from(tasks[destination.droppableId]);
    const [movedTask] = sourceColumn.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceColumn.splice(destination.index, 0, movedTask);
      setTasks((prevTasks) => ({
        ...prevTasks,
        [source.droppableId]: sourceColumn,
      }));
    } else {
      destColumn.splice(destination.index, 0, movedTask);
      setTasks((prevTasks) => ({
        ...prevTasks,
        [source.droppableId]: sourceColumn,
        [destination.droppableId]: destColumn,
      }));
    }
  };

  const removeTask = async (id, column) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`http://95.130.227.110:8000/api/todos/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to delete task');
      setTasks((prevTasks) => ({
        ...prevTasks,
        [column]: prevTasks[column].filter((task) => task.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleSpecialDaySubmit = async () => {
    const token = localStorage.getItem('access_token');
    if (!specialDay.month || !specialDay.day || !specialDay.task) {
      alert('Please fill all fields!');
      return;
    }

    try {
      const response = await fetch('http://95.130.227.110:8000/api/todos/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: specialDay.task,
          status: 'todo',
          due_date: `${specialDay.month}-${specialDay.day}`,
          created_date: new Date().toISOString(),
          is_special_day: true,
        }),
      });
      if (!response.ok) throw new Error('Failed to add special day task');
      const newSpecialTask = await response.json();
      setTasks((prevTasks) => ({
        ...prevTasks,
        todo: [...prevTasks.todo, newSpecialTask],
      }));
      setShowModal(false);
      setSpecialDay({ month: '', day: '', task: '' });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-800 text-white py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl">📝 Daily Tasks</h1>
        <p className="font-semibold text-lg">{today}</p>
        <div className="flex items-center space-x-4">
          <p>{user?.username || 'User Name'}</p>
          <img
            src="https://w7.pngwing.com/pngs/831/88/png-transparent-user-profile-computer-icons-user-interface-mystique-miscellaneous-user-interface-design-smile-thumbnail.png"
            alt="User Avatar"
            className="w-8 h-8 rounded-full"
          />
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="w-1/4 bg-white p-4 border-r border-gray-300">
          <ul>
            {[{ name: "Today's challenges", path: '/today-challenges' }, { name: 'Weekly Tasks', path: '/weekly-tasks' }, { name: 'Monthly Tasks', path: '/monthly-tasks' }, { name: '+ Add Special Day', path: '/add-special-day' }].map((item) => (
              <li key={item.path} className="mb-4">
                <button
                  onClick={() => item.name === '+ Add Special Day' ? setShowModal(true) : navigate(item.path)}
                  className={`w-full text-left px-4 py-2 rounded-md font-semibold transition-colors ${location.pathname === item.path ? 'text-white bg-blue-500' : 'text-gray-700 bg-transparent hover:bg-blue-100 hover:text-blue-500'}`}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <main className="flex-1 bg-white p-8">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex justify-between gap-4">
              {['todo', 'inProcess', 'done'].map((column) => (
                <Droppable key={column} droppableId={column}>
                  {(provided) => (
                    <div
                      className="w-1/3 bg-white shadow-md border border-gray-300 rounded-lg p-4"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      <h2 className="text-xl font-semibold capitalize mb-4 text-blue-700">
                        {column === 'todo' ? 'To Do' : column === 'inProcess' ? 'In Process' : 'Done'}
                      </h2>
                      {column === 'todo' && (
                        <div className="mb-4">
                          <input
                            type="text"
                            placeholder="New task"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addTask()}
                            className="w-full p-2 border border-gray-300 rounded mb-2"
                          />
                          <button onClick={addTask} className="bg-blue-600 text-white px-4 py-2 rounded w-full">
                            Add Task
                          </button>
                        </div>
                      )}
                      {tasks[column].map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-gray-100 border border-gray-300 rounded-md p-4 mb-2 flex justify-between items-center"
                            >
                              <span>{task.title}</span>
                              <button onClick={() => removeTask(task.id, column)} className="text-red-600">
                                <FaTrashAlt />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </main>
      </div>
    </div>
  );
};

export default TodayChallenges;
