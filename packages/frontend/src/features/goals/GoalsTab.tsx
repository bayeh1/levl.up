import { useEffect, useState } from 'react'
import { GoalCard } from './GoalCard'
import { GoalForm } from './GoalForm'
import { SkeletonCard } from '../../components/SkeletonCard'
import { getGoals, addGoal, updateGoal, resetGoalProgress } from '../../store/goals'
import { getTasks } from '../../store/tasks'
import { getTodayStreak } from '../../store/streaks'
import type { Goal, Task, PuzzleImageId } from '@levl-up/shared'

export function GoalsTab() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    try {
      const [allGoals, allTasks, todayStreak] = await Promise.all([
        getGoals(),
        getTasks(),
        getTodayStreak(),
      ])

      // Streak break: reset puzzle progress on all active goals not yet reset today
      if (todayStreak?.broken) {
        const today = new Date().toISOString().slice(0, 10)
        await Promise.all(
          allGoals
            .filter((g) => !g.completed && g.lastResetAt !== today)
            .map((g) => resetGoalProgress(g.id))
        )
        const refreshed = await getGoals()
        setGoals(refreshed)
      } else {
        setGoals(allGoals)
      }

      // Auto-complete goals where all linked tasks are done
      for (const g of allGoals.filter((g) => !g.completed)) {
        const goalTasks = allTasks.filter((t) => t.goalId === g.id)
        if (goalTasks.length > 0 && goalTasks.every((t) => t.completed)) {
          await updateGoal(g.id, { completed: true })
        }
      }

      setTasks(allTasks)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleAddGoal(fields: { title: string; deadline: Date; puzzleImageId: PuzzleImageId }) {
    await addGoal({
      id: crypto.randomUUID(),
      ...fields,
      createdAt: new Date(),
      completed: false,
    })
    setShowForm(false)
    await load()
  }

  const activeGoals = goals.filter((g) => !g.completed)
  const completedGoals = goals.filter((g) => g.completed)

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Goals</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="text-xs text-[#58a6ff]">
            + Add goal
          </button>
        )}
      </div>

      {showForm && (
        <GoalForm onSubmit={handleAddGoal} onCancel={() => setShowForm(false)} />
      )}

      {loading ? (
        <div role="status" className="space-y-2">
          <span className="sr-only">Loading goals…</span>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <>
          {goals.length === 0 && !showForm && (
            <p className="text-[#8b949e] text-sm">No goals yet</p>
          )}

          {activeGoals.length > 0 && (
            <section className="space-y-3">
              {activeGoals.map((g) => (
                <GoalCard key={g.id} goal={g} tasks={tasks} />
              ))}
            </section>
          )}

          {completedGoals.length > 0 && (
            <section>
              <h2 className="text-xs uppercase tracking-wide text-[#8b949e] mb-2">Completed</h2>
              <div className="space-y-3">
                {completedGoals.map((g) => (
                  <GoalCard key={g.id} goal={g} tasks={tasks} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
