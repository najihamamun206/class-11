

import { useState } from 'react'
import './App.css'

function App() {
  const [task, setTask] = useState('')
  const [todos, setTodos] = useState([])
  const [media, setMedia] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [uploadStatus, setUploadStatus] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmedTask = task.trim()
    if (!trimmedTask) return

    setTodos((currentTodos) => [
      ...currentTodos,
      {
        id: Date.now(),
        text: trimmedTask,
        completed: false,
      },
    ])
    setTask('')
  }

  const toggleTodo = (id) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    )
  }

  const deleteTodo = (id) => {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id))
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
      const response = await fetch('/upload', {
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
