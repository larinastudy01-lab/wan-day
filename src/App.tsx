import {
  Dispatch,
  lazy,
  ReactNode,
  SetStateAction,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { RecordModal } from "./components/RecordModal";
import type {
  Account,
  BodyLog,
  Budget,
  CalendarEvent,
  Course,
  Exam,
  ExerciseLog,
  FinanceTransaction,
  FocusKind,
  FocusLog,
  FormKind,
  Goal,
  Habit,
  Health,
  Holding,
  InvestmentTransaction,
  JournalEntry,
  Mistake,
  MockExam,
  Note,
  Profile,
  Project,
  Quadrant,
  SleepLog,
  StudyLog,
  Task,
  WaitingItem,
  WellnessLog,
  WorkLog,
  WorkProfile,
} from "./domain/types";
import {
  initialAccounts,
  initialBody,
  initialCourses,
  initialBudgets,
  initialEvents,
  initialExams,
  initialExercise,
  initialFinance,
  initialGoals,
  initialHabits,
  initialHoldings,
  initialInvestmentTx,
  initialJournal,
  initialMistakes,
  initialMocks,
  initialNotes,
  initialProjects,
  initialSleep,
  initialStudy,
  initialTasks,
  initialWaiting,
  initialWellness,
  initialWorkLogs,
  initialWorks,
} from "./domain/seeds";
import { navigation } from "./config/navigation";
import { formConfigs } from "./config/forms";
import { uiColors } from "./config/colors";
import { CalendarPage } from "./features/calendar/CalendarPage";
import { CapacityPage } from "./features/capacity/CapacityPage";
import { SearchModal } from "./features/search/SearchModal";
import { TodayPage } from "./features/planning/TodayPage";
import { TaskListPage } from "./features/planning/TaskListPage";
import { CategoryManager } from "./features/planning/CategoryManager";
import { TaskEditorModal } from "./features/planning/TaskEditorModal";
import { RestartPanel } from "./features/planning/RestartPanel";
import {
  OnboardingPage,
  type OnboardingSetup,
} from "./features/onboarding/OnboardingPage";
import { QuickCaptureModal } from "./features/planning/QuickCaptureModal";
import type { CaptureSuggestion } from "./features/planning/captureEngine";
import { suggestedFocusMinutes } from "./features/planning/adaptiveFlow";
import { ProjectPage } from "./features/projects/ProjectPage";
import { ProjectLifecyclePanel } from "./features/projects/ProjectLifecyclePanel";
import { createFocusLog, resolveFocus } from "./features/focus/focusEngine";
import { LearningPage } from "./features/learning/LearningPage";
import { TogetherPage } from "./features/social/TogetherPage";
import { WorkSchedulePage } from "./features/work/WorkSchedulePage";
import { buildInsights } from "./features/insights/insightEngine";
import { SmartInsightCard } from "./features/insights/SmartInsightCard";
import { usePersistentState } from "./hooks/usePersistentState";
import { useStorageScope } from "./hooks/storageScopeContext";
import { playCompletionTone } from "./lib/audio";
import { PageTitle } from "./components/PageTitle";
import { MascotCompanion, MascotGallery } from "./components/MascotCompanion";
import { mascotForPage } from "./config/mascots";
import { TaskRow } from "./components/TaskRow";
import { Empty } from "./components/EmptyState";
import {
  CalendarDays,
  Check,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock3,
  Droplets,
  Flame,
  HeartPulse,
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  Download,
  GraduationCap,
  Inbox,
  Landmark,
  LogOut,
  Menu,
  MoreHorizontal,
  Moon,
  Pause,
  PenLine,
  PiggyBank,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Smile,
  Sparkles,
  StickyNote,
  Upload,
  Sun,
  Target,
  TimerReset,
  Trash2,
  TrendingUp,
  TriangleAlert,
  Wallet,
  WifiOff,
  X,
  Zap,
} from "lucide-react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const FocusTrendChart = lazy(() =>
  import("./components/Charts").then((m) => ({ default: m.FocusTrendChart })),
);
const AllocationPieChart = lazy(() =>
  import("./components/Charts").then((m) => ({
    default: m.AllocationPieChart,
  })),
);
const MetricBarChart = lazy(() =>
  import("./components/Charts").then((m) => ({ default: m.MetricBarChart })),
);
const currentDate = () => new Date().toLocaleDateString("en-CA");
const alignToWeekday = (dateValue:string,weekday:number) => { const date=new Date(`${dateValue}T00:00:00`); date.setDate(date.getDate()+(weekday-date.getDay()+7)%7); return date.toLocaleDateString("en-CA") };

