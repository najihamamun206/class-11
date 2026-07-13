

import { useEffect, useState } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function App() {
  const [task, setTask] = useState('')
  const [todos, setTodos] = useState([])
  const [media, setMedia] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [uploadStatus, setUploadStatus] = useState('')

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/todos`)
        if (!response.ok) {
          throw new Error('Failed to load todos')
        }

        const data = await response.json()
        setTodos(data)
      } catch (error) {
        console.error(error)
      }
    }

    fetchTodos()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const trimmedTask = task.trim()
    if (!trimmedTask) return

    try {
      const response = await fetch(`${API_BASE_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: trimmedTask }),
      })

      if (!response.ok) {
        throw new Error('Failed to create todo')
      }

      const newTodo = await response.json()
      setTodos((currentTodos) => [...currentTodos, newTodo])
      setTask('')
    } catch (error) {
      console.error(error)
    }
  }

  const toggleTodo = async (id) => {
    const todo = todos.find((item) => item.id === id)
    if (!todo) return

    try {
      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !todo.completed }),
      })

      if (!response.ok) {
        throw new Error('Failed to update todo')
      }

      const updatedTodo = await response.json()
      setTodos((currentTodos) =>
        currentTodos.map((item) => (item.id === id ? updatedTodo : item)),
      )
    } catch (error) {
      console.error(error)
    }
  }

  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete todo')
      }

      setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setMedia(file)
    setPreviewUrl(URL.createObjectURL(file))
    setUploadStatus('')
  }

  const handleUpload = async () => {
    if (!media) {
      setUploadStatus('Please select a file first.')
      return
    }

    const formData = new FormData()
    formData.append('media', media)

    try {
      setUploadStatus('Uploading...')
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      setUploadStatus(`Upload successful: ${result.url}`)
      setMedia(null)
      setPreviewUrl('')
    } catch (error) {
      setUploadStatus('Upload failed. Try again.')
      console.error(error)
    }
  }

  return (
    <div className="app-container">
      <h1>TODO</h1>
      <form className="todo-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Add a new task"
        />
        <button type="submit">Submit</button>
      </form>

      {todos.length === 0 ? (
        <p className="empty-state">No tasks yet. Add one above.</p>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <li key={todo.id} className={todo.completed ? 'todo-item completed' : 'todo-item'}>
              <button className="checkbox" onClick={() => toggleTodo(todo.id)}>
                {todo.completed ? '✓' : '○'}
              </button>
              <span>{todo.text}</span>
              <button className="delete-button" onClick={() => deleteTodo(todo.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <section className="upload-section">
        <h2>Upload photo or video</h2>
        <input type="file" accept="image/*,video/*" onChange={handleFileChange} />

        {previewUrl && (
          <div className="preview-box">
            {media?.type.startsWith('image/') ? (
              <img src={previewUrl} alt="preview" />
            ) : (
              <video controls src={previewUrl}></video>
            )}
          </div>
        )}

        <button type="button" onClick={handleUpload} disabled={!media}>
          Upload file
        </button>
        {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
      </section>
    </div>
  )
}

export default App
