import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowDownLeft, ArrowUpRight, Bell, Download, Plus, Search, Target, Trash2, Wallet, X } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { initialTransactions } from "./data/seed";
import { filterTransactions, getSpendingByCategory, getMonthlyBudgetProgress, getMonthlyCashflow, summarizeTransactions, transactionsToCsv } from "./lib/finance";
import type { CategoryBudget } from "./lib/finance";
import type { Transaction, TransactionType } from "./types/finance";

const STORAGE_KEY = "fintrack.transactions.v1";
const BUDGET_STORAGE_KEY = "fintrack.category-budgets.v1";
const budgetCategories = ["Food", "Housing", "Transport", "Entertainment", "Education", "Health", "Other"];

function readBudgets(): CategoryBudget[] {
  try {
    const value = localStorage.getItem(BUDGET_STORAGE_KEY);
    if (!value) return [];
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter((item): item is CategoryBudget =>
      typeof item === "object" && item !== null &&
      typeof item.category === "string" && budgetCategories.includes(item.category) &&
      typeof item.limit === "number" && Number.isFinite(item.limit) && item.limit > 0);
  } catch {
    // Use empty budgets if storage is unavailable.
  }
  return [];
}
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const colors = ["#9ba7ff", "#4ed6b0", "#ffbd69", "#f18fa5", "#a78bfa", "#64b5f6"];

