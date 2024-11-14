import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { format, startOfYear, addMonths } from 'date-fns';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaTrashAlt, FaEdit, FaSave, FaArrowLeft, FaArrowRight, FaCalendarAlt, FaTimes } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const MonthlyTasks = () => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();

  // Oy nomlarini olish (hozirgi oy va undan keyingi oylar)
  const getNextSixMonths = () => {
    return Array.from({ length: 12 }, (_, i) =>
      format(addMonths(new Date(), i), 'MMMM yyyy')
    );
  };

  const [visibleIndex, setVisibleIndex] = useState(0);
  const [tasks, setTasks] = useState({ todo: [], inProcess: [], done: [] });
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const [showModal, setShowModal] = useState(false);
  const [specialDay, setSpecialDay] = useState({ month: '', day: '', task: '' });
  const [showCalendar, setShowCalendar] = useState(false);

  const monthNames = getNextSixMonths();  // Oydan boshlab oyni olish

  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem(`monthlyTasks_${selectedMonth}`)) || {
      todo: [],
      inProcess: [],
      done: [],
    };
    setTasks(savedTasks);
  }, [selectedMonth]);

  useEffect(() => {
    localStorage.setItem(`monthlyTasks_${selectedMonth}`, JSON.stringify(tasks));
  }, [tasks, selectedMonth]);

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
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

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

  const handleNextMonth = () => {
    if (visibleIndex < monthNames.length - 1) {
      setVisibleIndex(visibleIndex + 1);
      setSelectedMonth(format(addMonths(new Date(), visibleIndex + 1), 'yyyy-MM'));
    }
  };

  const handlePreviousMonth = () => {
    if (visibleIndex > 0) {
      setVisibleIndex(visibleIndex - 1);
      setSelectedMonth(format(addMonths(new Date(), visibleIndex - 1), 'yyyy-MM'));
    }
  };

  const handleSpecialDaySubmit = () => {
    console.log('Special Day:', specialDay);
    setShowModal(false);
    setSpecialDay({ month: '', day: '', task: '' });
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  const closeCalendar = () => {
    setShowCalendar(false);
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
          <h1 className="text-3xl font-bold tracking-wide">Monthly Tasks</h1>
          <div className="flex items-center space-x-4 mt-2">
            <button onClick={handlePreviousMonth} disabled={visibleIndex === 0}>
              <FaArrowLeft className="text-white hover:text-gray-200" />
            </button>
            {monthNames.slice(visibleIndex, visibleIndex + 1).map((month, index) => (
              <div
                key={index}
                onClick={() => setSelectedMonth(format(addMonths(new Date(), visibleIndex), 'yyyy-MM'))}
                className={`px-4 py-3 rounded-lg cursor-pointer transition-all duration-300 ${
                  format(addMonths(new Date(), visibleIndex), 'yyyy-MM') === selectedMonth
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-200 hover:bg-indigo-500 hover:text-white'
                }`}
              >
                <span className="text-lg font-semibold">{month}</span>
              </div>
            ))}
            <button onClick={handleNextMonth} disabled={visibleIndex >= monthNames.length - 1}>
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
                      className="bg-white p-4 rounded-lg shadow-md w-full"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      <h2 className="text-lg font-bold text-gray-700 capitalize mb-4">{column}</h2>
                      {tasks[column].map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                          {(provided) => (
                            <div
                              className="bg-gray-100 p-4 mb-4 rounded-lg shadow-sm flex justify-between items-center"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              {editingTask === task.id ? (
                                <div className="flex items-center space-x-2 w-full">
                                  <input
                                    type="text"
                                    value={editedText}
                                    onChange={(e) => setEditedText(e.target.value)}
                                    className="flex-grow p-2 rounded border border-gray-300 focus:outline-none"
                                  />
                                  <button
                                    onClick={() => saveEditedTask(column)}
                                    className="text-green-600"
                                  >
                                    <FaSave />
                                  </button>
                                  <button
                                    onClick={() => setEditingTask(null)}
                                    className="text-red-600"
                                  >
                                    <FaTimes />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2 w-full">
                                  <span className="flex-grow">{task.text}</span>
                                  <button
                                    onClick={() => startEditing(task)}
                                    className="text-blue-600"
                                  >
                                    <FaEdit />
                                  </button>
                                  <button
                                    onClick={() => removeTask(task.id, column)}
                                    className="text-red-600"
                                  >
                                    <FaTrashAlt />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {column === 'todo' && (
                        <div className="mt-6">
                          <input
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            className="w-full p-2 rounded border border-gray-300 mb-2"
                            placeholder="Add new task..."
                          />
                          <button
                            onClick={addTask}
                            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                          >
                            Add Task
                          </button>
                        </div>
                      )}
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
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <DatePicker
              inline
              selected={new Date(selectedMonth)}
              onChange={(date) => setSelectedMonth(format(date, 'yyyy-MM'))}
            />
            <button
              onClick={closeCalendar}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Close Calendar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyTasks;
