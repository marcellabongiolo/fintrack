import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ArrowDownLeft, ArrowUpRight, Bell, Download, Plus, Search, Target, Trash2, Wallet, X } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { initialTransactions } from "./data/seed";
import type { Transaction, TransactionType } from "./types/finance";

const STORAGE_KEY = "fintrack.transactions.v1";
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
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | TransactionType>("all");
  const [modal, setModal] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const income = transactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expenses = transactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const spending = useMemo(() => {
    const totals = new Map<string, number>();
    transactions.filter((item) => item.type === "expense").forEach((item) => totals.set(item.category, (totals.get(item.category) ?? 0) + item.amount));
    return [...totals.entries()].map(([name, value], index) => ({ name, value, color: colors[index % colors.length] })).sort((a, b) => b.value - a.value);
  }, [transactions]);
  const visible = transactions
    .filter((item) => filter === "all" || item.type === filter)
    .filter((item) => `${item.title} ${item.category}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date));

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
    const rows = [["Date", "Description", "Category", "Type", "Amount"], ...transactions.map((item) => [item.date, item.title, item.category, item.type, item.amount.toFixed(2)])];
    const csv = rows.map((row) => row.map((field) => `"${String(field).replace(/\"/g, '\"\"')}"`).join(",")).join("\r\n");
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
      <aside className="sidebar">
        <a className="brand" href="#"><span className="brand-mark"><Wallet size={21} /></span>fintrack<span className="brand-dot">.</span></a>
        <p className="side-label">WORKSPACE</p>
        <div className="workspace"><span className="workspace-avatar">P</span><span><strong>Personal space</strong><small>Free plan</small></span></div>
        <p className="side-label menu-label">MENU</p>
        <div className="nav-item active"><span>◈</span> Overview</div>
        <div className="nav-item"><ArrowUpRight size={17} /> Transactions</div>
        <div className="nav-item"><Target size={17} /> Budgets</div>
        <div className="sidebar-note"><span>✦</span><strong>Money, made clearer.</strong><p>Build better habits, one step at a time.</p></div>
        <div className="profile"><span className="avatar">JD</span><span><strong>Jordan Davis</strong><small>Demo account</small></span></div>
      </aside>

      <main className="main-content">
        <header className="topbar"><span className="crumb">Workspace <span>/</span> <strong>Overview</strong></span><div className="top-actions"><span className="today">{new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date())}</span><button className="icon-button" aria-label="Notifications" onClick={() => notify("You're all caught up!")}><Bell size={18} /></button><span className="avatar small-avatar">JD</span></div></header>
        <div className="page-content">
          <section className="welcome"><div><div className="eyebrow"><span /> YOUR FINANCIAL SNAPSHOT</div><h1>Good morning, Jordan <span>✦</span></h1><p>Here's what's happening with your money today.</p></div><div className="welcome-buttons"><button className="button-secondary" onClick={exportCsv}><Download size={16} /> Export</button><button className="button-primary" onClick={() => setModal(true)}><Plus size={17} /> Add transaction</button></div></section>

          <section className="stats">
            <article className="panel stat"><div className="stat-head">Total balance <span className="stat-icon purple"><Wallet size={18} /></span></div><strong>{money.format(income - expenses)}</strong><small>Income minus expenses</small></article>
            <article className="panel stat"><div className="stat-head">Total income <span className="stat-icon green"><ArrowDownLeft size={18} /></span></div><strong>{money.format(income)}</strong><small>Across all transactions</small></article>
            <article className="panel stat"><div className="stat-head">Total expenses <span className="stat-icon orange"><ArrowUpRight size={18} /></span></div><strong>{money.format(expenses)}</strong><small>Across all transactions</small></article>
          </section>

          <section className="insight"><span className="insight-icon">✦</span><div><strong>Small steps, stronger finances.</strong><p>You have {money.format(income - expenses)} left after your recorded expenses. Keep tracking to build a clearer picture.</p></div></section>

          <section className="middle-grid">
            <article className="panel content-panel"><div className="section-head"><div><h2>Spending breakdown</h2><p>Where your money is going</p></div><span className="tag">All time</span></div>
              {spending.length ? <div className="chart-layout"><div className="donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={spending} dataKey="value" nameKey="name" innerRadius="67%" outerRadius="92%" paddingAngle={4} stroke="none">{spending.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip formatter={(value) => money.format(Number(value))} contentStyle={{ background: "#182235", border: "1px solid #303d52", borderRadius: 10 }} /></PieChart></ResponsiveContainer><div className="donut-center"><span>Total spent</span><strong>{money.format(expenses)}</strong></div></div><div className="legend">{spending.slice(0, 5).map((item) => <div className="legend-item" key={item.name}><i style={{ background: item.color }} /><span>{item.name}</span><strong>{money.format(item.value)}</strong></div>)}</div></div> : <p className="empty">Add an expense to see your spending breakdown.</p>}
            </article>
            <article className="panel content-panel"><div className="section-head"><div><h2>Monthly budgets</h2><p>Keep spending on track</p></div><span className="tag">This month</span></div>
              {[
                { name: "Housing", spent: 1250, limit: 1500, color: "#9ba7ff" },
                { name: "Food", spent: 420, limit: 600, color: "#4ed6b0" },
                { name: "Transport", spent: 145, limit: 250, color: "#ffbd69" },
                { name: "Entertainment", spent: 92, limit: 180, color: "#f18fa5" }
              ].map((item) => <div className="budget" key={item.name}><div><span>{item.name}</span><small>{money.format(item.spent)} / {money.format(item.limit)}</small></div><div className="progress"><span style={{ width: `${Math.min(100, item.spent / item.limit * 100)}%`, background: item.color }} /></div></div>)}
              <div className="budget-foot"><Target size={16} /> You're building healthier money habits.</div>
            </article>
          </section>

          <section className="panel transactions-panel"><div className="section-head"><div><h2>Recent transactions</h2><p>Keep an eye on where your money goes.</p></div><span className="tag">{visible.length} items</span></div>
            <div className="tools"><label className="search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search transactions" aria-label="Search transactions" /></label><select value={filter} onChange={(event) => setFilter(event.target.value as "all" | TransactionType)} aria-label="Filter transactions"><option value="all">All activity</option><option value="income">Income</option><option value="expense">Expenses</option></select></div>
            {visible.length === 0 ? <p className="empty">No transactions match your search.</p> : visible.map((item) => <div className="transaction" key={item.id}><span className={`transaction-icon ${item.type}`}>{item.type === "income" ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}</span><div className="transaction-info"><strong>{item.title}</strong><small>{item.category} · {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(`${item.date}T12:00:00`))}</small></div><strong className={item.type === "income" ? "positive" : ""}>{item.type === "income" ? "+" : "−"}{money.format(item.amount)}</strong><button className="delete" aria-label={`Delete ${item.title}`} onClick={() => { setTransactions((current) => current.filter((transaction) => transaction.id !== item.id)); notify("Transaction deleted."); }}><Trash2 size={15} /></button></div>)}
          </section>
          <footer className="footer"><span>© {new Date().getFullYear()} FinTrack. Built with care.</span><span><i /> Demo mode · Data stays in this browser</span></footer>
        </div>
      </main>

      {modal && <div className="backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(false); }}><section className="modal panel" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="section-head"><div><h2 id="modal-title">Add transaction</h2><p>Record money coming in or going out.</p></div><button className="icon-button" onClick={() => setModal(false)} aria-label="Close dialog"><X size={19} /></button></div><form onSubmit={addTransaction}><label>Description<input name="title" required maxLength={70} placeholder="e.g. Grocery shopping" /></label><label>Amount (USD)<input name="amount" required type="number" min="0.01" step="0.01" placeholder="0.00" /></label><div className="form-row"><label>Type<select name="type"><option value="expense">Expense</option><option value="income">Income</option></select></label><label>Category<select name="category">{["Food","Housing","Transport","Entertainment","Education","Health","Salary","Freelance","Other"].map((category) => <option key={category}>{category}</option>)}</select></label></div><label>Date<input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} /></label><div className="modal-actions"><button type="button" className="button-secondary" onClick={() => setModal(false)}>Cancel</button><button type="submit" className="button-primary">Save transaction</button></div></form></section></div>}
      {notice && <div className="toast" role="status">✓ {notice}<button onClick={() => setNotice("")} aria-label="Dismiss">×</button></div>}
    </div>
  );
}