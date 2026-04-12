import { useEffect, useState } from 'react'
import { TaskItem } from './TaskItem'
import { TaskForm } from './TaskForm'
import { getTasks, addTask, completeTask, deleteTask, createTask } from '../../store/tasks'
import { recordCompletion } from '../../store/streaks'
import { SkeletonCard } from '../../components/SkeletonCard'
import type { Task, StreakContribution } from '@levl-up/shared'

export function TasksTab() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      setTasks(await getTasks())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleComplete(id: string) {
    await completeTask(id)
    const task = tasks.find((t) => t.id === id)
    if (task?.streakContribution !== 'none') await recordCompletion(1)
    await load()
  }

  async function handleAdd(fields: { title: string; dueDate: Date; category: 'productivity' | 'finance'; streakContribution: StreakContribution }) {
    await addTask(createTask(fields))
    setShowForm(false)
    await load()
  }

  const todayStr = new Date().toDateString()
  const todayTasks = tasks.filter((t) => !t.completed && new Date(t.dueDate).toDateString() === todayStr)
  const overdueTasks = tasks.filter((t) => !t.completed && new Date(t.dueDate) < new Date() && new Date(t.dueDate).toDateString() !== todayStr)
  const upcomingTasks = tasks.filter((t) => !t.completed && new Date(t.dueDate) > new Date() && new Date(t.dueDate).toDateString() !== todayStr)

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Tasks</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#238636] text-white px-4 py-1.5 rounded-lg text-sm font-medium"
        >
          + Add
        </button>
      </div>

      {showForm && <TaskForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />}

      {loading ? (
        <div className="space-y-2"><SkeletonCard /><SkeletonCard /></div>
      ) : (
        <>
          {overdueTasks.length > 0 && (
            <section>
              <h2 className="text-xs uppercase tracking-wide text-[#f85149] mb-2">Overdue</h2>
              <div className="space-y-2">
                {overdueTasks.map((t) => <TaskItem key={t.id} task={t} onComplete={handleComplete} onDelete={async (id) => { await deleteTask(id); load() }} />)}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-xs uppercase tracking-wide text-[#8b949e] mb-2">Today</h2>
            <div className="space-y-2">
              {todayTasks.length === 0 && !showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="text-sm text-[#58a6ff]"
                >
                  + Add your first task
                </button>
              )}
              {todayTasks.map((t) => <TaskItem key={t.id} task={t} onComplete={handleComplete} onDelete={async (id) => { await deleteTask(id); load() }} />)}
            </div>
          </section>

          {upcomingTasks.length > 0 && (
            <section>
              <h2 className="text-xs uppercase tracking-wide text-[#8b949e] mb-2">Upcoming</h2>
              <div className="space-y-2">
                {upcomingTasks.map((t) => <TaskItem key={t.id} task={t} onComplete={handleComplete} onDelete={async (id) => { await deleteTask(id); load() }} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