function App({ onLogout }: { onLogout: () => void }) {
  const storageScope = useStorageScope();
  const [tasks, setTasks] = usePersistentState<Task[]>(
    "growth-tasks-v2",
    initialTasks,
  );
  const [goals, setGoals] = usePersistentState<Goal[]>(
    "growth-goals-v2",
    initialGoals,
  );
  const [projects, setProjects] = usePersistentState<Project[]>(
    "growth-projects-v1",
    initialProjects,
  );
  const [habits, setHabits] = usePersistentState<Habit[]>(
    "growth-habits-v1",
    initialHabits,
  );
  const [journal, setJournal] = usePersistentState<JournalEntry[]>(
    "growth-journal-v1",
    initialJournal,
  );
  const [notes, setNotes] = usePersistentState<Note[]>(
    "growth-notes-v1",
    initialNotes,
  );
  const [health, setHealth] = usePersistentState<Health>("growth-health-v1", {
    water: 1250,
    sleep: 7.2,
    energy: 4,
    stress: 2,
    mood: 4,
    exercise: 35,
  });
  const [works, setWorks] = usePersistentState<WorkProfile[]>(
    "growth-works-v1",
    initialWorks,
  );
  const [workLogs, setWorkLogs] = usePersistentState<WorkLog[]>(
    "growth-worklogs-v1",
    initialWorkLogs,
  );
  const [exams, setExams] = usePersistentState<Exam[]>(
    "growth-exams-v1",
    initialExams,
  );
  const [mocks, setMocks] = usePersistentState<MockExam[]>(
    "growth-mocks-v1",
    initialMocks,
  );
  const [accounts, setAccounts] = usePersistentState<Account[]>(
    "growth-accounts-v1",
    initialAccounts,
  );
  const [finance, setFinance] = usePersistentState<FinanceTransaction[]>(
    "growth-finance-v1",
    initialFinance,
  );
  const [budgets] = useState<Budget[]>(initialBudgets);
  const [holdings, setHoldings] = usePersistentState<Holding[]>(
    "growth-holdings-v1",
    initialHoldings,
  );
  const [investmentTx, setInvestmentTx] = usePersistentState<
    InvestmentTransaction[]
  >("growth-investment-tx-v1", initialInvestmentTx);
  const [profile, setProfile] = usePersistentState<Profile>(
    "growth-profile-v1",
    {
      name: "Larin",
      headline: "正在建立更有意識的生活",
      roles: ["學生", "開發者", "家教"],
      lifeAreas: ["學習", "職涯", "財務", "健康", "生活", "成長"],
    },
  );
  const [onboarding, setOnboarding] = usePersistentState<OnboardingSetup>(
    "growth-onboarding-v1",
    { completed: false, focus: "", identity: "", enabledModules: [] },
  );
  const [waiting, setWaiting] = usePersistentState<WaitingItem[]>(
    "growth-waiting-v1",
    initialWaiting,
  );
  const [focusLogs, setFocusLogs] = usePersistentState<FocusLog[]>(
    "growth-focus-logs-v1",
    [],
  );
  const [studyLogs, setStudyLogs] = usePersistentState<StudyLog[]>(
    "growth-study-v1",
    initialStudy,
  );
  const [mistakes, setMistakes] = usePersistentState<Mistake[]>(
    "growth-mistakes-v1",
    initialMistakes,
  );
  const [exerciseLogs, setExerciseLogs] = usePersistentState<ExerciseLog[]>(
    "growth-exercise-v1",
    initialExercise,
  );
  const [sleepLogs, setSleepLogs] = usePersistentState<SleepLog[]>(
    "growth-sleep-v1",
    initialSleep,
  );
  const [bodyLogs, setBodyLogs] = usePersistentState<BodyLog[]>(
    "growth-body-v1",
    initialBody,
  );
  const [wellnessLogs, setWellnessLogs] = usePersistentState<WellnessLog[]>(
    "growth-wellness-v1",
    initialWellness,
  );
  const [focusQuality, setFocusQuality] = useState(4);
  const [interruptions, setInterruptions] = useState<string[]>([]);
  const [focusSound, setFocusSound] = usePersistentState(
    "growth-focus-sound-v1",
    true,
  );
  const [focusNotifications, setFocusNotifications] = usePersistentState(
    "growth-focus-notifications-v1",
    false,
  );
  const [studyDailyGoal] = usePersistentState(
    "growth-study-daily-goal-v1",
    120,
  );
  const [events, setEvents] = usePersistentState<CalendarEvent[]>(
    "growth-events-v1",
    initialEvents,
  );
  const [courses, setCourses] = usePersistentState<Course[]>(
    "growth-courses-v1",
    initialCourses,
  );
  const [taskCategories, setTaskCategories] = usePersistentState<string[]>(
    "growth-task-categories-v1",
    ["學習", "工作", "健康", "生活", "財務", "一般"],
  );
  const importRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState("今天");
  const [sidebar, setSidebar] = useState(false);
  const [quick, setQuick] = useState(false);
  const [search, setSearch] = useState(false);
  const [showMascots, setShowMascots] = useState(false);
  const [toast, setToast] = useState("");
  const [theme, setTheme] = usePersistentState<"light" | "dark">(
    "growth-theme-v1",
    "light",
  );
  const [online, setOnline] = useState(() => navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent>();
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);
  const [focusRunning, setFocusRunning] = useState(false);
  const [focusPreset, setFocusPreset] = useState(25);
  const [focusKind, setFocusKind] = useState<FocusKind>("task");
  const [focusEntityId, setFocusEntityId] = useState<number | undefined>();
  const [focusSubject, setFocusSubject] = useState("");
  const [focusCustomTitle, setFocusCustomTitle] = useState("");
  const [reviewChecks, setReviewChecks] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [reviewMode, setReviewMode] = useState<"每日" | "每週" | "每月">(
    "每週",
  );
  const [formKind, setFormKind] = useState<FormKind>(null);
  const [examCourseName, setExamCourseName] = useState("");
  const [editId, setEditId] = useState<number>();
  const [editingTaskId, setEditingTaskId] = useState<number>();
  const [undo, setUndo] = useState<{ label: string; run: () => void }>();
  const notify = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast("");
      setUndo(undefined);
    }, 3500);
  }, []);
  useEffect(() => {
    if (!focusRunning) return;
    const timer = setInterval(
      () =>
        setFocusSeconds((s) => {
          if (s <= 1) {
            setFocusRunning(false);
            const selection = {
              kind: focusKind,
              entityId: focusEntityId,
              subject: focusSubject,
              customTitle: focusCustomTitle,
            };
            const sources = { tasks, projects, exams, works };
            const log = createFocusLog(
              selection,
              sources,
              focusPreset,
              focusQuality,
              interruptions,
              currentDate(),
            );
            setFocusLogs((v) => [log, ...v]);
            if (focusKind === "task" && focusEntityId)
              setTasks((v) =>
                v.map((x) =>
                  x.id === focusEntityId
                    ? {
                        ...x,
                        actualMinutes: (x.actualMinutes || 0) + focusPreset,
                      }
                    : x,
                ),
              );
            if (focusKind === "learning" && focusEntityId)
              setStudyLogs((v) => [
                {
                  id: Date.now(),
                  examId: focusEntityId,
                  subject:
                    focusSubject ||
                    exams.find((exam) => exam.id === focusEntityId)?.subjects[0]
                      ?.name ||
                    "自由學習",
                  minutes: focusPreset,
                  questions: 0,
                  correct: 0,
                  date: currentDate(),
                },
                ...v,
              ]);
            if (focusKind === "work" && focusEntityId) {
              const work = works.find((item) => item.id === focusEntityId);
              if (work)
                setWorkLogs((v) => [
                  {
                    id: Date.now(),
                    workId: work.id,
                    date: currentDate(),
                    duration: focusPreset,
                    task: log.title,
                    income: Math.round((work.rate * focusPreset) / 60),
                    paid: false,
                  },
                  ...v,
                ]);
            }
            if (focusSound) playCompletionTone();
            if (
              focusNotifications &&
              "Notification" in window &&
              Notification.permission === "granted"
            )
              new Notification("灣day", {
                body: "專注完成，紀錄已同步到相關領域。",
                icon: "/icon.svg",
              });
            setInterruptions([]);
            notify(`${log.title} +${focusPreset} 分鐘，已同步紀錄`);
            return focusPreset * 60;
          }
          return s - 1;
        }),
      1000,
    );
    return () => clearInterval(timer);
  }, [
    focusRunning,
    focusPreset,
    focusKind,
    focusEntityId,
    focusSubject,
    focusCustomTitle,
    tasks,
    projects,
    exams,
    works,
    notify,
    focusQuality,
    interruptions,
    focusSound,
    focusNotifications,
    setFocusLogs,
    setTasks,
    setStudyLogs,
    setWorkLogs,
  ]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearch(true);
      }
      if (e.key === "Escape") {
        setSearch(false);
        setQuick(false);
      }
      if (
        e.key.toLowerCase() === "n" &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)
      )
        setQuick(true);
    };
    addEventListener("keydown", fn);
    return () => removeEventListener("keydown", fn);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document
      .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#18211F" : "#2F7F7A");
  }, [theme]);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    const capture = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    addEventListener("online", update);
    addEventListener("offline", update);
    addEventListener("beforeinstallprompt", capture);
    return () => {
      removeEventListener("online", update);
      removeEventListener("offline", update);
      removeEventListener("beforeinstallprompt", capture);
    };
  }, []);
  const installApp = async () => {
    if (!installPrompt) {
      notify("可從瀏覽器選單將灣day安裝到裝置");
      return;
    }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") notify("灣day 已加入裝置");
    setInstallPrompt(undefined);
  };
  const open = tasks.filter((t) => !t.done),
    completed = tasks.filter((t) => t.done).length;
  const smartInsights = buildInsights({
    tasks,
    health,
    focusLogs,
    studyLogs,
    date: currentDate(),
  });
  const top = open
    .filter((t) => t.quadrant === "Q1" || t.quadrant === "Q2")
    .slice(0, 3);
  const toggle = (id: number) =>
    setTasks((v) => v.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id: number) => {
    const item = tasks.find((x) => x.id === id);
    if (!item || !window.confirm(`確定刪除「${item.title}」？`)) return;
    setTasks((v) => v.filter((t) => t.id !== id));
    setUndo({ label: "復原刪除", run: () => setTasks((v) => [item, ...v]) });
    notify("任務已刪除");
  };
  const deleteNote = (id: number) => {
    const item = notes.find((x) => x.id === id);
    if (!item || !window.confirm(`確定刪除「${item.title}」？`)) return;
    setNotes((v) => v.filter((x) => x.id !== id));
    setUndo({ label: "復原刪除", run: () => setNotes((v) => [item, ...v]) });
    notify("筆記已刪除");
  };
  const deleteGoal = (id: number) => {
    const item = goals.find((x) => x.id === id);
    if (!item || !window.confirm(`確定刪除目標「${item.title}」？`)) return;
    setGoals((v) => v.filter((x) => x.id !== id));
    setUndo({ label: "復原刪除", run: () => setGoals((v) => [...v, item]) });
    notify("目標已刪除");
  };
  const deleteProject = (id: number) => {
    const item = projects.find((x) => x.id === id);
    if (!item || !window.confirm(`確定刪除專案「${item.title}」？`)) return;
    setProjects((v) => v.filter((x) => x.id !== id));
    setUndo({ label: "復原刪除", run: () => setProjects((v) => [...v, item]) });
    notify("專案已刪除");
  };
  const deleteRecord = <T extends { id: number }>(
    item: T,
    setter: Dispatch<SetStateAction<T[]>>,
    label: string,
  ) => {
    if (!window.confirm(`確定刪除這筆${label}？`)) return;
    setter((current) => current.filter((record) => record.id !== item.id));
    setUndo({
      label: "復原刪除",
      run: () => setter((current) => [item, ...current]),
    });
    notify(`${label}已刪除`);
  };
  const addTask = (capture: CaptureSuggestion) => {
    setTasks((v) => [
      {
        id: Date.now(),
        title: capture.title,
        done: false,
        quadrant: capture.quadrant,
        estimate: capture.estimate,
        project: "收集匣",
        category: capture.category,
        energy: capture.energy,
        due: capture.due,
        inbox: true,
        captureKind: capture.kind,
        sourceText: capture.raw,
      },
      ...v,
    ]);
    setQuick(false);
    notify("已加入收集匣");
  };
  const navigate = (name: string) => {
    setActive(name);
    setSidebar(false);
  };
  const planPages = ["計畫", "任務", "目標", "專案"];
  const lifePages = [
    "生活",
    "學習模式",
    "考試",
    "健康",
    "工作",
    "財務",
    "投資",
    "習慣",
    "日記",
    "筆記",
  ];
  const navIsActive = (name: string) =>
    name === "計畫"
      ? planPages.includes(active)
      : name === "行程"
        ? ["行程", "行事曆"].includes(active)
        : name === "生活"
          ? lifePages.includes(active)
          : active === name;
  const planTabs = (
    <HubTabs
      items={[
        ["任務", "計畫"],
        ["目標", "目標"],
        ["專案", "專案"],
      ]}
      active={active}
      navigate={navigate}
    />
  );
  const setPreset = (minutes: number) => {
    setFocusPreset(minutes);
    setFocusSeconds(minutes * 60);
    setFocusRunning(false);
  };
  const exportData = () => {
    const payload = {
      version: 4,
      exportedAt: new Date().toISOString(),
      profile,
      tasks,
      goals,
      projects,
      habits,
      journal,
      notes,
      health,
      works,
      workLogs,
      exams,
      mocks,
      accounts,
      finance,
      holdings,
      investmentTx,
      waiting,
      focusLogs,
      studyLogs,
      mistakes,
      exerciseLogs,
      sleepLogs,
      bodyLogs,
      wellnessLogs,
      events,
      courses,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `growth-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    notify("備份檔已建立");
  };
  const importData = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (data.profile) setProfile(data.profile);
        if (Array.isArray(data.tasks)) setTasks(data.tasks);
        if (Array.isArray(data.goals)) setGoals(data.goals);
        if (Array.isArray(data.projects)) setProjects(data.projects);
        if (Array.isArray(data.habits)) setHabits(data.habits);
        if (Array.isArray(data.journal)) setJournal(data.journal);
        if (Array.isArray(data.notes)) setNotes(data.notes);
        if (data.health) setHealth(data.health);
        if (Array.isArray(data.works)) setWorks(data.works);
        if (Array.isArray(data.workLogs)) setWorkLogs(data.workLogs);
        if (Array.isArray(data.exams)) setExams(data.exams);
        if (Array.isArray(data.mocks)) setMocks(data.mocks);
        if (Array.isArray(data.accounts)) setAccounts(data.accounts);
        if (Array.isArray(data.finance)) setFinance(data.finance);
        if (Array.isArray(data.holdings)) setHoldings(data.holdings);
        if (Array.isArray(data.investmentTx))
          setInvestmentTx(data.investmentTx);
        if (Array.isArray(data.waiting)) setWaiting(data.waiting);
        if (Array.isArray(data.focusLogs)) setFocusLogs(data.focusLogs);
        if (Array.isArray(data.studyLogs)) setStudyLogs(data.studyLogs);
        if (Array.isArray(data.mistakes)) setMistakes(data.mistakes);
        if (Array.isArray(data.exerciseLogs))
          setExerciseLogs(data.exerciseLogs);
        if (Array.isArray(data.sleepLogs)) setSleepLogs(data.sleepLogs);
        if (Array.isArray(data.bodyLogs)) setBodyLogs(data.bodyLogs);
        if (Array.isArray(data.wellnessLogs))
          setWellnessLogs(data.wellnessLogs);
        if (Array.isArray(data.events)) setEvents(data.events);
        if (Array.isArray(data.courses)) setCourses(data.courses);
        notify("資料已成功匯入");
      } catch {
        notify("匯入失敗：檔案格式不正確");
      }
    };
    reader.readAsText(file);
  };
  const resetData = () => {
    if (
      !window.confirm(
        "確定要清除這個帳號的個人資料並恢復示範內容嗎？此操作無法復原。",
      )
    )
      return;
    const prefix = `growth-user:${storageScope}:`;
    Object.keys(localStorage)
      .filter((k) => k.startsWith(prefix))
      .forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  };
  const editValues = () => {
    if (!formKind || editId === undefined) return undefined;
    const entity =
      formKind === "goal"
        ? goals.find((x) => x.id === editId)
        : formKind === "project"
          ? projects.find((x) => x.id === editId)
          : formKind === "work"
            ? works.find((x) => x.id === editId)
            : formKind === "exam"
              ? exams.find((x) => x.id === editId)
              : formKind === "account"
                ? accounts.find((x) => x.id === editId)
                : formKind === "holding"
                  ? holdings.find((x) => x.id === editId)
                  : formKind === "note"
                    ? notes.find((x) => x.id === editId)
                    : formKind === "journal"
                      ? journal.find((x) => x.id === editId)
                      : formKind === "habit"
                        ? habits.find((x) => x.id === editId)
                        : undefined;
    return entity as unknown as Record<string, string | number> | undefined;
  };
  const activeFormConfig = () => {
    if (!formKind) return undefined;
    const base = formConfigs[formKind];
    const values = editValues();
    return {
      ...base,
      title:
        editId === undefined
          ? base.title
          : `編輯${base.title.replace("新增", "").replace("建立", "")}`,
      submitLabel: editId === undefined ? "儲存" : "更新",
      fields: (formKind === "event"
        ? [...base.fields, { name: "endDate", label: "結束日期", type: "date" as const, required: true }, { name: "recurrenceEnd", label: "重複到哪一天", type: "date" as const, required: true, visibleWhen: (formValues: Record<string, string>) => formValues.recurrence !== "無" }]
        : base.fields).map((field) => ({
        ...field,
        defaultValue: values?.[field.name] ?? (formKind === "exam" && field.name === "name" && examCourseName ? `${examCourseName}考試` : field.defaultValue),
      })),
    };
  };
  const openEdit = (kind: Exclude<FormKind, null>, id: number) => {
    setEditId(id);
    setFormKind(kind);
  };
  const deleteEditingRecord = () => {
    if (editId === undefined || !formKind) return;
    const actions: Partial<Record<Exclude<FormKind, null>, () => void>> = {
      goal: () => {
        const item = goals.find((x) => x.id === editId);
        if (item) deleteRecord(item, setGoals, "目標");
      },
      project: () => {
        const item = projects.find((x) => x.id === editId);
        if (item) deleteRecord(item, setProjects, "專案");
      },
      work: () => {
        const item = works.find((x) => x.id === editId);
        if (item) deleteRecord(item, setWorks, "工作");
      },
      exam: () => {
        const item = exams.find((x) => x.id === editId);
        if (item) deleteRecord(item, setExams, "考試");
      },
      account: () => {
        const item = accounts.find((x) => x.id === editId);
        if (item) deleteRecord(item, setAccounts, "帳戶");
      },
      holding: () => {
        const item = holdings.find((x) => x.id === editId);
        if (item) deleteRecord(item, setHoldings, "持倉");
      },
      note: () => {
        const item = notes.find((x) => x.id === editId);
        if (item) deleteRecord(item, setNotes, "筆記");
      },
      journal: () => {
        const item = journal.find((x) => x.id === editId);
        if (item) deleteRecord(item, setJournal, "日記");
      },
      habit: () => {
        const item = habits.find((x) => x.id === editId);
        if (item) deleteRecord(item, setHabits, "習慣");
      },
    };
    actions[formKind]?.();
    setFormKind(null);
    setExamCourseName("");
    setEditId(undefined);
  };
  const createRecord = (values: Record<string, string>) => {
    const id = Date.now();
    const num = (key: string) => Number(values[key]) || 0;
    switch (formKind) {
      case "goal": {
        const item = {
          id: editId ?? id,
          title: values.title,
          area: values.area,
          current: num("current"),
          target: num("target"),
          unit: values.unit,
          deadline: values.deadline,
          color: goals.find((x) => x.id === editId)?.color || uiColors.study,
          reason: values.reason,
        };
        setGoals((v) =>
          editId === undefined
            ? [...v, item]
            : v.map((x) => (x.id === editId ? item : x)),
        );
        break;
      }
      case "futureGoal": {
        const futureColors:Record<string,string>={學習:uiColors.study,職涯:uiColors.work,旅行:uiColors.finance,健康:uiColors.health,生活:uiColors.brand,成長:uiColors.accent};
        const item:Goal={id,title:values.title,area:values.area,role:"future",current:0,target:1,unit:"",deadline:values.deadline,color:futureColors[values.area]||uiColors.brand,reason:values.reason};
        setGoals(current=>[...current,item]);
        break;
      }
      case "project": {
        const old = projects.find((x) => x.id === editId);
        const item: Project = {
          id: editId ?? id,
          title: values.title,
          area: values.area,
          role: values.role || profile.roles[0] || "個人成長",
          description: values.description,
          goal: values.goal,
          owner: values.owner || "自己",
          startDate: values.startDate,
          weeklyCapacity: num("weeklyCapacity") || 10,
          risk: values.risk,
          progress: old?.progress || 0,
          deadline: values.deadline,
          status: values.status as Project["status"],
          color: old?.color || uiColors.brand,
          completedAt: old?.completedAt,
          archivedAt: old?.archivedAt,
          retrospective: old?.retrospective,
          collaborators: old?.collaborators,
        };
        setProjects((v) =>
          editId === undefined
            ? [...v, item]
            : v.map((x) => (x.id === editId ? item : x)),
        );
        break;
      }
      case "work": {
        const item = {
          id: editId ?? id,
          name: values.name,
          organization: values.organization,
          role: values.role,
          type: values.type,
          rate: num("rate"),
          unit: values.unit,
          status: "進行中" as const,
          weekday: num("weekday"),
          start: values.start,
          end: values.end,
          startDate: values.startDate,
          endDate: values.endDate,
          location: values.location,
        };
        setWorks((v) =>
          editId === undefined
            ? [...v, item]
            : v.map((x) => (x.id === editId ? item : x)),
        );
        break;
      }
      case "course": {
        const course:Course={id:editId??id,name:values.name,instructor:values.instructor,location:values.location,weekday:num("weekday"),start:values.start,end:values.end,startDate:values.startDate,endDate:values.endDate};
        setCourses(current=>editId===undefined?[...current,course]:current.map(item=>item.id===editId?course:item));
        setEvents(current=>[...current.filter(event=>!(event.sourceType==="course"&&event.sourceId===course.id)),{id:Date.now()+2,title:course.name,date:alignToWeekday(course.startDate,course.weekday),endDate:course.endDate,start:course.start,end:course.end,category:"課程",recurrence:"每週",recurrenceEnd:course.endDate,note:[course.instructor,course.location].filter(Boolean).join("・"),sourceType:"course",sourceId:course.id}]);
        break;
      }
      case "exam": {
        const old = exams.find((x) => x.id === editId);
        const item = {
          id: editId ?? id,
          name: values.name,
          type: values.type,
          date: values.date,
          current: num("current"),
          target: num("target"),
          status: old?.status || "準備中",
          subjects: old?.subjects || [],
        };
        setExams((v) =>
          editId === undefined
            ? [...v, item]
            : v.map((x) => (x.id === editId ? item : x)),
        );
        setEvents(current=>[...current.filter(event=>!(event.sourceType==="exam"&&event.sourceId===item.id)),{id:Date.now()+3,title:item.name,date:item.date,endDate:item.date,start:values.start,end:values.end,category:"考試",recurrence:"無",note:item.type,sourceType:"exam",sourceId:item.id}]);
        break;
      }
      case "transaction": {
        const amount = num("amount");
        const type = values.type as FinanceTransaction["type"];
        setFinance((v) => [
          {
            id,
            accountId: accounts[0]?.id || 1,
            type,
            category: values.category,
            amount,
            date: values.date,
            endDate: values.endDate,
            note: values.note,
          },
          ...v,
        ]);
        setAccounts((v) =>
          v.map((a, i) =>
            i === 0
              ? {
                  ...a,
                  balance: a.balance + (type === "收入" ? amount : -amount),
                }
              : a,
          ),
        );
        break;
      }
      case "account": {
        const item = {
          id: editId ?? id,
          name: values.name,
          type: values.type,
          balance: num("balance"),
          color:
            accounts.find((x) => x.id === editId)?.color || uiColors.finance,
        };
        setAccounts((v) =>
          editId === undefined
            ? [...v, item]
            : v.map((x) => (x.id === editId ? item : x)),
        );
        break;
      }
      case "holding": {
        const holding: Holding = {
          id,
          symbol: values.symbol.toUpperCase(),
          name: values.name,
          type: values.type,
          quantity: num("quantity"),
          avgPrice: num("price"),
          currentPrice: num("price"),
          color: uiColors.finance,
        };
        setHoldings((v) => [...v, holding]);
        setInvestmentTx((v) => [
          {
            id: id + 1,
            holdingId: id,
            action: "買入",
            quantity: holding.quantity,
            price: holding.avgPrice,
            date: values.date,
          },
          ...v,
        ]);
        break;
      }
      case "note": {
        const item = {
          id: editId ?? id,
          title: values.title,
          content: values.content,
          tag: values.tag,
          updated: "剛剛",
        };
        setNotes((v) =>
          editId === undefined
            ? [item, ...v]
            : v.map((x) => (x.id === editId ? item : x)),
        );
        break;
      }
      case "journal": {
        const item = {
          id: editId ?? id,
          title: values.title,
          type: values.type,
          content: values.content,
          mood: Math.min(5, Math.max(1, num("mood"))),
          date: journal.find((x) => x.id === editId)?.date || currentDate(),
        };
        setJournal((v) =>
          editId === undefined
            ? [item, ...v]
            : v.map((x) => (x.id === editId ? item : x)),
        );
        break;
      }
      case "habit": {
        const old = habits.find((x) => x.id === editId);
        const item = {
          id: editId ?? id,
          name: values.name,
          category: values.category,
          streak: old?.streak || 0,
          days: old?.days || [false, false, false, false, false, false, false],
        };
        setHabits((v) =>
          editId === undefined
            ? [...v, item]
            : v.map((x) => (x.id === editId ? item : x)),
        );
        break;
      }
      case "waiting":
        setWaiting((v) => [
          ...v,
          {
            id,
            title: values.title,
            kind: "waiting",
            followUp: values.followUp,
            note: values.note,
            done: false,
          },
        ]);
        break;
      case "someday":
        setWaiting((v) => [
          ...v,
          {
            id,
            title: values.title,
            kind: "someday",
            note: values.note,
            done: false,
          },
        ]);
        break;
      case "study":
        setStudyLogs((v) => [
          {
            id,
            examId: exams[0]?.id || 0,
            subject: values.subject,
            minutes: num("minutes"),
            questions: num("questions"),
            correct: num("correct"),
            date: values.date,
          },
          ...v,
        ]);
        break;
      case "mistake":
        setMistakes((v) => [
          {
            id,
            examId: exams[0]?.id || 0,
            subject: values.subject,
            source: values.source,
            reason: values.reason,
            concept: values.concept,
            reviewed: false,
          },
          ...v,
        ]);
        break;
      case "exercise":
        setExerciseLogs((v) => [
          {
            id,
            type: values.type,
            duration: num("duration"),
            intensity: values.intensity,
            date: values.date,
          },
          ...v,
        ]);
        break;
      case "sleep": {
        const hours = num("hours");
        setSleepLogs((v) => [
          { id, hours, quality: num("quality"), date: values.date },
          ...v,
        ]);
        setHealth((v) => ({ ...v, sleep: hours }));
        break;
      }
      case "body":
        setBodyLogs((v) => [
          {
            id,
            weight: num("weight"),
            bodyFat: num("bodyFat"),
            waist: num("waist"),
            date: values.date,
          },
          ...v,
        ]);
        break;
      case "symptom":
        setWellnessLogs((v) => [
          {
            id,
            kind: "symptom",
            name: values.name,
            note: values.note,
            date: values.date,
          },
          ...v,
        ]);
        break;
      case "recovery":
        setWellnessLogs((v) => [
          {
            id,
            kind: "recovery",
            name: values.name,
            note: values.note,
            minutes: num("minutes"),
            date: values.date,
          },
          ...v,
        ]);
        break;
      case "event":
        setEvents((v) => [
          ...v,
          {
            id,
            title: values.title,
            date: values.date,
            start: values.start,
            end: values.end,
            category: values.category,
            recurrence: values.recurrence as CalendarEvent["recurrence"],
            recurrenceEnd: values.recurrence === "無" ? undefined : values.recurrenceEnd,
            note: values.note,
          },
        ]);
        break;
    }
    setFormKind(null);
    setEditId(undefined);
    notify(editId === undefined ? "新紀錄已儲存" : "變更已更新");
  };

  const dashboard = (
    <>
      <section className="welcome">
        <div>
          <p className="eyebrow">2026 年 8 月 13 日・星期四</p>
          <h1>
            早安，{profile.name || "夥伴"} <span>👋</span>
          </h1>
          <p>今天不是要把所有事做完，而是把重要的事向前推進。</p>
        </div>
        <button className="primary" onClick={() => setQuick(true)}>
          <Plus size={18} />
          新增任務
        </button>
      </section>
      <section className="status-strip">
        <div>
          <span className="status-icon coral">
            <Check />
          </span>
          <p>
            <b>{completed}</b>
            <small>今日完成</small>
          </p>
        </div>
        <div>
          <span className="status-icon green">
            <Clock3 />
          </span>
          <p>
            <b>3.2 hr</b>
            <small>預計專注</small>
          </p>
        </div>
        <div>
          <span className="status-icon gold">
            <Target />
          </span>
          <p>
            <b>72%</b>
            <small>本週進度</small>
          </p>
        </div>
        <div>
          <span className="status-icon blue">
            <Flame />
          </span>
          <p>
            <b>12 天</b>
            <small>持續前進</small>
          </p>
        </div>
      </section>
      <div className="grid">
        <section className="card top3">
          <div className="card-head">
            <div>
              <span className="kicker">今日核心</span>
              <h2>Today's Top 3</h2>
            </div>
            <span className="count">{top.length} / 3</span>
          </div>
          {top.map((t, i) => (
            <TaskRow key={t.id} task={t} number={i + 1} onToggle={toggle} />
          ))}
          <button className="text-btn" onClick={() => navigate("今天")}>
            查看所有今日任務 <ChevronRight size={16} />
          </button>
        </section>
        <section className="card next">
          <div className="card-head">
            <div>
              <span className="kicker">接下來</span>
              <h2>Next Event</h2>
            </div>
            <CalendarDays size={20} />
          </div>
          <div className="event">
            <div className="time">
              <b>14:00</b>
              <span>15:30</span>
            </div>
            <div>
              <span className="tag">研究</span>
              <h3>研究室週會</h3>
              <p>研究大樓 R302・90 分鐘</p>
            </div>
          </div>
          <div className="capacity">
            <div>
              <span>今日容量</span>
              <b>6.5 / 8 小時</b>
            </div>
            <div className="bar">
              <i style={{ width: "81%" }} />
            </div>
            <small>剩餘 1.5 小時可安排</small>
          </div>
        </section>
        <section className="card goals">
          <div className="card-head">
            <div>
              <span className="kicker">正在前進</span>
              <h2>目標進度</h2>
            </div>
            <button className="dots" onClick={() => navigate("目標")}>
              <MoreHorizontal />
            </button>
          </div>
          {goals.map((g) => (
            <GoalLine key={g.id} goal={g} />
          ))}
        </section>
        <section className="card matrix">
          <div className="card-head">
            <div>
              <span className="kicker">優先順序</span>
              <h2>Eisenhower Matrix</h2>
            </div>
            <span className="count">{open.length} 項</span>
          </div>
          <Matrix tasks={open} toggle={toggle} />
        </section>
        <section className="card focus-card">
          <div className="focus-copy">
            <span className="kicker light">專注中心</span>
            <h2>
              準備好進入
              <br />
              深度工作了嗎？
            </h2>
            <p>選一件重要的事，給它完整的注意力。</p>
            <button onClick={() => notify("專注計時已啟動：25:00")}>
              <TimerReset size={18} />
              開始 25 分鐘
            </button>
          </div>
          <div className="timer-ring">
            <span>25</span>
            <small>MIN</small>
          </div>
        </section>
        <section className="card chart">
          <div className="card-head">
            <div>
              <span className="kicker">本週洞察</span>
              <h2>專注時間</h2>
            </div>
            <b>21.3 小時</b>
          </div>
          <div className="chart-wrap">
            <Suspense fallback={<ChartSkeleton />}>
              <FocusTrendChart />
            </Suspense>
          </div>
        </section>
      </div>
    </>
  );

  const renderPage = () => {
    if (active === "總覽") return dashboard;
    if (active === "今天")
      return (
        <>
          <TodayPage
            tasks={tasks}
            health={health}
            profile={profile}
            setHealth={setHealth}
            onToggle={toggle}
            onAdd={() => setQuick(true)}
            onOpenTasks={() => navigate("計畫")}
            onOpenCapacity={() => navigate("行程")}
            onFocus={(taskId,minutes) => {
              setFocusKind("task");
              setFocusEntityId(taskId);
              setPreset(minutes);
              navigate("專注");
            }}
          />
          {smartInsights
            .filter((item) => item.placement === "today")
            .slice(0, 2)
            .map((item) => (
              <SmartInsightCard
                insight={item}
                onAction={navigate}
                key={item.id}
              />
            ))}
        </>
      );
    if (active === "計畫" || active === "任務")
      return (
        <>
          {planTabs}
          <TaskListPage
            tasks={tasks}
            setTasks={setTasks}
            waiting={waiting}
            setWaiting={setWaiting}
            categories={taskCategories}
            setCategories={setTaskCategories}
            onToggle={toggle}
            onDelete={remove}
            onDeleteWaiting={(item) => deleteRecord(item, setWaiting, item.kind === "waiting" ? "等待項目" : "以後再做項目")}
            onEdit={setEditingTaskId}
            onAdd={() => setQuick(true)}
          />
          <CategoryManager
            categories={taskCategories}
            setCategories={setTaskCategories}
            setTasks={setTasks}
          />
          <RestartPanel
            tasks={tasks}
            setTasks={setTasks}
            setWaiting={setWaiting}
            notify={notify}
          />
        </>
      );
    if (active === "收集匣")
      return (
        <>
          <PageTitle name={active} onAdd={() => setQuick(true)} />
          <section className="card inbox-page">
            <div className="inbox-intro">
              <div className="big-icon">
                <Inbox />
              </div>
              <div>
                <h2>{tasks.filter((t) => t.inbox).length} 個項目等待釐清</h2>
                <p>為項目指定優先象限與所屬專案，然後開始行動。</p>
              </div>
            </div>
            {tasks
              .filter((t) => t.inbox)
              .map((t) => (
                <div className="clarify" key={t.id}>
                  <TaskRow task={t} onToggle={toggle} onDelete={remove} />
                  <select
                    value={t.quadrant}
                    onChange={(e) =>
                      setTasks((v) =>
                        v.map((x) =>
                          x.id === t.id
                            ? {
                                ...x,
                                quadrant: e.target.value as Quadrant,
                                inbox: false,
                              }
                            : x,
                        ),
                      )
                    }
                  >
                    <option value="Q1">Q1 立即做</option>
                    <option value="Q2">Q2 排程做</option>
                    <option value="Q3">Q3 減少／委派</option>
                    <option value="Q4">Q4 降低投入</option>
                  </select>
                </div>
              ))}
            {!tasks.some((t) => t.inbox) && <Empty />}
          </section>
        </>
      );
    if (active === "目標")
      return (
        <>
          <PageTitle name={active} onAdd={() => setFormKind("goal")} />
          <section className="goal-cards">
            {goals.map((g) => (
              <article className="goal-card card" key={g.id}>
                <span className="area-pill">{g.area}</span>
                <h2 className="editable-title">
                  {g.title}
                  <button
                    aria-label="編輯目標"
                    onClick={() => openEdit("goal", g.id)}
                  >
                    <PenLine />
                  </button>
                  <button
                    aria-label="刪除目標"
                    onClick={() => deleteGoal(g.id)}
                  >
                    <Trash2 />
                  </button>
                </h2>
                <p>{g.reason}</p>
                <GoalLine goal={g} />
                <div className="goal-actions">
                  <button
                    onClick={() =>
                      setGoals((v) =>
                        v.map((x) =>
                          x.id === g.id
                            ? {
                                ...x,
                                current: Math.min(
                                  x.target,
                                  x.current +
                                    Math.max(1, Math.round(x.target * 0.05)),
                                ),
                              }
                            : x,
                        ),
                      )
                    }
                  >
                    <Plus size={15} />
                    推進一小步
                  </button>
                  <span>期限 {g.deadline}</span>
                </div>
              </article>
            ))}
          </section>
        </>
      );
    if (active === "專案")
      return (
        <>
          <ProjectPage
            projects={projects.filter((project) => !project.archivedAt)}
            tasks={tasks}
            setTasks={setTasks}
            onAddProject={() => setFormKind("project")}
            onEditProject={(id) => openEdit("project", id)}
            onDeleteProject={deleteProject}
            onAddTask={(task,start,end)=>{
              setTasks(current=>[...current,task]);
              setEvents(current=>[{id:task.id+1,title:task.title,date:task.due||currentDate(),endDate:task.due||currentDate(),start:/^\d{2}:\d{2}$/.test(start)?start:"09:00",end:/^\d{2}:\d{2}$/.test(end)?end:"10:00",category:"專案",recurrence:"無",note:task.project,sourceType:"task",sourceId:task.id},...current]);
              notify("專案任務已同步到行程");
            }}
          />
          <ProjectLifecyclePanel
            projects={projects}
            setProjects={setProjects}
            tasks={tasks}
            setTasks={setTasks}
          />
        </>
      );
    if (active === "行程" || active === "行事曆")
      return (
        <>
          <PageTitle name="行程" onAdd={() => setFormKind("event")} />
          {smartInsights
            .filter((item) => item.placement === "calendar")
            .map((item) => (
              <SmartInsightCard
                insight={item}
                onAction={navigate}
                key={item.id}
              />
            ))}
          <CalendarPage
            tasks={tasks}
            setTasks={setTasks}
            events={events}
            setEvents={setEvents}
            projects={projects}
            roles={profile.roles}
            health={health}
            onUndo={(item) => {
              setUndo({
                label: "復原刪除",
                run: () => setEvents((v) => [...v, item]),
              });
              notify("事件已刪除");
            }}
          />
        </>
      );
    if (active === "容量")
      return (
        <>
          <PageTitle name={active} onAdd={() => notify("容量設定已儲存")} />
          <CapacityPage
            tasks={open}
            projects={projects}
            roles={profile.roles}
            health={health}
          />
        </>
      );
    if (active === "分析" || active === "成長報告")
      return (
        <>
          {smartInsights
            .filter((item) => item.placement === "report")
            .map((item) => (
              <SmartInsightCard
                insight={item}
                onAction={navigate}
                key={item.id}
              />
            ))}
          <AnalyticsPage
            tasks={tasks}
            workLogs={workLogs}
            finance={finance}
            holdings={holdings}
            exams={exams}
            health={health}
          />
          <ReviewPage
            mode={reviewMode}
            setMode={setReviewMode}
            checks={reviewChecks}
            setChecks={setReviewChecks}
            tasks={tasks}
            projects={projects}
            inbox={tasks.filter((t) => t.inbox).length}
          />
        </>
      );
    if (active === "生活")
      return (
        <>
          <PageTitle name="生活" />
          <HubLauncher
            items={[
              ["學習", "學習模式", "今日目標、科目 Focus 與學習紀錄"],
              ["健康", "健康", "睡眠、能量與身體狀態"],
              ["工作", "工作", "工作身分、工時與收入"],
              ["財務", "財務", "帳戶、收支、預算與投資"],
              ["習慣", "習慣", "每日與每週的持續行動"],
              ["紀錄", "日記", "日記、心情與筆記"],
            ]}
            navigate={navigate}
          />
          <section className="card future-goals">
            <div className="card-head"><div><span className="kicker">FUTURE GOALS</span><h2>未來目標</h2><p>只記錄方向、標籤與期待日期，不需要設定目標數值。</p></div><button className="outline-btn" onClick={()=>setFormKind("futureGoal")}><Plus/>新增未來目標</button></div>
            <div className="future-goal-grid">{goals.filter(goal=>goal.role==="future").map(goal=><article style={{borderTopColor:goal.color}} key={goal.id}><span style={{background:goal.color}}>{goal.area}</span><time>{goal.deadline}</time><strong>{goal.title}</strong><p>{goal.reason}</p><button className="record-delete" aria-label={`刪除${goal.title}`} onClick={()=>deleteGoal(goal.id)}><Trash2/></button></article>)}</div>
          </section>
        </>
      );
    if (active === "學習模式")
      return (
        <>
          {smartInsights
            .filter((item) => item.placement === "learning")
            .map((item) => (
              <SmartInsightCard
                insight={item}
                onAction={navigate}
                key={item.id}
              />
            ))}
          <LearningPage
            courses={courses}
            exams={exams}
            studyLogs={studyLogs}
            dailyGoal={studyDailyGoal}
            onStartFocus={(examId, subject, minutes) => {
              setFocusKind("learning");
              setFocusEntityId(examId);
              setFocusSubject(subject);
              setPreset(minutes);
              navigate("專注");
            }}
            onAddCourse={() => setFormKind("course")}
            onDeleteCourse={(course) => {
              if (!window.confirm(`確定刪除課程「${course.name}」？`)) return;
              setCourses((current) => current.filter((item) => item.id !== course.id));
              setEvents((current) => current.filter((event) => !(event.sourceType === "course" && event.sourceId === course.id)));
              notify("課程與對應行程已刪除");
            }}
            onAddTask={(course, title, date, start, end) => {
              const taskId=Date.now();
              setTasks((current) => [{id:taskId,title,done:false,quadrant:"Q2",estimate:30,project:course.name,category:"學習",energy:"中",status:"待辦",due:date},...current]);
              setEvents(current=>[{id:taskId+1,title,date,endDate:date,start,end,category:"課程",recurrence:"無",note:course.name,sourceType:"task",sourceId:taskId},...current]);
              notify(`已加入「${course.name}」並排進行程`);
            }}
            onAddExam={(course) => {setExamCourseName(course.name);setFormKind("exam")}}
            onOpenExams={() => navigate("考試")}
          />
        </>
      );
    if (active === "一起")
      return (
        <TogetherPage
          focusLogs={focusLogs}
          onStartTogether={(activity, minutes) => {
            setFocusKind("custom");
            setFocusCustomTitle(activity);
            setPreset(minutes);
            navigate("專注");
          }}
        />
      );
    if (active === "工作") return <WorkSchedulePage works={works} tasks={tasks} events={events} onAdd={()=>setFormKind("work")} onEdit={(id)=>openEdit("work",id)} onDelete={(work)=>{if(!window.confirm(`確定刪除工作身分「${work.name}」？`))return;setWorks(current=>current.filter(item=>item.id!==work.id));setEvents(current=>current.filter(event=>!(event.sourceType==="work"&&event.sourceId===work.id)));notify("工作身分與對應班次已刪除")}} onToggleTask={toggle} onDeleteTask={(task)=>{if(!window.confirm(`確定刪除工作待辦「${task.title}」？`))return;setTasks(current=>current.filter(item=>item.id!==task.id));setEvents(current=>current.filter(event=>!(event.sourceType==="task"&&event.sourceId===task.id)));notify("工作待辦與對應行程已刪除")}} onDeleteShift={(shift)=>{setEvents(current=>current.filter(event=>event.id!==shift.id));notify("工作時間已從行程移除")}} onAddShift={({workId,date,start,end,location})=>{
      const work=works.find(item=>item.id===workId); if(!work)return;
      setEvents(current=>[{id:Date.now(),title:`${work.name}・工作時間`,date,endDate:date,start,end,category:"工作",recurrence:"無",note:location||work.organization,sourceType:"work",sourceId:work.id},...current]);
      notify("工作時間已同步到行程");
    }} onAddTask={({workId,title,date,start,end})=>{
      const work=works.find(item=>item.id===workId); if(!work)return; const taskId=Date.now();
      setTasks(current=>[{id:taskId,title,done:false,quadrant:"Q2",estimate:30,project:work.name,category:"工作",energy:"中",status:"待辦",due:date},...current]);
      setEvents(current=>[{id:taskId+1,title,date,endDate:date,start,end,category:"工作",recurrence:"無",note:work.name,sourceType:"task",sourceId:taskId},...current]);
      notify("工作待辦已同步到行程");
    }}/>;
    if (active === "工作")
      return (
        <>
          <PageTitle name={active} onAdd={() => setFormKind("work")} />
          <section className="work-summary">
            <SummaryCard
              label="本月工時"
              value={`${(workLogs.reduce((a, x) => a + x.duration, 0) / 60).toFixed(1)} hr`}
              sub="跨 3 個工作身份"
              icon={<Clock3 />}
            />
            <SummaryCard
              label="本月收入"
              value={`NT$ ${workLogs
                .filter((x) => x.paid)
                .reduce((a, x) => a + x.income, 0)
                .toLocaleString()}`}
              sub="已入帳金額"
              icon={<Wallet />}
            />
            <SummaryCard
              label="待收款"
              value={`NT$ ${workLogs
                .filter((x) => !x.paid)
                .reduce((a, x) => a + x.income, 0)
                .toLocaleString()}`}
              sub={`${workLogs.filter((x) => !x.paid).length} 筆待處理`}
              icon={<TriangleAlert />}
            />
          </section>
          <section className="work-layout">
            <div>
              <div className="section-heading">
                <div>
                  <span className="kicker">WORK PROFILES</span>
                  <h2>我的工作身份</h2>
                </div>
              </div>
              <div className="work-profiles">
                {works.map((w) => (
                  <article className="card work-profile" key={w.id}>
                    <header>
                      <span>{w.type}</span>
                      <em>{w.status}</em>
                    </header>
                    <h2 className="editable-title">
                      {w.name}
                      <button
                        aria-label="編輯工作"
                        onClick={() => openEdit("work", w.id)}
                      >
                        <PenLine />
                      </button>
                      <button aria-label="刪除工作" onClick={() => deleteRecord(w, setWorks, "工作")}><Trash2 /></button>
                    </h2>
                    <p>
                      {w.organization}・{w.role}
                    </p>
                    <footer>
                      <strong>NT$ {w.rate.toLocaleString()}</strong>
                      <span>/ {w.unit}</span>
                    </footer>
                  </article>
                ))}
              </div>
            </div>
            <aside className="card receivable">
              <span className="kicker">RECEIVABLE</span>
              <h2>待收款項</h2>
              {workLogs
                .filter((x) => !x.paid)
                .map((log) => {
                  const work = works.find((w) => w.id === log.workId);
                  return (
                    <div className="receivable-row" key={log.id}>
                      <div>
                        <b>{log.task}</b>
                        <span>
                          {work?.name}・{log.date}
                        </span>
                      </div>
                      <strong>NT$ {log.income.toLocaleString()}</strong>
                      <button
                        onClick={() =>
                          setWorkLogs((v) =>
                            v.map((x) =>
                              x.id === log.id ? { ...x, paid: true } : x,
                            ),
                          )
                        }
                      >
                        標記收款
                      </button>
                    </div>
                  );
                })}
            </aside>
          </section>
          <section className="card work-log-table">
            <div className="card-head">
              <div>
                <span className="kicker">TIME LOG</span>
                <h2>近期工時紀錄</h2>
              </div>
              <button
                className="outline-btn"
                onClick={() => {
                  const w = works[0];
                  setWorkLogs((v) => [
                    {
                      id: Date.now(),
                      workId: w.id,
                      date: "2026-08-13",
                      duration: 60,
                      task: "新的工作紀錄",
                      income: w.rate,
                      paid: false,
                    },
                    ...v,
                  ]);
                  notify("已新增 1 小時工作紀錄");
                }}
              >
                <Plus />
                新增紀錄
              </button>
            </div>
            <div className="data-table">
              <div className="data-head">
                <span>日期</span>
                <span>工作</span>
                <span>內容</span>
                <span>時間</span>
                <span>收入</span>
                <span>狀態</span>
              </div>
              {workLogs.map((l) => (
                <div className="data-row" key={l.id}>
                  <span>{l.date.slice(5)}</span>
                  <span>{works.find((w) => w.id === l.workId)?.name}</span>
                  <strong>{l.task}</strong>
                  <span>{l.duration / 60} hr</span>
                  <span>NT$ {l.income.toLocaleString()}</span>
                  <em className={l.paid ? "paid" : "pending"}>
                    {l.paid ? "已收款" : "待收款"}
                  </em>
                  <button className="record-delete" aria-label="刪除工時紀錄" onClick={() => deleteRecord(l, setWorkLogs, "工時紀錄")}><Trash2 /></button>
                </div>
              ))}
            </div>
          </section>
        </>
      );
    if (active === "財務") {
      const income =
        finance
          .filter((x) => x.type === "收入")
          .reduce((a, x) => a + x.amount, 0) +
        workLogs.filter((x) => x.paid).reduce((a, x) => a + x.income, 0);
      const expense = finance
        .filter((x) => x.type === "支出")
        .reduce((a, x) => a + x.amount, 0);
      const netWorth = accounts.reduce((a, x) => a + x.balance, 0);
      return (
        <>
          <PageTitle name={active} onAdd={() => setFormKind("transaction")} />
          <section className="finance-summary">
            <SummaryCard
              label="總資產"
              value={`NT$ ${netWorth.toLocaleString()}`}
              sub="所有現金與帳戶"
              icon={<Landmark />}
            />
            <SummaryCard
              label="本月收入"
              value={`NT$ ${income.toLocaleString()}`}
              sub="包含已收工作收入"
              icon={<ArrowUpRight />}
            />
            <SummaryCard
              label="本月支出"
              value={`NT$ ${expense.toLocaleString()}`}
              sub="較上月下降 8%"
              icon={<ArrowDownRight />}
            />
            <SummaryCard
              label="本月結餘"
              value={`NT$ ${(income - expense).toLocaleString()}`}
              sub={`${Math.round(((income - expense) / income) * 100)}% 儲蓄率`}
              icon={<PiggyBank />}
            />
          </section>
          <section className="finance-layout">
            <div className="card account-panel">
              <div className="card-head">
                <div>
                  <span className="kicker">ACCOUNTS</span>
                  <h2>我的帳戶</h2>
                </div>
                <button
                  className="outline-btn"
                  onClick={() => setFormKind("account")}
                >
                  <Plus />
                  新增
                </button>
              </div>
              {accounts.map((a) => (
                <div className="account-row" key={a.id}>
                  <span
                    className="account-mark"
                    style={{ background: a.color }}
                  >
                    <Wallet />
                  </span>
                  <div>
                    <b className="editable-title">
                      {a.name}
                      <button
                        aria-label="編輯帳戶"
                        onClick={() => openEdit("account", a.id)}
                      >
                        <PenLine />
                      </button>
                      <button aria-label="刪除帳戶" onClick={() => deleteRecord(a, setAccounts, "帳戶")}><Trash2 /></button>
                    </b>
                    <small>{a.type}</small>
                  </div>
                  <strong>NT$ {a.balance.toLocaleString()}</strong>
                </div>
              ))}
            </div>
            <div className="card budget-panel">
              <span className="kicker">MONTHLY BUDGET</span>
              <h2>預算使用狀況</h2>
              {budgets.map((b) => {
                const spent = finance
                  .filter((x) => x.type === "支出" && x.category === b.category)
                  .reduce((a, x) => a + x.amount, 0);
                const pct = Math.round((spent / b.limit) * 100);
                return (
                  <div className="budget-row" key={b.category}>
                    <div>
                      <b>{b.category}</b>
                      <span>
                        NT$ {spent.toLocaleString()} /{" "}
                        {b.limit.toLocaleString()}
                      </span>
                    </div>
                    <strong>{pct}%</strong>
                    <div className="bar">
                      <i
                        style={{
                          width: Math.min(100, pct) + "%",
                          background: b.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          <section className="finance-bottom">
            <div className="card transaction-list">
              <div className="card-head">
                <div>
                  <span className="kicker">TRANSACTIONS</span>
                  <h2>最近交易</h2>
                </div>
              </div>
              {finance.map((x) => (
                <div className="transaction-row" key={x.id}>
                  <span
                    className={
                      x.type === "收入" ? "tx-icon income" : "tx-icon expense"
                    }
                  >
                    {x.type === "收入" ? <ArrowUpRight /> : <ArrowDownRight />}
                  </span>
                  <div>
                    <b>{x.note}</b>
                    <small>
                      {x.category}・{x.date}
                    </small>
                  </div>
                  <strong className={x.type === "收入" ? "positive" : ""}>
                    {x.type === "收入" ? "+" : "-"} NT${" "}
                    {x.amount.toLocaleString()}
                  </strong>
                  <button className="record-delete" aria-label="刪除收支紀錄" onClick={() => deleteRecord(x, setFinance, "收支紀錄")}><Trash2 /></button>
                </div>
              ))}
            </div>
            <div className="card financial-goal">
              <CircleDollarSign />
              <span className="kicker">FINANCIAL GOAL</span>
              <h2>緊急預備金</h2>
              <strong>NT$ 60,000</strong>
              <p>目標 NT$ 100,000・2027 年 6 月</p>
              <div className="bar large">
                <i style={{ width: "60%" }} />
              </div>
              <small>60% 已完成</small>
            </div>
          </section>
        </>
      );
    }
    if (active === "投資") {
      const total = holdings.reduce(
        (a, h) => a + h.quantity * h.currentPrice,
        0,
      );
      const cost = holdings.reduce((a, h) => a + h.quantity * h.avgPrice, 0);
      const allocation = holdings.map((h) => ({
        name: h.symbol,
        value: Math.round(h.quantity * h.currentPrice),
        color: h.color,
      }));
      return (
        <>
          <PageTitle name={active} onAdd={() => setFormKind("holding")} />
          <section className="investment-hero">
            <div className="card portfolio-total">
              <span className="kicker">PORTFOLIO VALUE</span>
              <h2>投資組合總值</h2>
              <strong>NT$ {Math.round(total).toLocaleString()}</strong>
              <p className={total >= cost ? "positive" : "negative"}>
                {total >= cost ? "+" : ""} NT${" "}
                {Math.round(total - cost).toLocaleString()}（
                {(((total - cost) / cost) * 100).toFixed(1)}%）
              </p>
              <div className="portfolio-stats">
                <div>
                  <span>投入成本</span>
                  <b>NT$ {Math.round(cost).toLocaleString()}</b>
                </div>
                <div>
                  <span>持有資產</span>
                  <b>{holdings.length} 項</b>
                </div>
              </div>
            </div>
            <div className="card allocation-chart">
              <div>
                <span className="kicker">ALLOCATION</span>
                <h2>資產配置</h2>
              </div>
              <div className="pie-wrap">
                <Suspense fallback={<ChartSkeleton />}>
                  <AllocationPieChart data={allocation} />
                </Suspense>
              </div>
              <div className="allocation-legend">
                {allocation.map((x) => (
                  <span key={x.name}>
                    <i style={{ background: x.color }} />
                    {x.name}
                    <b>{Math.round((x.value / total) * 100)}%</b>
                  </span>
                ))}
              </div>
            </div>
          </section>
          <section className="card holdings-table">
            <div className="card-head">
              <div>
                <span className="kicker">HOLDINGS</span>
                <h2>目前持倉</h2>
              </div>
            </div>
            <div className="holding-head">
              <span>資產</span>
              <span>數量</span>
              <span>平均成本</span>
              <span>現價</span>
              <span>市值</span>
              <span>損益</span>
            </div>
            {holdings.map((h) => {
              const value = h.quantity * h.currentPrice;
              const pnl = (h.currentPrice - h.avgPrice) * h.quantity;
              return (
                <div className="holding-row" key={h.id}>
                  <div>
                    <span style={{ background: h.color }}>
                      {h.symbol.slice(0, 2)}
                    </span>
                    <b>
                      {h.symbol}
                      <small>
                        {h.name}・{h.type}
                      </small>
                    </b>
                  </div>
                  <span>{h.quantity}</span>
                  <span>{h.avgPrice.toLocaleString()}</span>
                  <span>{h.currentPrice.toLocaleString()}</span>
                  <strong>NT$ {Math.round(value).toLocaleString()}</strong>
                  <em className={pnl >= 0 ? "positive" : "negative"}>
                    {pnl >= 0 ? "+" : ""}
                    {Math.round(pnl).toLocaleString()}
                  </em>
                  <button className="record-delete" aria-label="刪除持倉" onClick={() => deleteRecord(h, setHoldings, "持倉")}><Trash2 /></button>
                </div>
              );
            })}
          </section>
          <section className="card investment-history">
            <div className="card-head">
              <div>
                <span className="kicker">ACTIVITY</span>
                <h2>投資交易紀錄</h2>
              </div>
            </div>
            {investmentTx.map((tx) => {
              const h = holdings.find((x) => x.id === tx.holdingId);
              return (
                <div className="investment-tx" key={tx.id}>
                  <span className={tx.action === "買入" ? "buy" : "sell"}>
                    {tx.action}
                  </span>
                  <div>
                    <b>
                      {h?.symbol}・{h?.name}
                    </b>
                    <small>{tx.date}</small>
                  </div>
                  <strong>
                    {tx.quantity} × NT$ {tx.price.toLocaleString()}
                  </strong>
                  <button className="record-delete" aria-label="刪除投資紀錄" onClick={() => deleteRecord(tx, setInvestmentTx, "投資紀錄")}><Trash2 /></button>
                </div>
              );
            })}
          </section>
        </>
      );
    }
    if (active === "考試")
      return (
        <>
          <PageTitle name={active} onAdd={() => setFormKind("exam")} />
          <section className="exam-summary">
            {exams.map((exam) => {
              const days = Math.max(
                0,
                Math.ceil(
                  (new Date(exam.date).getTime() -
                    new Date("2026-08-13").getTime()) /
                    86400000,
                ),
              );
              return (
                <article className="card exam-card" key={exam.id}>
                  <div className="exam-top">
                    <span>
                      <GraduationCap />
                    </span>
                    <div>
                      <small>{exam.type}</small>
                      <h2 className="editable-title">
                        {exam.name}
                        <button
                          aria-label="編輯考試"
                          onClick={() => openEdit("exam", exam.id)}
                        >
                          <PenLine />
                        </button>
                      </h2>
                    </div>
                    <em>{exam.status}</em>
                  </div>
                  <div className="score-progress">
                    <div>
                      <span>目前</span>
                      <strong>{exam.current}</strong>
                    </div>
                    <i />
                    <div>
                      <span>目標</span>
                      <strong>{exam.target}</strong>
                    </div>
                    <div className="countdown">
                      <b>{days}</b>
                      <span>天後考試</span>
                    </div>
                  </div>
                  <div className="bar">
                    <i
                      style={{
                        width: `${Math.min(100, (exam.current / exam.target) * 100)}%`,
                      }}
                    />
                  </div>
                  <footer>
                    <span>{exam.date}</span>
                    <button
                      onClick={() =>
                        setExams((v) =>
                          v.map((x) =>
                            x.id === exam.id
                              ? {
                                  ...x,
                                  current: Math.min(x.target, x.current + 5),
                                }
                              : x,
                          ),
                        )
                      }
                    >
                      更新進度 +5
                    </button>
                  </footer>
                </article>
              );
            })}
          </section>
          <section className="exam-layout">
            <div className="card subjects">
              <div className="card-head">
                <div>
                  <span className="kicker">SUBJECTS</span>
                  <h2>科目準備狀態</h2>
                </div>
              </div>
              {exams[0]?.subjects.map((s, i) => (
                <div className="subject-row" key={s.name}>
                  <div>
                    <strong>{s.name}</strong>
                    <span>
                      信心程度 {"●".repeat(s.confidence)}
                      {"○".repeat(5 - s.confidence)}
                    </span>
                  </div>
                  <div className="bar">
                    <i style={{ width: s.progress + "%" }} />
                  </div>
                  <b>{s.progress}%</b>
                  <button
                    onClick={() =>
                      setExams((v) =>
                        v.map((e, ei) =>
                          ei === 0
                            ? {
                                ...e,
                                subjects: e.subjects.map((x, si) =>
                                  si === i
                                    ? {
                                        ...x,
                                        progress: Math.min(100, x.progress + 5),
                                      }
                                    : x,
                                ),
                              }
                            : e,
                        ),
                      )
                    }
                  >
                    +5
                  </button>
                </div>
              ))}
            </div>
            <aside className="card mock-list">
              <div className="card-head">
                <div>
                  <span className="kicker">MOCK EXAM</span>
                  <h2>模擬考趨勢</h2>
                </div>
                <button
                  onClick={() => {
                    setMocks((v) => [
                      ...v,
                      {
                        id: Date.now(),
                        examId: exams[0].id,
                        date: "2026-08-13",
                        score: (v.at(-1)?.score || 600) + 10,
                        note: "新模擬考紀錄",
                      },
                    ]);
                    notify("已新增模擬考成績");
                  }}
                >
                  <Plus />
                </button>
              </div>
              {mocks
                .filter((m) => m.examId === exams[0]?.id)
                .map((m, i) => (
                  <div className="mock-row" key={m.id}>
                    <span>#{i + 1}</span>
                    <div>
                      <b>{m.score} 分</b>
                      <small>
                        {m.date}・{m.note}
                      </small>
                    </div>
                    {i > 0 && (
                      <em>
                        +
                        {m.score -
                          mocks.filter((x) => x.examId === m.examId)[i - 1]
                            .score}
                      </em>
                    )}
                    <button className="record-delete" aria-label="刪除模擬考紀錄" onClick={() => deleteRecord(m, setMocks, "模擬考紀錄")}><Trash2 /></button>
                  </div>
                ))}
            </aside>
          </section>
          <ExamActivity
            studyLogs={studyLogs}
            mistakes={mistakes}
            setMistakes={setMistakes}
            addStudy={() => setFormKind("study")}
            addMistake={() => setFormKind("mistake")}
            onDeleteStudy={(item) => deleteRecord(item, setStudyLogs, "學習紀錄")}
            onDeleteMistake={(item) => deleteRecord(item, setMistakes, "錯題")}
          />
        </>
      );
    if (active === "專注") {
      const selection = {
        kind: focusKind,
        entityId: focusEntityId,
        subject: focusSubject,
        customTitle: focusCustomTitle,
      };
      const resolved = resolveFocus(selection, {
        tasks,
        projects,
        exams,
        works,
      });
      const recommendedFocus=suggestedFocusMinutes(focusKind==="task"?tasks.find(task=>task.id===focusEntityId):undefined,health);
      return (
        <>
          <PageTitle name={active} onAdd={() => setPreset(25)} />
          <section
            className={
              focusRunning ? "focus-layout focus-active" : "focus-layout"
            }
          >
            <div className="card focus-console">
              <div className="focus-kind" aria-label="專注類型">
                {(
                  [
                    ["task", "任務"],
                    ["project", "專案"],
                    ["learning", "學習"],
                    ["work", "工作"],
                    ["custom", "自訂"],
                  ] as [FocusKind, string][]
                ).map(([kind, label]) => (
                  <button
                    className={focusKind === kind ? "active" : ""}
                    disabled={focusRunning}
                    onClick={() => {
                      setFocusKind(kind);
                      setFocusEntityId(undefined);
                      setFocusSubject("");
                    }}
                    key={kind}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <FocusSourcePicker
                kind={focusKind}
                entityId={focusEntityId}
                setEntityId={setFocusEntityId}
                subject={focusSubject}
                setSubject={setFocusSubject}
                customTitle={focusCustomTitle}
                setCustomTitle={setFocusCustomTitle}
                tasks={open}
                projects={projects}
                exams={exams}
                works={works}
                disabled={focusRunning}
              />
              <div className="focus-presets">
                {[
                  [20, recommendedFocus===20?"目前推薦":"短段"],
                  [40, recommendedFocus===40?"目前推薦":"穩定推進"],
                  [60, recommendedFocus===60?"目前推薦":"深度投入"],
                  [90, "長段專注"],
                ].map(([m, n]) => (
                  <button
                    disabled={focusRunning}
                    className={focusPreset === m ? "active" : ""}
                    onClick={() => setPreset(m as number)}
                    key={m}
                  >
                    {n}
                    <span>{m} 分</span>
                  </button>
                ))}
              </div>
              <div
                className={focusRunning ? "focus-clock running" : "focus-clock"}
              >
                <small>
                  {focusRunning ? `正在${resolved.context}` : "準備開始"}
                </small>
                <h2>{resolved.title}</h2>
                <span>
                  {String(Math.floor(focusSeconds / 60)).padStart(2, "0")}:
                  {String(focusSeconds % 60).padStart(2, "0")}
                </span>
                <small>
                  {focusRunning
                    ? "鼠鼠也坐下來陪你了，先專心做這件事。"
                    : "完成後會自動同步到對應紀錄。"}
                </small>
              </div>
              <div className="focus-controls">
                <button
                  className="reset"
                  onClick={() => setPreset(focusPreset)}
                >
                  <RefreshCw />
                </button>
                <button
                  className="focus-main"
                  onClick={() => setFocusRunning((v) => !v)}
                >
                  {focusRunning ? <Pause /> : <Play />}
                  {focusRunning ? "暫停" : "開始專注"}
                </button>
              </div>
            </div>
            <div className="card focus-history">
              <span className="kicker">TODAY</span>
              <h2>今日專注</h2>
              <strong>
                {focusLogs.length}
                <span>次</span>
              </strong>
              <p>共 {focusLogs.reduce((a, x) => a + x.minutes, 0)} 分鐘</p>
              {focusLogs.map((x) => (
                <div className="history-row" key={x.id}>
                  <span>
                    <Check />
                    <i>{x.context || "專注"}</i>
                    {x.title}
                  </span>
                  <b>{x.minutes} 分鐘</b>
                  <button className="record-delete" aria-label="刪除專注紀錄" onClick={() => deleteRecord(x, setFocusLogs, "專注紀錄")}><Trash2 /></button>
                </div>
              ))}
              {focusLogs.length === 0 && (
                <p>完成第一個專注時段後，紀錄會出現在這裡。</p>
              )}
              <FocusSettings
                quality={focusQuality}
                setQuality={setFocusQuality}
                interruptions={interruptions}
                setInterruptions={setInterruptions}
                sound={focusSound}
                setSound={setFocusSound}
                notifications={focusNotifications}
                setNotifications={setFocusNotifications}
              />
            </div>
          </section>
        </>
      );
    }
    if (active === "健康")
      return (
        <>
          <PageTitle name={active} onAdd={() => notify("今日健康紀錄已更新")} />
          <section className="health-grid">
            <HealthMetric
              icon={<Moon />}
              label="睡眠"
              value={`${health.sleep} hr`}
              sub="品質良好"
              tone="indigo"
            />
            <HealthMetric
              icon={<Droplets />}
              label="飲水"
              value={`${health.water} ml`}
              sub="目標 2,000 ml"
              tone="blue"
            />
            <HealthMetric
              icon={<Zap />}
              label="能量"
              value={`${health.energy} / 5`}
              sub="適合中高強度"
              tone="gold"
            />
            <HealthMetric
              icon={<Smile />}
              label="心情"
              value={`${health.mood} / 5`}
              sub="平穩、正向"
              tone="green"
            />
            <div className="card water-card">
              <div>
                <span className="kicker">HYDRATION</span>
                <h2>今天再喝一點水</h2>
                <p>還差 {Math.max(0, 2000 - health.water)} ml 達成今日目標</p>
              </div>
              <div className="water-actions">
                <button
                  onClick={() =>
                    setHealth((v) => ({ ...v, water: v.water + 250 }))
                  }
                >
                  +250 ml
                </button>
                <button
                  onClick={() =>
                    setHealth((v) => ({ ...v, water: v.water + 500 }))
                  }
                >
                  +500 ml
                </button>
              </div>
            </div>
            <div className="card checkin-card">
              <span className="kicker">DAILY CHECK-IN</span>
              <h2>今天感覺如何？</h2>
              {[
                ["能量", "energy"],
                ["壓力", "stress"],
                ["心情", "mood"],
              ].map(([label, key]) => (
                <label key={key}>
                  <span>{label}</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={health[key as "energy" | "stress" | "mood"]}
                    onChange={(e) =>
                      setHealth((v) => ({
                        ...v,
                        [key]: Number(e.target.value),
                      }))
                    }
                  />
                  <b>{health[key as "energy" | "stress" | "mood"]}</b>
                </label>
              ))}
            </div>
          </section>
          <HealthActivity
            exerciseLogs={exerciseLogs}
            sleepLogs={sleepLogs}
            bodyLogs={bodyLogs}
            wellnessLogs={wellnessLogs}
            addExercise={() => setFormKind("exercise")}
            addSleep={() => setFormKind("sleep")}
            addBody={() => setFormKind("body")}
            addSymptom={() => setFormKind("symptom")}
            addRecovery={() => setFormKind("recovery")}
            onDeleteExercise={(item) => deleteRecord(item, setExerciseLogs, "運動紀錄")}
            onDeleteSleep={(item) => deleteRecord(item, setSleepLogs, "睡眠紀錄")}
            onDeleteBody={(item) => deleteRecord(item, setBodyLogs, "身體紀錄")}
            onDeleteWellness={(item) => deleteRecord(item, setWellnessLogs, "健康紀錄")}
          />
        </>
      );
    if (active === "習慣")
      return (
        <>
          <PageTitle name={active} onAdd={() => setFormKind("habit")} />
          <section className="card habits-card">
            <div className="habit-days">
              <span />
              <b>一</b>
              <b>二</b>
              <b>三</b>
              <b>四</b>
              <b>五</b>
              <b>六</b>
              <b>日</b>
            </div>
            {habits.map((h) => (
              <div className="habit-row" key={h.id}>
                <div>
                  <strong className="editable-title">
                    {h.name}
                    <button
                      aria-label="編輯習慣"
                      onClick={() => openEdit("habit", h.id)}
                    >
                      <PenLine />
                    </button>
                    <button aria-label="刪除習慣" onClick={() => deleteRecord(h, setHabits, "習慣")}><Trash2 /></button>
                  </strong>
                  <span>
                    {h.category}・近 7 天完成 {h.days.filter(Boolean).length} 天（{Math.round(h.days.filter(Boolean).length / 7 * 100)}%）
                  </span>
                </div>
                {h.days.map((done, i) => (
                  <button
                    className={done ? "done" : ""}
                    onClick={() =>
                      setHabits((v) =>
                        v.map((x) =>
                          x.id === h.id
                            ? {
                                ...x,
                                days: x.days.map((d, j) => (j === i ? !d : d)),
                              }
                            : x,
                        ),
                      )
                    }
                    key={i}
                  >
                    {done && <Check />}
                  </button>
                ))}
              </div>
            ))}
          </section>
        </>
      );
    if (active === "日記")
      return (
        <>
          <PageTitle name={active} onAdd={() => setFormKind("journal")} />
          <section className="journal-layout">
            <div className="card journal-prompt">
              <PenLine />
              <span className="kicker">TODAY'S PROMPT</span>
              <h2>今天哪一刻，讓你感覺自己正在前進？</h2>
              <button onClick={() => notify("日記草稿已儲存")}>開始書寫</button>
            </div>
            <div className="journal-list">
              {journal.map((j) => (
                <article className="card journal-entry" key={j.id}>
                  <header>
                    <span>{j.type}</span>
                    <time>{j.date}</time>
                  </header>
                  <h2 className="editable-title">
                    {j.title}
                    <button
                      aria-label="編輯日記"
                      onClick={() => openEdit("journal", j.id)}
                    >
                      <PenLine />
                    </button>
                    <button aria-label="刪除日記" onClick={() => deleteRecord(j, setJournal, "日記")}><Trash2 /></button>
                  </h2>
                  <p>{j.content}</p>
                  <footer>
                    {"●".repeat(j.mood)}
                    <span>{"●".repeat(5 - j.mood)}</span>
                  </footer>
                </article>
              ))}
            </div>
          </section>
        </>
      );
    if (active === "筆記")
      return (
        <>
          <PageTitle name={active} onAdd={() => setFormKind("note")} />
          <section className="notes-grid">
            {notes.map((n) => (
              <article className="card note-card" key={n.id}>
                <div>
                  <StickyNote />
                  <span>{n.tag}</span>
                  <button onClick={() => deleteNote(n.id)}>
                    <Trash2 />
                  </button>
                </div>
                <h2 className="editable-title">
                  {n.title}
                  <button
                    aria-label="編輯筆記"
                    onClick={() => openEdit("note", n.id)}
                  >
                    <PenLine />
                  </button>
                </h2>
                <p>{n.content}</p>
                {notes.some(other=>other.id!==n.id&&other.tag===n.tag)&&<div className="note-related"><span>可能相關</span>{notes.filter(other=>other.id!==n.id&&other.tag===n.tag).slice(0,2).map(other=><button onClick={()=>openEdit("note",other.id)} key={other.id}>{other.title}</button>)}</div>}
                <small>更新於 {n.updated}</small>
              </article>
            ))}
          </section>
        </>
      );
    if (active === "每週回顧")
      return (
        <ReviewPage
          mode={reviewMode}
          setMode={setReviewMode}
          checks={reviewChecks}
          setChecks={setReviewChecks}
          tasks={tasks}
          projects={projects}
          inbox={tasks.filter((t) => t.inbox).length}
        />
      );
    if (active === "個人設定") {
      const roleOptions = [
        "學生",
        "研究者",
        "開發者",
        "家教",
        "自由工作者",
        "投資者",
        "創作者",
      ];
      const areaOptions = [
        "學習",
        "職涯",
        "財務",
        "健康",
        "生活",
        "成長",
        "家庭",
        "人際",
      ];
      return (
        <>
          <PageTitle name={active} onAdd={() => notify("個人設定已自動儲存")} />
          <section className="settings-layout">
            <div className="card identity-card">
              <span className="kicker">IDENTITY</span>
              <h2>基本資料</h2>
              <div className="settings-avatar">
                {profile.name.slice(0, 2).toUpperCase()}
              </div>
              <label>
                顯示名稱
                <input
                  value={profile.name}
                  onChange={(e) =>
                    setProfile((v) => ({ ...v, name: e.target.value }))
                  }
                />
              </label>
              <label>
                一句話介紹
                <input
                  value={profile.headline}
                  onChange={(e) =>
                    setProfile((v) => ({ ...v, headline: e.target.value }))
                  }
                />
              </label>
            </div>
            <div className="card setup-card">
              <span className="kicker">ROLES</span>
              <h2>現在的你，扮演哪些角色？</h2>
              <p>角色會影響容量分配與建議顯示。</p>
              <div className="choice-grid">
                {roleOptions.map((x) => (
                  <button
                    className={profile.roles.includes(x) ? "selected" : ""}
                    onClick={() =>
                      setProfile((v) => ({
                        ...v,
                        roles: v.roles.includes(x)
                          ? v.roles.filter((r) => r !== x)
                          : [...v.roles, x],
                      }))
                    }
                    key={x}
                  >
                    {profile.roles.includes(x) && <Check />}
                    {x}
                  </button>
                ))}
              </div>
              <span className="kicker area-kicker">LIFE AREAS</span>
              <h2>你想持續照顧的人生領域</h2>
              <div className="choice-grid">
                {areaOptions.map((x) => (
                  <button
                    className={profile.lifeAreas.includes(x) ? "selected" : ""}
                    onClick={() =>
                      setProfile((v) => ({
                        ...v,
                        lifeAreas: v.lifeAreas.includes(x)
                          ? v.lifeAreas.filter((a) => a !== x)
                          : [...v.lifeAreas, x],
                      }))
                    }
                    key={x}
                  >
                    {profile.lifeAreas.includes(x) && <Check />}
                    {x}
                  </button>
                ))}
              </div>
            </div>
            <div className="card data-card">
              <span className="kicker">DATA & PRIVACY</span>
              <h2>資料管理</h2>
              <p>
                目前所有資料只儲存在這個瀏覽器。定期匯出備份，避免清除瀏覽資料後遺失。
              </p>
              <div className="data-actions">
                <button onClick={exportData}>
                  <Download />
                  匯出 JSON 備份
                </button>
                <button onClick={() => importRef.current?.click()}>
                  <Upload />
                  匯入備份
                </button>
                <input
                  ref={importRef}
                  type="file"
                  accept="application/json"
                  onChange={(e) => importData(e.target.files?.[0])}
                />
              </div>
              <div className="storage-stat">
                <div>
                  <b>本機資料</b>
                  <span>
                    {tasks.length +
                      goals.length +
                      notes.length +
                      journal.length +
                      finance.length}{" "}
                    筆核心紀錄
                  </span>
                </div>
                <em>僅此裝置</em>
              </div>
              <button className="danger-btn" onClick={resetData}>
                <Trash2 />
                清除並恢復示範資料
              </button>
            </div>
          </section>
        </>
      );
    }
    return (
      <>
        <PageTitle
          name={active}
          onAdd={() => notify(`${active} 模組即將開放`)}
        />
        <section className="card empty-module">
          <Sparkles />
          <h2>{active} 模組已排入下一階段</h2>
          <p>
            核心資料與導覽已準備完成，接下來可沿用目前架構逐步接入完整功能。
          </p>
        </section>
      </>
    );
  };

  if (!onboarding.completed)
    return (
      <OnboardingPage
        name={profile.name || "夥伴"}
        onComplete={(setup) => {
          setOnboarding(setup);
          setProfile((current) => ({
            ...current,
            roles: Array.from(new Set([setup.identity, ...current.roles])),
            lifeAreas: Array.from(
              new Set([
                setup.focus
                  .replace("與考試", "")
                  .replace("管理", "")
                  .replace("習慣", ""),
                ...current.lifeAreas,
              ]),
            ),
          }));
        }}
      />
    );
  return (
    <div className="app">
      <aside className={sidebar ? "sidebar open" : "sidebar"}>
        <div className="brand">
          <span className="brandmark">
            <Flame size={18} />
          </span>
          <span>
            灣<b>day</b>
          </span>
          <button className="close" onClick={() => setSidebar(false)}>
            <X />
          </button>
        </div>
        <button className="quick-add" onClick={() => setQuick(true)}>
          <Plus size={18} />
          記一下 <kbd>N</kbd>
        </button>
        <nav>
          {navigation.map((section) => (
            <div className="nav-section" key={section.group}>
              <p>{section.group}</p>
              {section.items.map(([name, Icon]) => (
                <button
                  key={name}
                  className={navIsActive(name) ? "active" : ""}
                  onClick={() => navigate(name)}
                >
                  <Icon size={18} />
                  {name}
                  {name === "計畫" && tasks.some((t) => t.inbox) && (
                    <em>{tasks.filter((t) => t.inbox).length}</em>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <button
          className="growth-report-link"
          onClick={() => navigate("成長報告")}
        >
          <TrendingUp size={18} />
          成長報告
        </button>
        <button className="profile" onClick={() => navigate("個人設定")}>
          <div className="avatar">{profile.name.slice(0, 2).toUpperCase()}</div>
          <div>
            <strong>{profile.name || "未命名"}</strong>
            <span>
              {profile.roles.slice(0, 2).join("・") || "設定你的角色"}
            </span>
          </div>
          <Settings2 size={18} />
        </button>
      </aside>
      {sidebar && <div className="scrim" onClick={() => setSidebar(false)} />}
      <main>
        <header>
          <button
            className="menu"
            onClick={() => setSidebar(true)}
            aria-label="開啟選單"
          >
            <Menu />
          </button>
          <div className="crumb">
            灣day <ChevronRight size={14} /> <b>{active}</b>
          </div>
          <strong className="mobile-title">{active}</strong>
          <button className="search" onClick={() => setSearch(true)}>
            <Search size={17} />
            <span>搜尋任何內容</span>
            <kbd>⌘ K</kbd>
          </button>
          <button
            className="icon-btn app-install"
            onClick={installApp}
            aria-label="安裝灣day"
            title="安裝灣day"
          >
            <Download size={19} />
          </button>
          <button
            className="icon-btn theme-toggle"
            onClick={() =>
              setTheme((value) => (value === "light" ? "dark" : "light"))
            }
            aria-label={theme === "light" ? "切換深色模式" : "切換淺色模式"}
            title={theme === "light" ? "深色模式" : "淺色模式"}
          >
            {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
          </button>
          <button
            className="icon-btn focus-shortcut"
            onClick={() => navigate("專注")}
            aria-label="開始專注"
            title="開始專注"
          >
            <TimerReset size={19} />
          </button>
          <button
            className="mini-avatar"
            onClick={() => navigate("個人設定")}
            aria-label="個人設定"
          >
            {profile.name.slice(0, 2).toUpperCase()}
          </button>
          <button
            className="session-logout"
            onClick={onLogout}
            aria-label="登出"
            title="登出"
          >
            <LogOut size={17} />
          </button>
        </header>
        {!online && (
          <div className="offline-banner" role="status">
            <WifiOff size={15} />
            目前離線，變更會先保存在這台裝置
          </div>
        )}
        <div className="content">{renderPage()}</div>
        <MascotCompanion mascot={mascotForPage(active)} onOpen={() => setShowMascots(true)} />
      </main>
      <button
        className="mobile-fab"
        onClick={() => setQuick(true)}
        aria-label="記一下"
      >
        <Plus />
      </button>
      <div className="bottom-nav">
        {navigation[0].items.map(([name, Icon]) => (
          <button
            key={name}
            onClick={() => navigate(name)}
            className={navIsActive(name) ? "active" : ""}
          >
            <Icon size={20} />
            <span>{name}</span>
          </button>
        ))}
      </div>
      {quick && (
        <QuickCaptureModal
          onSubmit={addTask}
          onClose={() => setQuick(false)}
        />
      )}
      {search && (
        <SearchModal
          tasks={tasks}
          goals={goals}
          projects={projects}
          notes={notes}
          journal={journal}
          works={works}
          exams={exams}
          close={() => setSearch(false)}
          navigate={navigate}
        />
      )}{" "}
      {showMascots && <MascotGallery onClose={() => setShowMascots(false)} />}
      {toast && (
        <div className="toast">
          <Sparkles size={17} />
          <span>{toast}</span>
          {undo && (
            <button
              onClick={() => {
                undo.run();
                setUndo(undefined);
                setToast("已復原");
              }}
            >
              {undo.label}
            </button>
          )}
        </div>
      )}
      {formKind && (
        <RecordModal
          {...activeFormConfig()!}
          onClose={() => {
            setFormKind(null);
            setEditId(undefined);
          }}
          onSubmit={createRecord}
          onDelete={editId === undefined ? undefined : deleteEditingRecord}
        />
      )}
      {editingTaskId !== undefined &&
        tasks.find((task) => task.id === editingTaskId) && (
          <TaskEditorModal
            task={tasks.find((task) => task.id === editingTaskId)!}
            tasks={tasks}
            projects={projects}
            categories={taskCategories}
            roles={profile.roles}
            onClose={() => setEditingTaskId(undefined)}
            onSave={(updated) => {
              setTasks((current) =>
                current.map((task) =>
                  task.id === updated.id ? updated : task,
                ),
              );
              setEditingTaskId(undefined);
              notify("任務已更新");
            }}
          />
        )}
    </div>
  );
}

function GoalLine({ goal }: { goal: Goal }) {
  const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
  return (
    <div className="goal">
      <div className="goal-top">
        <span className="goal-icon" style={{ background: goal.color }}>
          <Target size={17} />
        </span>
        <div>
          <b>{goal.title}</b>
          <span>
            {goal.area}・{goal.deadline}
          </span>
        </div>
        <strong>{pct}%</strong>
      </div>
      <div className="bar">
        <i style={{ width: pct + "%", background: goal.color }} />
      </div>
      <p>
        {goal.current} / {goal.target} {goal.unit}
      </p>
    </div>
  );
}
function Matrix({
  tasks,
  toggle,
}: {
  tasks: Task[];
  toggle: (id: number) => void;
}) {
  return (
    <div className="matrix-grid">
      {(["Q1", "Q2", "Q3", "Q4"] as const).map((q, i) => (
        <div className={`quad q${i + 1}`} key={q}>
          <header>
            <b>{q}</b>
            <span>{["立即做", "排程做", "減少／委派", "降低投入"][i]}</span>
            <em>{tasks.filter((t) => t.quadrant === q).length}</em>
          </header>
          {tasks
            .filter((t) => t.quadrant === q)
            .slice(0, 3)
            .map((t) => (
              <button key={t.id} onClick={() => toggle(t.id)}>
                <Circle size={14} />
                {t.title}
              </button>
            ))}
        </div>
      ))}
    </div>
  );
}
function HubTabs({
  items,
  active,
  navigate,
}: {
  items: [string, string][];
  active: string;
  navigate: (name: string) => void;
}) {
  return (
    <div className="hub-tabs" aria-label="計畫檢視">
      {items.map(([label, page]) => (
        <button
          className={
            active === page || (active === "任務" && page === "計畫")
              ? "active"
              : ""
          }
          onClick={() => navigate(page)}
          key={page}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
function HubLauncher({
  items,
  navigate,
}: {
  items: [string, string, string][];
  navigate: (name: string) => void;
}) {
  return (
    <section className="hub-launcher">
      {items.map(([label, page, description]) => (
        <button className="card" onClick={() => navigate(page)} key={page}>
          <span>{label}</span>
          <p>{description}</p>
          <ChevronRight />
        </button>
      ))}
    </section>
  );
}
function FocusSourcePicker({
  kind,
  entityId,
  setEntityId,
  subject,
  setSubject,
  customTitle,
  setCustomTitle,
  tasks,
  projects,
  exams,
  works,
  disabled,
}: {
  kind: FocusKind;
  entityId?: number;
  setEntityId: Dispatch<SetStateAction<number | undefined>>;
  subject: string;
  setSubject: Dispatch<SetStateAction<string>>;
  customTitle: string;
  setCustomTitle: Dispatch<SetStateAction<string>>;
  tasks: Task[];
  projects: Project[];
  exams: Exam[];
  works: WorkProfile[];
  disabled: boolean;
}) {
  const select = (
    items: { id: number; title: string }[],
    placeholder: string,
  ) => (
    <select
      disabled={disabled}
      value={entityId ?? ""}
      onChange={(event) =>
        setEntityId(event.target.value ? Number(event.target.value) : undefined)
      }
    >
      <option value="">{placeholder}</option>
      {items.map((item) => (
        <option value={item.id} key={item.id}>
          {item.title}
        </option>
      ))}
    </select>
  );
  return (
    <div className="focus-source">
      <label>
        你現在要做什麼？{kind === "task" && select(tasks, "選擇一項任務")}
        {kind === "project" &&
          select(
            projects.map((item) => ({ id: item.id, title: item.title })),
            "選擇一個專案",
          )}
        {kind === "work" &&
          select(
            works.map((item) => ({
              id: item.id,
              title: `${item.name}・${item.organization}`,
            })),
            "選擇工作身分",
          )}
        {kind === "learning" && (
          <div className="focus-learning-selects">
            {select(
              exams.map((item) => ({ id: item.id, title: item.name })),
              "選擇考試",
            )}
            <select
              disabled={disabled || !entityId}
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            >
              <option value="">選擇科目</option>
              {exams
                .find((item) => item.id === entityId)
                ?.subjects.map((item) => (
                  <option key={item.name}>{item.name}</option>
                ))}
            </select>
          </div>
        )}
        {kind === "custom" && (
          <input
            disabled={disabled}
            value={customTitle}
            onChange={(event) => setCustomTitle(event.target.value)}
            placeholder="例如：整理房間、讀一本書"
          />
        )}
      </label>
    </div>
  );
}
function ChartSkeleton() {
  return (
    <div className="chart-skeleton">
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}
function ReviewPage({
  mode,
  setMode,
  checks,
  setChecks,
  tasks,
  projects,
  inbox,
}: {
  mode: "每日" | "每週" | "每月";
  setMode: Dispatch<SetStateAction<"每日" | "每週" | "每月">>;
  checks: boolean[];
  setChecks: Dispatch<SetStateAction<boolean[]>>;
  tasks: Task[];
  projects: Project[];
  inbox: number;
}) {
  const lists = {
    每日: [
      "收好今天新增的事情",
      "記下一個值得保留的亮點",
      "選出明天最值得推進的三件事",
    ],
    每週: [
      "整理這週還沒歸位的事情",
      "看看哪些承諾需要調整日期",
      "每個進行中專案選一個下一步",
      "確認下週真正可用的時間",
      "選出下週三個重點",
    ],
    每月: [
      "確認未來方向是否仍然重要",
      "保留有進展的專案，暫停其餘項目",
      "看看工作、學習、健康是否失衡",
      "選出下個月三個重點",
    ],
  };
  const items = lists[mode];
  return (
    <>
      <section className="page-title">
        <div>
          <span className="eyebrow">REVIEW & RESET</span>
          <h1>{mode}回顧</h1>
          <p>定期清理承諾、校準方向，讓系統持續值得信任。</p>
        </div>
        <div className="review-tabs">
          {(["每日", "每週", "每月"] as const).map((x) => (
            <button
              className={mode === x ? "active" : ""}
              onClick={() => {
                setMode(x);
                setChecks(Array(lists[x].length).fill(false));
              }}
              key={x}
            >
              {x}
            </button>
          ))}
        </div>
      </section>
      <section className="review-layout">
        <div className="card review-checklist">
          <span className="kicker">
            {mode === "每日"
              ? "DAILY SHUTDOWN"
              : mode === "每週"
                ? "WEEKLY RESET"
                : "MONTHLY REFLECTION"}
          </span>
          <h2>{mode}清理流程</h2>
          <p>完成這些步驟，為下一個週期建立清楚的起點。</p>
          {items.map((x, i) => (
            <button
              className={checks[i] ? "checked" : ""}
              key={x}
              onClick={() =>
                setChecks((v) =>
                  items.map((_, j) => (j === i ? !v[j] : Boolean(v[j]))),
                )
              }
            >
              <span>{checks[i] && <Check />}</span>
              {x}
            </button>
          ))}
        </div>
        <SystemHealth tasks={tasks} projects={projects} inbox={inbox} />
      </section>
    </>
  );
}
function ExamActivity({
  studyLogs,
  mistakes,
  setMistakes,
  addStudy,
  addMistake,
  onDeleteStudy,
  onDeleteMistake,
}: {
  studyLogs: StudyLog[];
  mistakes: Mistake[];
  setMistakes: Dispatch<SetStateAction<Mistake[]>>;
  addStudy: () => void;
  addMistake: () => void;
  onDeleteStudy: (item: StudyLog) => void;
  onDeleteMistake: (item: Mistake) => void;
}) {
  const minutes = studyLogs.reduce((a, x) => a + x.minutes, 0);
  const questions = studyLogs.reduce((a, x) => a + x.questions, 0);
  const correct = studyLogs.reduce((a, x) => a + x.correct, 0);
  return (
    <section className="learning-layout">
      <article className="card study-activity">
        <div className="card-head">
          <div>
            <span className="kicker">STUDY SESSIONS</span>
            <h2>學習紀錄</h2>
          </div>
          <button className="outline-btn" onClick={addStudy}>
            <Plus />
            新增
          </button>
        </div>
        <div className="study-stats">
          <div>
            <strong>{minutes}</strong>
            <span>分鐘</span>
          </div>
          <div>
            <strong>{questions}</strong>
            <span>題目</span>
          </div>
          <div>
            <strong>
              {questions ? Math.round((correct / questions) * 100) : 0}%
            </strong>
            <span>正確率</span>
          </div>
        </div>
        {studyLogs.map((x) => (
          <div className="study-row" key={x.id}>
            <div>
              <b>{x.subject}</b>
              <span>{x.date}</span>
            </div>
            <strong>
              {x.minutes} 分・{x.correct}/{x.questions} 題
            </strong>
            <button
              className="record-delete"
              aria-label="刪除學習紀錄"
              onClick={() => onDeleteStudy(x)}
            >
              <Trash2 />
            </button>
          </div>
        ))}
      </article>
      <article className="card mistake-review">
        <div className="card-head">
          <div>
            <span className="kicker">MISTAKE REVIEW</span>
            <h2>錯題回顧</h2>
          </div>
          <button className="outline-btn" onClick={addMistake}>
            <Plus />
            新增
          </button>
        </div>
        {mistakes.map((x) => (
          <div
            className={x.reviewed ? "mistake-row reviewed" : "mistake-row"}
            key={x.id}
          >
            <button
              onClick={() =>
                setMistakes((v) =>
                  v.map((m) =>
                    m.id === x.id ? { ...m, reviewed: !m.reviewed } : m,
                  ),
                )
              }
            >
              {x.reviewed ? <Check /> : <Circle />}
            </button>
            <div>
              <b>
                {x.subject}・{x.source}
              </b>
              <p>{x.reason}</p>
              <span>{x.concept}</span>
            </div>
            <button
              className="record-delete"
              aria-label="刪除錯題"
              onClick={() => onDeleteMistake(x)}
            >
              <Trash2 />
            </button>
          </div>
        ))}
      </article>
    </section>
  );
}
function FocusSettings({
  quality,
  setQuality,
  interruptions,
  setInterruptions,
  sound,
  setSound,
  notifications,
  setNotifications,
}: {
  quality: number;
  setQuality: Dispatch<SetStateAction<number>>;
  interruptions: string[];
  setInterruptions: Dispatch<SetStateAction<string[]>>;
  sound: boolean;
  setSound: Dispatch<SetStateAction<boolean>>;
  notifications: boolean;
  setNotifications: Dispatch<SetStateAction<boolean>>;
}) {
  const types = ["訊息", "電話", "社群媒體", "噪音", "他人", "其他"];
  const requestNotification = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setNotifications(permission === "granted");
  };
  return (
    <div className="focus-settings">
      <div>
        <span>預期品質</span>
        <select
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map((x) => (
            <option key={x} value={x}>
              {x} / 5
            </option>
          ))}
        </select>
      </div>
      <p>可能的中斷</p>
      <div className="interruptions">
        {types.map((x) => (
          <button
            className={interruptions.includes(x) ? "active" : ""}
            onClick={() =>
              setInterruptions((v) =>
                v.includes(x) ? v.filter((i) => i !== x) : [...v, x],
              )
            }
            key={x}
          >
            {x}
          </button>
        ))}
      </div>
      <label>
        <input
          type="checkbox"
          checked={sound}
          onChange={(e) => setSound(e.target.checked)}
        />
        完成音效
      </label>
      <label>
        <input
          type="checkbox"
          checked={notifications}
          onChange={(e) =>
            e.target.checked ? requestNotification() : setNotifications(false)
          }
        />
        桌面通知
      </label>
    </div>
  );
}
function HealthActivity({
  exerciseLogs,
  sleepLogs,
  bodyLogs,
  wellnessLogs,
  addExercise,
  addSleep,
  addBody,
  addSymptom,
  addRecovery,
  onDeleteExercise,
  onDeleteSleep,
  onDeleteBody,
  onDeleteWellness,
}: {
  exerciseLogs: ExerciseLog[];
  sleepLogs: SleepLog[];
  bodyLogs: BodyLog[];
  wellnessLogs: WellnessLog[];
  addExercise: () => void;
  addSleep: () => void;
  addBody: () => void;
  addSymptom: () => void;
  addRecovery: () => void;
  onDeleteExercise: (item: ExerciseLog) => void;
  onDeleteSleep: (item: SleepLog) => void;
  onDeleteBody: (item: BodyLog) => void;
  onDeleteWellness: (item: WellnessLog) => void;
}) {
  const latest = bodyLogs[0];
  return (
    <>
      <section className="health-activity">
        <article className="card">
          <div className="card-head">
            <div>
              <span className="kicker">EXERCISE</span>
              <h2>運動紀錄</h2>
            </div>
            <button className="outline-btn" onClick={addExercise}>
              <Plus />
              新增
            </button>
          </div>
          {exerciseLogs.map((x) => (
            <div className="health-log" key={x.id}>
              <span>
                <HeartPulse />
              </span>
              <div>
                <b>{x.type}</b>
                <small>
                  {x.date}・{x.intensity}強度
                </small>
              </div>
              <strong>{x.duration} 分</strong>
              <button className="record-delete" aria-label="刪除運動紀錄" onClick={() => onDeleteExercise(x)}><Trash2 /></button>
            </div>
          ))}
        </article>
        <article className="card">
          <div className="card-head">
            <div>
              <span className="kicker">SLEEP</span>
              <h2>睡眠紀錄</h2>
            </div>
            <button className="outline-btn" onClick={addSleep}>
              <Plus />
              新增
            </button>
          </div>
          {sleepLogs.map((x) => (
            <div className="health-log" key={x.id}>
              <span>
                <Moon />
              </span>
              <div>
                <b>{x.hours} 小時</b>
                <small>{x.date}</small>
              </div>
              <strong>品質 {x.quality}/5</strong>
              <button className="record-delete" aria-label="刪除睡眠紀錄" onClick={() => onDeleteSleep(x)}><Trash2 /></button>
            </div>
          ))}
        </article>
      </section>
      <section className="wellness-grid">
        <article className="card body-panel">
          <div className="card-head">
            <div>
              <span className="kicker">BODY</span>
              <h2>身體數據</h2>
            </div>
            <button className="outline-btn" onClick={addBody}>
              <Plus />
              新增
            </button>
          </div>
          {latest ? (
            <div className="body-values">
              <div>
                <strong>{latest.weight}</strong>
                <span>kg 體重</span>
              </div>
              <div>
                <strong>{latest.bodyFat}</strong>
                <span>% 體脂</span>
              </div>
              <div>
                <strong>{latest.waist}</strong>
                <span>cm 腰圍</span>
              </div>
              <button className="record-delete" aria-label="刪除身體紀錄" onClick={() => onDeleteBody(latest)}><Trash2 /></button>
            </div>
          ) : (
            <Empty />
          )}
        </article>
        <article className="card wellness-panel">
          <div className="card-head">
            <div>
              <span className="kicker">RECOVERY & SYMPTOMS</span>
              <h2>恢復與身體訊號</h2>
            </div>
            <div>
              <button className="outline-btn" onClick={addSymptom}>
                症狀
              </button>
              <button className="outline-btn" onClick={addRecovery}>
                恢復
              </button>
            </div>
          </div>
          {wellnessLogs.map((x) => (
            <div className={`wellness-row ${x.kind}`} key={x.id}>
              <span>
                {x.kind === "recovery" ? <Smile /> : <TriangleAlert />}
              </span>
              <div>
                <b>{x.name}</b>
                <small>
                  {x.date}・{x.note}
                </small>
              </div>
              {x.minutes && <strong>{x.minutes} 分</strong>}
              <button className="record-delete" aria-label="刪除健康紀錄" onClick={() => onDeleteWellness(x)}><Trash2 /></button>
            </div>
          ))}
        </article>
      </section>
    </>
  );
}
function AnalyticsPage({
  tasks,
  workLogs,
  finance,
  holdings,
  exams,
  health,
}: {
  tasks: Task[];
  workLogs: WorkLog[];
  finance: FinanceTransaction[];
  holdings: Holding[];
  exams: Exam[];
  health: Health;
}) {
  const completion = tasks.length
    ? Math.round((tasks.filter((x) => x.done).length / tasks.length) * 100)
    : 0;
  const planned = tasks.reduce((a, x) => a + x.estimate, 0) / 60;
  const workHours = workLogs.reduce((a, x) => a + x.duration, 0) / 60;
  const workIncome = workLogs
    .filter((x) => x.paid)
    .reduce((a, x) => a + x.income, 0);
  const income =
    finance.filter((x) => x.type === "收入").reduce((a, x) => a + x.amount, 0) +
    workIncome;
  const expense = finance
    .filter((x) => x.type === "支出")
    .reduce((a, x) => a + x.amount, 0);
  const portfolio = holdings.reduce(
    (a, x) => a + x.quantity * x.currentPrice,
    0,
  );
  const portfolioCost = holdings.reduce(
    (a, x) => a + x.quantity * x.avgPrice,
    0,
  );
  const qData = (["Q1", "Q2", "Q3", "Q4"] as Quadrant[]).map((q, i) => ({
    name: q,
    value: tasks.filter((x) => x.quadrant === q).length,
    color: [uiColors.danger, uiColors.brand, uiColors.warning, uiColors.muted][
      i
    ],
  }));
  const examData = exams.map((x) => ({
    name: x.type,
    目前: x.current,
    目標: x.target,
  }));
  const productivity = [
    {
      name: "任務",
      完成: tasks.filter((x) => x.done).length,
      待完成: tasks.filter((x) => !x.done).length,
    },
    { name: "時間", 完成: Math.round(workHours), 待完成: Math.round(planned) },
  ];
  const healthScore = Math.round(
    ((Math.min(5, health.sleep / 1.6) +
      health.energy +
      (6 - health.stress) +
      health.mood) /
      20) *
      100,
  );
  const insights = [
    tasks.filter((x) => x.quadrant === "Q2" && !x.done).length < 2
      ? "Q2 投入偏低，建議保留一段長期成長時間。"
      : "Q2 保護良好，長期目標正在穩定推進。",
    expense > income * 0.7
      ? "本月支出超過收入 70%，可優先檢查學習與非必要支出。"
      : `本月儲蓄率約 ${income ? Math.round(((income - expense) / income) * 100) : 0}%，現金流維持健康。`,
    health.sleep < 7
      ? "近期睡眠低於 7 小時，建議降低高能量任務密度。"
      : "睡眠與能量狀態足以支撐目前工作負載。",
  ];
  return (
    <>
      <PageTitle name="分析" />
      <section className="analytics-kpis">
        <SummaryCard
          label="任務完成率"
          value={`${completion}%`}
          sub={`${tasks.filter((x) => x.done).length} / ${tasks.length} 項`}
          icon={<CheckCircle2 />}
        />
        <SummaryCard
          label="本週規劃"
          value={`${planned.toFixed(1)} hr`}
          sub="預估任務投入"
          icon={<Clock3 />}
        />
        <SummaryCard
          label="健康指數"
          value={`${healthScore}`}
          sub="睡眠、能量與壓力"
          icon={<HeartPulse />}
        />
        <SummaryCard
          label="投資報酬"
          value={`${portfolioCost ? (((portfolio - portfolioCost) / portfolioCost) * 100).toFixed(1) : 0}%`}
          sub={`市值 NT$ ${Math.round(portfolio).toLocaleString()}`}
          icon={<TrendingUp />}
        />
      </section>
      <section className="analytics-grid">
        <article className="card analytic-chart">
          <div className="card-head">
            <div>
              <span className="kicker">PRODUCTIVITY</span>
              <h2>執行概況</h2>
            </div>
          </div>
          <div className="analytics-chart-wrap">
            <Suspense fallback={<ChartSkeleton />}>
              <MetricBarChart
                data={productivity}
                keys={[
                  { key: "完成", label: "完成／已投入", color: uiColors.brand },
                  {
                    key: "待完成",
                    label: "待完成／規劃",
                    color: uiColors.accent,
                  },
                ]}
              />
            </Suspense>
          </div>
        </article>
        <article className="card analytic-chart quadrant-chart">
          <div>
            <span className="kicker">PRIORITY MIX</span>
            <h2>四象限分布</h2>
          </div>
          <div className="analytic-pie">
            <Suspense fallback={<ChartSkeleton />}>
              <AllocationPieChart data={qData} />
            </Suspense>
          </div>
          <div className="analytic-legend">
            {qData.map((x) => (
              <span key={x.name}>
                <i style={{ background: x.color }} />
                {x.name}
                <b>{x.value}</b>
              </span>
            ))}
          </div>
        </article>
        <article className="card analytic-chart">
          <div className="card-head">
            <div>
              <span className="kicker">EXAM PROGRESS</span>
              <h2>考試目標差距</h2>
            </div>
          </div>
          <div className="analytics-chart-wrap">
            <Suspense fallback={<ChartSkeleton />}>
              <MetricBarChart
                data={examData}
                keys={[
                  { key: "目前", label: "目前", color: uiColors.study },
                  { key: "目標", label: "目標", color: uiColors.finance },
                ]}
              />
            </Suspense>
          </div>
        </article>
        <article className="card cashflow-card">
          <span className="kicker">CASH FLOW</span>
          <h2>本月現金流</h2>
          <div className="cashflow-value">
            <div>
              <span>收入</span>
              <strong className="positive">+ {income.toLocaleString()}</strong>
            </div>
            <div>
              <span>支出</span>
              <strong className="negative">- {expense.toLocaleString()}</strong>
            </div>
          </div>
          <div className="cashflow-track">
            <i
              style={{
                width: `${income ? Math.min(100, (expense / income) * 100) : 0}%`,
              }}
            />
          </div>
          <p>結餘 NT$ {(income - expense).toLocaleString()}</p>
        </article>
        <article className="card insight-card">
          <span className="kicker">SMART INSIGHTS</span>
          <h2>本週值得注意</h2>
          {insights.map((x, i) => (
            <div key={x}>
              <span>{i + 1}</span>
              <p>{x}</p>
            </div>
          ))}
        </article>
      </section>
    </>
  );
}
function HealthMetric({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub: string;
  tone: string;
}) {
  return (
    <article className="card health-metric">
      <span className={`health-icon ${tone}`}>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <p>{sub}</p>
      </div>
    </article>
  );
}
function SummaryCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <article className="card summary-card">
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <p>{sub}</p>
      </div>
    </article>
  );
}
function SystemHealth({
  tasks,
  projects,
  inbox,
}: {
  tasks: Task[];
  projects: Project[];
  inbox: number;
}) {
  const issues = [
    { label: "收集匣未釐清", value: inbox, ok: inbox === 0 },
    {
      label: "逾期任務",
      value: tasks.filter((t) => !t.done && t.due?.includes("今天")).length,
      ok: false,
    },
    {
      label: "沒有 Next Action 的專案",
      value: projects.filter(
        (p) => !tasks.some((t) => t.project === p.title && !t.done),
      ).length,
      ok: false,
    },
    {
      label: "未完成任務",
      value: tasks.filter((t) => !t.done).length,
      ok: tasks.filter((t) => !t.done).length < 8,
    },
  ];
  const score = Math.max(
    0,
    100 - issues.reduce((a, x) => a + (x.ok ? 0 : x.value * 5), 0),
  );
  return (
    <aside className="card system-health">
      <span className="kicker">SYSTEM HEALTH</span>
      <div className="health-score">
        <strong>{score}</strong>
        <span>
          / 100
          <br />
          系統健康度
        </span>
      </div>
      {issues.map((x) => (
        <div className="system-row" key={x.label}>
          <span className={x.ok ? "ok" : "warn"}>
            {x.ok ? <CheckCircle2 /> : <TriangleAlert />}
          </span>
          <b>{x.label}</b>
          <em>{x.value}</em>
        </div>
      ))}
      <p>
        {score >= 80
          ? "系統狀態良好，完成回顧即可開始新的一週。"
          : "有幾個項目需要注意，建議先完成左側回顧流程。"}
      </p>
    </aside>
  );
}

export default App;
