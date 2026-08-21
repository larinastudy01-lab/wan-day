import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { Circle, Plus, Trash2 } from "lucide-react";
import { Empty } from "../../components/EmptyState";
import { PageTitle } from "../../components/PageTitle";
import { TaskRow } from "../../components/TaskRow";
import type { Task, WaitingItem } from "../../domain/types";

type Tab = "任務" | "收集匣" | "等待他人" | "以後再做";
type Props = {
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
  waiting: WaitingItem[];
  setWaiting: Dispatch<SetStateAction<WaitingItem[]>>;
  categories: string[];
  setCategories: Dispatch<SetStateAction<string[]>>;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onDeleteWaiting: (item: WaitingItem) => void;
  onEdit: (id: number) => void;
  onAdd: () => void;
};

export function TaskListPage({
  tasks,
  setTasks,
  waiting,
  setWaiting,
  categories,
  setCategories,
  onToggle,
  onDelete,
  onDeleteWaiting,
  onEdit,
  onAdd,
}: Props) {
  const [tab, setTab] = useState<Tab>("任務");
  const [filter, setFilter] = useState<"全部" | "待完成" | "已完成">("待完成");
  const [category, setCategory] = useState("全部");
  const visible = tasks.filter(
    (task) =>
      !task.inbox &&
      (filter === "全部" || (filter === "已完成" ? task.done : !task.done)) &&
      (category === "全部" || (task.category || "一般") === category),
  );
  const addCategory = () => {
    const name = window.prompt("新類別名稱")?.trim();
    if (
      name &&
      !categories.some((item) => item.toLowerCase() === name.toLowerCase())
    ) {
      setCategories((current) => [...current, name]);
      setCategory(name);
    }
  };
  const gtdKind = tab === "等待他人" ? "waiting" : "someday";
  const gtdItems = waiting.filter(
    (item) => item.kind === gtdKind && !item.done,
  );
  return (
    <>
      <PageTitle name="任務中心" onAdd={onAdd} />
      <div className="task-hub-tabs">
        {(["任務", "收集匣", "等待他人", "以後再做"] as Tab[]).map((item) => (
          <button
            className={tab === item ? "active" : ""}
            onClick={() => setTab(item)}
            key={item}
          >
            {item}
            {item === "收集匣" && tasks.some((task) => task.inbox) && (
              <em>{tasks.filter((task) => task.inbox).length}</em>
            )}
          </button>
        ))}
      </div>
      {tab === "任務" && (
        <section className="card task-list-page">
          <div className="toolbar">
            <div className="segmented">
              {(["待完成", "已完成", "全部"] as const).map((option) => (
                <button
                  className={filter === option ? "active" : ""}
                  onClick={() => setFilter(option)}
                  key={option}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="category-filter">
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option>全部</option>
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <button title="新增類別" onClick={addCategory}>
                <Plus />
              </button>
            </div>
            <span>{visible.length} 項任務</span>
          </div>
          {visible.length ? (
            visible.map((task) => (
              <div className="categorized-task" key={task.id}>
                <TaskRow
                  task={task}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
                <select
                  value={task.category || "一般"}
                  onChange={(event) =>
                    setTasks((current) =>
                      current.map((item) =>
                        item.id === task.id
                          ? { ...item, category: event.target.value }
                          : item,
                      ),
                    )
                  }
                >
                  {categories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
            ))
          ) : (
            <Empty />
          )}
        </section>
      )}
      {tab === "收集匣" && (
        <section className="card inbox-page">
          <div className="inbox-intro">
            <div>
              <h2>
                {tasks.filter((task) => task.inbox).length} 個項目等待釐清
              </h2>
              <p>選擇類別與優先級後，項目會移到任務清單。</p>
            </div>
          </div>
          {tasks
            .filter((task) => task.inbox)
            .map((task) => (
              <div className="clarify task-hub-clarify" key={task.id}>
                <TaskRow
                  task={task}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
                <select
                  value={task.category || "一般"}
                  onChange={(event) =>
                    setTasks((current) =>
                      current.map((item) =>
                        item.id === task.id
                          ? { ...item, category: event.target.value }
                          : item,
                      ),
                    )
                  }
                >
                  {categories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <button
                  onClick={() =>
                    setTasks((current) =>
                      current.map((item) =>
                        item.id === task.id ? { ...item, inbox: false } : item,
                      ),
                    )
                  }
                >
                  完成釐清
                </button>
              </div>
            ))}
          {!tasks.some((task) => task.inbox) && <Empty />}
        </section>
      )}
      {(tab === "等待他人" || tab === "以後再做") && (
        <section className="card gtd-page">
          <div className="gtd-summary">
            <div>
              <h2>
                {gtdItems.length} 個{tab}
              </h2>
              <p>
                {tab === "等待他人"
                  ? "追蹤已交付的承諾與回覆。"
                  : "保存現在不需要投入注意力的想法。"}
              </p>
            </div>
          </div>
          {gtdItems.map((item) => (
            <article className="gtd-row" key={item.id}>
              <button
                onClick={() =>
                  setWaiting((current) =>
                    current.map((record) =>
                      record.id === item.id
                        ? { ...record, done: true }
                        : record,
                    ),
                  )
                }
              >
                <Circle />
              </button>
              <div>
                <b>{item.title}</b>
                <p>{item.note || "尚無備註"}</p>
              </div>
              {item.followUp && <time>跟進 {item.followUp}</time>}
              <button
                className="row-action"
                  aria-label={`刪除 ${item.title}`}
                  onClick={() => onDeleteWaiting(item)}
              >
                <Trash2 />
              </button>
            </article>
          ))}
          {gtdItems.length === 0 && <Empty />}
        </section>
      )}
    </>
  );
}
