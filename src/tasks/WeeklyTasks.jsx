import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaTrashAlt, FaEdit, FaSave, FaArrowLeft, FaArrowRight, FaCalendarAlt, FaTimes } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const WeeklyTasks = () => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();

  const [weekDays, setWeekDays] = useState([]);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [tasks, setTasks] = useState({ todo: [], inProcess: [], done: [] });
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [selectedDay, setSelectedDay] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [showModal, setShowModal] = useState(false);
  const [specialDay, setSpecialDay] = useState({ month: '', day: '', task: '' });
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const todayDate = new Date();
    const days = Array.from({ length: 7 }, (_, i) => addDays(todayDate, i));
    setWeekDays(days);
  }, []);

  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem(`weeklyTasks_${selectedDay}`)) || {
      todo: [],
      inProcess: [],
      done: [],
    };
    setTasks(savedTasks);
  }, [selectedDay]);

  useEffect(() => {
    localStorage.setItem(`weeklyTasks_${selectedDay}`, JSON.stringify(tasks));
  }, [tasks, selectedDay]);

  const addTask = () => {
    if (newTask.trim()) {
      setTasks({
        ...tasks,
        todo: [...tasks.todo, { id: Date.now(), text: newTask }],
      });
      setNewTask('');
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return; // Task joylashuvi o'zgarmasa, hech nima qilinmaydi.
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

  const removeTask = (id, column) => {
    setTasks((prevTasks) => ({
      ...prevTasks,
      [column]: prevTasks[column].filter((task) => task.id !== id),
    }));
  };

  const startEditing = (task) => {
    setEditingTask(task.id);
    setEditedText(task.text);
  };

  const saveEditedTask = (column) => {
    setTasks({
      ...tasks,
      [column]: tasks[column].map((task) =>
        task.id === editingTask ? { ...task, text: editedText } : task
      ),
    });
    setEditingTask(null);
  };

  const handleNextDays = () => {
    if (visibleIndex < weekDays.length - 5) {
      setVisibleIndex(visibleIndex + 1);
    }
  };

  const handlePreviousDays = () => {
    if (visibleIndex > 0) {
      setVisibleIndex(visibleIndex - 1);
    }
  };

  const handleSpecialDaySubmit = () => {
    console.log('Special Day:', specialDay);
    setShowModal(false);
    setSpecialDay({ month: '', day: '', task: '' }); // Reset Special Day form
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  const closeCalendar = () => {
    setShowCalendar(false); // Close the calendar when clicked
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-800 text-white py-5 px-8 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img
            src="https://w7.pngwing.com/pngs/831/88/png-transparent-user-profile-computer-icons-user-interface-mystique-miscellaneous-user-interface-design-smile-thumbnail.png"
            alt="User Avatar"
            className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
          />
          <span className="text-xl font-semibold">{user?.username || 'User Name'}</span>
        </div>
        <div className="flex flex-col items-center w-full">
          <h1 className="text-3xl font-bold tracking-wide">Weekly Tasks</h1>
          <div className="flex items-center space-x-4 mt-2">
            <button onClick={handlePreviousDays} disabled={visibleIndex === 0}>
              <FaArrowLeft className="text-white hover:text-gray-200" />
            </button>
            {weekDays.slice(visibleIndex, visibleIndex + 5).map((date, index) => (
              <div
                key={index}
                onClick={() => setSelectedDay(format(date, 'yyyy-MM-dd'))}
                className={`px-4 py-3 rounded-lg cursor-pointer transition-all duration-300 ${
                  format(date, 'yyyy-MM-dd') === selectedDay
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-200 hover:bg-indigo-500 hover:text-white'
                }`}
              >
                <span className="text-sm font-semibold">{format(date, 'EEEE')}</span>
                <div className="text-lg font-bold">{format(date, 'dd.MM')}</div>
              </div>
            ))}
            <button onClick={handleNextDays} disabled={visibleIndex >= weekDays.length - 5}>
              <FaArrowRight className="text-white hover:text-gray-200" />
            </button>
            <button onClick={toggleCalendar} className="ml-2">
              <FaCalendarAlt className="text-white hover:text-gray-200" />
            </button>
          </div>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-1/4 bg-white p-6 border-r border-gray-300">
          <ul>
            {[{ name: "Today's challenges", path: "/today-challenges" },
              { name: 'Weekly Tasks', path: '/weekly-tasks' },
              { name: 'Monthly Tasks', path: '/monthly-tasks' },
              { name: '+ Add Special Day', path: '/add-special-day' },
            ].map((item) => (
              <li key={item.path} className="mb-4">
                <button
                  onClick={() => item.name === '+ Add Special Day' ? setShowModal(true) : navigate(item.path)}
                  className={`w-full text-left px-4 py-3 rounded-md font-semibold transition-all ${
                    location.pathname === item.path
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-indigo-100 hover:text-indigo-600'
                  }`}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <main className="flex-1 bg-gray-50 p-10 overflow-y-auto">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex justify-between gap-6">
              {['todo', 'inProcess', 'done'].map((column) => (
                <Droppable key={column} droppableId={column}>
                  {(provided) => (
                    <div
                      className="w-1/3 bg-white shadow-lg border border-gray-200 rounded-lg p-6"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      <h2 className="text-2xl font-semibold capitalize mb-6 text-blue-700">
                        {column === 'todo' ? 'To Do' : column === 'inProcess' ? 'In Process' : 'Done'}
                      </h2>
                      {column === 'todo' && (
                        <div className="mb-4">
                          <input
                            type="text"
                            placeholder="Add a new task"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-4 py-2"
                          />
                          <button
                            onClick={addTask}
                            className="mt-3 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                          >
                            Add Task
                          </button>
                        </div>
                      )}
                      {tasks[column].map((task, index) => (
                        <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="flex justify-between items-center mb-3 p-3 bg-white shadow-sm rounded-lg border"
                            >
                              {editingTask === task.id ? (
                                <div className="flex flex-col w-full">
                                  <input
                                    type="text"
                                    value={editedText}
                                    onChange={(e) => setEditedText(e.target.value)}
                                    className="border border-gray-300 rounded-md p-2 mb-3"
                                  />
                                  <button
                                    onClick={() => saveEditedTask(column)}
                                    className="bg-green-500 text-white py-1 px-4 rounded-md"
                                  >
                                    Save
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <span className="text-sm">{task.text}</span>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => startEditing(task)}
                                      className="text-yellow-500"
                                    >
                                      <FaEdit />
                                    </button>
                                    <button
                                      onClick={() => removeTask(task.id, column)}
                                      className="text-red-500"
                                    >
                                      <FaTrashAlt />
                                    </button>
                                  </div>
                                </>
                              )}
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
      {/* Add Special Day Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-4">Add Special Day</h2>

            {/* Month Selector */}
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              value={specialDay.month}
              onChange={(e) => setSpecialDay({ ...specialDay, month: e.target.value })}
              className="w-full border px-3 py-2 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Select Month</option>
              {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(
                (month, index) => (
                  <option key={index} value={month}>
                    {month}
                  </option>
                )
              )}
            </select>

            {/* Day Selector */}
            <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
            <select
              value={specialDay.day}
              onChange={(e) => setSpecialDay({ ...specialDay, day: e.target.value })}
              className="w-full border px-3 py-2 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Select Day</option>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>

            {/* Special Task */}
            <label className="block text-sm font-medium text-gray-700 mb-1">Special Task</label>
            <input
              type="text"
              placeholder="Special Task"
              value={specialDay.task}
              onChange={(e) => setSpecialDay({ ...specialDay, task: e.target.value })}
              className="w-full border px-3 py-2 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            {/* Modal Buttons */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSpecialDaySubmit}
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {showCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <DatePicker
            selected={new Date()}
            onChange={(date) => setSelectedDay(format(date, 'yyyy-MM-dd'))}
            inline
          />
          <button
            onClick={closeCalendar} // Bind closeCalendar to the button
            className="absolute top-4 right-4 text-white text-xl"
          >
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
};

export default WeeklyTasks;