function readTransactions(): Transaction[] {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value) {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed as Transaction[];
    }
  } catch {
    // Use sample data if browser storage is unavailable.
  }
  return initialTransactions;
}

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(readTransactions);
  const [budgets, setBudgets] = useState<CategoryBudget[]>(readBudgets);
  const [budgetCategory, setBudgetCategory] = useState("Food");
  const [budgetLimit, setBudgetLimit] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | TransactionType>("all");
  const [modal, setModal] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!modal) return;
    const dialog = dialogRef.current;
    const firstField = dialog?.querySelector<HTMLInputElement>('input[name="title"]');
    firstField?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setModal(false);
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled])'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("keydown", onKeyDown); addButtonRef.current?.focus(); };
  }, [modal]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)); } catch { /* Continue in memory when storage is unavailable. */ }
  }, [transactions]);

  useEffect(() => {
    try { localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgets)); } catch { /* Storage may be disabled. */ }
  }, [budgets]);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const budgetProgress = useMemo(() => getMonthlyBudgetProgress(transactions, budgets, currentMonth), [transactions, budgets, currentMonth]);

  const cashflow = useMemo(() => getMonthlyCashflow(transactions, currentMonth), [transactions, currentMonth]);
  const cashflowHasActivity = cashflow.some((item) => item.income > 0 || item.expenses > 0);

  const { income, expenses, balance } = useMemo(
    () => summarizeTransactions(transactions),
    [transactions],
  );
  const spending = useMemo(
    () =>
      getSpendingByCategory(transactions).map((item, index) => ({
        ...item,
        color: colors[index % colors.length],
      })),
    [transactions],
  );
  const visible = useMemo(
    () => filterTransactions(transactions, query, filter),
    [transactions, query, filter],
  );

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2500);
  }

  function addTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const amount = Number(form.get("amount"));
    if (!title || !Number.isFinite(amount) || amount <= 0) {
      notify("Enter a description and an amount greater than zero.");
      return;
    }
    const item: Transaction = {
      id: crypto.randomUUID(),
      title,
      amount,
      category: String(form.get("category")),
      date: String(form.get("date")),
      type: String(form.get("type")) as TransactionType
    };
    setTransactions((current) => [item, ...current]);
    setModal(false);
    notify("Transaction added successfully.");
  }

  function exportCsv() {
    const csv = transactionsToCsv(transactions);
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "fintrack-transactions.csv";
    link.click();
    URL.revokeObjectURL(url);
    notify("CSV export downloaded.");
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <aside className="sidebar">
        <a className="brand" href="#"><span className="brand-mark"><Wallet size={21} /></span>fintrack<span className="brand-dot">.</span></a>
        <p className="side-label">WORKSPACE</p>
        <div className="workspace"><span className="workspace-avatar">P</span><span><strong>Personal space</strong><small>Free plan</small></span></div>
        <p className="side-label menu-label">MENU</p>
        <div className="nav-item active" aria-current="page"><span>◈</span> Overview</div>
        <div className="nav-item" aria-label="Transactions section"><ArrowUpRight size={17} /> Transactions</div>
        <div className="nav-item" aria-label="Budgets section"><Target size={17} /> Budgets</div>
        <div className="sidebar-note"><span>✦</span><strong>Money, made clearer.</strong><p>Build better habits, one step at a time.</p></div>
        <div className="profile"><span className="avatar">JD</span><span><strong>Jordan Davis</strong><small>Demo account</small></span></div>
      </aside>

      <main id="main-content" className="main-content" tabIndex={-1}>
        <header className="topbar"><span className="crumb">Workspace <span>/</span> <strong>Overview</strong></span><div className="top-actions"><span className="today">{new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date())}</span><button className="icon-button" aria-label="Notifications" onClick={() => notify("You're all caught up!")}><Bell size={18} /></button><span className="avatar small-avatar">JD</span></div></header>
        <div className="page-content">
          <section className="welcome"><div><div className="eyebrow"><span /> YOUR FINANCIAL SNAPSHOT</div><h1>Good morning, Jordan <span>✦</span></h1><p>Here's what's happening with your money today.</p></div><div className="welcome-buttons"><button className="button-secondary" onClick={exportCsv}><Download size={16} /> Export</button><button ref={addButtonRef} className="button-primary" onClick={() => setModal(true)}><Plus size={17} /> Add transaction</button></div></section>

          <section className="stats">
            <article className="panel stat"><div className="stat-head">Total balance <span className="stat-icon purple"><Wallet size={18} /></span></div><strong>{money.format(balance)}</strong><small>Income minus expenses</small></article>
            <article className="panel stat"><div className="stat-head">Total income <span className="stat-icon green"><ArrowDownLeft size={18} /></span></div><strong>{money.format(income)}</strong><small>Across all transactions</small></article>
            <article className="panel stat"><div className="stat-head">Total expenses <span className="stat-icon orange"><ArrowUpRight size={18} /></span></div><strong>{money.format(expenses)}</strong><small>Across all transactions</small></article>
          </section>

          <section className="insight"><span className="insight-icon">✦</span><div><strong>Small steps, stronger finances.</strong><p>You have {money.format(balance)} left after your recorded expenses. Keep tracking to build a clearer picture.</p></div></section>

          <section className="middle-grid">
            <article className="panel content-panel"><div className="section-head"><div><h2>Spending breakdown</h2><p>Where your money is going</p></div><span className="tag">All time</span></div>
              {spending.length ? <div className="chart-layout"><div className="donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={spending} dataKey="value" nameKey="name" innerRadius="67%" outerRadius="92%" paddingAngle={4} stroke="none">{spending.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip formatter={(value) => money.format(Number(value))} contentStyle={{ background: "#182235", border: "1px solid #303d52", borderRadius: 10 }} /></PieChart></ResponsiveContainer><div className="donut-center"><span>Total spent</span><strong>{money.format(expenses)}</strong></div></div><div className="legend">{spending.slice(0, 5).map((item) => <div className="legend-item" key={item.name}><i style={{ background: item.color }} /><span>{item.name}</span><strong>{money.format(item.value)}</strong></div>)}</div></div> : <p className="empty">Add an expense to see your spending breakdown.</p>}
            </article>
            <article className="panel content-panel"><div className="section-head"><div><h2>Monthly budgets</h2><p>Keep spending on track</p></div><span className="tag">This month</span></div>
              <form onSubmit={(event) => {
                event.preventDefault();
                const limit = Number(budgetLimit);
                if (!Number.isFinite(limit) || limit <= 0) { notify("Enter a positive budget limit."); return; }
                setBudgets((current) => [...current.filter((item) => item.category !== budgetCategory), { category: budgetCategory, limit }]);
                setBudgetLimit("");
                notify("Category budget saved.");
              }} style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                <select aria-label="Budget category" value={budgetCategory} onChange={(event) => setBudgetCategory(event.target.value)} style={{ flex: "1 1 120px", minWidth: 0 }}>
                  {budgetCategories.map((category) => <option key={category}>{category}</option>)}
                </select>
                <input aria-label="Monthly budget limit in USD" type="number" min="0.01" step="0.01" required placeholder="Limit (USD)" value={budgetLimit} onChange={(event) => setBudgetLimit(event.target.value)} style={{ flex: "1 1 110px", minWidth: 0 }} />
                <button type="submit" className="button-primary">Save</button>
              </form>
              {budgetProgress.length === 0 && <p className="empty">No budgets yet. Set a monthly limit for a category above.</p>}
              {budgetProgress.map((item, index) => <div className="budget" key={item.category}>
                <div><span>{item.category}{item.exceeded ? " · Over budget" : ""}</span><small>{money.format(item.spent)} / {money.format(item.limit)}</small></div>
                <div className="progress" role="progressbar" aria-label={`${item.category} monthly budget used`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, Math.round(item.percentage))} aria-valuetext={`${money.format(item.spent)} spent of ${money.format(item.limit)}${item.exceeded ? ", over budget" : ""}`}><span style={{ width: `${Math.min(100, item.percentage)}%`, background: item.exceeded ? "#f18fa5" : colors[index % colors.length] }} /></div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, marginBottom: 12 }}>
                  <small>{item.remaining >= 0 ? `${money.format(item.remaining)} left` : `${money.format(-item.remaining)} over limit`}</small>
                  <button type="button" className="delete" aria-label={`Remove budget for ${item.category}`} onClick={() => setBudgets((current) => current.filter((budget) => budget.category !== item.category))}><Trash2 size={15} /></button>
                </div>
              </div>)}
              <div className="budget-foot"><Target size={16} /> You're building healthier money habits.</div>
            </article>
          </section>

          <section className="panel content-panel" aria-label="Monthly cashflow" style={{ marginBottom: 24 }}>
            <div className="section-head"><div><h2>Monthly cashflow</h2><p>Income and expenses over the last six months</p></div><span className="tag">Last 6 months</span></div>
            {cashflowHasActivity ? (
              <div style={{ width: "100%", height: 290, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashflow} margin={{ top: 10, right: 12, left: 0, bottom: 8 }}>
                    <CartesianGrid stroke="#303d52" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(value: string) => value.slice(5)} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} width={54} />
                    <Tooltip formatter={(value) => money.format(Number(value))} contentStyle={{ background: "#182235", border: "1px solid #303d52", borderRadius: 10 }} />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="#4ed6b0" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="Expenses" fill="#f18fa5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <p className="empty">No transactions in the last six months.</p>}
            <p style={{ color: "#94a3b8", fontSize: 13 }}>Current month balance: {money.format(cashflow[cashflow.length - 1].balance)}</p>
          </section>

          <section className="panel transactions-panel" aria-label="Recent transactions"><div className="section-head"><div><h2>Recent transactions</h2><p>Keep an eye on where your money goes.</p></div><span className="tag" role="status" aria-live="polite">{visible.length} items</span></div>
            <div className="tools"><label className="search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search transactions" aria-label="Search transactions" /></label><select value={filter} onChange={(event) => setFilter(event.target.value as "all" | TransactionType)} aria-label="Filter transactions"><option value="all">All activity</option><option value="income">Income</option><option value="expense">Expenses</option></select></div>
            {visible.length === 0 ? <p className="empty">No transactions match your search.</p> : visible.map((item) => <div className="transaction" key={item.id}><span className={`transaction-icon ${item.type}`}>{item.type === "income" ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}</span><div className="transaction-info"><strong>{item.title}</strong><small>{item.category} · {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(`${item.date}T12:00:00`))}</small></div><strong className={item.type === "income" ? "positive" : ""}>{item.type === "income" ? "+" : "−"}{money.format(item.amount)}</strong><button className="delete" aria-label={`Delete ${item.title}`} onClick={() => { setTransactions((current) => current.filter((transaction) => transaction.id !== item.id)); notify("Transaction deleted."); }}><Trash2 size={15} /></button></div>)}
          </section>
          <footer className="footer"><span>© {new Date().getFullYear()} FinTrack. Built with care.</span><span><i /> Demo mode · Data stays in this browser</span></footer>
        </div>
      </main>

      {modal && <div className="backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(false); }}><section ref={dialogRef} className="modal panel" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="section-head"><div><h2 id="modal-title">Add transaction</h2><p>Record money coming in or going out.</p></div><button className="icon-button" onClick={() => setModal(false)} aria-label="Close dialog"><X size={19} /></button></div><form onSubmit={addTransaction}><label>Description<input name="title" required maxLength={70} placeholder="e.g. Grocery shopping" /></label><label>Amount (USD)<input name="amount" required type="number" min="0.01" step="0.01" placeholder="0.00" /></label><div className="form-row"><label>Type<select name="type"><option value="expense">Expense</option><option value="income">Income</option></select></label><label>Category<select name="category">{["Food","Housing","Transport","Entertainment","Education","Health","Salary","Freelance","Other"].map((category) => <option key={category}>{category}</option>)}</select></label></div><label>Date<input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} /></label><div className="modal-actions"><button type="button" className="button-secondary" onClick={() => setModal(false)}>Cancel</button><button type="submit" className="button-primary">Save transaction</button></div></form></section></div>}
      {notice && <div className="toast" role="status">✓ {notice}<button onClick={() => setNotice("")} aria-label="Dismiss">×</button></div>}
    </div>
  );
}